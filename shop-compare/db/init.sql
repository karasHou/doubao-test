CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  store VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  price DECIMAL(10,2) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, category, current_price, store) VALUES
('iPhone 15 Pro', '手机', 7999.00, '京东'),
('iPhone 15 Pro', '手机', 8199.00, '天猫'),
('iPhone 15 Pro', '手机', 7899.00, '拼多多'),
('小米14', '手机', 4999.00, '京东'),
('小米14', '手机', 5099.00, '天猫'),
('华为Mate 60', '手机', 6999.00, '京东'),
('华为Mate 60', '手机', 7199.00, '华为商城'),
('MacBook Air M2', '笔记本电脑', 8999.00, '苹果官网'),
('MacBook Air M2', '笔记本电脑', 8799.00, '京东'),
('联想ThinkPad X1', '笔记本电脑', 9999.00, '京东'),
('联想ThinkPad X1', '笔记本电脑', 10199.00, '天猫');

INSERT INTO price_history (product_id, price, date) VALUES
(1, 8199.00, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(1, 8099.00, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 7999.00, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 8399.00, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(2, 8299.00, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(2, 8199.00, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, 8099.00, CURRENT_TIMESTAMP - INTERVAL '7 days'),
(3, 7999.00, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(3, 7899.00, CURRENT_TIMESTAMP - INTERVAL '3 days');