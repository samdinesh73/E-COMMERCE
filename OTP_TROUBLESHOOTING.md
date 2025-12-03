# 🔧 OTP Troubleshooting Guide

## Issue: "Failed to send OTP"

### Step 1: Check Backend Console Logs

When you try to send OTP, look for logs like:
```
[OTP] Received request: { phone: '9876543210', phoneType: 'string', phoneLength: 10 }
[OTP] Cleaned phone: { cleanPhone: '9876543210', length: 10 }

✅ [OTP] Generated OTP for 9876543210: 123456
📱 [DEV] OTP for +919876543210: 123456
```

### Step 2: Check Frontend Console Logs

Open browser DevTools (F12) → Console tab. Look for:
```
[Frontend] Sending OTP for phone: 9876543210
[Frontend] API URL: http://localhost:5000
[Frontend] Response status: 200
[Frontend] Response data: {
  message: "OTP sent successfully",
  phone: "9876543210",
  otp: "123456",
  devOnly: true
}
```

### Step 3: Common Issues & Solutions

#### ❌ Error: "Valid 10-digit phone number required"
**Problem:** Phone number format is wrong
**Solution:**
- Enter exactly 10 digits (no spaces, no dashes)
- ✅ Correct: `9876543210`
- ❌ Wrong: `98-765-43210`, `(987) 654-3210`, `+919876543210`

#### ❌ Error: "Phone number is required"
**Problem:** Phone field is empty
**Solution:** Enter a phone number before clicking "Send OTP"

#### ❌ Error: "Failed to send OTP: Cannot read property..."
**Problem:** Backend error
**Solution:**
1. Restart backend: `npm start` in backend folder
2. Check Node version: `node -v` (should be 14+)
3. Check if OTP endpoint exists

#### ❌ Response shows 404
**Problem:** Backend not running or wrong API URL
**Solution:**
```bash
# Terminal 1 - Start Backend
cd backend
npm start
# Should show: Server running on port 5000

# Terminal 2 - Start Frontend
cd frontend
npm start
# Should show: Compiled successfully on port 3000
```

#### ❌ CORS Error in Console
**Problem:** Backend CORS not configured
**Solution:** Check backend `server.js` has CORS enabled:
```javascript
const cors = require('cors');
app.use(cors());
```

### Step 4: Manual Testing with cURL

Test the API directly:

```bash
# Send OTP
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# Expected response:
# {
#   "message": "OTP sent successfully",
#   "phone": "9876543210",
#   "otp": "123456",
#   "devOnly": true
# }
```

### Step 5: Database Check

Verify the users table has phone column:

```bash
mysql -u root -p shop_db
USE shop_db;
DESCRIBE users;
```

Should show:
```
| Field | Type | Null | Key | Default |
|-------|------|------|-----|---------|
| phone | varchar(15) | YES | UNI | NULL |
```

## Full Debug Checklist

- [ ] Backend running on port 5000? (`npm start` in backend folder)
- [ ] Frontend running on port 3000? (`npm start` in frontend folder)
- [ ] Phone number is exactly 10 digits?
- [ ] No spaces or special characters in phone?
- [ ] Backend console shows OTP generated?
- [ ] Frontend console shows response 200?
- [ ] Database migration ran? (`mysql < add-phone-otp.sql`)
- [ ] Phone column exists in users table?
- [ ] No CORS errors in browser console?

## If Still Not Working

### Reset Everything

```bash
# 1. Kill all Node processes
pkill node

# 2. Check database migration
mysql -u root -p shop_db < backend/add-phone-otp.sql

# 3. Start backend fresh
cd backend
npm install  # If needed
npm start

# 4. In new terminal, start frontend
cd frontend
npm install  # If needed
npm start

# 5. Visit http://localhost:3000/login
```

### Enable Maximum Logging

Add this to backend `authRoutes.js` at the very top of the file:

```javascript
// Add after all imports
console.log("✅ Auth routes loading...");
console.log("ℹ️ NODE_ENV:", process.env.NODE_ENV);
```

### Test Directly in Backend

Run this in Node directly:

```bash
node
> const phone = "9876543210";
> const otp = Math.floor(100000 + Math.random() * 900000).toString();
> console.log(`OTP for ${phone}: ${otp}`);
```

## Expected Output When Working

**Terminal 1 (Backend):**
```
✅ [OTP] Generated OTP for 9876543210: 123456
📱 [DEV] OTP for +919876543210: 123456
```

**Terminal 2 (Frontend Console):**
```
[Frontend] Response status: 200
[Frontend] Response data: {message: "OTP sent successfully", phone: "9876543210", otp: "123456", devOnly: true}
```

**UI Response:**
```
✅ OTP sent successfully
OTP input field appears
Resend countdown starts (60 seconds)
```

## Network Debugging

If still failing, check network tab in browser DevTools:

1. Open DevTools (F12)
2. Go to "Network" tab
3. Try to send OTP
4. Click on the request to `/api/auth/send-otp`
5. Check:
   - Request Headers: Is `Content-Type: application/json` there?
   - Request Payload: Is phone number included?
   - Response Status: Is it 200, 400, or 500?
   - Response: What's the exact error message?

## Support Commands

```bash
# Check if backend is running
netstat -an | grep 5000

# Check if frontend is running
netstat -an | grep 3000

# View backend logs in real-time
npm start  # Backend folder

# View frontend logs in real-time
npm start  # Frontend folder

# Test API endpoint directly
curl http://localhost:5000/api/auth/send-otp

# Check MySQL connection
mysql -u root -p -e "USE shop_db; SELECT COUNT(*) FROM users;"
```

## Still Need Help?

1. Check backend console for exact error message
2. Check browser console (F12) for any JavaScript errors
3. Verify phone number format (10 digits only)
4. Ensure database migration completed
5. Restart both backend and frontend

---

**Common Success Indicators:**
- ✅ OTP appears in backend console
- ✅ Frontend shows OTP sent message
- ✅ Resend timer appears
- ✅ OTP input field is enabled

If you see all of these, OTP was sent successfully! 🎉
