# 🚀 Quick Setup: Phone OTP Authentication

## Step 1: Update Database (1 minute)

```bash
cd backend
mysql -u root -p shop_db < add-phone-otp.sql
```

Or run in MySQL directly:
```sql
USE shop_db;

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(15) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_phone ON users(phone);
```

## Step 2: Start Backend (Development)

```bash
cd backend
npm start
```

Backend will run on `http://localhost:5000`

## Step 3: Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## Step 4: Test It Out! 🎉

### Test with Phone OTP:
1. Go to `http://localhost:3000` → Login/Signup page
2. Click "📱 Phone" tab
3. Enter phone: `9876543210`
4. Click "Send OTP"
5. **Check backend console** for OTP (in development mode)
6. Enter the OTP shown in console
7. For signup: Enter name, password, confirm password
8. Click "Verify OTP & Continue"

### Test with Email (Original):
1. Click "📧 Email" tab
2. Use traditional email/password
3. Works exactly as before ✅

## Available Test Numbers

You can use any 10-digit number for testing:
- 9876543210
- 9123456789
- 8765432109
- 7654321098

## Development Features

✅ **OTP Shown in Console:**
```
[OTP] Generated OTP for 9876543210: 123456
📱 [DEV] OTP for +919876543210: 123456
```

✅ **No SMS Service Required** - Uses console logging

✅ **5-Minute Expiry** - Plenty of time to test

✅ **Max 3 Attempts** - Prevents brute force

## For Production

⚠️ **Before Going Live:**

1. **Integrate SMS Service:**
```javascript
// In authRoutes.js, replace this:
// TODO: Integrate actual SMS service

// With one of:
// - Twilio (Recommended)
// - AWS SNS
// - Fast2SMS (India)
// - Amazon Pinpoint
```

2. **Use Redis for OTP Storage:**
```javascript
const redis = require('redis');
const client = redis.createClient();

// Replace otpStorage Map with:
await client.setex(`otp:${phone}`, 300, otp); // 5 min expiry
```

3. **Add Rate Limiting:**
```bash
npm install express-rate-limit
```

4. **Enforce HTTPS** - Use environment variables

5. **Set NODE_ENV=production** - Hides OTP from response

## Project Files

| File | Change | Purpose |
|------|--------|---------|
| `frontend/src/pages/LoginSignup.jsx` | ✏️ Updated | Phone/Email UI + OTP flow |
| `backend/src/routes/authRoutes.js` | ✏️ Updated | Added `/send-otp` & `/verify-otp` endpoints |
| `backend/add-phone-otp.sql` | 🆕 New | Database migration for phone columns |
| `OTP_AUTHENTICATION_GUIDE.md` | 🆕 New | Complete documentation |
| `OTP_QUICK_START.md` | 🆕 New | This file |

## Troubleshooting

**Q: OTP not appearing in console?**
A: Ensure NODE_ENV is not set to 'production'. Check backend logs.

**Q: Phone already registered error?**
A: Use a different phone number in database or delete the user.

**Q: Frontend can't connect to backend?**
A: Ensure backend is running on port 5000 and CORS is enabled.

**Q: How to verify OTP works?**
A: 
1. Send OTP - check console for code
2. Enter that code in OTP field
3. Should verify successfully

## API Endpoints Summary

```
POST /api/auth/send-otp
Body: { phone: "9876543210" }
Returns: { message, otp (dev only) }

POST /api/auth/verify-otp
Body: { phone, otp, name?, password?, action: "signup"|"login" }
Returns: { token, user, message }

POST /api/auth/signup (original)
POST /api/auth/signin (original)
GET /api/auth/me (original)
```

## Next Steps

After testing:
1. ✅ Verify phone signup creates user correctly
2. ✅ Verify phone login works
3. ✅ Verify email auth still works
4. ✅ Check user data in database
5. ✅ Plan SMS service integration
6. ✅ Setup production environment

## Support

See `OTP_AUTHENTICATION_GUIDE.md` for:
- Complete feature documentation
- Security considerations
- Production requirements
- Testing guide
- Troubleshooting

---

**Happy Testing!** 🎉

Start backend: `npm start` (backend folder)
Start frontend: `npm start` (frontend folder)
Visit: `http://localhost:3000`
