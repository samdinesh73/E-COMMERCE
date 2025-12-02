# Delhivery Integration - Order Auto-Creation

## Overview
When a user places an order, it automatically creates a shipment in your Delhivery dashboard.

## What Gets Sent to Delhivery

When an order is placed, the following details are automatically sent:

### Customer Details
- Name
- Phone
- Email
- Delivery Address (Street, City, State, Pincode)

### Product Details
- Product descriptions and quantities
- Total weight (calculated based on item count)
- Total amount/price

### Return/Seller Address
- Store name, phone, address
- Return city, state, pincode

## Configuration

Add these to your `.env` file:

```env
# Delhivery Configuration
DELHIVERY_AUTH_TOKEN=your_token_here
DELHIVERY_API_URL=https://staging-express.delhivery.com/api/cmu/create.json
DELHIVERY_WAREHOUSE=warehouse_name

# Store Details
STORE_PHONE=9876543210
STORE_ADDRESS=Your Address
STORE_CITY=Delhi
STORE_STATE=Haryana
STORE_PINCODE=110042
```

## For Production

Change the API URL to:
```
DELHIVERY_API_URL=https://track.delhivery.com/api/cmu/create.json
```

## How It Works

1. Customer places order with delivery address
2. Order is saved to database
3. Delhivery shipment is created automatically
4. Waybill is returned in order response
5. Customer receives order confirmation email
6. Order appears in Delhivery dashboard

## API Response

The order creation response includes:
```json
{
  "id": 123,
  "waybill": "1234567890",
  "trackingUrl": "https://track.delhivery.com/#/tracking/1234567890",
  ...
}
```

## Troubleshooting

**Issue**: "Delhivery credentials not configured"
- Solution: Check DELHIVERY_AUTH_TOKEN and DELHIVERY_API_URL in .env

**Issue**: Order created but no waybill
- Solution: Check Delhivery response in backend console logs. Verify all required fields are filled in order.

**Issue**: "No waybill returned from Delhivery"
- Solution: Ensure all customer details (name, phone, address, pincode) are provided correctly.

## Testing

Place a test order through your website and check:
1. Backend console for "✅ Delhivery shipment created! Waybill: xxxxx"
2. Order response includes waybill and trackingUrl
3. Delhivery dashboard shows the new shipment
