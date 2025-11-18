# Guest Checkout & Bug Fixes Complete

## What Was Done

### 1. ✅ Backend Order Endpoint Updated (`backend/src/routes/orderRoutes.js`)
- **Changed:** Removed mandatory `verifyToken` requirement from POST `/orders` endpoint
- **Added:** New `optionalAuth` middleware that:
  - Checks for Authorization header
  - Verifies JWT token if present
  - Sets `req.user` if valid, otherwise continues as guest
- **Now Accepts:**
  - Authenticated users: Creates order with `user_id`
  - Guest users: Creates order with `guest_name` and `guest_email` instead of `user_id`
- **All guest fields are properly destructured and inserted into database**

### 2. ✅ Database Schema Updated (`backend/init-db.sql`)
- Made `user_id` nullable (was `NOT NULL`)
- Added `guest_name` VARCHAR(255) column
- Added `guest_email` VARCHAR(255) column
- Updated foreign key to `ON DELETE SET NULL` (allows orders when user is deleted)

### 3. ✅ Database Migration Script Created (`backend/migrate-guest-orders.sql`)
- Provides SQL commands to update existing database with new columns
- Handles foreign key constraint changes
- Can be run directly in MySQL to upgrade existing schema

### 4. ✅ Frontend Checkout Page Enhanced (`frontend/src/pages/Checkout.jsx`)
- Added `email` field to form state (was missing)
- Guest/User toggle checkbox visible when not logged in
- Conditional email field (shown only for guests)
- `saveOrder()` function:
  - Conditionally includes Authorization header (only if user logged in)
  - Sends `guest_name` and `guest_email` for guest users
  - Sends nothing for authenticated users (backend uses `req.user.id`)

### 5. ✅ Backend Signin Response Handling Fixed (from previous session)
- Multiple fallback patterns to handle different response shapes from `db.execute()`
- Null checks before accessing `user.password_hash`
- Safety guard to prevent server crash on invalid responses

---

## How to Deploy These Changes

### Step 1: Update Database Schema
```bash
# Connect to MySQL and run:
mysql -u root -p < backend/migrate-guest-orders.sql
```

**Or manually in MySQL client:**
```sql
USE shop_db;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);

ALTER TABLE orders 
DROP FOREIGN KEY orders_ibfk_1;

ALTER TABLE orders 
MODIFY user_id INT NULL;

ALTER TABLE orders 
ADD CONSTRAINT orders_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

SHOW COLUMNS FROM orders;
```

### Step 2: Restart Backend Server
```bash
# Stop current backend (Ctrl+C in terminal if running)
# Navigate to backend directory:
cd backend

# Restart with:
npm start
# or
node src/server.js
```

### Step 3: Verify Frontend is Running
```bash
# In separate terminal, navigate to frontend:
cd frontend

# Start if not running:
npm start
```

---

## Testing the Features

### Test 1: Authenticated Checkout
1. Go to http://localhost:3000
2. Click "Sign In" (top right)
3. Sign in with your account
4. Add a product to cart
5. Go to Cart → Checkout
6. Verify form shows your info (if pre-filled) and allows checkout
7. Choose payment method and submit
8. Verify order appears in MyAccount with your user_id

### Test 2: Guest Checkout
1. Go to http://localhost:3000 (logged out)
2. Add a product to cart
3. Go to Cart → Checkout
4. Check "Continue as Guest" checkbox
5. Fill in all fields including Email
6. Choose payment method and submit
7. Verify order is saved with guest_name and guest_email (not user_id)

### Test 3: Signin After Fix
1. Go to http://localhost:3000
2. Click "Sign In"
3. Enter valid email and password from signup
4. Verify JWT token is returned and you're logged in
5. Navbar should show your name instead of "Sign In" button

---

## File Changes Summary

| File | Change | Purpose |
|------|--------|---------|
| `backend/src/routes/orderRoutes.js` | Added `optionalAuth` middleware; removed `verifyToken` from POST /orders | Allow guest checkout |
| `backend/init-db.sql` | Added guest columns, made user_id nullable | Support guest orders in DB |
| `backend/migrate-guest-orders.sql` | NEW: Migration script | Update existing DB schema |
| `frontend/src/pages/Checkout.jsx` | Added email field; added guest toggle; updated saveOrder | Guest checkout UI + logic |

---

## Database Behavior

### Creating an Order Now Works In 2 Ways:

**Authenticated User:**
```javascript
POST /orders
{
  "user_id": 1,  // from req.user.id
  "guest_name": null,
  "guest_email": null,
  ...
}
```

**Guest User:**
```javascript
POST /orders
{
  "user_id": null,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  ...
}
```

Both successfully create an order record.

---

## Troubleshooting

**Issue: "Guest order not saving"**
- Verify migrate-guest-orders.sql was run (columns exist)
- Check browser console for error details
- Check backend logs for response errors

**Issue: "Signin still crashes"**
- Backend changes were applied to signin response handling
- Must restart backend after code changes: `npm start`
- Check backend logs show "users found: X" (X should be > 0 if email correct)

**Issue: "Cannot continue as guest - checkbox doesn't show"**
- This only appears when NOT logged in
- Make sure you're logged out or use incognito window
- Check browser console for JavaScript errors

**Issue: "Email field doesn't appear for guests"**
- Verify you checked "Continue as Guest" checkbox
- Form state now includes email (was added in this update)
- Refresh page after pulling latest code

---

## Next Steps (Optional Future Work)

- [ ] Razorpay payment signature verification (backend endpoint)
- [ ] Email notifications for order placement (both guest and user)
- [ ] Admin panel to update order status
- [ ] Guest order tracking without login (use email + order ID)
- [ ] Guest order history page

---

**All changes are automated. No manual code fixes needed. Just restart backend and test!**
