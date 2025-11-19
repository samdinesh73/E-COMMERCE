# User Role System - Implementation Guide

## Overview

A complete user role-based access control (RBAC) system has been implemented with three user roles:

1. **Admin** - Full access to admin dashboard and all management features
2. **Customer** - Regular user with access to shopping, cart, wishlist, orders
3. **Subscriber** - Same as customer (can be upgraded later with specific features)

---

## User Roles

### Admin Role
- Access to Admin Dashboard
- Manage products (create, read, update, delete)
- Manage categories (create, read, update, delete)
- View all orders
- View all users
- View user details
- View order details

### Customer Role
- Browse products
- Add to cart and wishlist
- Checkout and place orders
- View own account and orders
- No access to admin features

### Subscriber Role
- Same as Customer (reserved for future features)
- Can be used for VIP customers or members

---

## Database Changes

### SQL Migration
File: `backend/add-user-roles.sql`

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer' AFTER password;

-- Create index for faster queries
CREATE INDEX idx_users_role ON users(role);
```

**To apply migration:**
```bash
mysql -u root -p shop_db < backend/add-user-roles.sql
```

### Users Table Structure
```sql
users {
  id (PK, AUTO_INCREMENT),
  email (VARCHAR, UNIQUE),
  password_hash (VARCHAR),
  name (VARCHAR),
  role (VARCHAR, DEFAULT 'customer'),  -- NEW COLUMN
  created_at (TIMESTAMP),
  updated_at (TIMESTAMP)
}
```

**Role Values:**
- `'admin'` - Administrator
- `'customer'` - Regular customer (default)
- `'subscriber'` - Subscriber member (reserved)

---

## Backend Implementation

### Authentication Routes - Updated

**File:** `backend/src/routes/authRoutes.js`

#### Sign Up - POST `/auth/signup`
Now automatically assigns `'customer'` role to new users.

```javascript
// New users get 'customer' role by default
INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'customer')
```

**Response includes role:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

#### Sign In - POST `/auth/signin`
Returns user's assigned role in JWT token and response.

```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

#### Get User Info - GET `/auth/me`
Returns user with role information.

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

### JWT Token Structure

JWT now includes `role` field:

**Payload:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700604800
}
```

---

## Frontend Implementation

### 1. AuthContext Updates

**File:** `frontend/src/context/AuthContext.jsx`

Already stores complete user object including role from backend.

```javascript
// User object now includes role from JWT
user = {
  id: 1,
  email: "user@example.com",
  name: "John Doe",
  role: "admin"
}
```

Usage in components:
```jsx
const { user } = useAuth();
console.log(user.role); // "admin", "customer", or "subscriber"
```

### 2. Protected Route Component

**New File:** `frontend/src/components/layout/ProtectedRoute.jsx`

Role-based route protection component:

```jsx
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Usage in App.jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

**Features:**
- Checks if user is authenticated
- Verifies user has required role
- Shows loading spinner while verifying
- Redirects to login if not authenticated
- Shows "Access Denied" message if wrong role

### 3. App.jsx Routes

**File:** `frontend/src/App.jsx`

All admin routes now wrapped with role protection:

```jsx
{/* Admin Dashboard - Admin Only */}
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

{/* Admin Order Details - Admin Only */}
<Route
  path="/admin/order/:orderId"
  element={
    <ProtectedRoute requiredRole="admin">
      <OrderDetail />
    </ProtectedRoute>
  }
/>

{/* Admin User Details - Admin Only */}
<Route
  path="/admin/user/:userId"
  element={
    <ProtectedRoute requiredRole="admin">
      <UserDetail />
    </ProtectedRoute>
  }
/>
```

### 4. Navbar Updates

**File:** `frontend/src/components/layout/Navbar.jsx`

Admin link only visible to admin users:

```jsx
{/* Desktop - Admin link only for admin users */}
{user?.role === "admin" && (
  <Link to="/admin" className="...">
    Admin
  </Link>
)}

{/* Mobile - Admin link only for admin users */}
{user?.role === "admin" && (
  <Link to="/admin" className="...">
    Admin
  </Link>
)}
```

**Behavior:**
- Admin users: See red "Admin" link in navbar
- Customer users: Admin link hidden
- Non-logged-in users: Admin link hidden

---

## How It Works - User Flow

### New User Registration
```
1. User signs up with email, password, name
   ↓
2. Backend creates user with role = 'customer' (default)
   ↓
3. JWT token generated with role: 'customer'
   ↓
4. User logged in as 'customer'
   ↓
5. Admin link not visible in navbar
   ↓
6. Attempting /admin shows "Access Denied"
```

