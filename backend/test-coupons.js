/**
 * Coupon Feature Testing Guide
 * 
 * This document outlines all the endpoints and test cases for the coupon system
 */

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * PUBLIC ENDPOINTS
 */

// GET /coupons
// Description: Get all active coupons
// Response: [{ id, code, description, discount_type, discount_value, min_order_value, max_uses, current_uses, expires_at }]
// No authentication required

// POST /coupons/validate
// Description: Validate a coupon code and calculate discount
// Body: { code: "SAVE10", orderTotal: 5000 }
// Response: { valid: true, coupon: {...}, discountAmount: 500, finalTotal: 4500 }
// No authentication required

// GET /coupons/:id
// Description: Get specific coupon details
// Response: { id, code, description, discount_type, discount_value, min_order_value, max_uses, current_uses, expires_at, is_active }
// No authentication required

/**
 * PROTECTED ENDPOINTS (Require Authentication)
 */

// POST /coupons/apply
// Description: Apply coupon to an order (records usage)
// Headers: Authorization: Bearer {token}
// Body: { couponId: 1, orderId: 123, discountAmount: 500 }
// Response: { success: true, message: "Coupon applied successfully", usageId: 456 }
// Authentication required

/**
 * ADMIN ENDPOINTS (Require Authentication + Admin Role)
 */

// POST /coupons
// Description: Create new coupon
// Headers: Authorization: Bearer {token}
// Body: {
//   code: "NEWYEAR10",
//   description: "New Year Special - 10% off",
//   discount_type: "percentage",
//   discount_value: 10,
//   min_order_value: 1000,
//   max_uses: 500,
//   expires_at: "2025-01-31 23:59:59"
// }
// Response: { success: true, message: "Coupon created successfully", couponId: 5 }
// Admin authentication required

// PUT /coupons/:id
// Description: Update coupon details
// Headers: Authorization: Bearer {token}
// Body: { description: "Updated description", max_uses: 1000, is_active: 0 }
// Response: { success: true, message: "Coupon updated successfully" }
// Admin authentication required

// DELETE /coupons/:id
// Description: Delete a coupon
// Headers: Authorization: Bearer {token}
// Response: { success: true, message: "Coupon deleted successfully" }
// Admin authentication required

// GET /coupons/:id/usage
// Description: Get coupon usage history
// Headers: Authorization: Bearer {token}
// Response: [{ id, coupon_id, user_id, order_id, discount_amount, used_at }]
// Admin authentication required

// ============================================================================
// TEST CASES
// ============================================================================

/**
 * TEST 1: Validate Percentage Discount Coupon
 * 
 * Endpoint: POST /coupons/validate
 * Coupon: SAVE10 (10% off)
 * Order Total: ₹5000
 * Expected Discount: ₹500
 * Expected Final: ₹4500
 */
test1_validatePercentageCoupon = async () => {
  const response = await fetch("http://localhost:5000/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "SAVE10",
      orderTotal: 5000
    })
  });
  const data = await response.json();
  console.log("TEST 1 - Percentage Discount:", data);
  // Expected: { valid: true, discountAmount: 500, finalTotal: 4500 }
};

/**
 * TEST 2: Validate Fixed Discount Coupon
 * 
 * Endpoint: POST /coupons/validate
 * Coupon: FLAT500 (₹500 off, min ₹2000)
 * Order Total: ₹2500
 * Expected Discount: ₹500
 * Expected Final: ₹2000
 */
test2_validateFixedCoupon = async () => {
  const response = await fetch("http://localhost:5000/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "FLAT500",
      orderTotal: 2500
    })
  });
  const data = await response.json();
  console.log("TEST 2 - Fixed Discount:", data);
  // Expected: { valid: true, discountAmount: 500, finalTotal: 2000 }
};

/**
 * TEST 3: Validate Minimum Order Value
 * 
 * Endpoint: POST /coupons/validate
 * Coupon: FLAT500 (requires min ₹2000)
 * Order Total: ₹1500
 * Expected: Error - minimum order value not met
 */
test3_validateMinOrderValue = async () => {
  const response = await fetch("http://localhost:5000/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "FLAT500",
      orderTotal: 1500
    })
  });
  const data = await response.json();
  console.log("TEST 3 - Min Order Value Check:", data);
  // Expected: { error: "Minimum order value of ₹2000 required" }
};

/**
 * TEST 4: Invalid Coupon Code
 * 
 * Endpoint: POST /coupons/validate
 * Coupon: INVALIDCODE
 * Expected: Error - coupon not found
 */
test4_invalidCoupon = async () => {
  const response = await fetch("http://localhost:5000/coupons/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "INVALIDCODE",
      orderTotal: 5000
    })
  });
  const data = await response.json();
  console.log("TEST 4 - Invalid Coupon:", data);
  // Expected: { error: "Invalid or expired coupon code" }
};

/**
 * TEST 5: Get All Active Coupons
 * 
 * Endpoint: GET /coupons
 * Expected: Array of all active coupons
 */
