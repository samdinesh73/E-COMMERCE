# Environment Variables Quick Reference

## Files to Configure

| File | Purpose | Location |
|------|---------|----------|
| `backend/.env` | Backend secrets & DB config | `backend/` |
| `frontend/.env` | Frontend API & public keys | `frontend/` |
| `.env.example` | Template for new developers | Both folders |

## Required Backend Variables

```bash
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password    # Change this!
DB_NAME=shop_db

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_secure_key      # Generate a strong random string

# Payments
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=secret_xxx
```

## Required Frontend Variables

```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY=rzp_test_xxx
```

## Generate Strong JWT_SECRET

Run this command in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output to `JWT_SECRET` in `backend/.env`

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Always use `.env.example` as template
- [ ] Use strong passwords and secrets
- [ ] Rotate secrets periodically
- [ ] Use different values for dev/staging/production
- [ ] Keep sensitive data out of code

## After Changing `.env`

Always restart the server:
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## Environment-Specific Setup

### Local Development
```bash
NODE_ENV=development
DB_HOST=127.0.0.1
REACT_APP_API_URL=http://localhost:5000
```

### Production
```bash
NODE_ENV=production
DB_HOST=your-prod-db.com
REACT_APP_API_URL=https://api.yoursite.com
```
