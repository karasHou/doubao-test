import { query } from '../utils/database.js';

// 创建数据库表结构
const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    // 创建 assets 表
    await query(`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        asset_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'in_stock' NOT NULL,
        "user" VARCHAR(100),
        department VARCHAR(100),
        purchase_date DATE,
        price DECIMAL(10, 2) NOT NULL,
        supplier VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建 asset_transfers 表（领用记录）
    await query(`
      CREATE TABLE IF NOT EXISTS asset_transfers (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
        "user" VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        transfer_date DATE NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建 asset_returns 表（归还记录）
    await query(`
      CREATE TABLE IF NOT EXISTS asset_returns (
        id SERIAL PRIMARY KEY,
        asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
        "user" VARCHAR(100) NOT NULL,
        return_date DATE NOT NULL,
        condition VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建索引
    await query(`CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_assets_user ON assets("user")`);
    await query(`CREATE INDEX IF NOT EXISTS idx_asset_transfers_asset ON asset_transfers(asset_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_asset_returns_asset ON asset_returns(asset_id)`);

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此文件，则执行初始化
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase();
}

export default initDatabase;