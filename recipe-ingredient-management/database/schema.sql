-- 智能菜谱与食材管理系统 - 数据库初始化脚本
-- PostgreSQL

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 食材分类表
CREATE TABLE IF NOT EXISTS ingredient_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 食材表
CREATE TABLE IF NOT EXISTS ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES ingredient_categories(id),
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit VARCHAR(20) NOT NULL,
    expiration_date DATE,
    is_expired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 菜谱表
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cooking_time INTEGER NOT NULL, -- 烹饪时间（分钟）
    difficulty VARCHAR(20) NOT NULL, -- '简单', '中等', '困难'
    cuisine_type VARCHAR(50), -- 菜系
    servings INTEGER NOT NULL DEFAULT 1,
    instructions TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 菜谱食材关联表
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id),
    ingredient_name VARCHAR(100) NOT NULL,
    quantity NUMERIC NOT NULL,
    unit VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 菜谱标签表
CREATE TABLE IF NOT EXISTS recipe_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id),
    tag VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入初始数据

-- 食材分类
INSERT INTO ingredient_categories (name) VALUES
('蔬菜'), ('水果'), ('肉类'), ('海鲜'), ('谷物'), ('乳制品'), ('调料');

-- 示例食材
INSERT INTO ingredients (name, category_id, quantity, unit, expiration_date)
SELECT
    '西红柿', c.id, 5, '个', CURRENT_DATE + INTERVAL '7 days'
FROM ingredient_categories c WHERE c.name = '蔬菜';

INSERT INTO ingredients (name, category_id, quantity, unit, expiration_date)
SELECT
    '鸡蛋', c.id, 12, '个', CURRENT_DATE + INTERVAL '14 days'
FROM ingredient_categories c WHERE c.name = '乳制品';

INSERT INTO ingredients (name, category_id, quantity, unit, expiration_date)
SELECT
    '面粉', c.id, 1, '千克', CURRENT_DATE + INTERVAL '90 days'
FROM ingredient_categories c WHERE c.name = '谷物';

-- 示例菜谱
INSERT INTO recipes (name, description, cooking_time, difficulty, cuisine_type, servings, instructions)
VALUES (
    '西红柿炒蛋',
    '经典的家常菜，简单又美味',
    15,
    '简单',
    '中式',
    2,
    '1. 西红柿切块，鸡蛋打散\n2. 热锅倒油，倒入鸡蛋液\n3. 鸡蛋凝固后盛出备用\n4. 锅中再倒油，炒香葱花\n5. 加入西红柿翻炒至出汁\n6. 加入炒好的鸡蛋\n7. 加盐调味，翻炒均匀\n8. 出锅装盘'
);

-- 菜谱食材关联
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
SELECT r.id, '西红柿', 2, '个' FROM recipes r WHERE r.name = '西红柿炒蛋';

INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
SELECT r.id, '鸡蛋', 3, '个' FROM recipes r WHERE r.name = '西红柿炒蛋';

INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
SELECT r.id, '盐', 0.5, '茶匙' FROM recipes r WHERE r.name = '西红柿炒蛋';

-- 菜谱标签
INSERT INTO recipe_tags (recipe_id, tag)
SELECT r.id, '家常菜' FROM recipes r WHERE r.name = '西红柿炒蛋';

INSERT INTO recipe_tags (recipe_id, tag)
SELECT r.id, '快手菜' FROM recipes r WHERE r.name = '西红柿炒蛋';
