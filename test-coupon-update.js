// Test script to verify coupon update logic
const axios = require("axios");

const API_BASE_URL = "http://localhost:3001/api";

async function testCouponUpdate() {
  try {
    // First, get a token (assuming you have admin access)
    // Skip for now - use existing token from localStorage
    const token = "your_admin_token_here"; // You need to replace this

    console.log("=== Testing Coupon Update ===\n");

    // 1. Create a test coupon
    console.log("1. Creating test coupon...");
    const createResponse = await axios.post(
      `${API_BASE_URL}/coupons`,
      {
        code: "TESTUPDATE",
        description: "Test update coupon",
        discount_type: "percentage",
        discount_value: 10,
        min_order_value: 500,
        max_uses: 100,
        expires_at: "2025-12-31",
        is_active: 1,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const couponId = createResponse.data.couponId;
    console.log(`Created coupon ID: ${couponId}\n`);

    // 2. Fetch the coupon to see initial state
    console.log("2. Fetching created coupon...");
    const getResponse = await axios.get(`${API_BASE_URL}/coupons/${couponId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Initial coupon:", JSON.stringify(getResponse.data, null, 2), "\n");

    // 3. Update the coupon (toggle inactive)
    console.log("3. Updating coupon (setting to inactive)...");
    const updateResponse = await axios.put(
      `${API_BASE_URL}/coupons/${couponId}`,
      {
        code: "TESTUPDATE",
        description: "Updated description",
        discount_type: "percentage",
        discount_value: 15,
        min_order_value: 500,
        max_uses: 100,
        expires_at: "2025-12-31",
        is_active: 0, // <-- Setting to inactive
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Update response:", JSON.stringify(updateResponse.data, null, 2), "\n");

    // 4. Fetch the coupon again to verify it still exists
    console.log("4. Fetching updated coupon...");
    const getFinalResponse = await axios.get(`${API_BASE_URL}/coupons/${couponId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Final coupon state:", JSON.stringify(getFinalResponse.data, null, 2), "\n");

    // 5. Check if coupon exists in all coupons list
    console.log("5. Checking if coupon is in all coupons list...");
    const allCouponsResponse = await axios.get(`${API_BASE_URL}/coupons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const foundInList = allCouponsResponse.data.some(c => c.id === couponId);
    console.log(`Coupon found in list: ${foundInList}`);
    console.log(`Total coupons: ${allCouponsResponse.data.length}\n`);

    if (foundInList) {
      console.log("✅ SUCCESS: Coupon was NOT deleted on update!");
    } else {
      console.log("❌ FAILED: Coupon was deleted on update!");
    }
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

testCouponUpdate();
