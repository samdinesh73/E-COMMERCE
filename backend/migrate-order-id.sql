-- Migration to update login_orders table with custom order ID starting from 1000

-- Step 1: Backup existing data (optional - comment out if you want to keep data)
-- CREATE TABLE login_orders_backup AS SELECT * FROM login_orders;

-- Step 2: Drop the existing login_orders table
DROP TABLE IF EXISTS login_orders;

-- Step 3: Create login_orders table with AUTO_INCREMENT starting from 1000
CREATE TABLE login_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  full_name VARCHAR(255),
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

-- Step 4: Set the AUTO_INCREMENT to start from 1000
ALTER TABLE login_orders AUTO_INCREMENT = 1000;

-- Verification query - run this to check
-- SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='login_orders' AND TABLE_SCHEMA='shop_db';
