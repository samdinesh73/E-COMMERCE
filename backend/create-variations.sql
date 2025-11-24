-- Create product_variations table
CREATE TABLE IF NOT EXISTS product_variations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  variation_type VARCHAR(50) NOT NULL DEFAULT 'Size',
  variation_value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  stock_quantity INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_variation (product_id, variation_type, variation_value)
);

-- Create variation_images table
CREATE TABLE IF NOT EXISTS variation_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  variation_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  image_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_product_id ON product_variations(product_id);
CREATE INDEX idx_variation_id ON variation_images(variation_id);
