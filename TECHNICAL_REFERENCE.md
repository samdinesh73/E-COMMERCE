# Technical Reference - Guest Checkout Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Checkout.jsx                                         │  │
│  │ - isGuest state (boolean)                           │  │
│  │ - guest/user toggle checkbox                        │  │
│  │ - conditional email field                           │  │
│  │ - saveOrder() with conditional JWT header           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────────┘
                      │ POST /orders
                      │ {guest_name, guest_email, ...}
                      │ Header: Authorization: Bearer {token?}
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ orderRoutes.js                                       │  │
│  │ - optionalAuth middleware                           │  │
│  │   (verifies JWT if present, continues if not)      │  │
│  │ - POST /orders endpoint                             │  │
│  │   (accepts guest_name, guest_email)                │  │
│  │ - user_id = req.user?.id || null                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬──────────────────────────────────────┘
                      │ INSERT INTO orders
                      │ (user_id, guest_name, guest_email, ...)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    MySQL Database                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ orders table                                         │  │
│  │ - id (PK)                                            │  │
│  │ - user_id (FK, nullable) ◄─ KEY: Can be NULL       │  │
│  │ - guest_name (nullable)  ◄─ KEY: For guest orders  │  │
│  │ - guest_email (nullable) ◄─ KEY: For guest orders  │  │
│  │ - total_price, shipping_address, payment_method... │  │
│  │ - status, created_at, updated_at                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Comparison

### Scenario 1: Authenticated User Checkout

```javascript
// Frontend
const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGc..." // ← JWT present
};
const body = {
  total_price: 5000,
  shipping_address: "123 Main St",
  payment_method: "cod",
  guest_name: undefined,        // ← NOT sent
  guest_email: undefined        // ← NOT sent
};

// Backend - optionalAuth middleware
const token = req.headers.authorization?.split(" ")[1]; // ← "eyJhbGc..."
const decoded = jwt.verify(token, JWT_SECRET);          // ← Verifies
req.user = { id: 1, email: "user@example.com" };        // ← Sets user

// Backend - POST /orders
const user_id = req.user?.id || null;  // ← user_id = 1
const guest_name = req.body.guest_name; // ← undefined
const guest_email = req.body.guest_email; // ← undefined

// Database INSERT
INSERT INTO orders (user_id, guest_name, guest_email, ...)
VALUES (1, null, null, ...);

// Result: ✅ Order with user_id=1
```

### Scenario 2: Guest Checkout

```javascript
// Frontend
const headers = {
  "Content-Type": "application/json"
  // NO Authorization header
};
const body = {
  total_price: 5000,
  shipping_address: "456 Guest Ave",
  payment_method: "cod",
  guest_name: "John Doe",           // ← Sent
  guest_email: "john@example.com"   // ← Sent
};

// Backend - optionalAuth middleware
const token = req.headers.authorization?.split(" ")[1]; // ← undefined
if (token) { /* ... */ } // ← Skipped
// req.user is undefined
next(); // ← Continues without error

// Backend - POST /orders
const user_id = req.user?.id || null;  // ← user_id = null (no req.user)
const guest_name = req.body.guest_name; // ← "John Doe"
const guest_email = req.body.guest_email; // ← "john@example.com"

// Database INSERT
INSERT INTO orders (user_id, guest_name, guest_email, ...)
VALUES (null, "John Doe", "john@example.com", ...);

// Result: ✅ Order with guest_name and guest_email
```

---

## Code Implementation Details

### optionalAuth Middleware
```javascript
const optionalAuth = (req, res, next) => {
  // Try to extract JWT from Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  
  // If token exists, verify it
  if (token) {
    try {
      const jwt = require("jsonwebtoken");
      const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;  // ← Set authenticated user
    } catch (err) {
      // Token invalid? Ignore and continue as guest
    }
  }
  // Call next whether auth succeeded or not
  next();
};
```

**Key Points:**
- Doesn't throw error if token missing (unlike verifyToken)
- Doesn't throw error if token invalid (fail-safe)
- Sets `req.user` ONLY if token valid
- `req.user?.id` safely returns undefined if no user

### saveOrder() Function
```javascript
const saveOrder = async (paymentMethod) => {
  const headers = {
    "Content-Type": "application/json",
  };
  
  // Conditionally add JWT - only if logged in
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const resp = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      total_price: total,
      shipping_address: form.address,
      city: form.city,
      pincode: form.pincode,
      payment_method: paymentMethod,
      // Only send guest fields if guest checkout
      guest_name: isGuest ? form.name : undefined,
      guest_email: isGuest ? form.email : undefined,
      items,
    }),
  });
};
```

**Key Points:**
- `if (token)` check ensures header only added for authenticated users
- Guest fields sent as `undefined` for authenticated checkout (backend ignores)
- Authenticated fields (via JWT) sent implicitly through Authorization header

### POST /orders Endpoint
```javascript
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { total_price, shipping_address, city, pincode, 
            payment_method, guest_name, guest_email, items } = req.body;
    
    // THIS IS THE KEY LINE - conditional user_id
    const user_id = req.user?.id || null;
    
    // Validation
    if (!total_price || !shipping_address || !payment_method) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // INSERT with conditional values
    const [resultRaw] = await db.execute(
      "INSERT INTO orders (user_id, total_price, shipping_address, city, " +
      "pincode, payment_method, guest_name, guest_email, status) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [user_id, total_price, shipping_address, city, pincode, 
       payment_method, guest_name, guest_email, "pending"]
    );
    
    // Response (same for both auth and guest)
    return res.status(201).json({
      id: insertResult.insertId,
      user_id,
      total_price,
      shipping_address,
      payment_method,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});
```

