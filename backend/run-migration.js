#!/usr/bin/env node

require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Sellerrocket@2025",
    database: process.env.DB_NAME || "shop_db",
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log("🔄 Running coupon migration...\n");
    
    // Read SQL file
    const sqlFile = path.join(__dirname, "create-coupons.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log("✅ Executed:", statement.split("\n")[0].substring(0, 60) + "...");
      } catch (err) {
        if (err.code === "ER_TABLE_EXISTS_ERROR") {
          console.log("⚠️  Table already exists, skipping...");
        } else {
          console.error("❌ Error:", err.message);
          throw err;
        }
      }
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Checking tables...\n");

    // Verify tables exist
    const tables = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?",
      [process.env.DB_NAME || "shop_db"]
    );

    console.log("Available tables:");
    tables[0].forEach((table) => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    await connection.end();
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
