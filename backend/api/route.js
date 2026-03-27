const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');

// Initialize Snap API client
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: 'Mid-server-hclmnOHGtvLZBy2B4hjLNatS',
  clientKey: 'Mid-client-HAk7N5BauqIO_iDy'
});

router.post('/token', async (req, res) => {
  try {
    const { order_id, gross_amount, item_details, customer_details } = req.body;

    const parameter = {
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount
      },
      item_details,
      customer_details
    };

    const transaction = await snap.createTransaction(parameter);
    
    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url
    });
  } catch (error) {
    console.error('Midtrans Token Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment token',
      error: error.message
    });
  }
});

module.exports = router;
