-- Create database if not exists
CREATE DATABASE IF NOT EXISTS shop_db;
USE shop_db;

-- Create products table with all necessary columns
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  city VARCHAR(100),
  pincode VARCHAR(20),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Sample products (optional - comment out if you already have products)
-- INSERT INTO products (name, price, image, description) VALUES
-- ('iPhone 15 Pro', 79999, '/uploads/iphone15.jpg', 'Latest Apple smartphone with advanced features'),
-- ('Samsung Galaxy S24', 74999, '/uploads/samsung-s24.jpg', 'Premium Android phone with great camera'),
-- ('Redmi Note 13', 22999, '/uploads/redmi-note13.jpg', 'Budget-friendly smartphone with great performance');
