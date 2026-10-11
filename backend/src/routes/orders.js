const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { emitOrderUpdate, emitQueueUpdate } = require('../services/socket');

const router = express.Router();

// GET PICKUP SLOTS
router.get('/pickup-slots', async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';
    const slots = await db.query(
      `SELECT * FROM pickup_slots WHERE canteen_id = $1 AND is_active = 1 ORDER BY slot_time ASC`,
      [canteenId]
    );
    res.json({ slots });
  } catch (error) {
    console.error('[Get Pickup Slots Error]:', error);
    res.status(500).json({ error: 'Error fetching pickup slots.' });
  }
});

// GET KITCHEN ORDER BATCHES (Section 24: Order Batching for Kitchen Efficiency)
router.get('/kitchen-batches', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';
    const batches = await db.query(
      `SELECT oi.menu_item_id, oi.item_name,
              SUM(oi.quantity) as total_quantity_needed,
              COUNT(DISTINCT o.id) as distinct_order_count
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.canteen_id = $1 AND o.order_status IN ('PLACED', 'ACCEPTED', 'PREPARING')
       GROUP BY oi.menu_item_id, oi.item_name
       ORDER BY total_quantity_needed DESC`,
      [canteenId]
    );

    const formattedBatches = batches.map(b => ({
      menu_item_id: b.menu_item_id,
      item_name: b.item_name,
      total_quantity: parseInt(b.total_quantity_needed || 0),
      order_count: parseInt(b.distinct_order_count || 0),
      batch_recommendation: `Prepare ${b.total_quantity_needed} servings of ${b.item_name} together (aggregating ${b.distinct_order_count} active orders).`
    }));

    res.json({ canteen_id: canteenId, batches: formattedBatches });
  } catch (error) {
    console.error('[Kitchen Batches Error]:', error);
    res.status(500).json({ error: 'Error calculating kitchen batches.' });
  }
});

