CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  price NUMERIC(10,2),
  image VARCHAR(255),
  category VARCHAR(50),
  stock INT DEFAULT 100
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id),
  quantity INT,
  total NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (name, price, image, category) VALUES
  ('MacBook Pro 14"', 1999.99, 'https://picsum.photos/seed/mac/300/200', 'Laptops'),
  ('Sony WH-1000XM5', 349.99, 'https://picsum.photos/seed/sony/300/200', 'Audio'),
  ('iPhone 15 Pro', 1099.99, 'https://picsum.photos/seed/iphone/300/200', 'Phones'),
  ('Samsung 4K Monitor', 499.99, 'https://picsum.photos/seed/monitor/300/200', 'Monitors'),
  ('Logitech MX Master 3', 99.99, 'https://picsum.photos/seed/mouse/300/200', 'Accessories'),
  ('iPad Air', 749.99, 'https://picsum.photos/seed/ipad/300/200', 'Tablets');