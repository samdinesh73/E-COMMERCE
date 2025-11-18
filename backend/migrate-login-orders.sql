-- Migrate login_orders table to add phone, email, and full_name columns
ALTER TABLE login_orders ADD COLUMN email VARCHAR(255) AFTER user_id;
ALTER TABLE login_orders ADD COLUMN phone VARCHAR(20) AFTER email;
ALTER TABLE login_orders ADD COLUMN full_name VARCHAR(255) AFTER phone;