// CREATE ORDER
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { canteen_id, items, order_type = 'PICKUP', pickup_slot_id, delivery_building, delivery_floor, delivery_room, scheduled_time, coupon_code } = req.body;

    if (!canteen_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one item.' });
    }

    // Faculty check for cabin delivery
    if (order_type === 'CABIN_DELIVERY' && req.user.role !== 'FACULTY' && req.user.role !== 'COLLEGE_ADMIN') {
      return res.status(403).json({ error: 'Cabin delivery is exclusively available for Faculty members.' });
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Verify each item availability & price
    for (const item of items) {
      const dbItems = await db.query(
        'SELECT id, name, price, availability_status, available_quantity FROM menu_items WHERE id = $1 AND canteen_id = $2',
        [item.menu_item_id, canteen_id]
      );

      if (dbItems.length === 0) {
        return res.status(400).json({ error: `Menu item ${item.menu_item_id} is not available in this canteen.` });
      }

      const menuItem = dbItems[0];
      if (menuItem.availability_status === 'SOLD_OUT' || menuItem.availability_status === 'TEMPORARILY_UNAVAILABLE') {
        return res.status(400).json({ error: `Sorry, '${menuItem.name}' is currently sold out.` });
      }

      const qty = parseInt(item.quantity) || 1;
      const unitPrice = parseFloat(menuItem.price);
      const lineTotal = unitPrice * qty;
      totalAmount += lineTotal;

      validatedItems.push({
        menu_item_id: menuItem.id,
        name: menuItem.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: lineTotal
      });
    }

    let discountAmount = 0;
    if (coupon_code) {
      const coupons = await db.query('SELECT * FROM coupons WHERE code = $1 AND is_active = 1', [coupon_code.toUpperCase()]);
      if (coupons.length > 0) {
        const cpn = coupons[0];
        if (totalAmount >= parseFloat(cpn.min_order_amount)) {
          if (cpn.discount_type === 'PERCENTAGE') {
            discountAmount = Math.min((totalAmount * parseFloat(cpn.discount_value)) / 100, parseFloat(cpn.max_discount_amount));
          } else {
            discountAmount = Math.min(parseFloat(cpn.discount_value), totalAmount);
          }
        }
      }
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    // Get next digital token number for today
    const countRes = await db.query('SELECT COUNT(*) as count FROM orders WHERE canteen_id = $1', [canteen_id]);
    const totalOrdersCount = parseInt(countRes[0]?.count || countRes[0]?.COUNT || 0);
    const tokenNumber = (totalOrdersCount % 999) + 1;
    const orderNumber = `CX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    // Insert order
    await db.query(
      `INSERT INTO orders (id, order_number, user_id, canteen_id, order_type, order_status, payment_status, total_amount, discount_amount, final_amount, token_number, pickup_slot_id, scheduled_time, delivery_building, delivery_floor, delivery_room, est_prep_mins)
       VALUES ($1, $2, $3, $4, $5, 'PLACED', 'PAID', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        orderId, orderNumber, req.user.id, canteen_id, order_type,
        totalAmount, discountAmount, finalAmount, tokenNumber,
        pickup_slot_id || null, scheduled_time || null,
        delivery_building || null, delivery_floor || null, delivery_room || null, 12
      ]
    );

    // Insert order items & update stock
    for (const vItem of validatedItems) {
      const itemLineId = 'oi_' + Math.random().toString(36).substr(2, 9);
      await db.query(
        `INSERT INTO order_items (id, order_id, menu_item_id, item_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [itemLineId, orderId, vItem.menu_item_id, vItem.name, vItem.quantity, vItem.unit_price, vItem.total_price]
      );

      // Decrement stock
      await db.query(
        `UPDATE menu_items SET available_quantity = MAX(0, available_quantity - $1) WHERE id = $2`,
        [vItem.quantity, vItem.menu_item_id]
      );
    }

    // Insert order status history
    await db.query(
      `INSERT INTO order_status_history (id, order_id, status, remarks) VALUES ($1, $2, 'PLACED', 'Order placed successfully.')`,
      ['osh_' + Date.now(), orderId]
    );

    // Insert QR token record
    const qrId = 'qr_' + Date.now();
    const qrCodeStr = `CX-QR-${orderNumber}`;
    const qrPayload = JSON.stringify({ orderId, orderNumber, token: tokenNumber, userId: req.user.id });
    await db.query(
      `INSERT INTO qr_tokens (id, order_id, token_code, qr_payload) VALUES ($1, $2, $3, $4)`,
      [qrId, orderId, qrCodeStr, qrPayload]
    );

    // Award reward points (1 point per Rs. 10 spent)
    const pointsEarned = Math.floor(finalAmount / 10);
    if (pointsEarned > 0) {
      await db.query(`UPDATE users SET reward_points = reward_points + $1 WHERE id = $2`, [pointsEarned, req.user.id]);
    }

    // Emit Socket event to canteen staff
    emitOrderUpdate(canteen_id, {
      id: orderId,
      order_number: orderNumber,
      token_number: tokenNumber,
      user_id: req.user.id,
      order_status: 'PLACED',
      total_amount: finalAmount
    });

    res.status(201).json({
      message: 'Order created successfully.',
      order: {
        id: orderId,
        order_number: orderNumber,
        token_number: tokenNumber,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        est_prep_mins: 12,
        qr_code: qrCodeStr,
        items: validatedItems
      }
    });
  } catch (error) {
    console.error('[Create Order Error]:', error);
    res.status(500).json({ error: 'Error placing order.' });
  }
});

// GET ORDERS (User history or Staff Active Queue)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { canteen_id, status, type } = req.query;
    let sql = '';
    let params = [];

    if (['CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'].includes(req.user.role) && canteen_id) {
      // Kitchen queue view
      sql = `SELECT o.*, u.full_name as customer_name, u.role as customer_role, u.phone as customer_phone
             FROM orders o
             JOIN users u ON o.user_id = u.id
             WHERE o.canteen_id = $1`;
      params.push(canteen_id);

      if (status) {
        sql += ` AND o.order_status = $2`;
        params.push(status);
      } else {
        sql += ` AND o.order_status IN ('PLACED', 'ACCEPTED', 'PREPARING', 'READY')`;
      }
      sql += ` ORDER BY o.created_at ASC`;
    } else {
      // Student or Faculty order history
      sql = `SELECT o.*, c.name as canteen_name
             FROM orders o
             JOIN canteens c ON o.canteen_id = c.id
             WHERE o.user_id = $1 ORDER BY o.created_at DESC`;
      params.push(req.user.id);
    }

    const orders = await db.query(sql, params);

    // Fetch order items for each order
    for (const ord of orders) {
      const items = await db.query(`SELECT * FROM order_items WHERE order_id = $1`, [ord.id]);
      ord.items = items;
    }

    res.json({ orders });
  } catch (error) {
    console.error('[Get Orders Error]:', error);
    res.status(500).json({ error: 'Error retrieving orders.' });
  }
});

// GET SINGLE ORDER DETAIL & TRACKING
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orders = await db.query(
      `SELECT o.*, c.name as canteen_name, qr.token_code, qr.qr_payload, qr.is_scanned
       FROM orders o
       JOIN canteens c ON o.canteen_id = c.id
       LEFT JOIN qr_tokens qr ON qr.order_id = o.id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = orders[0];
    const items = await db.query(`SELECT * FROM order_items WHERE order_id = $1`, [order.id]);
    order.items = items;

    const history = await db.query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
      [order.id]
    );
    order.status_history = history;

    res.json({ order });
  } catch (error) {
    console.error('[Get Order Detail Error]:', error);
    res.status(500).json({ error: 'Error fetching order tracking details.' });
  }
});

