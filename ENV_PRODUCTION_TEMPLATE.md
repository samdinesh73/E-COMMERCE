# Production Environment Configuration Template

## How to Use This File

1. Copy the content below
2. Replace `YOUR_*` placeholders with actual values
3. Save to `.env` in backend directory
4. Never commit to git (add .env to .gitignore)

---

## Backend .env Template

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Sellerrocket@2025
DB_NAME=shop_db

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=production
JWT_SECRET=1d7dcc6398030bb71aea69a0d904f2ac

# ============================================
# RAZORPAY LIVE KEYS
# ============================================
# Get from: https://dashboard.razorpay.com/settings/api-keys
# Switch to "Live" mode (top right)

# 28-character key starting with rzp_live_
RAZORPAY_KEY_ID=rzp_live_REPLACE_WITH_YOUR_LIVE_KEY_ID

# 32-character secret key
RAZORPAY_KEY_SECRET=REPLACE_WITH_YOUR_LIVE_KEY_SECRET

# Webhook secret for payment events
# Get from: https://dashboard.razorpay.com/settings/webhooks
RAZORPAY_WEBHOOK_SECRET=REPLACE_WITH_YOUR_WEBHOOK_SECRET

# ============================================
# OPTIONAL: PRODUCTION FEATURES
# ============================================
# Email configuration (optional)
# EMAIL_SERVICE=smtp
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# SMS configuration (optional)
# SMS_API_KEY=your_sms_api_key
# SMS_SENDER_ID=SHOPDB

# ============================================
# NOTES
# ============================================
# - Never share these keys
# - Never commit .env to git
# - Use strong passwords
# - Keep backups of these credentials
# - Rotate keys regularly for security
```

---

## Frontend .env Template

```env
# ============================================
# FRONTEND CONFIGURATION
# ============================================

# API Backend URL (production domain)
REACT_APP_API_URL=https://yourdomain.com

# Razorpay Live Key (Public Key)
# Get from: https://dashboard.razorpay.com/settings/api-keys
# Switch to "Live" mode
REACT_APP_RAZORPAY_KEY=rzp_live_REPLACE_WITH_YOUR_LIVE_KEY_ID

# Environment mode
REACT_APP_ENV=production

# ============================================
# NOTES
# ============================================
# - Only public key here (RAZORPAY_KEY_ID)
# - Never put secret key in frontend
# - Can be committed to git (contains no secrets)
# - Update for each deployment
```

---

## Step-by-Step Setup Instructions

### 1. Get Razorpay Live Keys

```
1. Go to: https://dashboard.razorpay.com
2. Login with your Razorpay account
3. Click "Settings" (gear icon)
4. Click "API Keys"
5. Switch to "Live" mode (top right toggle)
6. You'll see:
   - Key ID (starts with rzp_live_)
   - Key Secret
7. Copy both values
```

### 2. Get Webhook Secret

```
1. In Razorpay Dashboard
2. Go to Settings → Webhooks
3. Add Webhook with URL: https://yourdomain.com/payments/razorpay-webhook
4. Select events:
   - payment.authorized
   - payment.captured
   - payment.failed
5. Copy the Signing Secret
```

### 3. Update Backend .env

```
Replace these placeholders:
- RAZORPAY_KEY_ID=rzp_live_xxxxx
- RAZORPAY_KEY_SECRET=xxxxx
- RAZORPAY_WEBHOOK_SECRET=xxxxx
```

### 4. Update Frontend .env

```
Replace:
- REACT_APP_API_URL=https://yourdomain.com
- REACT_APP_RAZORPAY_KEY=rzp_live_xxxxx
```

### 5. Restart Servers

```powershell
# Backend
npm run dev

# Frontend (build for production)
npm run build
```

### 6. Test with Small Payment

```
1. Go to checkout
2. Add product (₹1 or more)
3. Fill form
4. Select Razorpay
5. Use card: 4111 1111 1111 1111
6. Verify payment succeeds
7. Check Razorpay dashboard
8. Verify order in database
```

---

## Environment Variables Validation

### Backend Validation

```javascript
// Backend should check:
if (NODE_ENV === 'production' && !RAZORPAY_KEY_ID.startsWith('rzp_live_')) {
  throw new Error('Invalid Razorpay key for production');
}

if (!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET.length < 30) {
  throw new Error('Invalid Razorpay secret');
}
```

### Frontend Validation

```javascript
// Frontend should verify:
if (REACT_APP_ENV === 'production' && !REACT_APP_RAZORPAY_KEY) {
  throw new Error('Razorpay key not configured');
}

if (REACT_APP_ENV === 'production' && !REACT_APP_API_URL.startsWith('https://')) {
  throw new Error('API URL must use HTTPS in production');
}
```

---

## Security Best Practices

### DO ✅
- Use strong, unique passwords
- Store keys in environment variables
- Use HTTPS for all connections
- Rotate keys annually
- Keep backups of credentials
- Monitor payment transactions
- Log all payment events
- Use webhook signatures

### DON'T ❌
- Share keys with anyone
- Commit .env to git
- Use same key for dev and prod
- Hardcode keys in source code
- Send keys over unencrypted channels
- Store card details
- Expose secret key to frontend
- Skip payment verification

---

## Database Schema for Production

```sql
-- Ensure these tables exist:

-- Main orders table
CREATE TABLE login_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_price DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_id VARCHAR(50),
    order_id VARCHAR(50),
    shipping_address TEXT,
    city VARCHAR(100),
    pincode VARCHAR(10),
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_id (payment_id),
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id)
);

-- Guest orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    total_price DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_id VARCHAR(50),
    order_id VARCHAR(50),
    shipping_address TEXT,
    city VARCHAR(100),
    pincode VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_id (payment_id),
    INDEX idx_order_id (order_id)
);
```

---

## Troubleshooting Checklist

| Problem | Solution |
|---------|----------|
| "Authentication failed" | Verify keys copied exactly from Razorpay dashboard |
| "Invalid key" | Ensure key starts with `rzp_live_` |
| "Signature mismatch" | Check RAZORPAY_KEY_SECRET is correct |
| "Webhook not working" | Verify webhook URL in Razorpay dashboard |
| "Order not saving" | Check database connection and schema |
| "Payment modal won't open" | Verify REACT_APP_RAZORPAY_KEY is correct |
| "HTTPS error" | Deploy with valid SSL certificate |

---

## Support Resources

- Razorpay Dashboard: https://dashboard.razorpay.com
- API Documentation: https://razorpay.com/docs/api/
- Webhook Details: https://razorpay.com/docs/webhooks/
- Payment Methods: https://razorpay.com/docs/paymentlinks/
- Support Email: support@razorpay.com

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] .env file created and populated
- [ ] .gitignore includes .env
- [ ] Database schema created
- [ ] SSL/HTTPS certificate installed
- [ ] Backend tested with test keys first
- [ ] Test payment successful
- [ ] Webhook URL added to Razorpay
- [ ] Payment verification implemented
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Backups enabled

---

## Post-Deployment Steps

1. Monitor first transactions closely
2. Check Razorpay dashboard daily
3. Review webhook logs
4. Test refund process
5. Setup payment alerts
6. Document any issues
7. Plan scaling if needed

---

**Configuration Template v1.0 - Ready for Production! 🚀**
