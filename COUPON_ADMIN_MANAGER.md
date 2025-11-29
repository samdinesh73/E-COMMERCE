# Admin Coupon Manager - Complete Implementation Guide

## Overview
The Coupon Management system is now fully integrated into the Admin Dashboard. Admins can create, edit, update, and delete discount coupons with complete CRUD operations.

## Features Implemented

### 1. **Create New Coupon**
- Coupon code input (auto-uppercase)
- Discount type selection: Percentage (%) or Fixed Amount (₹)
- Discount value input
- Minimum order value requirement
- Maximum uses limit (optional - leave empty for unlimited)
- Expiry date selection
- Description field
- Active/Inactive status toggle

### 2. **View All Coupons**
- List table showing all created coupons
- Displays: Code, Discount, Min Order, Uses, Expiry, Status
- Real-time usage tracking (current uses vs max uses)
- Active/Inactive status badge styling

### 3. **Edit Coupon**
- Click Edit icon to modify existing coupon
- All fields editable except coupon code (prevents code changes)
- Updates reflected immediately
- Form auto-populates with current values

### 4. **Delete Coupon**
- Click Delete icon for each coupon
- Confirmation modal prevents accidental deletion
- Permanent deletion from database

## File Structure

```
frontend/src/components/admin/
├── CouponManager.jsx         # Main coupon management component
└── AdminDashboard.jsx        # Updated to include coupons tab
```

## Component Details

### CouponManager.jsx
**Location**: `frontend/src/components/admin/CouponManager.jsx`

**Key Features**:
- React hooks for state management (useState, useEffect)
- Axios for API calls
- Form validation
- Loading states
- Error/success notifications
- Delete confirmation modal
- Responsive table layout
- Token-based authentication

**State Management**:
```javascript
- coupons: Array of all coupons
- loading: Loading state for fetching coupons
- showForm: Show/hide create/edit form
- editingId: Track which coupon is being edited
- deleting: Track coupon pending deletion
- error: Error messages
- success: Success messages
- token: Authentication token from localStorage
- form: Current form data object
```

**Form Fields**:
```javascript
{
  code: String,                    // Coupon code (uppercase)
  description: String,             // Optional description
  discount_type: "percentage"|"fixed", // Type of discount
  discount_value: Number,         // Discount amount/percentage
  min_order_value: Number,        // Minimum order amount
  max_uses: Number|null,          // Maximum uses (null for unlimited)
  expires_at: String,             // Expiry date (YYYY-MM-DD)
  is_active: 1|0                  // Active status
}
```

## Backend API Endpoints

All endpoints require admin authentication token in headers: `Authorization: Bearer {token}`

### 1. **GET /coupons**
Fetch all coupons
- **Response**: Array of coupon objects
- **Status**: 200 OK

### 2. **POST /coupons**
Create new coupon
- **Request Body**:
  ```json
  {
    "code": "SAVE10",
    "description": "Save 10% on all products",
    "discount_type": "percentage",
    "discount_value": 10,
    "min_order_value": 500,
    "max_uses": 100,
    "expires_at": "2025-12-31",
    "is_active": 1
  }
  ```
- **Response**: Created coupon object
- **Status**: 201 Created

### 3. **PUT /coupons/:id**
Update existing coupon
- **Request Body**: Same as POST
- **Response**: Updated coupon object
- **Status**: 200 OK

### 4. **DELETE /coupons/:id**
Delete coupon
- **Response**: Success message
- **Status**: 200 OK

### 5. **GET /coupons/:id/usage**
Get coupon usage history
- **Response**: Array of usage records
- **Status**: 200 OK

## UI Components

### 1. **Header Section**
- Title: "Coupon Management"
- Subtitle: "Create and manage discount coupons"
- "New Coupon" button with Plus icon

### 2. **Alert Messages**
- Red alert for errors with AlertCircle icon
- Green alert for success with Check icon
- Auto-dismiss after 3 seconds

### 3. **Create/Edit Form**
- Hidden by default, shows when creating/editing
- Close button (X icon) to dismiss
- Two-column responsive grid for form fields
- Submit buttons: Cancel and Create/Update
- Form validation (required fields marked with *)

### 4. **Coupons Table**
- Responsive horizontal scrolling on mobile
- Columns: Code, Discount, Min Order, Uses, Expiry, Status, Actions
- Hover effects on rows
- Edit icon (blue) and Delete icon (red) for each row
- Empty state message if no coupons

### 5. **Delete Confirmation Modal**
- Overlay modal on top of page
- Confirmation message
- Cancel and Delete buttons
- Prevents accidental deletion

## Usage Flow

### Creating a Coupon
1. Click "New Coupon" button in admin dashboard
2. Fill in coupon details:
   - Enter coupon code (e.g., SAVE10)
   - Select discount type (percentage or fixed)
   - Enter discount value
   - Set minimum order value (optional)
   - Set maximum uses or leave empty for unlimited
   - Select expiry date (optional)
   - Toggle active status
   - Add description
3. Click "Create Coupon"
4. See success message and coupon appears in table

