import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import redisService from '../services/redis';
import minioService from '../services/minio';
import { calculateFileHash } from '../utils/hash';
import config from '../config';

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../../temp') });

// 检查文件是否已存在（秒传）
router.post('/check', async (req, res) => {
  try {
    const { fileHash, fileName, fileSize } = req.body;

    if (!fileHash) {
      return res.status(400).json({ error: '缺少文件哈希' });
    }

    // 检查 Redis 中是否有该文件的记录
    const fileRecord = await redisService.hgetall(`file:${fileHash}`);

    if (fileRecord && Object.keys(fileRecord).length > 0) {
      // 检查 MinIO 中文件是否存在
      const exists = await minioService.fileExists(config.minio.bucket, fileRecord.objectName);

      if (exists) {
        return res.json({
          exists: true,
          fileId: fileHash,
          fileName: fileRecord.fileName,
          fileSize: fileRecord.fileSize,
          url: `/files/${fileHash}`
        });
      }
    }

    // 检查是否有未完成的上传
    const uploadRecord = await redisService.hgetall(`upload:${fileHash}`);

    if (uploadRecord && Object.keys(uploadRecord).length > 0) {
      const uploadedChunks = await redisService.smembers(`upload:${fileHash}:chunks`);

      return res.json({
        exists: false,
        uploadId: fileHash,
        fileName,
        fileSize,
        chunkSize: config.chunk.size,
        totalChunks: Math.ceil(fileSize / config.chunk.size),
        uploadedChunks: uploadedChunks.map(Number)
      });
    }

    // 文件不存在，返回新的上传信息
    res.json({
      exists: false,
      uploadId: fileHash,
      fileName,
      fileSize,
      chunkSize: config.chunk.size,
      totalChunks: Math.ceil(fileSize / config.chunk.size),
      uploadedChunks: []
    });

  } catch (error) {
    console.error('检查文件存在性错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 上传分片
router.post('/chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, fileName, fileSize } = req.body;
    const chunkFile = req.file;

    if (!chunkFile) {
      return res.status(400).json({ error: '缺少分片文件' });
    }

    if (!uploadId || chunkIndex === undefined) {
      return res.status(400).json({ error: '缺少必要的分片信息' });
    }

    const chunkNumber = parseInt(chunkIndex);

    // 保存分片信息到 Redis
    await redisService.hset(`upload:${uploadId}`, 'fileName', fileName);
    await redisService.hset(`upload:${uploadId}`, 'fileSize', fileSize);
    await redisService.hset(`upload:${uploadId}`, 'totalChunks', totalChunks);
    await redisService.hset(`upload:${uploadId}`, 'lastActivity', Date.now());

    // 将分片标记为已上传
    await redisService.sadd(`upload:${uploadId}:chunks`, chunkNumber.toString());

    // 上传分片到 MinIO
    const chunkObjectName = `chunks/${uploadId}/${chunkNumber}`;
    await minioService.uploadFile(config.minio.bucket, chunkObjectName, chunkFile.path);

    // 删除临时文件
    fs.unlinkSync(chunkFile.path);

    // 检查是否所有分片都已上传
    const uploadedChunks = await redisService.smembers(`upload:${uploadId}:chunks`);

    res.json({
      success: true,
      uploadId,
      chunkIndex: chunkNumber,
      uploadedChunks: uploadedChunks.length,
      totalChunks: parseInt(totalChunks),
      completed: uploadedChunks.length === parseInt(totalChunks)
    });

  } catch (error) {
    console.error('上传分片错误:', error);

    // 清理临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 合并分片
router.post('/merge', async (req, res) => {
  try {
    const { uploadId, fileName, fileSize } = req.body;

    if (!uploadId) {
      return res.status(400).json({ error: '缺少上传 ID' });
    }

    // 获取已上传的分片
    const uploadedChunks = await redisService.smembers(`upload:${uploadId}:chunks`);
    const totalChunks = await redisService.hget(`upload:${uploadId}`, 'totalChunks');

    if (!totalChunks || uploadedChunks.length !== parseInt(totalChunks)) {
      return res.status(400).json({ error: '分片未全部上传完成' });
    }

    // 创建临时文件用于合并
    const tempFilePath = path.join(__dirname, '../../temp', `${uploadId}_merged`);
    const writeStream = fs.createWriteStream(tempFilePath);

    // 按顺序合并所有分片
    for (let i = 0; i < parseInt(totalChunks); i++) {
      const chunkObjectName = `chunks/${uploadId}/${i}`;

      try {
        // 从 MinIO 下载分片
        const chunkFilePath = path.join(__dirname, '../../temp', `${uploadId}_chunk_${i}`);
        await minioService.downloadFile(config.minio.bucket, chunkObjectName, chunkFilePath);

        // 将分片内容写入合并文件
        const chunkData = fs.readFileSync(chunkFilePath);
        writeStream.write(chunkData);

        // 删除临时分片文件
        fs.unlinkSync(chunkFilePath);

        // 从 MinIO 删除分片
        await minioService.removeFile(config.minio.bucket, chunkObjectName);

      } catch (error) {
        console.error(`合并分片 ${i} 错误:`, error);
        writeStream.close();
        fs.unlinkSync(tempFilePath);
        throw error;
      }
    }

    // 完成合并
    writeStream.end();

    // 计算合并后文件的哈希值，验证完整性
    const mergedFileHash = await calculateFileHash(tempFilePath);

    if (mergedFileHash !== uploadId) {
      fs.unlinkSync(tempFilePath);
      return res.status(400).json({ error: '文件合并后哈希值不一致，文件损坏' });
    }

    // 上传合并后的文件到 MinIO
    const objectName = `files/${uploadId}/${fileName}`;
    await minioService.uploadFile(config.minio.bucket, objectName, tempFilePath);

    // 删除临时合并文件
    fs.unlinkSync(tempFilePath);

    // 保存文件信息到 Redis
    await redisService.hset(`file:${uploadId}`, 'fileName', fileName);
    await redisService.hset(`file:${uploadId}`, 'fileSize', fileSize);
    await redisService.hset(`file:${uploadId}`, 'objectName', objectName);
    await redisService.hset(`file:${uploadId}`, 'uploadTime', Date.now());

    // 清理上传临时信息
    await redisService.del(`upload:${uploadId}`);
    await redisService.del(`upload:${uploadId}:chunks`);

    res.json({
      success: true,
      fileId: uploadId,
      fileName,
      fileSize,
      url: `/files/${uploadId}`
    });

  } catch (error) {
    console.error('合并分片错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 获取上传状态
router.get('/status/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;

    const uploadRecord = await redisService.hgetall(`upload:${uploadId}`);

    if (!uploadRecord || Object.keys(uploadRecord).length === 0) {
      return res.status(404).json({ error: '上传记录不存在' });
    }

    const uploadedChunks = await redisService.smembers(`upload:${uploadId}:chunks`);

    res.json({
      uploadId,
      fileName: uploadRecord.fileName,
      fileSize: uploadRecord.fileSize,
      totalChunks: uploadRecord.totalChunks,
      uploadedChunks: uploadedChunks.map(Number),
      uploadedChunksCount: uploadedChunks.length
    });

  } catch (error) {
    console.error('获取上传状态错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

export default router;