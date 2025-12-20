const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'deliver_system',
});

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS 快递 (
        id SERIAL PRIMARY KEY,
        单号 VARCHAR(50) UNIQUE NOT NULL,
        快递公司 VARCHAR(50),
        当前状态 VARCHAR(50) DEFAULT '待处理',
        物流信息 JSONB,
        异常状态 BOOLEAN DEFAULT FALSE,
        创建时间 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        更新时间 TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_快递_单号 ON 快递 (单号)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_快递_当前状态 ON 快递 (当前状态)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_快递_更新时间 ON 快递 (更新时间)
    `);

    console.log('数据库表初始化完成');
  } catch (error) {
    console.error('初始化数据库失败:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase
};
