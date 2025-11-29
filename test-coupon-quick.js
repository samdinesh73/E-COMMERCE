#!/usr/bin/env node

/**
 * Quick API Test - verify coupon endpoint is working
 */

const http = require("http");

function testCouponAPI() {
  const postData = JSON.stringify({
    code: "SAVE10",
    orderTotal: 5000
  });

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/coupons/validate",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  };

  console.log("\n🧪 Testing Coupon API\n");
  console.log("Request: POST http://localhost:5000/coupons/validate");
  console.log("Body:", { code: "SAVE10", orderTotal: 5000 });
  console.log("\nWaiting for response...\n");

  const req = http.request(options, (res) => {
    let data = "";

    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Status:", res.statusCode);
      console.log("Response:");
      
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.valid) {
          console.log("\n✅ SUCCESS!");
          console.log(`   Code: ${parsed.coupon.code}`);
          console.log(`   Discount: ₹${parsed.discountAmount}`);
          console.log(`   Final Total: ₹${parsed.finalTotal}`);
        }
      } catch (e) {
        console.log(data);
      }
      console.log("\n");
    });
  });

  req.on("error", (error) => {
    console.error("❌ Error:", error.message);
    if (error.code === "ECONNREFUSED") {
      console.log("\n⚠️  Backend server is not running on port 5000");
      console.log("   Run: npm start (in backend directory)");
    }
  });

  req.write(postData);
  req.end();
}

testCouponAPI();
