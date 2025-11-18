# 🚀 Get Started in 3 Steps

## Step 1: Get Your Live Razorpay Credentials (5 min)

**Link:** https://dashboard.razorpay.com/settings/api-keys

1. Login to your Razorpay account
2. Click Settings (⚙️ icon)
3. Click "API Keys"
4. Toggle to **"Live"** mode (top-right corner)
5. You will see:
   - **Key ID** (looks like: `rzp_live_xxxxxxxxxxxxxxxx`)
   - **Key Secret** (looks like: `xxxxxxxxxxxxxxxxxxxxxxxx`)

**Copy both values!**

---

## Step 2: Update Your .env Files (2 min)

### Backend .env

**File:** `c:\Users\SR\Downloads\full_project\backend\.env`

Find these lines:
```env
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

Replace with YOUR actual values from step 1. Example:
```env
RAZORPAY_KEY_ID=rzp_live_abc123def456ghi
RAZORPAY_KEY_SECRET=xyz789uvw012abc345def678
RAZORPAY_WEBHOOK_SECRET=webhook_secret_key_here
```

### Frontend .env

**File:** `c:\Users\SR\Downloads\full_project\frontend\.env`

Update:
```env
REACT_APP_RAZORPAY_KEY=rzp_live_abc123def456ghi
```

(Use same Key ID from backend)

---

## Step 3: Test Your Payment (3 min)

### Restart Servers

```powershell
# Terminal 1 - Backend (Ctrl+C to stop, then:)
npm run dev

# Terminal 2 - Frontend (Ctrl+C to stop, then:)
npm start
```

### Go to Checkout

1. Go to http://localhost:3000
2. Add any product to cart
3. Click Checkout
4. Fill in form (any valid data)
5. Select **"Razorpay"** payment method
6. Click **"Pay ₹XXX"**

### Use Test Card

Razorpay modal will open. Enter:
- **Card:** 4111 1111 1111 1111
- **Expiry:** 12/25
- **CVV:** 123
- Click Pay

### Success!

You should see:
- ✅ "Payment successful! Order placed."
- ✅ Redirect to My Account
- ✅ Order visible in list

---

## Verify Everything Worked

### Check Backend Logs

You should see:
```
🔴 LIVE mode activated
📋 Creating Razorpay order: ₹XXX.XX
✅ Order created: order_xxxxxxxxxxxxx
✅ Payment verified: pay_xxxxxxxxxxxxx
```

### Check Database

```sql
SELECT * FROM login_orders 
WHERE payment_method = 'razorpay' 
ORDER BY id DESC LIMIT 1;
```

Should show your payment!

### Check Razorpay Dashboard

Go to https://dashboard.razorpay.com/orders

Should show your test payment with:
- Amount
- Status: Authorized/Captured
- Payment ID

---

## ✅ Done!

Your real-time Razorpay integration is **LIVE and WORKING**! 

**You can now:**
- ✅ Accept real payments
- ✅ Process transactions
- ✅ Store payment details
- ✅ Track orders
- ✅ Monitor in Razorpay dashboard

---

## 🆘 Troubleshooting

### "Authentication failed" error?
- Check KEY_ID and KEY_SECRET copied exactly
- No extra spaces
- Restart backend after .env changes

### Modal doesn't open?
- Clear browser cache: Ctrl+Shift+R
- Check browser console (F12) for errors
- Verify REACT_APP_RAZORPAY_KEY is set

### Payment succeeded but no order saved?
- Check database is running
- Verify /orders endpoint is working
- Check backend logs for errors

### Still not working?
1. Stop backend (Ctrl+C)
2. Stop frontend (Ctrl+C)  
3. Verify .env files one more time
4. Start backend: `npm run dev`
5. Start frontend: `npm start`
6. Try again

---

## 📞 Need Help?

- Razorpay Support: https://razorpay.com/contact-us/
- Razorpay Docs: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com

---

**🎉 Congratulations! You're ready for production!**
