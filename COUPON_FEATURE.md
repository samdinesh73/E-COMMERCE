# Coupon Feature Implementation Guide

## Overview

The coupon system allows customers to apply discount codes at checkout. The system supports both percentage-based and fixed amount discounts with features like:

- **Discount Types**: Percentage (%) or Fixed Amount (₹)
- **Usage Limits**: Set maximum uses per coupon
- **Expiry Dates**: Automatic validation of coupon expiration
- **Minimum Order Value**: Optional minimum purchase requirement
- **Usage Tracking**: Track which users used which coupons

## Database Schema

### `coupons` Table
Stores coupon configurations and metadata.

```sql
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,          -- Coupon code (e.g., SAVE10)
  description TEXT,                          -- User-friendly description
  discount_type ENUM('percentage', 'fixed'), -- Type of discount
  discount_value DECIMAL(10, 2),             -- Discount amount or percentage
  min_order_value DECIMAL(10, 2),            -- Minimum order value to use
  max_uses INT,                              -- Maximum times coupon can be used
  current_uses INT DEFAULT 0,                -- Current usage count
  expires_at DATETIME,                       -- Expiry date/time
  is_active BOOLEAN DEFAULT 1,               -- Active/inactive flag
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Sample Data:**
```sql
INSERT INTO coupons VALUES
('SAVE10', '10% off on all products', 'percentage', 10, 0, 100, 0, DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('FLAT500', '₹500 off on orders above ₹2000', 'fixed', 500, 2000, 50, 0, DATE_ADD(NOW(), INTERVAL 30 DAY), 1),
('WELCOME20', '20% off for new customers', 'percentage', 20, 0, 200, 0, DATE_ADD(NOW(), INTERVAL 60 DAY), 1),
('SUMMER50', 'Summer sale - ₹50 off', 'fixed', 50, 500, 150, 0, DATE_ADD(NOW(), INTERVAL 14 DAY), 1);
```

### `coupon_usage` Table
Tracks coupon usage for analytics and validation.

```sql
CREATE TABLE coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id INT,
  order_id INT,
  discount_amount DECIMAL(10, 2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## API Endpoints

### Public Endpoints

#### GET `/coupons`
Retrieve all active and non-expired coupons.

**Response:**
```json
[
  {
    "id": 1,
    "code": "SAVE10",
    "description": "10% off on all products",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_order_value": 0,
    "max_uses": 100,
    "current_uses": 25,
    "expires_at": "2025-01-31T23:59:59.000Z"
  }
]
```

#### POST `/coupons/validate`
Validate a coupon code and calculate discount amount.

**Request Body:**
```json
{
  "code": "SAVE10",
  "orderTotal": 5000
}
```

**Response (Success):**
```json
{
  "valid": true,
  "coupon": {
    "id": 1,
    "code": "SAVE10",
    "discount_type": "percentage",
    "discount_value": 10,
    "description": "10% off on all products"
  },
  "discountAmount": 500,
  "finalTotal": 4500
}
```

**Response (Error - Minimum Order Value):**
```json
{
  "error": "Minimum order value of ₹2000 required"
}
```

**Response (Error - Usage Limit Exceeded):**
```json
{
  "error": "Coupon usage limit exceeded"
}
```

**Response (Error - Invalid Code):**
```json
{
  "error": "Invalid or expired coupon code"
}
```

#### GET `/coupons/:id`
Get details of a specific coupon by ID.

**Response:**
```json
{
  "id": 1,
  "code": "SAVE10",
  "description": "10% off on all products",
  "discount_type": "percentage",
  "discount_value": 10,
  "min_order_value": 0,
  "max_uses": 100,
  "current_uses": 25,
  "expires_at": "2025-01-31T23:59:59.000Z",
  "is_active": 1
}
```

### Protected Endpoints (Requires Authentication)

#### POST `/coupons/apply`
Apply a coupon to an order and record usage.

**Headers:**
```
Authorization: Bearer {user_token}
```

**Request Body:**
```json
{
  "couponId": 1,
  "orderId": 123,
  "discountAmount": 500
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "usageId": 456
}
```

### Admin Endpoints (Requires Admin Authentication)

#### POST `/coupons`
Create a new coupon.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "code": "NEWYEAR25",
  "description": "New Year Special - 25% off",
  "discount_type": "percentage",
  "discount_value": 25,
  "min_order_value": 500,
  "max_uses": 200,
  "expires_at": "2025-01-31 23:59:59"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "couponId": 5
}
```

#### PUT `/coupons/:id`
Update coupon details.

**Request Body:**
```json
{
  "description": "Updated description",
  "max_uses": 500,
  "discount_value": 15,
  "is_active": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon updated successfully"
}
```

#### DELETE `/coupons/:id`
Delete a coupon.

**Response:**
```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

#### GET `/coupons/:id/usage`
Get usage history for a specific coupon.

**Response:**
```json
[
  {
    "id": 1,
    "coupon_id": 1,
    "user_id": 5,
    "order_id": 123,
    "discount_amount": 500,
    "used_at": "2025-01-15T10:30:00.000Z",
    "code": "SAVE10",
    "email": "user@example.com",
    "name": "John Doe"
  }
]
```

## Frontend Integration

### CouponInput Component

Located at: `frontend/src/components/CouponInput.jsx`

**Usage in Cart Page:**
```jsx
import CouponInput from "../components/CouponInput";
import { useCart } from "../context/CartContext";

function Cart() {
  const { 
    appliedCoupon, 
    getDiscountAmount, 
    getFinalTotal,
    applyCoupon,
    removeCoupon
  } = useCart();

  return (
    <CouponInput 
      orderTotal={subtotal}
      onCouponApply={applyCoupon}
      appliedCoupon={appliedCoupon}
      onRemoveCoupon={removeCoupon}
    />
  );
}
```

### CartContext Updates

**New State & Methods:**
```jsx
// State
const [appliedCoupon, setAppliedCoupon] = useState(null);

// Methods
const getDiscountAmount = () => appliedCoupon?.discountAmount || 0;
const getFinalTotal = () => getTotalPrice() - getDiscountAmount();
const applyCoupon = (couponData) => setAppliedCoupon(couponData);
const removeCoupon = () => setAppliedCoupon(null);
```

## Testing

### Run Migration
```bash
cd backend
node run-migration.js
```

### Quick Test (Browser Console)
```javascript
// Validate a coupon
fetch("http://localhost:5000/coupons/validate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: "SAVE10", orderTotal: 5000 })
}).then(r => r.json()).then(console.log);

// Get all coupons
fetch("http://localhost:5000/coupons")
  .then(r => r.json())
  .then(console.log);
```

### CURL Commands
```bash
# Validate coupon
curl -X POST http://localhost:5000/coupons/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"SAVE10","orderTotal":5000}'

# Get all coupons
curl http://localhost:5000/coupons

# Get specific coupon
curl http://localhost:5000/coupons/1

# Create new coupon (requires admin token)
curl -X POST http://localhost:5000/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code":"NEWYEAR10",
    "description":"New Year Special",
    "discount_type":"percentage",
    "discount_value":10,
    "min_order_value":500,
    "max_uses":200,
    "expires_at":"2025-01-31 23:59:59"
  }'
```

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── couponController.js       # Coupon business logic
│   ├── routes/
│   │   └── couponRoutes.js           # Coupon API routes
│   └── server.js                     # Updated with coupon routes
├── create-coupons.sql                # Database schema
├── run-migration.js                  # Migration script
└── test-coupons.js                   # Test cases and examples

frontend/
└── src/
    ├── components/
    │   └── CouponInput.jsx           # Coupon input component
    ├── context/
    │   └── CartContext.jsx           # Updated with coupon state
    └── pages/
        └── Cart.jsx                  # Updated with CouponInput
```

## Key Features

### 1. **Discount Calculation**
- **Percentage**: `discount = (orderTotal * discount_value) / 100`
- **Fixed**: `discount = discount_value`
- Discount capped at order total

### 2. **Validation Logic**
```javascript
1. Check if coupon code exists
2. Check if coupon is active
3. Check if coupon has not expired (expires_at > NOW)
4. Check if usage limit not exceeded (current_uses < max_uses)
5. Check if order meets minimum value (orderTotal >= min_order_value)
6. Calculate and return discount
```

### 3. **Usage Tracking**
- Records user ID, order ID, and discount amount
- Increments coupon usage count
- Enables analytics and fraud detection

### 4. **Frontend State Persistence**
- Coupon stored in localStorage
- Persists across page refreshes
- Automatically clears on cart clear

## Example Workflows

### Workflow 1: Apply 10% Coupon
1. User adds items to cart (Total: ₹5000)
2. Navigates to Cart page
3. Enters coupon code "SAVE10"
4. Clicks "Apply"
5. Frontend validates via `/coupons/validate`
6. Discount calculated: ₹500 (10% of ₹5000)
7. Final total shown: ₹4500
8. Coupon stored in CartContext
9. On checkout, `/coupons/apply` records usage

### Workflow 2: Fixed Amount Coupon with Min Order
1. User's cart total: ₹1500
2. Tries to apply "FLAT500" (₹500 off, requires ₹2000 minimum)
3. Validation fails with error: "Minimum order value of ₹2000 required"
4. User adds more items to reach ₹2000
5. Reapplies "FLAT500"
6. Validation succeeds
7. Final total: ₹1500 (₹2000 - ₹500)

## Best Practices

1. **Coupon Codes**: Keep them simple and uppercase (SAVE10, FLAT500)
2. **Descriptions**: Write user-friendly, clear descriptions
3. **Expiry Dates**: Set reasonable expiry periods (30-90 days typically)
4. **Usage Limits**: Set based on promotional goals
5. **Minimum Order Value**: Consider your average order value
6. **Discount Types**: 
   - Use percentage for percentage-based promotions
   - Use fixed for specific amounts or loyalty rewards

## Troubleshooting

### Coupon Not Validating
1. Check coupon code (case-sensitive - converts to uppercase)
2. Verify coupon is active (`is_active = 1`)
3. Check expiry date hasn't passed
4. Confirm order total meets minimum value
5. Verify usage limit not exceeded

### Migration Issues
1. Ensure database credentials are correct in `.env`
2. Run with admin privileges
3. Check MySQL is running
4. Review `run-migration.js` output for specific errors

### Frontend Component Issues
1. Verify CouponInput component imported correctly
2. Ensure CartContext provider wraps app
3. Check browser console for API errors
4. Verify API base URL in config

## Future Enhancements

- [ ] User-specific coupons
- [ ] Coupon categories/segments
- [ ] Automatic coupon application based on purchase history
- [ ] Stacking multiple coupons
- [ ] Referral coupon generation
- [ ] Time-based coupon scheduling
