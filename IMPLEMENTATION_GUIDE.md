# Implementation Guide - Cart & Wishlist Sync Across Devices

## Problem Statement
Previously, cart and wishlist items were only stored in browser localStorage. When logging in on a different device, users would not see their saved items.

## Solution
Implemented a backend-frontend sync system that:
1. Stores cart and wishlist items in MySQL database per user
2. Automatically loads items when user logs in
3. Maintains localStorage for guest users (non-authenticated)
4. Syncs all operations in real-time

---

## Installation Steps

### Step 1: Create Database Tables

Run the migration script to create the necessary tables:

```bash
cd backend
mysql -u root -p shop_db < create-cart-wishlist-tables.sql
```

**What it creates:**
- `carts` table - Stores user cart items with product details
- `wishlists` table - Stores user wishlist items

### Step 2: Verify Backend Routes

The following files were created/modified:

**Files Created:**
```
backend/src/routes/cartRoutes.js        - Cart API endpoints
backend/src/routes/wishlistRoutes.js    - Wishlist API endpoints
backend/src/middleware/auth.js          - Authentication middleware
backend/create-cart-wishlist-tables.sql - Database migration
```

**Files Modified:**
```
backend/src/server.js - Added cart and wishlist routes
```

### Step 3: Verify Frontend Context Updates

The context files have been updated to sync with backend:

**Files Modified:**
```
frontend/src/context/CartContext.jsx      - Syncs with backend
frontend/src/context/WishlistContext.jsx  - Syncs with backend
```

---

## API Endpoints

### Cart Endpoints

All endpoints require `Authorization: Bearer <token>` header.

#### GET /cart
Fetch user's cart items

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 5,
      "name": "iPhone 15",
      "price": "79999.00",
      "image": "/uploads/iphone15.jpg",
      "description": "Latest Apple smartphone",
      "quantity": 2,
      "added_at": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

#### POST /cart
Add item to cart

**Request Body:**
```json
{
  "product_id": 5,
  "quantity": 1,
  "price": "79999.00"
}
```

**Response:**
```json
{ "success": true, "message": "Item added to cart" }
```

#### PUT /cart/:productId
Update item quantity

**Request Body:**
```json
{ "quantity": 3 }
```

**Response:**
```json
{ "success": true, "message": "Cart updated" }
```

#### DELETE /cart/:productId
Remove item from cart

**Response:**
```json
{ "success": true, "message": "Item removed from cart" }
```

#### DELETE /cart
Clear entire cart

**Response:**
```json
{ "success": true, "message": "Cart cleared" }
```

---

### Wishlist Endpoints

All endpoints require `Authorization: Bearer <token>` header.

#### GET /wishlist
Fetch user's wishlist items

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 10,
      "name": "Samsung Galaxy S24",
      "price": "74999.00",
      "image": "/uploads/samsung-s24.jpg",
      "description": "Premium Android phone",
      "added_at": "2025-01-14T15:45:00.000Z"
    }
  ]
}
```

#### POST /wishlist
Add item to wishlist

**Request Body:**
```json
{ "product_id": 10 }
```

**Response:**
```json
{ "success": true, "message": "Item added to wishlist" }
```

#### DELETE /wishlist/:productId
Remove item from wishlist

**Response:**
```json
{ "success": true, "message": "Item removed from wishlist" }
```

#### GET /wishlist/:productId
Check if product is in wishlist

**Response:**
```json
{ "inWishlist": true }
```

---

## How It Works

### User Flow - Add to Cart While Logged In

```
1. User clicks "Add to Cart"
   ↓
2. CartContext.addToCart() called
   ↓
3. Local state updated immediately (UI responds instantly)
   ↓
4. If user is logged in:
     - Backend call made to POST /cart with product details
     - Database record created/updated
   ↓
5. If user is NOT logged in:
     - Only localStorage updated
```

### User Flow - Login on Different Device

```
1. User logs in on Device B
   ↓
2. AuthContext sets user and token
   ↓
3. CartContext detects user/token change via useEffect
   ↓
