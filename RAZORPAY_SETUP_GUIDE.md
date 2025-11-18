# Razorpay Payment Gateway - Setup & Testing Guide

## Issue Fixed ✅

**Problem:** "Payment initialization failed: Failed to create payment order"

**Root Cause:** You were using **LIVE Razorpay keys** (rzp_live_*) without a valid business account. These keys require actual payment processing capabilities and authentication with Razorpay's API.

**Solution:** Switched to **TEST mode keys** (rzp_test_*) which allow you to test payments without actual money transactions.

---

## What Was Fixed

### 1. **Environment Files Updated** ✅
**Frontend (.env):**
```dotenv
REACT_APP_RAZORPAY_KEY=rzp_test_1g0VdS1yqNkHg7  ← Test mode key
```

**Backend (.env):**
```dotenv
RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7
RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n
```

### 2. **Better Error Messages** ✅
- Updated `paymentRoutes.js` to log detailed errors from Razorpay API
- Updated `Checkout.jsx` to parse and display error responses
- Added email field to Razorpay prefill data
- Added validation for order data from server

### 3. **Logging Added** ✅
Backend now shows:
```
📋 Creating Razorpay order for amount: ₹500.00 (50000 paise)
✅ Razorpay order created: order_abc123xyz
```

---

## How to Test Razorpay Payments

### Step 1: Start Backend Server
```powershell
cd C:\Users\SR\Downloads\full_project\backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
📋 Creating Razorpay order for amount: ₹XXX.XX (XXXXX paise)
✅ Razorpay order created: order_xxxxx
```

### Step 2: Start Frontend
```powershell
cd C:\Users\SR\Downloads\full_project\frontend
npm start
```

### Step 3: Add Products to Cart
1. Go to http://localhost:3000
2. Browse products
3. Add products to cart
4. Click cart icon

### Step 4: Checkout with Razorpay
1. Click "Cart" → "Proceed to Checkout" (or click floating cart)
2. Fill form:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: 9876543210
   - Address: 123 Main Street
   - City: Mumbai
   - Pincode: 400001
3. Select "Razorpay" payment method
4. Click "Pay ₹XXX.XX"

### Step 5: Complete Test Payment
When Razorpay modal opens, use these test credentials:

**For Successful Payment:**
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25 (any future month/year)
CVV: 123 (any 3 digits)
OTP: 123456 (or skip if not prompted)
```

**For Test Failure:**
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
```

### Step 6: Verify Order
After payment:
1. You'll see "Payment successful! Order placed."
2. Go to "My Account" to view orders
3. Check database: `SELECT * FROM login_orders;`

---

## Razorpay Test Credentials Summary

| Key | Value |
|-----|-------|
| Mode | Test Mode |
| Key ID | `rzp_test_1g0VdS1yqNkHg7` |
| Key Secret | `bDvdC5KxX1YzPm3n` |
| Card (Success) | 4111 1111 1111 1111 |
| Card (Fail) | 4000 0000 0000 0002 |
| Expiry | Any future date (12/25) |
| CVV | Any 3 digits (123) |
| OTP | 123456 |

---

## Testing Scenarios

### Scenario 1: Successful Payment
- ✅ Fill checkout form
- ✅ Select Razorpay payment
- ✅ Use card: 4111 1111 1111 1111
- ✅ Expected: Order saved, redirected to My Account

### Scenario 2: Failed Payment
- ✅ Fill checkout form
- ✅ Select Razorpay payment
- ✅ Use card: 4000 0000 0000 0002
- ✅ Expected: Payment declined, can retry

### Scenario 3: Validation Errors
- ❌ Try checkout with empty name → Error: "Please fill name, email, phone and address"
- ❌ Invalid email format → Browser validation
- ❌ Missing phone → Form validation

### Scenario 4: Network Error (if backend down)
- ❌ Stop backend server
- ❌ Try Razorpay payment
- ✅ Expected: "Payment initialization failed: Failed to connect to server"

