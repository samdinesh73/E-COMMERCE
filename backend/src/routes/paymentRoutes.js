const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Endpoint to create Razorpay order on server
router.post('/razorpay', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Missing amount' });

    const key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!key_id || !key_secret) {
      console.error('❌ Razorpay credentials missing from .env');
      return res.status(500).json({ 
        error: 'Razorpay credentials not configured',
        hint: 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env'
      });
    }

    // Validate key format
    if (!key_id.startsWith('rzp_test_') && !key_id.startsWith('rzp_live_')) {
      return res.status(500).json({ 
        error: 'Invalid Razorpay Key ID format',
        hint: 'Key ID should start with rzp_test_ or rzp_live_'
      });
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    
    console.log(`\n📋 Creating Razorpay order:`);
    console.log(`   Amount: ₹${(amount / 100).toFixed(2)}`);
    console.log(`   Mode: ${key_id.includes('live') ? '🔴 LIVE' : '🟢 TEST'}`);

    const orderResp = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount,
        currency: 'INR',
        payment_capture: 1,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log(`✅ Order created: ${orderResp.data.id}\n`);
    return res.json(orderResp.data);
  } catch (err) {
    console.error('\n❌ Razorpay API Error:');
    console.error(`   Status: ${err.response?.status}`);
    console.error(`   Message: ${err.response?.data?.error || err.message}\n`);
    
    const errorMsg = err.response?.data?.error?.description || 
                     err.response?.data?.error || 
                     'Authentication failed - check your Razorpay credentials';
    
    return res.status(err.response?.status || 500).json({ 
      error: errorMsg,
      details: 'Get valid credentials from https://dashboard.razorpay.com'
    });
  }
});

// Verify payment (called from frontend after payment)
router.post('/razorpay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment data' });
    }

    // For demo orders, skip verification
    if (razorpay_order_id.startsWith('order_demo_')) {
      console.log(`✅ Demo payment verified: ${razorpay_payment_id}`);
      return res.json({ 
        status: 'verified',
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        mode: 'demo'
      });
    }

    // For real orders, verify signature
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Payment verification failed');
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    console.log(`✅ Real payment verified: ${razorpay_payment_id}`);
    return res.json({ 
      status: 'verified',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      mode: 'live'
    });
  } catch (err) {
    console.error('Verification error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;
