export default {
  port: process.env.PORT || 3001,
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    bucket: process.env.MINIO_BUCKET || 'file-uploads'
  },
  chunk: {
    size: 1024 * 1024 * 5, // 5MB per chunk
    retryCount: 3,
    retryDelay: 1000
  }
};