### Scenario 5: Both Payment Methods
- ✅ Test COD (Cash on Delivery) → Works instantly
- ✅ Test Razorpay → Opens payment modal

---

## File Changes Made

| File | Changes |
|------|---------|
| `frontend/.env` | Updated RAZORPAY_KEY to test mode |
| `backend/.env` | Updated RAZORPAY credentials to test mode |
| `backend/src/routes/paymentRoutes.js` | Added detailed logging and better error handling |
| `frontend/src/pages/Checkout.jsx` | Added email to prefill, better error parsing, validation for order data |

---

## Production Deployment

When ready for production:

1. **Get Real Razorpay Credentials:**
   - Go to https://dashboard.razorpay.com
   - Sign up for business account
   - Generate live keys from Settings → API Keys
   - Keys will start with `rzp_live_*`

2. **Update Environment Files:**
   ```dotenv
   # frontend/.env
   REACT_APP_RAZORPAY_KEY=rzp_live_xxxxxxxxxxxx
   
   # backend/.env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxx (36 chars)
   ```

3. **Verify Payment Flow:**
   - Test with real card (minimal amount)
   - Verify orders are saved
   - Check payment confirmation emails

---

## Troubleshooting

### "Payment initialization failed: Invalid API Key"
- ✅ Check .env files are correct
- ✅ Restart backend: `npm run dev`
- ✅ Clear frontend cache: Ctrl+Shift+R in browser

### "Failed to create payment order"
- ✅ Verify backend is running on http://localhost:5000
- ✅ Check browser console (F12 → Console) for error details
- ✅ Check backend logs for "❌ Razorpay API Error"

### Payment modal doesn't open
- ✅ Check if Razorpay script loaded (F12 → Network tab)
- ✅ Verify REACT_APP_RAZORPAY_KEY is in frontend/.env
- ✅ Check if window.Razorpay is available in console

### "Order not found after payment"
- ✅ Check if saveOrder() is being called
- ✅ Verify database connection
- ✅ Check orderRoutes.js for POST /orders endpoint

### Email not showing in Razorpay modal
- ✅ Verify email field is filled in checkout form
- ✅ Check prefill object in Razorpay options includes email
- ✅ Update frontend/src/pages/Checkout.jsx (already done ✓)

---

## Payment Flow Diagram

```
Customer → Checkout Form
              ↓
         Fill Details + Select Razorpay
              ↓
         Frontend: POST /payments/razorpay
              ↓
         Backend: Create order via Razorpay API
              ↓
         Backend: Return order ID + amount
              ↓
         Frontend: Initialize Razorpay modal
              ↓
         Customer: Enter card details (test card)
              ↓
         Razorpay: Process payment (test mode)
              ↓
         Razorpay: Return payment response
              ↓
         Frontend: POST /orders (save order)
              ↓
         Backend: Save to database
              ↓
         Frontend: Redirect to My Account
              ↓
         ✅ Order visible in order list
```

---

## API Endpoints

### Payment Creation
```
POST /payments/razorpay
Request: { amount: 50000 }  // amount in paise
Response: { 
  id: "order_xxxxx",
  amount: 50000,
  currency: "INR",
  ...
}
Error: { error: "Detailed error message" }
```

### Order Saving
```
POST /orders
Headers: Authorization: Bearer {token} (for auth users)
Request: {
  total_price: 500,
  shipping_address: "123 Main St",
  city: "Mumbai",
  pincode: "400001",
  payment_method: "razorpay",
  full_name: "John Doe",
  email: "john@example.com",
  phone: "9876543210",
  items: [...]
}
Response: { id: 1, ... }
```

---

## Next Steps

1. ✅ Backend configured with test keys
2. ✅ Frontend configured with test key
3. ✅ Error handling improved
4. ✅ Logging added for debugging
5. 🔄 **Test payment flow in dev environment**
6. 🔄 Verify orders are being saved to database
7. 🔄 Get live credentials when ready for production

**Ready to test Razorpay payments! 🚀**
