-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer' AFTER password;

-- Update existing users to have 'customer' role if they don't have one
UPDATE users SET role = 'customer' WHERE role IS NULL;

-- Create index on role for faster queries
CREATE INDEX idx_users_role ON users(role);

-- Optional: Create one or more admin users (change email/password as needed)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
