const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// PostgreSQL 连接
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'leave_approval',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

// Redis 连接
let redisClient = null;

try {
  redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.connect().then(() => {
    console.log('Connected to Redis');
  });
} catch (err) {
  console.error('Failed to create Redis client:', err);
  // 创建一个模拟的 Redis 客户端，以便系统在没有 Redis 的情况下也能工作
  redisClient = {
    get: async (key) => null,
    set: async (key, value) => null,
    del: async (key) => null
  };
}

// 导出连接以便在路由中使用
module.exports = { pool, redisClient };

// 路由
app.use('/api/employees', require('./routes/employees'));
app.use('/api/leave-types', require('./routes/leave-types'));
app.use('/api/leave-applications', require('./routes/leave-applications'));
app.use('/api/approvals', require('./routes/approvals'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
