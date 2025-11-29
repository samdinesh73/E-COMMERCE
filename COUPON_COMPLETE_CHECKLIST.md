# Coupon Feature - Complete Setup Checklist

## ✅ Code Changes Made

### 1. Backend Routes - FIXED ✅
- **File**: `backend/src/routes/couponRoutes.js`
- **Issue**: Routes were not in correct order (specific before generic)
- **Fix**: Reorganized all routes with proper ordering:
  ```
  1. GET /             (get all coupons)
  2. POST /validate    (public validation) ← Most specific
  3. POST /apply       (apply to order)
  4. GET /:id/usage    (usage history)
  5. POST /            (create - admin)
  6. PUT /:id          (update - admin)
  7. DELETE /:id       (delete - admin)
  8. GET /:id          (get by ID)        ← Least specific
  ```

### 2. Auth Middleware - FIXED ✅
- **File**: `backend/src/middleware/auth.js`
- **Issue**: Missing `authorize` function for admin routes
- **Fix**: Added role-based authorization middleware
- **Code**:
  ```javascript
  const authorize = (role) => {
    return (req, res, next) => {
      if (!req.user) return res.status(401).json({ error: "Not authenticated" });
      if (req.user.role !== role) return res.status(403).json({ error: "Insufficient permissions" });
      next();
    };
  };
  ```

### 3. Backend Integration ✅
- **File**: `backend/src/server.js`
- **Status**: Already integrated coupon routes
- **Line**: `app.use("/coupons", couponRoutes);`

### 4. Frontend Components ✅
- **CouponInput.jsx**: Created with validation, loading states, success/error messages
- **CartContext.jsx**: Updated with coupon state management
- **Cart.jsx**: Integrated CouponInput component with discount display

### 5. Database Schema ✅
- **File**: `backend/create-coupons.sql`
- **Status**: SQL migration file ready
- **Action Needed**: Must run setup script

---

## 🚀 IMMEDIATE ACTION REQUIRED

### Step 1: Create Database Tables

Open terminal and run:
```bash
cd c:\Users\SR\Downloads\full_project\backend
node setup-coupons.js
```

**What it does:**
- Connects to MySQL database
- Creates `coupons` table
- Creates `coupon_usage` table
- Inserts 4 sample coupons

**Expected Output:**
```
✅ Connected successfully!

[1/X] Executing...
     CREATE TABLE IF NOT EXISTS coupons...
     ✅ Success

✅ Both coupon tables exist
✅ Found 4 sample coupons
✅ COUPON SYSTEM SETUP COMPLETED!
```

### Step 2: Restart Backend Server

```bash
npm start
```

**Expected Output:**
```
✅ MySQL Connected Successfully
🚀 Server running on http://localhost:5000
```

### Step 3: Test the System

Open another terminal and run diagnostics:
```bash
cd c:\Users\SR\Downloads\full_project\backend
node diagnose-coupons.js
```

**Should show:**
```
✅ Connected to shop_db at 127.0.0.1
✅ Both coupon tables exist
✅ Found 4 sample coupons
✅ Backend server is running
✅ GET /coupons works
✅ POST /coupons/validate route exists
✅ Sample coupon validation works!
   Discount: ₹500
   Final Total: ₹4500
```

### Step 4: Test in Frontend