### Admin User Login
```
1. Admin user (pre-configured in DB) signs in
   ↓
2. Backend fetches user with role = 'admin'
   ↓
3. JWT token generated with role: 'admin'
   ↓
4. User logged in as 'admin'
   ↓
5. Red "Admin" link visible in navbar
   ↓
6. Can access /admin dashboard
```

---

## Making Users Admin

To make an existing user an admin:

**Option 1: Direct Database Query**
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

**Option 2: In your SQL migration file**
```sql
-- Make specific user admin
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

**After update:**
- User must log out and log back in
- New JWT token will include `role: 'admin'`
- Admin link will appear in navbar
- Admin pages will be accessible

---

## API Endpoints - Role-Based Access

### Protected Admin Endpoints

All these endpoints now check user role in the backend (already implemented):

```
POST   /categories          - Admin only
PUT    /categories/:id      - Admin only
DELETE /categories/:id      - Admin only
POST   /products            - Admin only
PUT    /products/:id        - Admin only
DELETE /products/:id        - Admin only
GET    /orders              - Admin only (view all)
GET    /users               - Admin only
```

Authentication headers required:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Security Considerations

### Token-Based Security
- Role encoded in JWT token
- Token expires in 7 days
- Token validation on backend
- New token issued on each login

### Frontend Protection
- Routes protected with `ProtectedRoute` component
- Admin link hidden from non-admin users
- Direct URL access to /admin blocked

### Backend Protection
- Every admin endpoint verifies token
- JWT signature verified
- User role checked from database on /auth/me
- Express middleware validates requests

### Best Practices
1. **Change JWT_SECRET** in production (.env file)
2. **Use HTTPS** in production
3. **Token refreshing** - Implement token refresh if needed
4. **Role verification** - Always verify role on backend before sensitive operations
5. **Audit logging** - Log admin actions for security

---

## Testing Role-Based Access

### Test Case 1: Customer Cannot Access Admin
1. Create account with normal signup
2. Try accessing `/admin` directly
3. **Expected:** Shows "Access Denied" message

### Test Case 2: Admin Can Access Admin
1. Database: Update user to admin role
2. Logout and login
3. Admin link appears in navbar
4. Clicking Admin works
5. **Expected:** Admin dashboard loads

### Test Case 3: Role Persists on Page Reload
1. Login as admin
2. Visit admin page
3. Refresh page
4. **Expected:** Still on admin page, still authenticated

### Test Case 4: Role Lost After Logout
1. Login as admin
2. Click logout
3. Try accessing `/admin`
4. **Expected:** Redirected to login

---

## File Structure

```
backend/
├── add-user-roles.sql              (NEW - DB migration)
└── src/routes/
    └── authRoutes.js               (UPDATED - role in JWT)

frontend/
├── src/
│   ├── App.jsx                     (UPDATED - protected routes)
│   ├── context/
│   │   └── AuthContext.jsx         (Already supports role)
│   └── components/layout/
│       ├── Navbar.jsx              (UPDATED - conditional admin link)
│       └── ProtectedRoute.jsx       (NEW - role-based route guard)
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Admin link not showing | Check user.role === 'admin', verify JWT has role |
| Cannot access /admin | Check database role value, re-login |
| 401 Unauthorized on admin pages | JWT expired or invalid, re-login |
| Role not updating immediately | User needs to logout and login again |
| Wrong role in JWT | Backend and frontend JWT must match |

---

## Future Enhancements

- [ ] Role-based API endpoints management
- [ ] Dynamic role creation
- [ ] Permission system (granular permissions)
- [ ] Role hierarchy
- [ ] Audit logging for role changes
- [ ] Admin role assignment UI
- [ ] Subscriber premium features
- [ ] Token refresh mechanism

---

## Quick Reference

### Check User Role in Component
```jsx
import { useAuth } from "../context/AuthContext";

function MyComponent() {
  const { user } = useAuth();
  
  return user?.role === "admin" ? <AdminPanel /> : <UserPanel />;
}
```

### Protect a Route
```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>
```

### Database: Make User Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

### Check Role in Backend
```javascript
// In any auth-protected endpoint
const token = req.headers.authorization?.split(" ")[1];
const decoded = jwt.verify(token, JWT_SECRET);
console.log(decoded.role); // "admin", "customer", or "subscriber"
```

