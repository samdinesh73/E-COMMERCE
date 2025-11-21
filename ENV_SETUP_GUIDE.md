# Environment Variables Setup Guide

## Overview
This project uses environment variables to securely manage sensitive information like database credentials, API keys, and secrets. **Never commit `.env` files to version control.**

## Backend Setup

### 1. Create `.env` file in backend directory
```bash
cd backend
cp .env.example .env
```

### 2. Configure Backend Environment Variables

Edit `backend/.env` with your actual values:

```dotenv
# Database Configuration
DB_HOST=127.0.0.1          # MySQL host (local or remote)
DB_PORT=3306               # MySQL port
DB_USER=root               # MySQL username
DB_PASSWORD=your_password  # MySQL password (DO NOT use in public repos)
DB_NAME=shop_db            # Database name

# Server Configuration
PORT=5000                  # Server port
NODE_ENV=development       # Environment: development, production, staging

# Authentication
JWT_SECRET=your_long_secure_random_string_here  # Generate a strong secret for JWT

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_xxxxx     # Razorpay test/live key ID
RAZORPAY_KEY_SECRET=xxxxxx         # Razorpay secret key

# CORS Settings (optional)
CORS_ORIGIN=http://localhost:3000  # Frontend URL for CORS
```

### Important Notes:
- ⚠️ **NEVER hardcode credentials in your code**
- ⚠️ **NEVER commit `.env` file to Git**
- ✅ Use `.env.example` as a template for other developers
- ✅ Generate a strong JWT_SECRET using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## Frontend Setup

### 1. Create `.env` file in frontend directory
```bash
cd frontend
cp .env.example .env
```

### 2. Configure Frontend Environment Variables

Edit `frontend/.env` with your actual values:

```dotenv
# Backend API Configuration
REACT_APP_API_URL=http://localhost:5000  # Backend API URL

# Razorpay Configuration
REACT_APP_RAZORPAY_KEY=rzp_test_xxxxx   # Razorpay public key
```

### Important Notes:
- ℹ️ React environment variables must start with `REACT_APP_`
- ⚠️ Do NOT expose secret keys in frontend (use public keys only)
- ✅ Update `REACT_APP_API_URL` for different environments (local, staging, production)

## Production Deployment

### Backend
```bash
NODE_ENV=production
DB_HOST=your-prod-db-server.com
DB_USER=prod_user
DB_PASSWORD=strong_production_password
JWT_SECRET=very_strong_random_secret_here
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=live_secret_key
```

### Frontend
```bash
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_RAZORPAY_KEY=rzp_live_xxxxx
```

## Using Environment Variables in Code

### Backend (Node.js)
```javascript
// ✅ Correct way
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;

// ❌ Wrong way - don't do this
const dbPassword = "Sellerrocket@2025";
```

### Frontend (React)
```javascript
// ✅ Correct way
const apiUrl = process.env.REACT_APP_API_URL;

// ❌ Wrong way - don't do this
const apiUrl = "http://localhost:5000";
```

## Checklist
- [ ] Create `.env` files in both frontend and backend (from `.env.example`)
- [ ] Add real values to all required variables
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Never commit `.env` file
- [ ] Generate strong JWT_SECRET
- [ ] Use environment-specific values (dev, staging, prod)
- [ ] Update `.env.example` only with placeholder values
- [ ] Restart backend after changing `.env` values

## Troubleshooting

### Variables not loading?
- ✅ Ensure `require("dotenv").config()` is at the top of your main file
- ✅ Make sure variable names match exactly
- ✅ Restart the server after changing `.env`

### JWT authentication failing?
- ✅ Ensure `JWT_SECRET` is set in `.env`
- ✅ Both backend and frontend should reference the same `JWT_SECRET` when verifying tokens

### Database connection errors?
- ✅ Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` are correct
- ✅ Ensure MySQL service is running
- ✅ Check MySQL user permissions