4. CartContext calls fetchCartFromBackend()
   ↓
5. GET /cart request sent with Bearer token
   ↓
6. Backend returns all user's cart items from database
   ↓
7. Local cart state replaced with backend data
   ↓
8. UI updates to show all items from Device A
```

### User Flow - Logout and Login Later

```
1. User logs out
   ↓
2. Cart and Wishlist remain in localStorage
   ↓
3. User operates in guest mode (adding items only to localStorage)
   ↓
4. User logs back in
   ↓
5. Backend data loads and overwrites localStorage
   ↓
6. User sees their original saved items (new guest items lost)
```

---

## Frontend Implementation Details

### CartContext Changes

**Before:**
```javascript
// Only localStorage
useEffect(() => {
  localStorage.setItem("cart_items", JSON.stringify(items));
}, [items]);
```

**After:**
```javascript
const { user, token } = useAuth(); // NEW

// Sync with backend when logged in
useEffect(() => {
  if (user && token) {
    fetchCartFromBackend(); // NEW
  }
}, [user, token]); // NEW

// Still save to localStorage for guests
useEffect(() => {
  localStorage.setItem("cart_items", JSON.stringify(items));
}, [items]);

// When adding to cart - also sync with backend
const addToCart = async (product, quantity = 1) => {
  setItems(prev => { /* update local state */ });
  
  if (user && token) {
    // NEW: Backend sync
    await axios.post(`${API_BASE_URL}/cart`, {
      product_id: product.id,
      quantity,
      price: product.price,
    }, { headers: { Authorization: `Bearer ${token}` } });
  }
};
```

### WishlistContext Changes

Similar pattern to CartContext:
- Watches for user/token changes
- Fetches from backend on login
- Syncs all operations
- Falls back to localStorage for guests

---

## Database Schema

### carts table
```sql
CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id)
);
```

**Key Points:**
- UNIQUE constraint prevents duplicate items
- Foreign keys ensure referential integrity
- Cascade delete ensures cleanup when user/product deleted

### wishlists table
```sql
CREATE TABLE wishlists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (user_id, product_id)
);
```

---

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Backend server starts without errors
- [ ] Can add items to cart while logged in
- [ ] Can add items to wishlist while logged in
- [ ] Cart items appear in database
- [ ] Wishlist items appear in database
- [ ] Can log out
- [ ] Can log in on different browser
- [ ] All items from previous device appear
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Can clear cart/wishlist
- [ ] Guest operations (without login) still work with localStorage
- [ ] Items persist in localStorage for guests

---

## Troubleshooting

### Cart items not loading after login

1. Check browser console for errors
2. Verify token is being sent in Authorization header
3. Run in MySQL: `SELECT * FROM carts WHERE user_id = <user_id>;`
4. Check backend logs for endpoint errors

### Items disappearing after logout

**Expected behavior:** Items stored in localStorage remain. When you log back in, backend items replace localStorage.

### Database errors

```bash
# Check if tables exist
mysql -u root -p shop_db
mysql> DESCRIBE carts;
mysql> DESCRIBE wishlists;

# Check for foreign key constraints
mysql> SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME='carts';
```

### CORS or token errors

- Verify `.env` has correct `REACT_APP_API_URL`
- Check `JWT_SECRET` is set in backend `.env`
- Verify token is being stored in localStorage after login

---

## Performance Considerations

- Cart fetch happens once on login (not on every component render)
- Individual add/remove operations synced in background
- Local state updates happen immediately for responsive UI
- Duplicate items prevented by database UNIQUE constraints
- Consider pagination if users have 100+ items in cart/wishlist

---

## Future Enhancements

- [ ] Add item recommendations based on wishlist
- [ ] Send email when wishlist item goes on sale
- [ ] Sync cart expiry (auto-clear after 30 days of inactivity)
- [ ] Show "Added to cart by Device A at 3:45 PM" timestamps
- [ ] Cross-device cart merge strategy (instead of replace)
- [ ] Analytics: Most wishlisted products, average cart value per user
