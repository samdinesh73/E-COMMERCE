# Order Variations Implementation Guide

## Database Changes

### 1. Apply Migration
Run this SQL to add variations column to order tables:

```sql
-- Add variations column to order_items and guest_order_items tables
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variations JSON;
ALTER TABLE guest_order_items ADD COLUMN IF NOT EXISTS variations JSON;
```

Or run the migration file:
```bash
mysql -u your_user -p shop_db < backend/add-order-variations.sql
```

## Backend Changes

### Order Routes (`backend/src/routes/orderRoutes.js`)
✅ Updated to:
- **Create Order**: Save `selectedVariations` as JSON with each order item
- **Get Orders**: Returns orders with items that include parsed variations
- **Get Order Details**: Admin endpoint includes variations with items

### What's Stored:
For each order item, the system now stores:
- `product_id`
- `product_name`
- `quantity`
- `price` (final price of that variation)
- `variations` (JSON) - contains all selected variations like `{"Size": {...}, "Color": {...}}`

## Frontend Changes

### 1. CartContext (`frontend/src/context/CartContext.jsx`)
✅ Updated `addToCart()` to accept and store `selectedVariations`

### 2. ProductDetail (`frontend/src/pages/ProductDetail.jsx`)
✅ Updated `handleAddToCart()` to pass `selectedVariations`

### 3. Checkout (`frontend/src/pages/Checkout.jsx`)
✅ Updated to send `selectedVariations` with each item when creating order

### 4. MyAccount (`frontend/src/pages/MyAccount.jsx`)
✅ Enhanced to show:
- Expandable order details (click order row to expand)
- Shipping address
- Order items with:
  - Product name
  - Quantity
  - Price
  - **Variations** (Size, Color, Weight, etc.) with their values

## How It Works - Complete Flow

### 1. Shopping
User selects variations on product detail page (e.g., Size: L, Color: Red)

### 2. Cart
When adding to cart, variations are stored with the item in CartContext

### 3. Checkout
When proceeding to checkout, variations are sent with order data:
```javascript
{
  items: [
    {
      id: 1,
      name: "T-Shirt",
      price: 500,
      quantity: 1,
      selectedVariations: {
        "Size": { id: 10, variation_type: "Size", variation_value: "L", ... },
        "Color": { id: 20, variation_type: "Color", variation_value: "Red", ... }
      }
    }
  ]
}
```

### 4. Order Storage
Backend saves variations as JSON:
```sql
INSERT INTO order_items (..., variations) 
VALUES (..., '{"Size": {...}, "Color": {...}}')
```

### 5. Order Retrieval
When fetching orders, variations are parsed back:
```javascript
{
  id: 1,
  product_name: "T-Shirt",
  price: 500,
  quantity: 1,
  selectedVariations: {
    "Size": {...},
    "Color": {...}
  }
}
```

### 6. Display
MyAccount page shows expandable orders with all variations clearly displayed

## What Users See

**Orders List:**
```
[Order #123] [Date] [₹500] [COD] [Pending] ▼
```

**When Expanded:**
```
Shipping Address: 123 Main St, Delhi - 110001

Items:
┌─────────────────────────────┐
│ T-Shirt (Qty: 1) - ₹500     │
│ Variations:                 │
│ Size: Large                 │
│ Color: Red                  │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Jeans (Qty: 2) - ₹1000      │
│ Variations:                 │
│ Size: 32                    │
│ Color: Black                │
└─────────────────────────────┘
```

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Upload product with multiple variation types (Size, Color)
- [ ] Select variations on product detail page
- [ ] Add to cart with variations selected
- [ ] Proceed to checkout
- [ ] Complete COD order
- [ ] Go to MyAccount
- [ ] Click on order to expand
- [ ] Verify all variations display correctly

## Files Modified

### Backend
- `backend/src/routes/orderRoutes.js` - Added variations handling in all order endpoints
- `backend/add-order-variations.sql` - Migration file (NEW)

### Frontend
- `frontend/src/context/CartContext.jsx` - Store variations with items
- `frontend/src/pages/ProductDetail.jsx` - Pass variations to cart
- `frontend/src/pages/Checkout.jsx` - Include variations in order
- `frontend/src/pages/MyAccount.jsx` - Display variations in order details

## API Changes

### POST /orders
Request body now includes variations for each item:
```json
{
  "items": [
    {
      "product_id": 1,
      "name": "T-Shirt",
      "price": 500,
      "quantity": 1,
      "selectedVariations": {
        "Size": {...},
        "Color": {...}
      }
    }
  ]
}
```

### GET /orders
Response now includes items with variations:
```json
{
  "orders": [
    {
      "id": 1,
      "total_price": 500,
      "items": [
        {
          "product_id": 1,
          "product_name": "T-Shirt",
          "price": 500,
          "quantity": 1,
          "selectedVariations": {...}
        }
      ]
    }
  ]
}
```
