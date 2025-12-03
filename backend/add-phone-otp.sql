-- Add phone authentication columns to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(15) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP NULL;

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_phone ON users(phone);

-- Update existing records (optional)
UPDATE users SET otp_verified = TRUE WHERE phone IS NULL;

-- Verify changes
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = DATABASE();