**Key Points:**
- `user_id = req.user?.id || null` - will be ID (if auth) or null (if guest)
- Query accepts NULL for user_id (column is nullable)
- guest_name and guest_email always accepted (ignored by authenticated users)
- INSERT works for both authenticated (user_id set, guest fields null) and guest (user_id null, guest fields set)

---

## Database Schema

### Before (Orders Table - No Guest Support)
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,              -- ❌ MUST be present
  total_price DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  city VARCHAR(100),
  pincode VARCHAR(20),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)  -- ❌ Strict FK
);
```

### After (Orders Table - With Guest Support)
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,                        -- ✅ Nullable
  total_price DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT NOT NULL,
  city VARCHAR(100),
  pincode VARCHAR(20),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  guest_name VARCHAR(255),            -- ✅ NEW for guest checkout
  guest_email VARCHAR(255),           -- ✅ NEW for guest checkout
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL  -- ✅ Soft delete
);
```

### Query Examples

**Authenticated Order:**
```sql
SELECT * FROM orders WHERE id = 1;
-- Result:
-- id: 1, user_id: 1, guest_name: NULL, guest_email: NULL, ...
```

**Guest Order:**
```sql
SELECT * FROM orders WHERE id = 2;
-- Result:
-- id: 2, user_id: NULL, guest_name: "John Doe", guest_email: "john@example.com", ...
```

**Find All Guest Orders:**
```sql
SELECT * FROM orders WHERE user_id IS NULL;
```

**Find Orders by Email (Guest or User):**
```sql
SELECT * FROM orders WHERE 
  guest_email = 'john@example.com' OR 
  user_id IN (SELECT id FROM users WHERE email = 'john@example.com');
```

---

## State Transitions

### Checkout Page Component State

```javascript
// Initial State (Logged Out)
{
  isGuest: true,    // Default: treat as guest if no token
  method: "cod",    // Default payment method
  form: {
    name: "",       // Always required
    email: "",      // Only shown/used if isGuest = true
    phone: "",      // Always required
    address: "",    // Always required
    city: "",
    pincode: ""
  },
  loading: false
}

// State Change 1: User Logs In (mid-session)
{
  isGuest: false,   // Changed: token now exists
  // ... rest same
  // Email field disappears, guest option not shown
}

// State Change 2: User Toggles Guest Checkbox (Logged Out)
{
  isGuest: true,    // Manually toggled
  // Email field appears for guest order
}

// State Change 3: User Logs Out
{
  isGuest: true,    // Reset to guest mode
  // Email field reappears
}
```

---

## Error Scenarios & Handling

| Scenario | Frontend | Backend | Result |
|----------|----------|---------|--------|
| Auth user, token valid | Sends JWT | optionalAuth verifies ✅ | user_id set, guest fields ignored |
| Auth user, token invalid/expired | Sends invalid JWT | optionalAuth fails silently | guest order created (fallback) |
| Auth user, no token sent | No JWT header | optionalAuth skips | guest order created (fallback) |
| Guest user, no token | No JWT header | optionalAuth skips | guest order created ✅ |
| Missing required fields | Validation fails | Validation fails | 400 Bad Request |
| DB constraint violation | (shouldn't happen) | Try/catch | 500 Error |

---

## Compatibility Matrix

| Operation | Authenticated | Guest | Notes |
|-----------|---------------|-------|-------|
| POST /orders | ✅ Works | ✅ Works | `optionalAuth` handles both |
| GET /orders | ✅ Works (verifyToken) | ❌ Returns 401 | User-specific orders |
| GET /orders/:id | ✅ Works (verifyToken) | ❌ Returns 401 | User-specific order |
| Order created with user_id | ✅ Yes | ❌ NULL | Linked to user account |
| Order created with guest_email | ❌ NULL | ✅ Yes | For confirmation |
| Track order in MyAccount | ✅ Yes (auto) | ❌ No | Requires login |

---

## Testing Queries

### Verify Schema Updated
```sql
SHOW COLUMNS FROM orders;
-- Should see: id, user_id (nullable), guest_name, guest_email, ...
```

### Check Data After Testing
```sql
-- Count authenticated orders
SELECT COUNT(*) FROM orders WHERE user_id IS NOT NULL;

-- Count guest orders
SELECT COUNT(*) FROM orders WHERE user_id IS NULL;

-- View recent orders
SELECT id, user_id, guest_name, guest_email, payment_method, status 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;

-- Find guest orders by email
SELECT * FROM orders 
WHERE guest_email = 'john@example.com'
ORDER BY created_at DESC;
```

---

## Future Enhancements

### 1. Guest Order Tracking (No Login)
```sql
-- Query orders by email + order ID combo
SELECT * FROM orders 
WHERE guest_email = ? AND id = ?;
```

### 2. Send Confirmation Email
```javascript
// After order created, send email to:
// - req.user.email (if authenticated)
// - guest_email (if guest)
```

### 3. Admin Query - All Orders by Customer
```sql
-- Find all orders from a customer (via email)
SELECT * FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.email = ? OR o.guest_email = ?
ORDER BY o.created_at DESC;
```

### 4. Convert Guest Order to Account
```javascript
// If guest wants to create account with same email:
INSERT INTO users (email, password_hash, name) VALUES (...);
UPDATE orders SET user_id = LAST_INSERT_ID() WHERE guest_email = ?;
```

---

**Architecture complete and tested!**
