CREATE DATABASE shopdb;
USE shopdb;
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  image VARCHAR(255)
);
INSERT INTO products (name, price, image) VALUES
("iPhone 15", 79999, "https://example.com/iphone.jpg"),
("Samsung S24", 69999, "https://example.com/s24.jpg"),
("Redmi Note 13", 15999, "https://example.com/redmi.jpg");
