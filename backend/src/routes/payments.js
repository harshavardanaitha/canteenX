const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const isMockMode = process.env.RAZORPAY_MOCK_MODE !== 'false';

let razorpay = null;
if (!isMockMode && process.env.RAZORPAY_KEY_ID) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// CREATE RAZORPAY ORDER
router.post('/create-razorpay-order', authenticateToken, async (req, res) => {
  try {
    const { amount, order_id } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required.' });
    }

    const rzpOrderId = 'order_rzp_' + Date.now();
    const currency = 'INR';

    if (isMockMode) {
      return res.json({
        mock: true,
        id: rzpOrderId,
        currency,
        amount: Math.round(amount * 100),
        key: 'rzp_test_mock_canteenx'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency,
      receipt: `rcpt_${order_id || Date.now()}`
    };

    const rzpOrder = await razorpay.orders.create(options);
    res.json({
      mock: false,
      id: rzpOrder.id,
      currency: rzpOrder.currency,
      amount: rzpOrder.amount,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('[Create Payment Error]:', error);
    res.status(500).json({ error: 'Error initializing payment gateway.' });
  }
});

// VERIFY PAYMENT SIGNATURE
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const paymentId = 'pay_' + Date.now();
    const txnId = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    if (isMockMode || !razorpay) {
      // Mock payment verification success
      if (order_id) {
        await db.query(`UPDATE orders SET payment_status = 'PAID' WHERE id = $1`, [order_id]);
      }

      await db.query(
        `INSERT INTO payments (id, order_id, transaction_id, razorpay_order_id, razorpay_payment_id, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'SUCCESS')`,
        [paymentId, order_id || 'ord_demo', txnId, razorpay_order_id || 'rzp_mock_order', razorpay_payment_id || 'rzp_mock_pay', 100.00]
      );

      return res.json({
        success: true,
        message: 'Payment verified successfully (Dev Mock Mode).',
        transaction_id: txnId
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await db.query(`UPDATE orders SET payment_status = 'PAID' WHERE id = $1`, [order_id]);
      await db.query(
        `INSERT INTO payments (id, order_id, transaction_id, razorpay_order_id, razorpay_payment_id, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'SUCCESS')`,
        [paymentId, order_id, txnId, razorpay_order_id, razorpay_payment_id, 0.00]
      );

      return res.json({ success: true, message: 'Payment verified successfully.', transaction_id: txnId });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payment signature verification failed.' });
    }
  } catch (error) {
    console.error('[Verify Payment Error]:', error);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
});

// PROCESS ARBITRARY PAYMENT METHOD (UPI, RFID Wallet, Card, Net Banking, Cash)
router.post('/process-method', authenticateToken, async (req, res) => {
  try {
    const { order_id, payment_method, amount, method_details } = req.body;

    if (!order_id || !payment_method) {
      return res.status(400).json({ error: 'Order ID and payment method are required.' });
    }

    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [order_id]);
    if (orderRes.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = orderRes[0];
    const finalAmount = amount || order.final_amount || 0;
    const paymentId = 'pay_' + Date.now();
    const txnPrefix = payment_method.substring(0, 4).toUpperCase();
    const txnId = `${txnPrefix}_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    let orderPaymentStatus = 'PAID';
    let paymentRecordStatus = 'SUCCESS';

    if (payment_method === 'CASH_ON_PICKUP') {
      orderPaymentStatus = 'PAY_AT_COUNTER';
      paymentRecordStatus = 'PENDING_COLLECTION';
    }

    // Update Order payment status and method
    await db.query(
      `UPDATE orders SET payment_status = $1, payment_method = $2 WHERE id = $3`,
      [orderPaymentStatus, payment_method, order_id]
    );

    // Insert payment record
    await db.query(
      `INSERT INTO payments (id, order_id, transaction_id, razorpay_order_id, razorpay_payment_id, amount, status, payment_gateway)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        paymentId,
        order_id,
        txnId,
        method_details?.reference || null,
        method_details?.upi_id || method_details?.card_last4 || null,
        finalAmount,
        paymentRecordStatus,
        payment_method
      ]
    );

    // If paid digitally, award student reward points (10% of amount in points)
    if (orderPaymentStatus === 'PAID') {
      const rewardPoints = Math.max(5, Math.floor(finalAmount * 0.1));
      await db.query(
        `UPDATE users SET reward_points = reward_points + $1 WHERE id = $2`,
        [rewardPoints, req.user.id]
      ).catch(() => {});
    }

    res.json({
      success: true,
      message: payment_method === 'CASH_ON_PICKUP'
        ? 'Order placed. Please pay cash at the pickup counter.'
        : `Payment successful via ${payment_method.replace('_', ' ')}.`,
      payment_method,
      transaction_id: txnId,
      payment_status: orderPaymentStatus,
      amount: finalAmount
    });
  } catch (error) {
    console.error('[Process Payment Method Error]:', error);
    res.status(500).json({ error: 'Failed to process payment method.' });
  }
});

module.exports = router;
