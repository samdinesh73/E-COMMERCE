# Coupon Feature - Setup & Troubleshooting Guide

## Issue Fixed: "Route Not Found" Error

### Root Causes Identified & Fixed

1. **Route Ordering Issue** ✅ FIXED
   - Express routes must be ordered from most specific to least specific
   - POST `/validate` must come before generic `:id` routes
   - Fixed in `backend/src/routes/couponRoutes.js`

2. **Missing `authorize` Function** ✅ FIXED
   - Auth middleware was missing the `authorize` function
   - Added `authorize(role)` middleware to `backend/src/middleware/auth.js`
   - Now properly checks user role for admin endpoints

3. **Database Tables Not Created** ⚠️ NEEDS ACTION
   - Coupon API requires tables to exist in database
   - Run setup script to create tables

### What Was Changed

#### File 1: `backend/src/routes/couponRoutes.js`
**Change**: Reordered routes to follow Express best practices
```javascript
// Before: Routes were mixed, causing conflicts
// After: Organized by specificity
- Specific routes first (/:id is too generic)
- Admin routes with :id next
- Generic :id route last
```

#### File 2: `backend/src/middleware/auth.js`
**Change**: Added missing `authorize` function
```javascript
// Added:
const authorize = (role) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (req.user.role !== role) return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
};

module.exports = { authenticate, authorize };
```

### Quick Setup Steps

#### Step 1: Create Database Tables
```bash
cd backend
node setup-coupons.js
```

This will:
- Connect to your MySQL database
- Create `coupons` and `coupon_usage` tables
- Insert 4 sample coupons (SAVE10, FLAT500, WELCOME20, SUMMER50)

#### Step 2: Restart Backend Server
```bash
npm start
```

#### Step 3: Run Diagnostics
```bash
node diagnose-coupons.js
```

This will check:
- ✅ Database connectivity
- ✅ Coupon tables exist
- ✅ API routes are working
- ✅ Sample coupon validation works

#### Step 4: Test in Frontend
1. Go to Cart page
2. Scroll to "Order Summary" section
3. Enter coupon code: `SAVE10`
4. Click "Apply" button
5. You should see the discount applied!

### Available Coupons (Sample Data)

After running `setup-coupons.js`, these coupons will be available:

| Code | Type | Discount | Min Order | Max Uses |
|------|------|----------|-----------|----------|
| SAVE10 | Percentage | 10% off | ₹0 | 100 |
| FLAT500 | Fixed | ₹500 off | ₹2000 | 50 |
| WELCOME20 | Percentage | 20% off | ₹0 | 200 |
| SUMMER50 | Fixed | ₹50 off | ₹500 | 150 |

### API Endpoints

**Public Endpoints:**
```bash
# Get all coupons
curl http://localhost:5000/coupons

# Validate coupon
curl -X POST http://localhost:5000/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE10","orderTotal":5000}'

# Get specific coupon
curl http://localhost:5000/coupons/1
```

**Protected Endpoints (Require User Login):**
```bash
curl -X POST http://localhost:5000/coupons/apply \
  -H "Authorization: Bearer {user_token}" \
  -d '{"couponId":1,"orderId":123,"discountAmount":500}'
```

**Admin Endpoints (Require Admin Role):**
```bash
# Create coupon
curl -X POST http://localhost:5000/coupons \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "code":"NEWYEAR25",
    "description":"25% off",
    "discount_type":"percentage",
    "discount_value":25
  }'

# Get usage history
curl http://localhost:5000/coupons/1/usage \
  -H "Authorization: Bearer {admin_token}"
```

### Troubleshooting

#### Still Getting "Route Not Found"?

1. **Backend server not restarted?**
   ```bash
   # Stop old process
   npm stop
   
   # Start fresh
   npm start
   ```

2. **Database tables don't exist?**
   ```bash
   node setup-coupons.js
   ```

3. **Check diagnostics:**
   ```bash
   node diagnose-coupons.js
   ```

#### Getting "Invalid coupon code"?

1. Check database has sample data:
   ```bash
   node diagnose-coupons.js
   ```

2. Try exact coupon codes:
   - `SAVE10` (case-sensitive, automatically converted to uppercase)
   - `FLAT500`
   - `WELCOME20`
   - `SUMMER50`

#### Discount Not Calculating Correctly?

Check minimum order values:
- `FLAT500`: Requires minimum ₹2000 order
- `SUMMER50`: Requires minimum ₹500 order
- Others have no minimum

### Frontend Integration

The coupon feature is integrated in:
- **Component**: `frontend/src/components/CouponInput.jsx`
- **Context**: `frontend/src/context/CartContext.jsx` (updated)
- **Page**: `frontend/src/pages/Cart.jsx` (updated)

### File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── couponController.js      # ✅ All functions working
│   ├── routes/
│   │   └── couponRoutes.js          # ✅ FIXED - routes reordered
│   ├── middleware/
│   │   └── auth.js                  # ✅ FIXED - added authorize function
│   └── server.js                    # ✅ Routes integrated
├── create-coupons.sql               # Database schema
├── setup-coupons.js                 # NEW - easy setup script
└── diagnose-coupons.js              # NEW - diagnostic script

frontend/
└── src/
    ├── components/
    │   └── CouponInput.jsx          # ✅ Component working
    ├── context/
    │   └── CartContext.jsx          # ✅ Updated with coupon state
    └── pages/
        └── Cart.jsx                 # ✅ Updated with CouponInput
```

### Next Steps

1. ✅ Run `node setup-coupons.js` to create tables
2. ✅ Restart backend server
3. ✅ Test coupon feature in cart
4. ✅ Create admin panel to manage coupons (optional)

### Notes

- Coupons are stored in localStorage on the frontend
- They persist across page refreshes
- Automatically clear when cart is cleared
- Discount amounts are calculated as: `discount = min(calculated_discount, order_total)`
- Both percentage and fixed amount discounts are supported
