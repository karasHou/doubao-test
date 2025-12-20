-- 启用 TimescaleDB 扩展
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 创建数据库表
CREATE TABLE IF NOT EXISTS devices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20),
  location VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS energy_readings (
  time TIMESTAMPTZ NOT NULL,
  device_id INTEGER REFERENCES devices(id),
  power DOUBLE PRECISION NOT NULL,
  energy DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  device_id INTEGER REFERENCES devices(id),
  type VARCHAR(20),
  message TEXT,
  level VARCHAR(10),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 TimescaleDB Hypertable
SELECT create_hypertable('energy_readings', 'time');

-- 插入示例设备数据
INSERT INTO devices (name, type, location) VALUES
('空调', '空调', '客厅'),
('冰箱', '冰箱', '厨房'),
('电视', '电视', '客厅'),
('热水器', '热水器', '浴室')
ON CONFLICT DO NOTHING;
