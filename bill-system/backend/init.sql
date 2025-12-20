CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'expense',
  color VARCHAR(7) DEFAULT '#1890ff'
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  tags TEXT[],
  date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, type, color) VALUES
('餐饮', 'expense', '#FF6B6B'),
('交通', 'expense', '#4ECDC4'),
('购物', 'expense', '#45B7D1'),
('娱乐', 'expense', '#FFA07A'),
('医疗', 'expense', '#98D8C8'),
('教育', 'expense', '#F7DC6F'),
('住房', 'expense', '#BB8FCE'),
('工资', 'income', '#82E0AA');
