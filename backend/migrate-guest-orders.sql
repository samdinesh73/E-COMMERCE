-- Migration to support guest checkout
-- This script adds guest_name and guest_email columns to existing orders table
-- and makes user_id nullable

USE shop_db;

-- Add guest columns if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);

-- Make user_id nullable and update foreign key constraint
-- Note: This requires dropping and recreating the foreign key
ALTER TABLE orders 
DROP FOREIGN KEY orders_ibfk_1;

ALTER TABLE orders 
MODIFY user_id INT NULL;

ALTER TABLE orders 
ADD CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Verify the changes
SHOW COLUMNS FROM orders;
