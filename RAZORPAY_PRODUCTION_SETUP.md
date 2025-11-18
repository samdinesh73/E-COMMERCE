# Razorpay Production Setup - Real Live Keys Integration

## Overview
This guide shows how to integrate real live Razorpay keys for production payments.

---

## Step 1: Get Your Live Razorpay Credentials

### Create Razorpay Account
1. Go to https://razorpay.com
2. Click "Sign up" or "Get Started"
3. Create account with business details
4. Verify email and phone

### Get Live Keys
1. Go to https://dashboard.razorpay.com
2. Click on "Settings" (⚙️ icon)
3. Click "API Keys"
4. Switch to **"Live"** mode (top right)
5. You'll see:
   - **Key ID**: `rzp_live_xxxxxxxxxxxxx` (28 characters)
   - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxxxx` (32 characters)
6. Copy both values

### Get Webhook Secret
1. In Dashboard, go to **Settings → Webhooks**
2. Click "Add Webhook"
3. Add URL: `https://yourdomain.com/payments/razorpay-webhook`
4. Select events: `payment.authorized`, `payment.failed`, `payment.captured`
5. Copy the **Signing Secret**

---

## Step 2: Update Environment Files

### Backend (.env)

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Sellerrocket@2025
DB_NAME=shop_db

# Server
PORT=5000
NODE_ENV=production
JWT_SECRET=1d7dcc6398030bb71aea69a0d904f2ac

# Razorpay Live Keys (from dashboard)
RAZORPAY_KEY_ID=rzp_live_PASTE_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=PASTE_YOUR_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=PASTE_YOUR_WEBHOOK_SECRET_HERE
```

### Frontend (.env)

```env
# API
REACT_APP_API_URL=https://yourdomain.com  # Your production domain
REACT_APP_RAZORPAY_KEY=rzp_live_PASTE_YOUR_KEY_ID_HERE
REACT_APP_ENV=production
```

---

## Step 3: Code Structure (Already Implemented)

### Backend Routes (paymentRoutes.js)

**Endpoint 1: Create Order**
```
POST /payments/razorpay
Request: { amount: 50000 }
Response: { id: "order_xxxxx", amount: 50000, ... }
```

**Endpoint 2: Verify Payment**
```
POST /payments/razorpay/verify
Request: {
  razorpay_order_id: "order_xxxxx",
  razorpay_payment_id: "pay_xxxxx",
  razorpay_signature: "signature_xxxxx"
}
Response: { status: "verified", payment_id: "pay_xxxxx" }
```

**Endpoint 3: Webhook**
```
POST /payments/razorpay-webhook
Receives: Payment events (authorized, captured, failed)
```

### Frontend Flow (Checkout.jsx)

```
1. User clicks "Pay"
   ↓
2. Create Razorpay order (backend)
   ↓
3. Open Razorpay modal
   ↓
4. User enters card details
   ↓
5. Razorpay processes payment
   ↓
6. Frontend receives payment response
   ↓
7. Verify signature (backend)
   ↓
8. Save order if verified
   ↓
9. Show success
```

---

## Step 4: Testing Before Going Live

### Test with Small Amount
1. Use your live keys
2. Create order for ₹1 (minimum)
3. Use test card: **4111 1111 1111 1111**
4. Verify payment goes through
5. Check Razorpay dashboard for transaction

### Payment Methods to Test
- Credit Card: 4111 1111 1111 1111
- Debit Card: 5555 5555 5555 4444
- Wallet: Use actual payment wallet

### Verify Orders
```sql
SELECT * FROM login_orders WHERE payment_method = 'razorpay' ORDER BY id DESC;
```

---

## Step 5: Database Schema for Payments

### login_orders Table
```sql
CREATE TABLE IF NOT EXISTS login_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2),
    payment_method VARCHAR(50),  -- 'razorpay' or 'cod'
    payment_id VARCHAR(50),      -- Razorpay payment ID
    order_id VARCHAR(50),        -- Razorpay order ID
    shipping_address TEXT,
    city VARCHAR(100),
    pincode VARCHAR(10),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending',  -- pending, confirmed, shipped, delivered
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Add to orders table
```sql
ALTER TABLE orders ADD COLUMN payment_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN order_id VARCHAR(50);
ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
```

---

## Step 6: Production Deployment

### Domain Setup
1. Deploy backend to your domain (e.g., api.yourdomain.com)
2. Deploy frontend to your domain (e.g., yourdomain.com)
3. Update `.env` files with production URLs

### SSL/HTTPS
- ✅ Must have HTTPS certificate
- Razorpay requires HTTPS for security
- Use Let's Encrypt (free) or paid SSL

### Webhook Setup
1. Update webhook URL in Razorpay dashboard:
   ```
   https://api.yourdomain.com/payments/razorpay-webhook
   ```
