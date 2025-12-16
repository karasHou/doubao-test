import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import uploadRoutes from './routes/upload';
import redisService from './services/redis';
import minioService from './services/minio';
import config from './config';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建临时目录
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 路由
app.use('/api/upload', uploadRoutes);

// 文件下载路由
app.get('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // 从 Redis 获取文件信息
    const fileRecord = await redisService.hgetall(`file:${fileId}`);

    if (!fileRecord || Object.keys(fileRecord).length === 0) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 检查 MinIO 中文件是否存在
    const exists = await minioService.fileExists(config.minio.bucket, fileRecord.objectName);

    if (!exists) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 获取文件流
    const fileStream = await minioService.getFileStream(config.minio.bucket, fileRecord.objectName);

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileRecord.fileName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // 管道文件流到响应
    fileStream.pipe(res);

  } catch (error) {
    console.error('下载文件错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      redis: 'connected',
      minio: 'connected'
    }
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '路由不存在' });
});

// 错误处理中间件
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', error);
  res.status(error.status || 500).json({
    error: error.message || '服务器内部错误'
  });
});

// 启动服务器
const PORT = config.port;

app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);

  try {
    // 测试 Redis 连接
    await redisService.set('test:connection', 'ok');
    const redisTest = await redisService.get('test:connection');
    console.log(`Redis 连接测试: ${redisTest === 'ok' ? '成功' : '失败'}`);

    // 测试 MinIO 连接
    const buckets = await minioService.listObjects(config.minio.bucket);
    console.log(`MinIO 连接测试: 成功，桶 ${config.minio.bucket} 中对象数量: ${buckets.length}`);

    console.log('所有服务初始化完成');

  } catch (error) {
    console.error('服务初始化错误:', error);
  }
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');

  try {
    await redisService.disconnect();
    console.log('Redis 连接已关闭');
  } catch (error) {
    console.error('关闭 Redis 连接错误:', error);
  }

  process.exit(0);
});