// UPDATE ORDER STATUS (Staff / Manager)
router.patch('/:id/status', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const orderId = req.params.id;

    if (!['ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid order status transition.' });
    }

    const orders = await db.query('SELECT canteen_id, user_id, order_number FROM orders WHERE id = $1', [orderId]);
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const order = orders[0];

    await db.query(
      `UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [status, orderId]
    );

    await db.query(
      `INSERT INTO order_status_history (id, order_id, status, changed_by_user_id, remarks)
       VALUES ($1, $2, $3, $4, $5)`,
      ['osh_' + Date.now(), orderId, status, req.user.id, remarks || `Status changed to ${status}`]
    );

    // Real-time broadcast
    emitOrderUpdate(order.canteen_id, {
      id: orderId,
      order_number: order.order_number,
      user_id: order.user_id,
      order_status: status
    });

    res.json({ message: `Order status updated to ${status}`, orderId, status });
  } catch (error) {
    console.error('[Update Order Status Error]:', error);
    res.status(500).json({ error: 'Error updating order status.' });
  }
});

// SCAN & VERIFY QR CODE (Staff Counter Scanner)
router.post('/qr-verify', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({ error: 'QR Code string is required.' });
    }

    const tokens = await db.query(
      `SELECT qr.*, o.id as order_id, o.order_number, o.token_number, o.order_status, u.full_name as customer_name
       FROM qr_tokens qr
       JOIN orders o ON qr.order_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE qr.token_code = $1 OR qr.order_id = $1`,
      [qr_code.trim()]
    );

    if (tokens.length === 0) {
      return res.status(404).json({ valid: false, error: 'Invalid QR Token. Order not found.' });
    }

    const token = tokens[0];

    if (token.is_scanned === 1) {
      return res.status(400).json({
        valid: false,
        error: `Token #${token.token_number} (${token.order_number}) was ALREADY REDEEMED!`,
        token
      });
    }

    // Mark as scanned and set order status to COMPLETED
    await db.query(
      `UPDATE qr_tokens SET is_scanned = 1, scanned_at = CURRENT_TIMESTAMP, scanned_by_user_id = $1 WHERE id = $2`,
      [req.user.id, token.id]
    );

    await db.query(`UPDATE orders SET order_status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [token.order_id]);

    await db.query(
      `INSERT INTO order_status_history (id, order_id, status, changed_by_user_id, remarks)
       VALUES ($1, $2, 'COMPLETED', $3, 'QR scanned and order verified at counter.')`,
      ['osh_' + Date.now(), token.order_id, req.user.id]
    );

    res.json({
      valid: true,
      message: `Token #${token.token_number} (${token.order_number}) Verified Successfully!`,
      token_number: token.token_number,
      customer_name: token.customer_name,
      order_number: token.order_number
    });
  } catch (error) {
    console.error('[QR Verify Error]:', error);
    res.status(500).json({ error: 'Error verifying QR code token.' });
  }
});

module.exports = router;
