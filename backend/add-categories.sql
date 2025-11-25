-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  parent_id INT DEFAULT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add category_id column to products table
ALTER TABLE products ADD COLUMN category_id INT AFTER description;
ALTER TABLE products ADD FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Note: Images are now stored as filenames in /public/uploads/
-- They are uploaded via the admin panel CategoryManager component
-- No sample data with images needed since uploads are handled separately
