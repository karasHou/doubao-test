-- 游戏资源地图查询系统 - 数据库表结构
-- PostgreSQL + PostGIS

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS postgis;

-- 资源类型枚举
CREATE TYPE resource_type AS ENUM (
    'plant',     -- 植物
    'animal',    -- 动物
    'mineral',   -- 矿产
    'task'       -- 任务
);

-- 稀有度/等级枚举
CREATE TYPE resource_rarity AS ENUM (
    'common',    -- 普通
    'uncommon',  --  uncommon
    'rare',      -- 稀有
    'epic',      -- 史诗
    'legendary'  -- 传奇
);

-- 资源点表
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type resource_type NOT NULL,
    rarity resource_rarity NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    -- 空间位置 (PostGIS 点类型)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    -- 资源数量
    quantity INTEGER NOT NULL DEFAULT 1,
    -- 刷新时间
    refresh_time TIMESTAMP WITH TIME ZONE,
    -- 创建和更新时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建空间索引 (关键优化: 空间查询性能)
CREATE INDEX idx_resources_location ON resources USING GIST (location);

-- 创建复合索引 (类型 + 稀有度 + 等级)
CREATE INDEX idx_resources_type_rarity_level ON resources (type, rarity, level);

-- 更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建更新时间触发器
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE
    ON resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 示例数据 (可选)
INSERT INTO resources (name, type, rarity, level, description, location, quantity)
VALUES
('普通草药', 'plant', 'common', 1, '用于制作低级药剂', ST_GeogFromText('POINT(116.40 39.90)'), 10),
('铁矿石', 'mineral', 'common', 2, '用于制作武器和 armor', ST_GeogFromText('POINT(116.39 39.91)'), 5),
('野兔', 'animal', 'uncommon', 1, '可获取兔肉和毛皮', ST_GeogFromText('POINT(116.41 39.89)'), 3),
('古老遗迹', 'task', 'rare', 5, '包含珍贵宝藏的古代遗迹', ST_GeogFromText('POINT(116.42 39.92)'), 1);
