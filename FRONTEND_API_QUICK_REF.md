# Frontend API - Quick Reference

## Single Source of Truth

All API calls now use environment variables through:
```javascript
import { API_BASE_URL, ENDPOINTS } from "../../constants/config";
```

## All Endpoints

| Purpose | Endpoint | Usage |
|---------|----------|-------|
| Products | `ENDPOINTS.PRODUCTS` | `/products` |
| Product Detail | `ENDPOINTS.PRODUCT_DETAIL` | `/products/:id` |
| Cart | `ENDPOINTS.CART` | `/cart` |
| Orders | `ENDPOINTS.ORDERS` | `/orders` |
| Categories | `ENDPOINTS.CATEGORIES` | `/categories` |
| Auth Me | `ENDPOINTS.AUTH_ME` | `/auth/me` |
| Auth Signup | `ENDPOINTS.AUTH_SIGNUP` | `/auth/signup` |
| Auth Signin | `ENDPOINTS.AUTH_SIGNIN` | `/auth/signin` |
| Wishlist | `ENDPOINTS.WISHLIST` | `/wishlist` |
| Razorpay | `ENDPOINTS.PAYMENTS_RAZORPAY` | `/payments/razorpay` |
| Razorpay Verify | `ENDPOINTS.PAYMENTS_RAZORPAY_VERIFY` | `/payments/razorpay/verify` |

## Usage Examples

### Fetching Data
```javascript
// Using endpoints constant
const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}`);

// Using axios
import axios from "axios";
axios.get(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}`)
```

### Dynamic URLs
```javascript
// Product detail
fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCT_DETAIL}`.replace(':id', productId))

// Or manually
fetch(`${API_BASE_URL}/products/${productId}`)
```

## Files Modified

✅ Core Config:
- `frontend/src/constants/config.js`

✅ Context (State):
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/context/CartContext.jsx`
- `frontend/src/context/WishlistContext.jsx`

✅ Pages:
- `frontend/src/pages/MyAccount.jsx`
- `frontend/src/pages/Checkout.jsx`
- `frontend/src/pages/admin/AdminDashboard.jsx`
- `frontend/src/pages/admin/OrderDetail.jsx`
- `frontend/src/pages/admin/UserDetail.jsx`

✅ Components:
- All admin components
- All product loading components
- ShopFilters component
- UserList component

## Environment Setup

### `.env` File
```dotenv
# Development
REACT_APP_API_URL=http://localhost:5000

# Staging
REACT_APP_API_URL=https://staging.api.com

# Production
REACT_APP_API_URL=https://api.yourdomain.com
```

## Zero Hardcoded URLs

❌ This no longer exists anywhere:
```javascript
"http://localhost:5000"
process.env.REACT_APP_API_URL || "http://localhost:5000"
```

✅ Everything uses:
```javascript
API_BASE_URL + ENDPOINTS.*
```

## Benefits

1. **Change API URL in 1 place** - Just update `.env`
2. **Environment-specific** - Dev/staging/prod use different URLs
3. **No code changes** - Deploy to different servers without rebuilding
4. **Secure** - Sensitive URLs not in code
5. **Maintainable** - Easy to find and update endpoints
6. **Consistent** - All requests follow same pattern

## Testing After Changes

1. Check `.env` has `REACT_APP_API_URL` set
2. Restart: `npm start`
3. Open DevTools → Network tab
4. All requests should use URL from `REACT_APP_API_URL`
5. No `localhost:5000` in any request

Done! ✅
