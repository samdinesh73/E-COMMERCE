# Quick Start - Razorpay Payment Testing

## ⚡ 5-Minute Setup

### Step 1: Verify Environment Files ✅

**Frontend** (`c:\Users\SR\Downloads\full_project\frontend\.env`)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY=rzp_test_1g0VdS1yqNkHg7
```

**Backend** (`c:\Users\SR\Downloads\full_project\backend\.env`)
```
RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7
RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n
```

### Step 2: Start Backend

```powershell
cd C:\Users\SR\Downloads\full_project\backend
npm run dev
```

**Wait for:** `🚀 Server running on http://localhost:5000`

### Step 3: Start Frontend

```powershell
cd C:\Users\SR\Downloads\full_project\frontend
npm start
```

**Wait for:** Browser opens at http://localhost:3000

### Step 4: Complete Test Payment

1. **Add to Cart**
   - Browse products
   - Click heart icon or "Add to Cart"
   - Can add multiple items

2. **Go to Checkout**
   - Click cart icon (top right)
   - Click "Proceed to Checkout" or similar

3. **Fill Checkout Form**
   ```
   Full Name:  John Doe
   Email:      john@example.com
   Phone:      9876543210
   Address:    123 Main Street
   City:       Mumbai
   Pincode:    400001
   ```

4. **Select Razorpay Payment**
   - Click radio button: "Razorpay"
   - (Don't select COD)

5. **Click Pay Button**
   - Click "Pay ₹XXX" button
   - Razorpay modal will open

6. **Enter Test Card**
   - Card Number: **4111 1111 1111 1111**
   - Expiry: **12/25** (or any future date)
   - CVV: **123** (any 3 digits)
   - Click Pay/Submit

7. **See Success**
   - Alert: "Payment successful! Order placed."
   - Redirected to "My Account"
   - Order visible in order list

---

## 🧪 Test Card Reference

| Use Case | Card Number | Expiry | CVV |
|----------|-------------|--------|-----|
| **✅ SUCCESS** | 4111 1111 1111 1111 | 12/25 | 123 |
| **❌ FAILURE** | 4000 0000 0000 0002 | 12/25 | 123 |
| International | 4242 4242 4242 4242 | 12/25 | 123 |
| Amex | 3782 822463 10005 | 12/25 | 1234 |

OTP (if prompted): **123456**

---

## 🐛 Troubleshooting

### Payment Modal Doesn't Open

**Check:**
```powershell
# 1. Backend running?
# Terminal 1 should show: 🚀 Server running on http://localhost:5000

# 2. Frontend running?
# Terminal 2 should show: Compiled successfully

# 3. Check browser console (F12 → Console tab)
# Should NOT show red errors
```

**Fix:**
1. Restart both servers
2. Clear browser cache: **Ctrl+Shift+R**
3. Check .env files have correct keys

### "Failed to create payment order"

**Check Backend Logs:**
```
Should show:
📋 Creating Razorpay order for amount: ₹500.00 (50000 paise)
✅ Razorpay order created: order_xxxxx
```

**If showing error:**
1. Verify .env has `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. Check they match exactly (copy-paste from this file)
3. Restart backend: `npm run dev`

### "Invalid API Key"

**Solution:**
1. Open `backend/.env`
2. Verify line reads:
   ```
   RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7
   RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n
   ```
3. Restart backend: Press Ctrl+C, then `npm run dev`

### Order Not Saved After Payment

**Check:**
1. Backend still running? (no error messages)
2. Database connected? 
   ```powershell
   # Backend logs should NOT show database errors
   ```
3. Check database:
   ```sql
   SELECT * FROM login_orders ORDER BY id DESC LIMIT 1;
   ```

---

## ✅ Verification Checklist

After testing, verify:

- [ ] Backend console shows order creation logs
- [ ] Razorpay modal opened successfully
- [ ] Test card accepted without error
- [ ] "Payment successful!" message appeared
- [ ] Redirected to My Account page
- [ ] Order visible in order list
- [ ] Order has correct amount
- [ ] Order has "razorpay" as payment method
- [ ] Customer name, email, phone saved
- [ ] Order visible in database

---

## 📊 Expected Backend Logs

When making a test payment, backend should show:

```
🚀 Server running on http://localhost:5000

[When clicking Pay button]
📋 Creating Razorpay order for amount: ₹500.00 (50000 paise)
✅ Razorpay order created: order_XXXXXXXXXXXXX

[When saving order]
POST /orders
[Order saved successfully]
```

If you see errors instead, check:
- .env file credentials
- Database connection
- Port availability (5000)

---

## 🚀 Next Steps

### After Successful Test:
1. ✅ Test with different products/amounts
2. ✅ Test with multiple items in cart
3. ✅ Test COD method (should work instantly)
4. ✅ Verify orders in database
5. ✅ Check order emails (if configured)

### When Ready for Production:
1. Get live Razorpay credentials from dashboard.razorpay.com
2. Update .env files with live keys (rzp_live_*)
3. Update database connection to production
4. Deploy backend and frontend
5. Test with real payment (minimal amount)
6. Set up payment confirmations emails
7. Monitor transactions

---

## 📞 Support

### Issue Resolution Steps:

1. **Check terminal logs** (where backend is running)
2. **Check browser console** (F12 → Console tab)
3. **Check .env files** (match credentials exactly)
4. **Restart servers** (Ctrl+C, then npm run dev)
5. **Clear cache** (Ctrl+Shift+R)

### Common Fixes:

| Problem | Solution |
|---------|----------|
| "Not working" | Check both servers running |
| "Invalid key" | Verify .env credentials |
| "Modal not opening" | Clear browser cache |
| "Order not saved" | Check database connection |
| "Network error" | Check API URL in .env |

---

## 🎯 Success Criteria

✅ **Payment flow is working when:**
- Backend logs show order creation
- Razorpay modal opens with test key
- Test card is accepted
- Success message appears
- Order saved in database
- Can view order in My Account

**Status: Ready to Test! 🎉**