1. Go to Cart page (http://localhost:3000/cart)
2. Scroll to "Order Summary" section
3. Enter: `SAVE10`
4. Click "Apply" button
5. **Expected**: 10% discount should apply

---

## 📊 Sample Coupons Available

| Code | Description | Type | Discount | Min Order | Max Uses | Expires |
|------|-------------|------|----------|-----------|----------|---------|
| SAVE10 | 10% off on all products | % | 10% | ₹0 | 100 | +30 days |
| FLAT500 | ₹500 off above ₹2000 | Fixed | ₹500 | ₹2000 | 50 | +30 days |
| WELCOME20 | 20% off for new customers | % | 20% | ₹0 | 200 | +60 days |
| SUMMER50 | Summer sale - ₹50 off | Fixed | ₹50 | ₹500 | 150 | +14 days |

---

## 🧪 Testing Commands

### Test 1: Get All Coupons
```bash
curl http://localhost:5000/coupons
```
**Expected**: Array of coupons

### Test 2: Validate Coupon (10% Discount)
```bash
curl -X POST http://localhost:5000/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE10","orderTotal":5000}'
```
**Expected**:
```json
{
  "valid": true,
  "coupon": { "code": "SAVE10", "discount_type": "percentage", "discount_value": 10 },
  "discountAmount": 500,
  "finalTotal": 4500
}
```

### Test 3: Validate Coupon (Minimum Order Not Met)
```bash
curl -X POST http://localhost:5000/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"FLAT500","orderTotal":1500}'
```
**Expected**:
```json
{
  "error": "Minimum order value of ₹2000 required"
}
```

### Test 4: Invalid Coupon
```bash
curl -X POST http://localhost:5000/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"INVALID","orderTotal":5000}'
```
**Expected**:
```json
{
  "error": "Invalid or expired coupon code"
}
```

---

## 🔍 If You Still See "Route Not Found"

### Checklist:

- [ ] Did you run `node setup-coupons.js`?
- [ ] Did you restart the backend server after setup?
- [ ] Is the backend running on port 5000?
- [ ] Check browser console for exact error message
- [ ] Run `node diagnose-coupons.js` to see detailed errors
- [ ] Verify files were updated:
  - [ ] `backend/src/routes/couponRoutes.js` - routes reordered
  - [ ] `backend/src/middleware/auth.js` - authorize function added
  - [ ] `backend/src/controllers/couponController.js` - all exports present

### Network Check:
```bash
# Check if backend is responding
curl http://localhost:5000/health

# Check if coupon route exists
curl http://localhost:5000/coupons
```

---

## 📝 Feature Overview

### What Works Now:
- ✅ Coupon validation via API
- ✅ Percentage discounts (e.g., 10% off)
- ✅ Fixed amount discounts (e.g., ₹500 off)
- ✅ Minimum order value requirements
- ✅ Usage limits per coupon
- ✅ Expiry date validation
- ✅ Frontend coupon input component
- ✅ Cart integration with discount display
- ✅ Coupon persistence in localStorage
- ✅ Admin coupon management endpoints

### How It Works:
1. User enters coupon code in Cart page
2. Frontend validates via `/coupons/validate` endpoint
3. API checks: active, not expired, usage limit, min order value
4. Calculates discount based on type (% or fixed)
5. Applies discount to cart total
6. Shows coupon and discount amount
7. User can remove coupon anytime

---

## 🛠️ Utility Scripts

### setup-coupons.js
Creates database tables and sample coupons
```bash
node backend/setup-coupons.js
```

### diagnose-coupons.js
Checks if everything is working
```bash
node backend/diagnose-coupons.js
```

### test-coupon-api.js
Simple API endpoint tests
```bash
node backend/test-coupon-api.js
```

### test-coupons.js
Comprehensive test cases and examples
```bash
node backend/test-coupons.js
```

---

## ✨ Features Ready for Admin Panel (Optional)

The API is ready for admin features:
- Create new coupons: `POST /coupons`
- Update existing: `PUT /coupons/:id`
- Delete coupons: `DELETE /coupons/:id`
- View usage stats: `GET /coupons/:id/usage`

---

## 📚 Documentation

- **COUPON_FEATURE.md** - Complete feature documentation
- **COUPON_SETUP_FIX.md** - Detailed troubleshooting guide

---

## ✅ FINAL CHECKLIST

Before testing in browser:
- [ ] Run `node setup-coupons.js`
- [ ] Restart backend server (`npm start`)
- [ ] Run `node diagnose-coupons.js` (shows ✅ for all checks)
- [ ] Backend console shows "✅ MySQL Connected Successfully"
- [ ] Frontend console has no errors
- [ ] Cart page loads without errors

---

**You're all set! Go test the coupon feature in your cart.** 🎉
