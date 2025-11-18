# Razorpay Test Card Numbers

## Quick Test Credentials

| Card Type | Card Number | Expiry | CVV | OTP |
|-----------|------------|--------|-----|-----|
| **SUCCESS** | 4111 1111 1111 1111 | 12/25 | 123 | 123456 |
| **FAIL** | 4000 0000 0000 0002 | 12/25 | 123 | 123456 |
| International | 4242 4242 4242 4242 | Any future | Any 3 | 123456 |
| Amex | 3782 822463 10005 | 12/25 | 1234 | 123456 |

## Steps to Complete Test Payment

1. **Add to Cart** → Add any product to cart
2. **Go to Checkout** → Click cart → Click checkout
3. **Fill Details:**
   - Name: John Doe
   - Email: test@example.com
   - Phone: 9876543210
   - Address: 123 Street
   - City: Mumbai
   - Pincode: 400001
4. **Select Razorpay** → Choose "Razorpay" payment method
5. **Click Pay** → Click "Pay ₹XXX" button
6. **Razorpay Modal** → Opens payment form
7. **Enter Test Card:**
   - Card: 4111 1111 1111 1111
   - Expiry: 12/25
   - CVV: 123
8. **Submit** → Click Pay
9. **Confirm** → If OTP prompt appears, enter: 123456
10. **Success** → See "Payment successful! Order placed."
11. **My Account** → Go to My Account to verify order saved

## Backend Logs to Check

When making a test payment, backend should show:
```
📋 Creating Razorpay order for amount: ₹500.00 (50000 paise)
✅ Razorpay order created: order_xxxxx
```

## Environment Variables

**Frontend:** `c:/Users/SR/Downloads/full_project/frontend/.env`
```
REACT_APP_RAZORPAY_KEY=rzp_test_1g0VdS1yqNkHg7
```

**Backend:** `c:/Users/SR/Downloads/full_project/backend/.env`
```
RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7
RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Invalid API Key" | Restart backend: `npm run dev` |
| "Payment modal doesn't open" | Check browser console (F12) for errors |
| "Razorpay script failed to load" | Clear browser cache: Ctrl+Shift+R |
| "Order not saved after payment" | Check if backend is running |
| "Email field empty in modal" | It should auto-fill from checkout form |

## Testing Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Added product to cart
- [ ] Filled all checkout fields
- [ ] Selected Razorpay payment method
- [ ] Used test card 4111 1111 1111 1111
- [ ] Payment successful message appeared
- [ ] Order visible in My Account
- [ ] Order saved in database

**Status:** ✅ Ready to test
