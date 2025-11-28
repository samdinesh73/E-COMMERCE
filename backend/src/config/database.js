require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Sellerrocket@2025",
  database: process.env.DB_NAME || "shop_db",
  port: process.env.DB_PORT || 3306,
});

// Create a promise wrapper for async/await support
const dbPromise = db.promise();

db.connect((err) => {
  if (err) {
    console.error("❌ Database Connection Error:", err.message);
    process.exit(1);
  } else {
    console.log("✅ MySQL Connected Successfully");
  }
});

// Ensure optional 'description' column exists to be compatible with frontend payloads.
// This makes the backend tolerant of clients that send a description field.
const dbName = process.env.DB_NAME || "shop_db";
const ensureDescriptionColumn = () => {
  const checkSql = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'description'`;
  db.query(checkSql, [dbName], (err, results) => {
    if (err) {
      console.error("Error checking columns:", err.message);
      return;
    }
    if (results.length === 0) {
      console.log("'description' column missing -> attempting to add it...");
      db.query("ALTER TABLE products ADD COLUMN description TEXT", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add 'description' column:", alterErr.message);
        } else {
          console.log("Added 'description' column to products table.");
        }
      });
    } else {
      // console.log("'description' column already present.");
    }
  });
};

// Ensure product_images table exists for storing additional product images
const ensureProductImagesTable = () => {
  const checkTableSql = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'product_images'`;
  db.query(checkTableSql, [dbName], (err, results) => {
    if (err) {
      console.error("Error checking product_images table:", err.message);
      return;
    }
    if (results.length === 0) {
      console.log("product_images table missing -> creating it...");
      const createTableSql = `
        CREATE TABLE product_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_id INT NOT NULL,
          image_path VARCHAR(255) NOT NULL,
          angle_description VARCHAR(255),
          display_order INT DEFAULT 0,
          is_primary BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          INDEX idx_product_id (product_id),
          INDEX idx_is_primary (is_primary),
          INDEX idx_product_order (product_id, display_order)
        )
      `;
      db.query(createTableSql, (createErr) => {
        if (createErr) {
          console.error("Failed to create product_images table:", createErr.message);
        } else {
          console.log("✅ Created product_images table successfully.");
        }
      });
    } else {
      console.log("✅ product_images table already exists.");
    }
  });
};

// Ensure phone column exists in orders table for guest checkout
const ensurePhoneColumn = () => {
  const checkSql = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'phone'`;
  db.query(checkSql, [dbName], (err, results) => {
    if (err) {
      console.error("Error checking phone column:", err.message);
      return;
    }
    if (results.length === 0) {
      console.log("'phone' column missing in orders table -> adding it...");
      db.query("ALTER TABLE orders ADD COLUMN phone VARCHAR(20) AFTER guest_email", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add 'phone' column:", alterErr.message);
        } else {
          console.log("✅ Added 'phone' column to orders table.");
        }
      });
    } else {
      console.log("✅ phone column already exists in orders table.");
    }
  });
};

// Ensure parent_id column exists in categories table for subcategories feature
const ensureParentIdColumn = () => {
  const checkSql = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'parent_id'`;
  db.query(checkSql, [dbName], (err, results) => {
    if (err) {
      console.error("Error checking parent_id column:", err.message);
      return;
    }
    if (results.length === 0) {
      console.log("'parent_id' column missing in categories table -> adding it...");
      db.query("ALTER TABLE categories ADD COLUMN parent_id INT DEFAULT NULL", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add 'parent_id' column:", alterErr.message);
        } else {
          console.log("✅ Added 'parent_id' column to categories table.");
          // Add foreign key constraint
          db.query("ALTER TABLE categories ADD CONSTRAINT fk_parent_id FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL", (fkErr) => {
            if (fkErr) {
              console.error("Error adding foreign key constraint:", fkErr.message);
            } else {
              console.log("✅ Added foreign key constraint for parent_id.");
            }
          });
        }
      });
    } else {
      console.log("✅ parent_id column already exists in categories table.");
    }
  });
};

// Ensure phone and avatar columns exist in users table for user profiles
const ensureUserColumnsExist = () => {
  const checkSql = `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('phone', 'avatar')`;
  db.query(checkSql, [dbName], (err, results) => {
    if (err) {
      console.error("Error checking user columns:", err.message);
      return;
    }
    const hasPhone = results.some(col => col.COLUMN_NAME === 'phone');
    const hasAvatar = results.some(col => col.COLUMN_NAME === 'avatar');

    // Add phone column if missing
    if (!hasPhone) {
      console.log("'phone' column missing in users table -> adding it...");
      db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER email", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add 'phone' column:", alterErr.message);
        } else {
          console.log("✅ Added 'phone' column to users table.");
        }
      });
    } else {
      console.log("✅ phone column already exists in users table.");
    }

    // Add avatar column if missing
    if (!hasAvatar) {
      console.log("'avatar' column missing in users table -> adding it...");
      db.query("ALTER TABLE users ADD COLUMN avatar VARCHAR(255) AFTER phone", (alterErr) => {
        if (alterErr) {
          console.error("Failed to add 'avatar' column:", alterErr.message);
        } else {
          console.log("✅ Added 'avatar' column to users table.");
        }
      });
    } else {
      console.log("✅ avatar column already exists in users table.");
    }
  });
};

// Ensure user_addresses table exists for managing multiple addresses per user
const ensureUserAddressesTable = () => {
  const checkTableSql = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_addresses'`;
  db.query(checkTableSql, [dbName], (err, results) => {
    if (err) {
      console.error("Error checking user_addresses table:", err.message);
      return;
    }
    if (results.length === 0) {
      console.log("user_addresses table missing -> creating it...");
      const createTableSql = `
        CREATE TABLE user_addresses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          address_line VARCHAR(500) NOT NULL,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(20),
          country VARCHAR(100),
          is_default BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_is_default (is_default)
        )
      `;
      db.query(createTableSql, (createErr) => {
        if (createErr) {
          console.error("Failed to create user_addresses table:", createErr.message);
        } else {
          console.log("✅ Created user_addresses table successfully.");
        }
      });
    } else {
      console.log("✅ user_addresses table already exists.");
    }
  });
};

// Run checks after a short delay to allow schema availability on startup.
setTimeout(ensureDescriptionColumn, 500);
setTimeout(ensureProductImagesTable, 1000);
setTimeout(ensurePhoneColumn, 1500);
setTimeout(ensureParentIdColumn, 2000);
setTimeout(ensureUserColumnsExist, 2500);
setTimeout(ensureUserAddressesTable, 3000);

// Export promise-based connection
module.exports = dbPromise;
