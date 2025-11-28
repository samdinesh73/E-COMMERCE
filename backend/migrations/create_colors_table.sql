-- Create colors table
CREATE TABLE IF NOT EXISTS colors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  color_name VARCHAR(100) NOT NULL UNIQUE,
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add color_id column to product_variations if it doesn't exist
ALTER TABLE product_variations 
ADD COLUMN IF NOT EXISTS color_id INT,
ADD CONSTRAINT fk_color_id FOREIGN KEY (color_id) REFERENCES colors(id) ON DELETE SET NULL;
