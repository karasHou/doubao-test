-- 创建数据库表结构
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
);

-- 创建 asset_transfers 表（领用记录）
CREATE TABLE IF NOT EXISTS asset_transfers (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  "user" VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  transfer_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 asset_returns 表（归还记录）
CREATE TABLE IF NOT EXISTS asset_returns (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
  "user" VARCHAR(100) NOT NULL,
  return_date DATE NOT NULL,
  "condition" VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_user ON assets("user");
CREATE INDEX IF NOT EXISTS idx_asset_transfers_asset ON asset_transfers(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_returns_asset ON asset_returns(asset_id);

-- 插入示例数据
INSERT INTO assets (
  asset_number,
  name,
  category,
  status,
  purchase_date,
  price,
  supplier,
  description
) VALUES
('ASSET001', '联想笔记本电脑', 'electronic_equipment', 'in_stock', '2023-01-15', 5999.00, '联想官方旗舰店', '配置：i5-12代，16G内存，512G SSD'),
('ASSET002', '华为手机', 'electronic_equipment', 'in_use', '2023-03-20', 3999.00, '华为授权经销商', '型号：Mate 50，128G存储'),
('ASSET003', '办公椅', 'furniture_appliances', 'in_stock', '2023-02-10', 899.00, '得力办公家具', '人体工学设计，可调节高度'),
('ASSET004', '打印机', 'office_equipment', 'in_use', '2023-04-05', 1299.00, '惠普官方授权店', '型号：HP LaserJet Pro M404dn'),
('ASSET005', '会议桌', 'furniture_appliances', 'in_stock', '2023-05-15', 4599.00, '震旦家具', '尺寸：2.4米x1.2米，可容纳8人')
ON CONFLICT DO NOTHING;