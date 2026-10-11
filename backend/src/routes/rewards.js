const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET ACTIVE COUPONS
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await db.query('SELECT * FROM coupons WHERE is_active = 1 ORDER BY min_order_amount ASC');
    res.json({ coupons });
  } catch (error) {
    console.error('[Get Coupons Error]:', error);
    res.status(500).json({ error: 'Error fetching coupons.' });
  }
});

// VALIDATE & APPLY COUPON
router.post('/coupons/apply', authenticateToken, async (req, res) => {
  try {
    const { code, cart_amount } = req.body;

    if (!code || !cart_amount) {
      return res.status(400).json({ error: 'Coupon code and cart amount are required.' });
    }

    const coupons = await db.query('SELECT * FROM coupons WHERE code = $1 AND is_active = 1', [code.toUpperCase().trim()]);
    if (coupons.length === 0) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired coupon code.' });
    }

    const cpn = coupons[0];
    const amount = parseFloat(cart_amount);

    if (amount < parseFloat(cpn.min_order_amount)) {
      return res.status(400).json({
        valid: false,
        error: `Coupon requires minimum order amount of ₹${cpn.min_order_amount}.`
      });
    }

    let discount = 0;
    if (cpn.discount_type === 'PERCENTAGE') {
      discount = Math.min((amount * parseFloat(cpn.discount_value)) / 100, parseFloat(cpn.max_discount_amount));
    } else {
      discount = Math.min(parseFloat(cpn.discount_value), amount);
    }

    res.json({
      valid: true,
      code: cpn.code,
      discount_amount: discount,
      message: `Coupon '${cpn.code}' applied successfully! Saved ₹${discount.toFixed(2)}`
    });
  } catch (error) {
    console.error('[Apply Coupon Error]:', error);
    res.status(500).json({ error: 'Error validating coupon.' });
  }
});

// GET REWARD POINTS
router.get('/points', authenticateToken, async (req, res) => {
  try {
    const users = await db.query('SELECT reward_points FROM users WHERE id = $1', [req.user.id]);
    const points = users[0]?.reward_points || 0;
    res.json({ reward_points: points, user_id: req.user.id });
  } catch (error) {
    console.error('[Get Rewards Error]:', error);
    res.status(500).json({ error: 'Error fetching reward points.' });
  }
});

module.exports = router;
