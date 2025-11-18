# Razorpay Integration Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                    http://localhost:3000                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Checkout.jsx                                                    │
│  ├─ Form Fields (Name, Email, Phone, Address, City, Pincode)   │
│  ├─ Payment Method Selection (Razorpay / COD)                   │
│  └─ Razorpay Integration                                        │
│      ├─ Load Razorpay Script                                    │
│      ├─ Initialize Modal with Options                           │
│      │   ├─ key: REACT_APP_RAZORPAY_KEY (test key)             │
│      │   ├─ amount: (from cart total * 100 paise)              │
│      │   ├─ order_id: (from backend response)                  │
│      │   └─ prefill: { name, email, phone }                    │
│      └─ Handle Payment Response                                │
│                                                                   │
│  .env File                                                       │
│  └─ REACT_APP_RAZORPAY_KEY=rzp_test_1g0VdS1yqNkHg7             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
           │                                          │
           │ 1. POST /payments/razorpay              │ 3. POST /orders
           │    { amount: 50000 }                    │    { order_details }
           │                                          │
           ▼                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Express)                         │
│                    http://localhost:5000                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  paymentRoutes.js (POST /payments/razorpay)                     │
│  ├─ Receive amount from frontend                               │
│  ├─ Read .env credentials                                      │
│  │  ├─ RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7                │
│  │  └─ RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n                   │
│  ├─ Create Base64 auth header                                  │
│  ├─ HTTP POST to Razorpay API                                  │
│  │  └─ https://api.razorpay.com/v1/orders                     │
│  │     ├─ Headers: Authorization: Basic {auth}                 │
│  │     └─ Body: { amount, currency: "INR", payment_capture: 1}│
│  ├─ Log: 📋 Creating order...                                  │
│  ├─ Receive order_id from Razorpay                            │
│  ├─ Log: ✅ Order created: {order_id}                         │
│  └─ Return { id, amount, currency }                           │
│                                                                   │
│  orderRoutes.js (POST /orders)                                  │
│  └─ Save order to database                                     │
│     ├─ Insert into login_orders (for auth users)              │
│     ├─ Insert into orders (for guests)                        │
│     └─ Return { id, timestamp }                               │
│                                                                   │
│  .env File                                                       │
│  ├─ RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7                    │
│  ├─ RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n                       │
│  ├─ DB credentials                                              │
│  └─ JWT Secret                                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
           │                                          │
           │ 2. Return order_id + amount             │ 4. Return order saved
           │                                          │
           ▼                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              RAZORPAY PAYMENT GATEWAY (External)                 │
│                  https://api.razorpay.com                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Order Creation                                                  │
│  ├─ Authenticate with credentials                              │
│  ├─ Validate amount and currency                               │
│  ├─ Create payment order                                       │
│  └─ Return order_id + metadata                                 │
│                                                                   │
│  Payment Processing                                             │
│  ├─ Display checkout modal in frontend                         │
│  ├─ Accept customer's card details                             │
│  │  ├─ Card Number: 4111 1111 1111 1111                       │
│  │  ├─ Expiry: 12/25                                           │
│  │  └─ CVV: 123                                                │
│  ├─ Verify payment securely (test mode)                        │
│  ├─ Return success/failure response                            │
│  └─ Webhook notification to backend (optional)                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Payment Status + Handler Callback
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MYSQL DATABASE                              │
│                       shop_db                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  login_orders (Authenticated Users)                              │
│  ├─ id (Primary Key)                                            │
│  ├─ user_id (Foreign Key)                                       │
│  ├─ total_price                                                 │
│  ├─ payment_method: "razorpay"                                 │
│  ├─ shipping_address                                            │
│  ├─ city, pincode                                               │
│  ├─ full_name, email, phone                                    │
│  ├─ created_at                                                  │
│  └─ status                                                       │
│                                                                   │
│  orders (Guest Users)                                            │
│  ├─ id (Primary Key)                                            │
│  ├─ guest_name                                                  │
│  ├─ guest_email                                                 │
│  ├─ total_price                                                 │
│  ├─ payment_method: "razorpay"                                 │
│  ├─ shipping_address                                            │
│  ├─ city, pincode                                               │
│  ├─ created_at                                                  │
│  └─ status                                                       │
│                                                                   │
│  products                                                        │
│  └─ Product details linked to orders                            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Payment Flow Sequence

