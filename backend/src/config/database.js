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

// Run checks after a short delay to allow schema availability on startup.
setTimeout(ensureDescriptionColumn, 500);
setTimeout(ensureProductImagesTable, 1000);

// Export promise-based connection
module.exports = dbPromise;
