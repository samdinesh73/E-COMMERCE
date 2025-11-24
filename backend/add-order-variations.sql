-- Add variations column to order_items and guest_order_items tables

USE shop_db;

-- Add variations column to order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variations JSON;

-- Add variations column to guest_order_items
ALTER TABLE guest_order_items ADD COLUMN IF NOT EXISTS variations JSON;

-- Verify columns were added
DESCRIBE order_items;
DESCRIBE guest_order_items;