```
FRONTEND                          BACKEND                         RAZORPAY
   │                                │                                │
   │  1. User fills checkout form   │                                │
   │  2. Clicks "Pay" button        │                                │
   │────────────────────────────────>                                │
   │    POST /payments/razorpay     │                                │
   │    { amount: 50000 }           │                                │
   │                                │                                │
   │                                │ 3. Validate credentials        │
   │                                │    & create auth header        │
   │                                │                                │
   │                                │ 4. HTTP POST /v1/orders       │
   │                                │────────────────────────────────>
   │                                │                                │
   │                                │    5. Verify & Create Order   │
   │                                │    Return: {order_id, amount}  │
   │                                │<────────────────────────────────
   │                                │                                │
   │ 6. Response with order_id      │                                │
   │<────────────────────────────────                                │
   │                                │                                │
   │ 7. Initialize Razorpay Modal   │                                │
   │    with order_id & test key    │                                │
   │    └─────────────────────────────────────────────────────────> │
   │                                │                                │
   │ 8. User enters test card       │                                │
   │    4111 1111 1111 1111         │                                │
   │    Expiry: 12/25               │                                │
   │    CVV: 123                    │                                │
   │────────────────────────────────────────────────────────────────>│
   │                                │                                │
   │                                │            9. Process Payment  │
   │                                │            (test mode)         │
   │                                │            Return: Success     │
   │<────────────────────────────────────────────────────────────────
   │ 10. Payment Success Handler    │                                │
   │────────────────────────────────>                                │
   │     POST /orders               │                                │
   │     { order_details, items }   │                                │
   │                                │                                │
   │                                │ 11. Save to Database           │
   │                                │     INSERT into login_orders   │
   │                                │                                │
   │ 12. Order Saved Response       │                                │
   │<────────────────────────────────                                │
   │                                │                                │
   │ 13. Show Success Message       │                                │
   │     Redirect to /myaccount     │                                │
   │                                │                                │
```

## State Management

```
FRONTEND STATE:
├─ Cart Context
│  └─ items: [{ id, name, price, quantity, image }]
│     └─ Used to calculate total_price
│
├─ Auth Context
│  ├─ user: { id, email, name }
│  └─ token: JWT token
│     └─ Used to authenticate order save
│
└─ Checkout Form
   ├─ name: "John Doe"
   ├─ email: "john@example.com"
   ├─ phone: "9876543210"
   ├─ address: "123 Main Street"
   ├─ city: "Mumbai"
   ├─ pincode: "400001"
   ├─ method: "razorpay"
   └─ loading: false
```

## API Request/Response Examples

### 1. Create Payment Order

**Request:**
```http
POST /payments/razorpay HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "amount": 50000
}
```

**Response (Success):**
```json
{
  "id": "order_XXXXXXXXXXXXX",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "receipt": "receipt_id",
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": {},
  "created_at": 1700000000
}
```

**Response (Error):**
```json
{
  "error": "Authentication failed"
}
```

### 2. Save Order

**Request:**
```http
POST /orders HTTP/1.1
Host: localhost:5000
Authorization: Bearer {token}
Content-Type: application/json

{
  "total_price": 500,
  "shipping_address": "123 Main Street",
  "city": "Mumbai",
  "pincode": "400001",
  "payment_method": "razorpay",
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "items": [
    { "id": 1, "name": "Product", "price": 500, "quantity": 1 }
  ]
}
```

**Response:**
```json
{
  "id": 42,
  "user_id": 5,
  "total_price": 500,
  "payment_method": "razorpay",
  "status": "pending",
  "created_at": "2024-11-18T10:30:00Z"
}
```

## Environment Configuration

```
FRONTEND (.env)
├─ REACT_APP_API_URL=http://localhost:5000
│  └─ Backend API base URL
│
└─ REACT_APP_RAZORPAY_KEY=rzp_test_1g0VdS1yqNkHg7
   └─ Public key for Razorpay modal (from .env)
   └─ DO NOT expose secret key

BACKEND (.env)
├─ DB_HOST=127.0.0.1
├─ DB_PORT=3306
├─ DB_USER=root
├─ DB_PASSWORD=xxxxx
├─ DB_NAME=shop_db
│  └─ Database connection
│
├─ PORT=5000
│  └─ Server port
│
├─ RAZORPAY_KEY_ID=rzp_test_1g0VdS1yqNkHg7
│  └─ Public key (read from .env)
│
└─ RAZORPAY_KEY_SECRET=bDvdC5KxX1YzPm3n
   └─ Secret key (NEVER expose to frontend)
```

## Error Handling Flow

```
PAYMENT FAILURE SCENARIOS:

1. Invalid Credentials
   Backend → Check .env
   ❌ "Razorpay credentials not configured"

2. Network Error
   Backend → Cannot reach Razorpay API
   ❌ "Failed to create razorpay order"

3. Invalid Amount
   Backend → Amount = 0 or null
   ❌ "Missing amount"

4. Card Declined (Test)
   Razorpay → User uses 4000 0000 0000 0002
   ❌ "Payment declined"

5. Timeout
   Frontend → Request takes >10s
   ❌ "Failed to create payment order"

6. Invalid Order ID
   Frontend → Backend didn't return order_id
   ❌ "Invalid order data from server"
```

## Security Best Practices

```
✅ IMPLEMENTED:
├─ Secret key never exposed to frontend
├─ API key in .env (not in code)
├─ Base64 authentication for API calls
├─ HTTPS for production Razorpay API
├─ CORS enabled for frontend-backend
├─ JWT token validation for authenticated orders
└─ Test mode for development

⚠️ TODO FOR PRODUCTION:
├─ Use .env.production for live keys
├─ Enable HTTPS on backend
├─ Implement webhook verification
├─ Add rate limiting on /payments endpoint
├─ Log all payment attempts
├─ Implement payment confirmation emails
├─ Set up monitoring/alerts
└─ Enable PCI compliance
```
