-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(10, 2) DEFAULT 0,
  max_uses INT DEFAULT NULL,
  current_uses INT DEFAULT 0,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active),
  INDEX idx_expires (expires_at)
);

-- Create coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT,
  order_id INT,
  discount_amount DECIMAL(10, 2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_coupon (coupon_id),
  INDEX idx_user (user_id),
  INDEX idx_order (order_id)
);

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_uses, expires_at, is_active) 
VALUES
('SAVE10', '10% off on all products', 'percentage', 10, 0, 100, DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('FLAT500', '₹500 off on orders above ₹2000', 'fixed', 500, 2000, 50, DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('WELCOME20', '20% off for new customers', 'percentage', 20, 0, 200, DATE_ADD(NOW(), INTERVAL 60 DAY), 1),
('SUMMER50', 'Summer sale - ₹50 off', 'fixed', 50, 500, 150, DATE_ADD(NOW(), INTERVAL 14 DAY), 1);
