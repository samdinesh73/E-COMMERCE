require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Sellerrocket@2025",
  database: process.env.DB_NAME || "shop_db",
  port: process.env.DB_PORT || 3306,
});

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

// Run this check after a short delay to allow schema availability on startup.
setTimeout(ensureDescriptionColumn, 500);

module.exports = db;
