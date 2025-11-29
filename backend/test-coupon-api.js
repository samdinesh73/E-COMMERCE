#!/usr/bin/env node

/**
 * Quick test to verify coupon API endpoints
 * Run: node test-coupon-api.js
 */

const http = require("http");

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
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

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log("🧪 Testing Coupon API Endpoints\n");

  try {
    // Test 1: Get all coupons
    console.log("📋 TEST 1: GET /coupons");
    let result = await makeRequest("GET", "/coupons");
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.data);
    console.log();

    // Test 2: Validate coupon
    console.log("✓ TEST 2: POST /coupons/validate");
    result = await makeRequest("POST", "/coupons/validate", {
      code: "SAVE10",
      orderTotal: 5000,
    });
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.data);
    console.log();

    // Test 3: Get specific coupon
    console.log("📌 TEST 3: GET /coupons/1");
    result = await makeRequest("GET", "/coupons/1");
    console.log(`Status: ${result.status}`);
    console.log(`Response:`, result.data);
    console.log();

    console.log("✅ All tests completed!");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
    process.exit(1);
  }
}

// Wait for server to start if needed
setTimeout(runTests, 1000);
