# Email Notifications Setup Guide

## Overview
Your e-commerce platform now sends automated email notifications for orders:
- **Customer Email**: Order confirmation after checkout
- **Admin Email**: New order notification

## Configuration Steps

### 1. Gmail Setup (Recommended)

#### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Copy this password

#### Step 3: Update Backend .env

Edit `backend/.env` and add/update:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
ADMIN_EMAIL=admin@yourdomain.com
STORE_NAME=YourStoreName
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=shopowner@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
ADMIN_EMAIL=admin@shop.kannanpalaniyappan.com
STORE_NAME=ShopDB
```

### 2. Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key
```

#### AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

## Email Templates

### Customer Order Confirmation Email
**Triggers:** When order is placed
**Contains:**
- Order ID and Date
- Shipping Address
- Order Items with quantities and prices
- Total Amount
- Payment Method
- Professional HTML formatting

### Admin New Order Notification Email
**Triggers:** When order is placed
**Contains:**
- Customer Information (Name, Email, Phone)
- Order Details (ID, Date, Payment Method)
- Shipping Address
- Order Items with quantities and prices
- Total Amount
- Call-to-action to review order in admin dashboard

## Testing

### Test Order Confirmation
1. Go to your shop at `http://localhost:3000`
2. Add items to cart
3. Complete checkout
4. You should receive:
   - Customer confirmation email at provided email
   - Admin notification at `ADMIN_EMAIL`

### Check Backend Logs
Monitor terminal where backend is running:
```
✅ Order confirmation email sent to customer@example.com
✅ New order notification email sent to admin@shop.kannanpalaniyappan.com
```

## Troubleshooting

### Emails Not Sending?

1. **Check Gmail App Password**
   - Verify 16-character password is correct (no spaces in .env)
   - Ensure 2-Step Verification is enabled

2. **Check SMTP Settings**
   - Verify SMTP_HOST and SMTP_PORT
   - Test with: `telnet smtp.gmail.com 587`

3. **Check Logs**
   - Look at backend terminal for error messages
   - Common errors show in console

4. **Email Configuration**
   - Ensure SMTP_USER and SMTP_PASS are set
   - Verify ADMIN_EMAIL format is valid
   - Check customer email is being sent correctly

5. **Gmail Security**
   - Enable "Less secure apps" if using regular password
   - Or use App Passwords (recommended)

### Common Errors

**Error: "No transporter"**
- Solution: Ensure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS are set in .env

**Error: "Invalid login credentials"**
- Solution: Verify SMTP_USER and SMTP_PASS are correct
- For Gmail: Use 16-character app password

**Error: "ECONNREFUSED"**
- Solution: Check SMTP_HOST and SMTP_PORT
- Test: `ping smtp.gmail.com`

## Environment Variables Summary

| Variable | Required | Example |
|----------|----------|---------|
| SMTP_HOST | Yes | smtp.gmail.com |
| SMTP_PORT | Yes | 587 |
| SMTP_USER | Yes | your-email@gmail.com |
| SMTP_PASS | Yes | abcd efgh ijkl mnop |
| ADMIN_EMAIL | Yes | admin@shop.kannanpalaniyappan.com |
| STORE_NAME | No | ShopDB |

## Production Deployment

When deploying to production (yourdomain.com):

1. Use a professional email service (SendGrid, AWS SES, etc.)
2. Set up SPF/DKIM records for better deliverability
3. Update ADMIN_EMAIL to your domain email
4. Set STORE_NAME appropriately
5. Test sending before going live

## Code Integration

The email service is automatically called in:
- `backend/src/routes/orderRoutes.js` → When order is created

Email functions available in:
- `backend/src/utils/emailService.js`

Functions:
- `sendOrderConfirmationEmail(orderData)` - Send to customer
- `sendAdminNewOrderEmail(orderData)` - Send to admin

## Contact Support
For issues with email setup, check:
1. Backend terminal logs
2. Gmail account security settings
3. App password configuration
4. .env file format
