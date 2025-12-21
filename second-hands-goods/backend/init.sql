CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  brand VARCHAR(50),
  model VARCHAR(50),
  original_price DECIMAL(10, 2),
  estimated_price DECIMAL(10, 2),
  condition INTEGER CHECK (condition >= 1 AND condition <= 5),
  purchase_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id),
  price DECIMAL(10, 2) NOT NULL,
  estimated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, description) VALUES
('电子产品', '手机、电脑、数码配件等'),
('家具家居', '家具、家电、装饰用品等'),
('服装鞋帽', '衣服、鞋子、配饰等'),
('图书音像', '书籍、音乐、影视等'),
('运动户外', '运动器材、户外装备等'),
('其他', '未分类物品');