test5_getAllCoupons = async () => {
  const response = await fetch("http://localhost:5000/coupons");
  const data = await response.json();
  console.log("TEST 5 - All Active Coupons:", data);
  // Expected: [{ id, code, description, discount_type, discount_value, ... }]
};

/**
 * TEST 6: Get Specific Coupon
 * 
 * Endpoint: GET /coupons/1
 * Expected: Coupon details for ID 1
 */
test6_getCouponById = async () => {
  const response = await fetch("http://localhost:5000/coupons/1");
  const data = await response.json();
  console.log("TEST 6 - Coupon by ID:", data);
  // Expected: { id: 1, code: "SAVE10", ... }
};

/**
 * TEST 7: Create New Coupon (Admin)
 * 
 * Endpoint: POST /coupons
 * Headers: Authorization: Bearer {admin_token}
 * Body: Create new coupon
 */
test7_createCoupon = async (adminToken) => {
  const response = await fetch("http://localhost:5000/coupons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      code: "NEWYEAR25",
      description: "New Year Special - 25% off",
      discount_type: "percentage",
      discount_value: 25,
      min_order_value: 500,
      max_uses: 200,
      expires_at: "2025-01-31 23:59:59"
    })
  });
  const data = await response.json();
  console.log("TEST 7 - Create Coupon:", data);
  // Expected: { success: true, couponId: X }
};

/**
 * TEST 8: Update Coupon (Admin)
 * 
 * Endpoint: PUT /coupons/1
 * Headers: Authorization: Bearer {admin_token}
 * Body: Update coupon details
 */
test8_updateCoupon = async (adminToken) => {
  const response = await fetch("http://localhost:5000/coupons/1", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      description: "Updated - 10% off on all products",
      max_uses: 500,
      is_active: 1
    })
  });
  const data = await response.json();
  console.log("TEST 8 - Update Coupon:", data);
  // Expected: { success: true, message: "Coupon updated successfully" }
};

/**
 * TEST 9: Apply Coupon to Order (Protected)
 * 
 * Endpoint: POST /coupons/apply
 * Headers: Authorization: Bearer {user_token}
 * Body: Apply coupon to order
 */
test9_applyCoupon = async (userToken) => {
  const response = await fetch("http://localhost:5000/coupons/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${userToken}`
    },
    body: JSON.stringify({
      couponId: 1,
      orderId: 123,
      discountAmount: 500
    })
  });
  const data = await response.json();
  console.log("TEST 9 - Apply Coupon:", data);
  // Expected: { success: true, message: "Coupon applied successfully" }
};

/**
 * TEST 10: Get Coupon Usage History (Admin)
 * 
 * Endpoint: GET /coupons/1/usage
 * Headers: Authorization: Bearer {admin_token}
 * Expected: Array of usage records
 */
test10_getCouponUsage = async (adminToken) => {
  const response = await fetch("http://localhost:5000/coupons/1/usage", {
    headers: {
      "Authorization": `Bearer ${adminToken}`
    }
  });
  const data = await response.json();
  console.log("TEST 10 - Coupon Usage History:", data);
  // Expected: [{ id, coupon_id, user_id, order_id, discount_amount, used_at }]
};

// ============================================================================
// FRONTEND INTEGRATION TEST
// ============================================================================

/**
 * Test CouponInput Component in Cart Page
 * 
 * 1. Navigate to /cart
 * 2. Scroll to Order Summary section
 * 3. Find "Have a coupon code?" section
 * 4. Enter: SAVE10
 * 5. Click "Apply"
 * 6. Verify:
 *    - Success message appears
 *    - Discount amount shows below Subtotal
 *    - Total is reduced by discount amount
 *    - Component changes to show applied coupon with remove button
 * 7. Click X to remove coupon
 * 8. Verify coupon is removed and total reverts to original
 */

// ============================================================================
// CURL COMMANDS FOR QUICK TESTING
// ============================================================================

/*
# Get all coupons
curl http://localhost:5000/coupons

# Validate coupon
curl -X POST http://localhost:5000/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE10","orderTotal":5000}'

# Create coupon (replace TOKEN with actual admin token)
curl -X POST http://localhost:5000/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "code":"NEWYEAR10",
    "description":"New Year Special",
    "discount_type":"percentage",
    "discount_value":10,
    "min_order_value":500,
    "max_uses":200,
    "expires_at":"2025-01-31 23:59:59"
  }'

# Get coupon usage
curl http://localhost:5000/coupons/1/usage \
  -H "Authorization: Bearer TOKEN"
*/

// ============================================================================
// QUICK TEST RUNNER
// ============================================================================

(async () => {
  console.log("🧪 Starting Coupon Feature Tests...\n");
  
  try {
    console.log("\n=== PUBLIC TESTS ===\n");
    await test1_validatePercentageCoupon();
    await test2_validateFixedCoupon();
    await test3_validateMinOrderValue();
    await test4_invalidCoupon();
    await test5_getAllCoupons();
    await test6_getCouponById();
    
    console.log("\n✅ All public tests completed!");
    console.log("\n📝 For protected/admin tests, run with authentication tokens:");
    console.log("   - Get tokens from login endpoint");
    console.log("   - Pass as parameter to test functions");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
})();