### Editing a Coupon
1. Find coupon in table
2. Click Edit icon (pencil)
3. Form appears with current values pre-filled
4. Update desired fields
5. Click "Update Coupon"
6. Changes reflected immediately

### Deleting a Coupon
1. Find coupon in table
2. Click Delete icon (trash)
3. Confirmation modal appears
4. Click "Delete" to confirm
5. Coupon removed from table

## Integration with AdminDashboard

**Updated Files**: `frontend/src/pages/admin/AdminDashboard.jsx`

**Changes Made**:
1. Added import: `import CouponManager from "../../components/admin/CouponManager";`
2. Added Ticket icon to imports from lucide-react
3. Added coupon tab to tabs array:
   ```javascript
   { id: "coupons", label: "Coupons", icon: Ticket }
   ```
4. Added coupon tab rendering:
   ```jsx
   {tab === "coupons" && <CouponManager />}
   ```

## Styling

The component uses Tailwind CSS with the following design principles:
- Blue (#3b82f6) for primary actions (Create, Update buttons)
- Red (#dc2626) for destructive actions (Delete)
- Green for active status and success messages
- Gray for inactive status and secondary elements
- Responsive grid layout that adapts to mobile/tablet/desktop
- Hover states for better UX
- Consistent spacing and border styling

## Coupon Business Logic

### Discount Calculation
**Frontend** (CartContext.jsx):
```javascript
getDiscountAmount() {
  if (!appliedCoupon) return 0;
  const subtotal = getTotalPrice();
  
  if (appliedCoupon.discount_type === 'percentage') {
    return (subtotal * appliedCoupon.discount_value) / 100;
  } else {
    return appliedCoupon.discount_value;
  }
}

getFinalTotal() {
  return getTotalPrice() - getDiscountAmount();
}
```

**Backend** (couponController.js - validateCoupon):
- Validates coupon code exists
- Checks coupon is active
- Validates not expired
- Checks minimum order value requirement
- Checks max uses limit not exceeded
- Calculates discount amount
- Returns validated coupon with discount details

### Coupon Validation Rules
1. **Code Match**: Coupon code must match exactly
2. **Status**: Coupon must be active (is_active = 1)
3. **Expiry**: If expires_at is set, must not be past expiry date
4. **Min Order**: Cart subtotal must be >= min_order_value
5. **Usage Limit**: Current uses < max_uses (if max_uses is set)

## Error Handling

- **Network Errors**: Display "Failed to load coupons" message
- **Validation Errors**: Display specific error from backend
- **Delete Errors**: Show error message with retry option
- **Save Errors**: Display error with details

## Performance Considerations

1. **Lazy Loading**: Coupons loaded on component mount only once if token exists
2. **Efficient Rendering**: Uses keys for list items, conditional rendering for modal
3. **Optimized Requests**: Single fetch for all coupons, specific fetch for individual operations
4. **Debounced State**: Form resets properly after operations

## Security

1. **Token-Based Auth**: All API requests include Bearer token
2. **Code Immutability**: Once created, coupon code cannot be changed
3. **Deletion Confirmation**: Extra step prevents accidental deletes
4. **Server-Side Validation**: Backend validates all operations
5. **Type Validation**: Proper type checking for discount calculations

## Testing Checklist

- [x] Create coupon with percentage discount
- [x] Create coupon with fixed amount discount
- [x] Create coupon with expiry date
- [x] Create coupon with max uses limit
- [x] Create coupon without max uses (unlimited)
- [x] Edit existing coupon (code cannot be changed)
- [x] Delete coupon with confirmation
- [x] View all coupons in table
- [x] See current uses vs max uses
- [x] Toggle active/inactive status
- [x] Success and error messages display correctly
- [x] Form validation (required fields)
- [x] Responsive on mobile/tablet
- [x] Authentication token properly used

## Troubleshooting

### Coupons Not Loading
- Check if auth token is in localStorage
- Verify user is logged in as admin
- Check browser console for API errors
- Verify backend is running

### Form Not Submitting
- Check all required fields are filled
- Verify internet connection
- Check auth token is valid
- Check backend logs for validation errors

### Delete Not Working
- Confirm in confirmation modal
- Check if coupon is being used in orders
- Verify auth token permissions
- Check backend error logs

### Discount Not Applying in Checkout
- Ensure coupon is active (is_active = 1)
- Check expiry date hasn't passed
- Verify cart amount meets minimum requirement
- Check max uses limit not exceeded

## Future Enhancements

- [ ] Bulk upload coupons via CSV
- [ ] Coupon usage analytics/reports
- [ ] A/B testing with coupon variants
- [ ] Automatic coupon generation
- [ ] Coupon scheduling (future activation)
- [ ] Usage history export
- [ ] Coupon performance metrics
- [ ] Integration with marketing tools

## Related Documentation

- `COUPON_LOADING_FIX.md` - Fixed coupon validation loading issue
- `COUPON_CHECKOUT_FIX.md` - Fixed discount not passing to checkout
- `COUPON_USER_FLOW.md` - User flow documentation for coupon system
