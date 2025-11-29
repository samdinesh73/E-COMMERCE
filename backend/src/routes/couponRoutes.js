const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const { authenticate, authorize } = require("../middleware/auth");

// IMPORTANT: In Express, route matching is specific:
// 1. Method (GET, POST, PUT, DELETE) is checked FIRST
// 2. Then path pattern is matched
// 3. More specific paths should be defined before generic :id patterns

// ========== PUBLIC READ ROUTES ==========

// GET all coupons (shows all coupons for admin view)
router.get("/", couponController.getAllCoupons);

// POST validate coupon code (public - no auth needed)
router.post("/validate", couponController.validateCoupon);

// ========== ADMIN CREATE/APPLY ROUTES (specific paths before :id) ==========

// POST apply coupon to order (authenticated users)
router.post("/apply", authenticate, couponController.applyCouponToOrder);

// POST create new coupon (admin only) - MUST be defined before /:id patterns
router.post("/", authenticate, authorize("admin"), couponController.createCoupon);

// ========== SPECIFIC :ID ROUTES (before generic :id) ==========

// GET coupon usage history
router.get("/:id/usage", authenticate, authorize("admin"), couponController.getCouponUsageHistory);

// ========== GENERIC :ID ROUTES (least specific - defined last) ==========

// GET specific coupon by ID
router.get("/:id", couponController.getCouponById);

// PUT update coupon (admin only)
router.put("/:id", authenticate, authorize("admin"), couponController.updateCoupon);

// DELETE coupon (admin only)
router.delete("/:id", authenticate, authorize("admin"), couponController.deleteCoupon);

module.exports = router;
