const express = require('express');
const router = express.Router();
const axios = require('axios');

// Endpoint to create Razorpay order on server
router.post('/razorpay', async (req, res) => {
  try {
    const { amount } = req.body; // amount in paise expected
    if (!amount) return res.status(400).json({ error: 'Missing amount' });

    // Use server-side Razorpay key/secret from env
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({ error: 'Razorpay credentials not configured on server' });
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');

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
      }
    );

    return res.json(orderResp.data);
  } catch (err) {
    console.error('Razorpay order error', err && err.response ? err.response.data : err.message);
    return res.status(500).json({ error: 'Failed to create razorpay order' });
  }
});

module.exports = router;
