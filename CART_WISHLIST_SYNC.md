# Cart & Wishlist Sync Implementation

## Overview
Cart and Wishlist items are now synced with the backend database. When a user logs in on a different device, their cart and wishlist items will be automatically loaded from the database.

## Features
- ✅ Cart items persist across devices when logged in
- ✅ Wishlist items persist across devices when logged in
- ✅ Local storage fallback for guest users
- ✅ Automatic sync when user authenticates
- ✅ Real-time backend synchronization for add/remove/update operations

## Database Setup

Run the migration to create the new tables:

```bash
mysql -u root -p shop_db < backend/create-cart-wishlist-tables.sql
```

This creates two tables:
- `carts` - Stores user cart items with product details and quantity
- `wishlists` - Stores user wishlist items

## Backend Changes

### New Routes Added:

**Cart Routes** (`/cart`):
- `GET /cart` - Fetch user's cart items
- `POST /cart` - Add item to cart
- `PUT /cart/:productId` - Update item quantity
- `DELETE /cart/:productId` - Remove item from cart
- `DELETE /cart` - Clear entire cart

**Wishlist Routes** (`/wishlist`):
- `GET /wishlist` - Fetch user's wishlist items
- `POST /wishlist` - Add item to wishlist
- `DELETE /wishlist/:productId` - Remove item from wishlist
- `GET /wishlist/:productId` - Check if product is in wishlist

### Authentication
All routes require Bearer token authentication via the `authenticate` middleware.

## Frontend Changes

### CartContext Updates
- Automatically fetches cart from backend when user logs in
- Syncs all cart operations (add/remove/update) with backend
- Falls back to localStorage for guest users
- Maintains local state for instant UI updates

### WishlistContext Updates
- Automatically fetches wishlist from backend when user logs in
- Syncs all wishlist operations with backend
- Falls back to localStorage for guest users
- Maintains local state for instant UI updates

## How It Works

1. **User Logs In**
   - AuthContext sets user and token
   - CartContext watches for user/token changes
   - WishlistContext watches for user/token changes
   - Both contexts automatically fetch data from backend

2. **User Adds Item to Cart**
   - Local state updated immediately (for instant UI)
   - Backend synced in background (if logged in)
   - Guest users: only localStorage

3. **User Logs In on Different Device**
   - All backend data is fetched
   - Local cart/wishlist replaced with server data
   - User sees all their saved items

4. **User Logs Out**
   - Cart and Wishlist remain in localStorage (guest mode)
   - When logged back in, backend data overwrites localStorage

## Testing

1. Add items to cart/wishlist while logged in
2. Log out
3. Log in on a different browser or device
4. Verify cart and wishlist items are loaded

## Files Created/Modified

### Created:
- `backend/create-cart-wishlist-tables.sql` - Database migration
- `backend/src/routes/cartRoutes.js` - Cart API endpoints
- `backend/src/routes/wishlistRoutes.js` - Wishlist API endpoints
- `backend/src/middleware/auth.js` - Authentication middleware

### Modified:
- `backend/src/server.js` - Added cart and wishlist routes
- `frontend/src/context/CartContext.jsx` - Added backend sync
- `frontend/src/context/WishlistContext.jsx` - Added backend sync