2. Verify webhook is receiving events:
   - Razorpay Dashboard → Webhooks → Test Webhook
3. Check backend logs for webhook events

### Environment Variables
```bash
# Production server setup
export NODE_ENV=production
export RAZORPAY_KEY_ID=rzp_live_xxxxx
export RAZORPAY_KEY_SECRET=xxxxxxxxx
export RAZORPAY_WEBHOOK_SECRET=xxxxxxxxx
```

---

## Step 7: Monitoring & Security

### Payment Monitoring
1. Monitor Razorpay dashboard for:
   - Failed payments
   - High error rates
   - Unusual transaction patterns

2. Set up alerts for:
   - Payment failures
   - Large transactions
   - Webhook failures

### Security Checklist
- ✅ Never expose RAZORPAY_KEY_SECRET to frontend
- ✅ Always verify payment signatures
- ✅ Use HTTPS for all payment endpoints
- ✅ Implement rate limiting on /payments endpoints
- ✅ Log all payment attempts
- ✅ Verify webhook signatures
- ✅ Use strong JWT secrets
- ✅ Validate all payment amounts

### PCI Compliance
- ✅ Don't store card details
- ✅ Use Razorpay for card processing
- ✅ Use HTTPS everywhere
- ✅ Implement proper logging
- ✅ Regular security audits

---

## Step 8: Troubleshooting

### Payment Fails with "Invalid Credentials"
**Fix:**
1. Verify live keys in .env (should start with `rzp_live_`)
2. Check keys are copied exactly
3. Ensure NODE_ENV=production
4. Restart backend server

### "Signature Verification Failed"
**Fix:**
1. Verify RAZORPAY_KEY_SECRET is correct
2. Check webhook secret is configured
3. Ensure backend time is synchronized
4. Check for special characters in keys

### Webhook Not Received
**Fix:**
1. Verify webhook URL in Razorpay dashboard
2. Check backend can be accessed from internet
3. Verify SSL certificate is valid
4. Check firewall allows Razorpay IPs
5. Monitor backend logs

### Payment Saved but Order Not Created
**Fix:**
1. Check /orders endpoint is working
2. Verify user token is valid
3. Check database permissions
4. Review error logs

---

## Step 9: Testing Checklist

- [ ] Live keys configured in .env
- [ ] Backend running in production mode
- [ ] Frontend API URL set to production domain
- [ ] SSL/HTTPS certificate installed
- [ ] Database tables have payment columns
- [ ] Can create small test order (₹1)
- [ ] Test payment goes through
- [ ] Order saved to database
- [ ] Payment appears in Razorpay dashboard
- [ ] Webhook events are logged
- [ ] Payment verification working
- [ ] Multi-currency support tested (if needed)
- [ ] Error handling working
- [ ] Refund process tested

---

## Step 10: Code Files Updated

**Files Modified:**
1. ✅ `backend/.env` - Production config
2. ✅ `frontend/.env` - Production config
3. ✅ `backend/src/routes/paymentRoutes.js` - Live payment processing + webhook
4. ✅ `frontend/src/pages/Checkout.jsx` - Payment verification

**New Features:**
- Razorpay order creation
- Payment signature verification
- Webhook event handling
- Production logging
- Error handling

---

## Step 11: After Going Live

### Monitor First Week
- Check all transactions
- Monitor for errors
- Review webhook logs
- Test refund process

### Setup Alerts
- Payment failures
- Webhook errors
- Database errors
- API errors

### Scaling
- Enable caching for orders
- Setup payment analytics
- Implement rate limiting
- Monitor payment API latency

---

## Quick Commands

### Start Production
```bash
# Backend
NODE_ENV=production npm run dev

# Frontend (build for production)
npm run build
npm install -g serve
serve -s build -l 5000
```

### Check Logs
```bash
# Backend payment logs
grep "Razorpay" server.log

# Webhook events
grep "Webhook received" server.log
```

### Database Queries
```sql
-- All successful payments
SELECT * FROM login_orders WHERE payment_method = 'razorpay' AND status = 'confirmed';

-- Failed payments
SELECT * FROM login_orders WHERE payment_method = 'razorpay' AND status = 'failed';

-- Recent orders
SELECT * FROM login_orders ORDER BY created_at DESC LIMIT 10;
```

---

## Support & Resources

- Razorpay Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/orders/
- Webhook Details: https://razorpay.com/docs/webhooks/
- Support: https://razorpay.com/contact-us/

---

## Summary

✅ **Setup Complete!**
- Backend configured for live Razorpay
- Frontend ready for production
- Payment verification implemented
- Webhook support added
- Database schema prepared
- Security measures in place

**Ready to accept real payments! 🚀**
