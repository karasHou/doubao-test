import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// 创建数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'asset_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password'
});

// 测试数据库连接
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('数据库连接成功');
    client.release();
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

// 执行 SQL 查询
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('执行查询', { text, duration, rows: res.rowCount });
  return res;
};

export { pool, query, testConnection };