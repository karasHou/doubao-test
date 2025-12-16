import { MinioClient } from 'minio';
import config from '../config';

class MinioService {
  private client: MinioClient;

  constructor() {
    this.client = new MinioClient({
      endPoint: config.minio.endPoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey
    });

    this.initBucket();
  }

  private async initBucket(): Promise<void> {
    try {
      const bucketExists = await this.client.bucketExists(config.minio.bucket);
      if (!bucketExists) {
        await this.client.makeBucket(config.minio.bucket, 'us-east-1');
        console.log(`Bucket ${config.minio.bucket} created successfully`);
      } else {
        console.log(`Bucket ${config.minio.bucket} already exists`);
      }
    } catch (error) {
      console.error('Error initializing MinIO bucket:', error);
    }
  }

  async uploadFile(bucketName: string, objectName: string, filePath: string): Promise<void> {
    try {
      await this.client.fPutObject(bucketName, objectName, filePath);
      console.log(`File ${filePath} uploaded to ${bucketName}/${objectName}`);
    } catch (error) {
      console.error('Error uploading file to MinIO:', error);
      throw error;
    }
  }

  async uploadStream(bucketName: string, objectName: string, stream: NodeJS.ReadableStream, size: number): Promise<void> {
    try {
      await this.client.putObject(bucketName, objectName, stream, size);
      console.log(`Stream uploaded to ${bucketName}/${objectName}`);
    } catch (error) {
      console.error('Error uploading stream to MinIO:', error);
      throw error;
    }
  }

  async downloadFile(bucketName: string, objectName: string, filePath: string): Promise<void> {
    try {
      await this.client.fGetObject(bucketName, objectName, filePath);
      console.log(`File ${objectName} downloaded to ${filePath}`);
    } catch (error) {
      console.error('Error downloading file from MinIO:', error);
      throw error;
    }
  }

  async getFileStream(bucketName: string, objectName: string): Promise<NodeJS.ReadableStream> {
    try {
      const stream = await this.client.getObject(bucketName, objectName);
      console.log(`File stream obtained for ${bucketName}/${objectName}`);
      return stream;
    } catch (error) {
      console.error('Error getting file stream from MinIO:', error);
      throw error;
    }
  }

  async removeFile(bucketName: string, objectName: string): Promise<void> {
    try {
      await this.client.removeObject(bucketName, objectName);
      console.log(`File ${objectName} removed from ${bucketName}`);
    } catch (error) {
      console.error('Error removing file from MinIO:', error);
      throw error;
    }
  }

  async fileExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(bucketName, objectName);
      return true;
    } catch (error) {
      if (error instanceof Error && (error as any).code === 'NoSuchKey') {
        return false;
      }
      console.error('Error checking file existence in MinIO:', error);
      throw error;
    }
  }

  async getFileInfo(bucketName: string, objectName: string): Promise<any> {
    try {
      const stats = await this.client.statObject(bucketName, objectName);
      return stats;
    } catch (error) {
      console.error('Error getting file info from MinIO:', error);
      throw error;
    }
  }

  async listObjects(bucketName: string, prefix?: string): Promise<any[]> {
    try {
      const objects = [];
      const stream = this.client.listObjects(bucketName, prefix, true);

      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => objects.push(obj));
        stream.on('end', () => resolve(objects));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error listing objects in MinIO:', error);
      throw error;
    }
  }
}

export default new MinioService();