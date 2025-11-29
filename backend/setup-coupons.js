#!/usr/bin/env node

/**
 * SETUP INSTRUCTIONS FOR COUPON FEATURE
 * 
 * This script will:
 * 1. Create coupon database tables
 * 2. Insert sample coupon data
 * 3. Test the API endpoints
 */

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Sellerrocket@2025",
  database: process.env.DB_NAME || "shop_db",
  port: process.env.DB_PORT || 3306,
};

async function setupCouponSystem() {
  let connection;

  try {
    console.log("\n🚀 COUPON SYSTEM SETUP\n");
    console.log("Database Configuration:");
    console.log(`  Host: ${DB_CONFIG.host}`);
    console.log(`  Database: ${DB_CONFIG.database}`);
    console.log(`  User: ${DB_CONFIG.user}\n`);

    // Connect to database
    console.log("🔄 Connecting to database...");
    connection = await mysql.createConnection(DB_CONFIG);
    console.log("✅ Connected successfully!\n");

    // Read SQL file
    const sqlFile = path.join(__dirname, "create-coupons.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    // Split into statements
    const statements = sql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Executing...`);
        
        // Log first 80 chars of statement
        const preview = statement
          .split("\n")[0]
          .substring(0, 80)
          .replace(/\s+/g, " ");
        console.log(`     ${preview}`);
        
        await connection.execute(statement);
        console.log("     ✅ Success\n");
      } catch (err) {
        if (err.code === "ER_TABLE_EXISTS_ERROR") {
          console.log("     ⚠️  Table already exists (skipping)\n");
        } else {
          console.error(`     ❌ Error: ${err.message}\n`);
          throw err;
        }
      }
    }

    // Verify tables exist
    console.log("📋 Verifying tables...\n");
    
    const [couponsTable] = await connection.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'coupons'
    `, [DB_CONFIG.database]);

    const [usageTable] = await connection.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'coupon_usage'
    `, [DB_CONFIG.database]);

    if (couponsTable.length > 0) {
      console.log("✅ coupons table exists");
    } else {
      console.log("❌ coupons table NOT found");
      return false;
    }

    if (usageTable.length > 0) {
      console.log("✅ coupon_usage table exists\n");
    } else {
      console.log("❌ coupon_usage table NOT found\n");
      return false;
    }

    // Verify sample data
    console.log("📦 Checking sample coupons...\n");
    const [coupons] = await connection.execute("SELECT code, discount_type, discount_value FROM coupons");
    
    if (coupons.length > 0) {
      console.log(`Found ${coupons.length} sample coupons:`);
      coupons.forEach((coupon) => {
        const value = coupon.discount_type === "percentage" 
          ? `${coupon.discount_value}%` 
          : `₹${coupon.discount_value}`;
        console.log(`  - ${coupon.code}: ${coupon.discount_type} (${value})`);
      });
      console.log();
    } else {
      console.log("⚠️  No sample coupons found\n");
    }

    console.log("✅ COUPON SYSTEM SETUP COMPLETED!\n");
    console.log("📝 NEXT STEPS:");
    console.log("  1. Restart your backend server: npm start");
    console.log("  2. Go to your cart page");
    console.log("  3. Enter coupon code: SAVE10");
    console.log("  4. Click Apply button");
    console.log("  5. See 10% discount applied\n");

    console.log("🧪 TESTING:");
    console.log("  curl http://localhost:5000/coupons");
    console.log("  curl -X POST http://localhost:5000/coupons/validate \\");
    console.log("    -H 'Content-Type: application/json' \\");
    console.log("    -d '{\"code\":\"SAVE10\",\"orderTotal\":5000}'\n");

    return true;
  } catch (err) {
    console.error("\n❌ SETUP FAILED!");
    console.error(`Error: ${err.message}\n`);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupCouponSystem().then((success) => {
  process.exit(success ? 0 : 1);
});
