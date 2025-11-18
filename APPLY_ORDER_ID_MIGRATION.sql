-- IMPORTANT: Run this migration to update login_orders table order IDs to start from 1000

-- Login to MySQL first:
-- mysql -u root -p

-- Select the database:
-- USE shop_db;

-- Then run these queries:

-- Step 1: Check current AUTO_INCREMENT (before)
SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME='login_orders' AND TABLE_SCHEMA='shop_db';

-- Step 2: Drop the existing login_orders table (this will delete existing orders!)
DROP TABLE IF EXISTS login_orders;

-- Step 3: Recreate login_orders table with AUTO_INCREMENT starting from 1000
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

-- Step 4: Set AUTO_INCREMENT to 1000
ALTER TABLE login_orders AUTO_INCREMENT = 1000;

-- Step 5: Verify (check AUTO_INCREMENT is now 1000)
SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME='login_orders' AND TABLE_SCHEMA='shop_db';

-- Done! New orders will now have IDs: 1000, 1001, 1002, etc.
