-- Migration to create login_orders table for authenticated user orders

USE shop_db;

-- Create login_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS login_orders (
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
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Verify the table was created
SHOW TABLES LIKE 'login_orders';
DESCRIBE login_orders;
