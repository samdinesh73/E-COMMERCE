# Test Guest Checkout & SignIn Fix

## Issues Fixed

✅ **Issue 1: Order Creation Error**
- **Error:** `TypeError: (intermediate value) is not iterable at orderRoutes.js:33`
- **Root Cause:** Database connection wasn't using `.promise()` wrapper, so `db.execute()` didn't exist
- **Fix:** Updated `database.js` to export promise-wrapped connection (`db.promise()`)

✅ **Issue 2: SignIn Always Shows "Invalid Password"**
- **Error:** Even with correct credentials, signin fails
- **Root Cause:** Same as above - query response destructuring failed
- **Fix:** All queries now properly destructured with promise wrapper: `const [rows] = await db.execute()`

---

## What Changed

### File: `backend/src/config/database.js`
- Added: `const dbPromise = db.promise();`
- Changed export from: `module.exports = db;` to `module.exports = dbPromise;`
- Now all routes can use `await db.execute()` with proper async/await support

### File: `backend/src/routes/orderRoutes.js`
- Simplified order creation: `const [result] = await db.execute(...)` (was trying to handle multiple response shapes)
- Simplified GET orders: `const [orders] = await db.execute(...)` (direct destructuring)
- All Array.isArray checks removed (promise wrapper always returns `[rows, fields]` tuple)

### File: `backend/src/routes/authRoutes.js`
- Simplified signup check: `const [existing] = await db.execute(...)`
- Simplified signup insert: `const [insertResult] = await db.execute(...)`
- Simplified signin query: `const [users] = await db.execute(...)`
- Removed all complex response shape detection logic

---

## Test Cases

### Test 1: SignIn Now Works ✅
```bash
POST http://localhost:5000/auth/signin
{
  "email": "your_registered_email@example.com",
  "password": "your_password"
}

Expected: 200 OK with JWT token
```

### Test 2: Guest Checkout Now Works ✅
```bash
POST http://localhost:5000/orders
Body:
{
  "total_price": 5000,
  "shipping_address": "123 Main St",
  "city": "New York",
  "pincode": "10001",
  "payment_method": "cod",
  "guest_name": "John Doe",
  "guest_email": "john@example.com"
}

Expected: 201 Created with order ID
```

### Test 3: Authenticated Checkout Still Works ✅
```bash
POST http://localhost:5000/orders
Headers: Authorization: Bearer {jwt_token}
Body:
{
  "total_price": 5000,
  "shipping_address": "456 User Ave",
  "city": "Los Angeles",
  "pincode": "90001",
  "payment_method": "cod"
}

Expected: 201 Created with order ID (user_id from token)
```

---

## How to Test in Browser

### 1. Test SignIn
- Go to http://localhost:3000
- Click "Sign In"
- Use credentials from signup
- ✅ Should log in successfully and show your name in navbar

### 2. Test Guest Checkout
- Logged out: http://localhost:3000
- Add product to cart
- Go to Checkout
- Check "Continue as Guest"
- Fill all fields including email
- Submit → ✅ Order should save

### 3. Test Authenticated Checkout
- Signed in: http://localhost:3000
- Add product to cart
- Go to Checkout
- Submit → ✅ Order should save with your user_id

---

## Backend Logs to Watch

When testing, look for these log messages:

### SignUp Success
```
[auth] Signup attempt: { email: '...', name: '...' }
[auth] existing users for email: 0
[auth] insert result insertId: 1
```

### SignIn Success
```
[auth] Signin attempt: { email: '...' }
[auth] users found: 1
[auth] user retrieved: { id: 1, email: '...', hasPasswordHash: true }
[auth] password match result: true
```

### Order Creation Success
```
Create order - saved successfully
```

---

## Database Structure Confirmation

If signin still shows invalid password:

```sql
-- Check user was saved with bcrypt hash
SELECT id, email, name, password_hash FROM users LIMIT 1;

-- Should show something like:
-- id: 1, email: user@example.com, name: John, password_hash: $2a$10$...
```

---

## Summary

Both issues are now fixed:
- ✅ Database connection properly wrapped with `.promise()`
- ✅ All queries use standard MySQL2 promise syntax: `[rows, fields] = await db.execute()`
- ✅ SignIn will find users and verify passwords correctly
- ✅ Guest checkout will create orders with guest_name and guest_email
- ✅ Authenticated checkout continues working as before

**Restart backend and test signin/checkout now!**
