#!/usr/bin/env node

/**
 * COUPON SYSTEM DIAGNOSTICS
 * 
 * Run this to check if coupon system is properly set up
 */

const http = require("http");
const mysql = require("mysql2/promise");
require("dotenv").config();

const API_URL = "http://localhost:5000";
const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Sellerrocket@2025",
  database: process.env.DB_NAME || "shop_db",
  port: process.env.DB_PORT || 3306,
};

function makeHttpRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
          });
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function runDiagnostics() {
  console.log("\n🔍 COUPON SYSTEM DIAGNOSTICS\n");
  console.log("=" .repeat(60));

  // Check 1: Database Connection
  console.log("\n1️⃣  DATABASE CONNECTION");
  try {
    const conn = await mysql.createConnection(DB_CONFIG);
    console.log(`✅ Connected to ${DB_CONFIG.database} at ${DB_CONFIG.host}`);
    
    const [tables] = await conn.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('coupons', 'coupon_usage')
    `, [DB_CONFIG.database]);

    if (tables.length === 0) {
      console.log("❌ Coupon tables NOT FOUND in database!");
      console.log("   Run: node setup-coupons.js");
    } else if (tables.length === 1) {
      console.log(`⚠️  Only 1 table found (expected 2):`);
      tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));
    } else {
      console.log("✅ Both coupon tables exist:");
      tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));

      // Check coupon count
      const [coupons] = await conn.execute("SELECT COUNT(*) as count FROM coupons");
      console.log(`✅ Found ${coupons[0].count} sample coupons`);
    }

    await conn.end();
  } catch (err) {
    console.log(`❌ Database Error: ${err.message}`);
  }

  // Check 2: Backend Server
  console.log("\n2️⃣  BACKEND SERVER");
  try {
    console.log(`🔄 Checking ${API_URL}...`);
    const result = await makeHttpRequest("GET", "/health");
    if (result.status === 200) {
      console.log("✅ Backend server is running");
    } else {
      console.log(`⚠️  Server responded with status ${result.status}`);
    }
  } catch (err) {
    console.log(`❌ Server Error: ${err.message}`);
    console.log("   Make sure backend is running: npm start");
    process.exit(1);
  }

  // Check 3: Coupon Routes
  console.log("\n3️⃣  COUPON ROUTES");
  
  try {
    console.log("🔄 Testing GET /coupons...");
    let result = await makeHttpRequest("GET", "/coupons");
    if (result.status === 200) {
      console.log(`✅ GET /coupons works (found ${(result.data || []).length} coupons)`);
    } else {
      console.log(`❌ Status: ${result.status}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }

  try {
    console.log("🔄 Testing POST /coupons/validate...");
    const result = await makeHttpRequest("POST", "/coupons/validate");
    // Expect 400 because we're not sending body, but route should exist
    if (result.status === 400 || result.status === 200) {
      console.log(`✅ POST /coupons/validate route exists (status: ${result.status})`);
    } else if (result.status === 404) {
      console.log(`❌ Route NOT FOUND (404)`);
      console.log("   This might be a route ordering issue in couponRoutes.js");
    } else {
      console.log(`⚠️  Status: ${result.status}`);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }

  // Check 4: Sample Request
  console.log("\n4️⃣  SAMPLE REQUEST TEST");
  try {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: "/coupons/validate",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    const result = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          resolve({ status: res.statusCode, data: JSON.parse(body || "{}") });
        });
      });
      req.on("error", reject);
      req.write(JSON.stringify({ code: "SAVE10", orderTotal: 5000 }));
      req.end();
    });

    if (result.status === 200 && result.data.valid) {
      console.log("✅ Sample coupon validation works!");
      console.log(`   Discount: ₹${result.data.discountAmount}`);
      console.log(`   Final Total: ₹${result.data.finalTotal}`);
    } else if (result.status === 404) {
      console.log("❌ Route returned 404 (NOT FOUND)");
    } else {
      console.log(`Status: ${result.status}`);
      console.log(`Response:`, result.data);
    }
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✅ DIAGNOSTICS COMPLETE\n");
}

runDiagnostics().catch(console.error);
