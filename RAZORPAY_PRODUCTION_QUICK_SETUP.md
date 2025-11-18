# Production Razorpay Setup - Quick Reference

## 1️⃣ Get Live Keys (5 minutes)

**Go to:** https://dashboard.razorpay.com/settings/api-keys

**Switch to:** "Live" mode (top right)

**Copy these:**
```
Key ID:       rzp_live_xxxxxxxxxxxxx
Key Secret:   xxxxxxxxxxxxxxxxxxxxxxxx
Webhook Key:  xxxxxxxxxxxxxxxxxxxxxxxx (from Webhooks section)
```

---

## 2️⃣ Update Backend (.env)

**File:** `c:\Users\SR\Downloads\full_project\backend\.env`

Replace placeholders with your live keys:

```env
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_PASTE_HERE
RAZORPAY_KEY_SECRET=PASTE_HERE
RAZORPAY_WEBHOOK_SECRET=PASTE_HERE
```

---

## 3️⃣ Update Frontend (.env)

**File:** `c:\Users\SR\Downloads\full_project\frontend\.env`

```env
REACT_APP_API_URL=https://yourdomain.com
REACT_APP_RAZORPAY_KEY=rzp_live_PASTE_HERE
REACT_APP_ENV=production
```

---

## 4️⃣ Verify Configuration

### Backend Check
```powershell
# Ensure this shows live key and production
npm run dev

# Look for logs like:
# 🔴 LIVE mode activated
# ✅ Payment processing enabled
```

### Test Payment
1. Go to checkout
2. Add product
3. Select Razorpay
4. **Use test card:** `4111 1111 1111 1111`
5. Expiry: `12/25`, CVV: `123`
6. Should succeed and save order

### Verify in Database
```sql
SELECT * FROM login_orders 
WHERE payment_method = 'razorpay' 
ORDER BY id DESC LIMIT 1;
```

---

## 5️⃣ Webhook Setup (Optional but Recommended)

### Add Webhook URL
1. Razorpay Dashboard → Settings → Webhooks
2. Click "Add Webhook"
3. URL: `https://yourdomain.com/payments/razorpay-webhook`
4. Events: Select `payment.authorized`, `payment.captured`, `payment.failed`
5. Save

### Verify Webhook
```powershell
# Backend logs should show:
# ✅ Webhook received: payment.authorized
# Order ID: order_xxxxx
```

---

## 6️⃣ Security Checklist

- ✅ Keys start with `rzp_live_`
- ✅ KEY_SECRET never in frontend code
- ✅ HTTPS enabled on backend
- ✅ NODE_ENV=production
- ✅ Database backups enabled
- ✅ Payment verification enabled
- ✅ Webhook signature check enabled

---

## 7️⃣ File Locations

```
Backend:
  /backend/.env                          (keys here)
  /backend/src/routes/paymentRoutes.js   (live payment code)

Frontend:
  /frontend/.env                         (public key here)
  /frontend/src/pages/Checkout.jsx       (payment UI)
```

---

## 8️⃣ Testing Cards (After Live Keys)

| Card Type | Number | Expiry | CVV |
|-----------|--------|--------|-----|
| **SUCCESS** | 4111 1111 1111 1111 | 12/25 | 123 |
| **FAILURE** | 4000 0000 0000 0002 | 12/25 | 123 |
| Amex | 3782 822463 10005 | 12/25 | 1234 |

---

## 9️⃣ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "Authentication failed" | Check KEY_ID and KEY_SECRET copied exactly |
| "Invalid key" | Ensure key starts with `rzp_live_` |
| "Signature verification failed" | Verify RAZORPAY_KEY_SECRET in .env |
| "Order not saving" | Check /orders endpoint and database connection |
| "Webhook not received" | Verify URL in Razorpay dashboard, check HTTPS |

---

## 🔟 Production Deployment

### Before Going Live
1. ✅ Test with ₹1 payment
2. ✅ Verify payment in Razorpay dashboard
3. ✅ Check order saved correctly
4. ✅ Test refund process
5. ✅ Review all error logs

### After Going Live
1. Monitor Razorpay dashboard daily
2. Set up payment failure alerts
3. Keep webhook logs
4. Regular security audits
5. Backup database regularly

---

## 📞 Razorpay Support

- Dashboard: https://dashboard.razorpay.com
- Docs: https://razorpay.com/docs/
- API Reference: https://razorpay.com/docs/api/orders/
- Support: https://razorpay.com/contact-us/

---

## ✅ Completion Checklist

- [ ] Live keys obtained from Razorpay
- [ ] Backend .env updated with live keys
- [ ] Frontend .env updated with live key
- [ ] NODE_ENV set to production
- [ ] Backend restarted
- [ ] Frontend rebuilt
- [ ] Test payment successful
- [ ] Order saved to database
- [ ] Payment appears in Razorpay dashboard
- [ ] Webhook configured (optional)
- [ ] HTTPS enabled on production domain

**Status: Ready for Production! 🚀**
