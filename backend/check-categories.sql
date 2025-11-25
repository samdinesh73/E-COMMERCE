-- Check categories table structure
DESCRIBE categories;

-- Check if parent_id column exists and has correct type
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'categories' AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;

-- Check if there's a foreign key on parent_id
SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'categories' AND TABLE_SCHEMA = DATABASE();

-- Sample query to see what's in the categories table
SELECT id, name, slug, parent_id FROM categories LIMIT 10;
