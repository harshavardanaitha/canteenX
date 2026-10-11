const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET INVENTORY LIST WITH PREDICTIVE ALERTS
router.get('/', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';

    const items = await db.query(
      `SELECT inv.*, s.name as supplier_name, s.phone as supplier_phone
       FROM inventory inv
       LEFT JOIN suppliers s ON inv.supplier_id = s.id
       WHERE inv.canteen_id = $1
       ORDER BY (inv.current_stock <= inv.min_stock_threshold) DESC, inv.ingredient_name ASC`,
      [canteenId]
    );

    // Compute predictive stockout alerts
    for (const item of items) {
      item.is_low_stock = parseFloat(item.current_stock) <= parseFloat(item.min_stock_threshold);
      // Predictive calculation based on estimated daily usage
      const estimatedTomorrowUsage = parseFloat(item.min_stock_threshold) * 1.5;
      item.predicted_tomorrow_requirement = estimatedTomorrowUsage;
      item.predictive_alert = (parseFloat(item.current_stock) < estimatedTomorrowUsage)
        ? `Stock (${item.current_stock} ${item.unit}) may be insufficient for projected tomorrow requirement (${estimatedTomorrowUsage} ${item.unit}).`
        : null;
    }

    res.json({ inventory: items });
  } catch (error) {
    console.error('[Get Inventory Error]:', error);
    res.status(500).json({ error: 'Error fetching inventory.' });
  }
});

// RESTOCK / UPDATE INVENTORY ITEM
router.patch('/:id', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const { current_stock, min_stock_threshold, cost_per_unit } = req.body;
    const invId = req.params.id;

    await db.query(
      `UPDATE inventory
       SET current_stock = $1, min_stock_threshold = $2, cost_per_unit = $3, last_restocked_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [current_stock, min_stock_threshold, cost_per_unit, invId]
    );

    // Record inventory transaction log
    await db.query(
      `INSERT INTO inventory_transactions (id, inventory_id, user_id, transaction_type, quantity, notes)
       VALUES ($1, $2, $3, 'RESTOCK', $4, 'Restocked by manager')`,
      ['it_' + Date.now(), invId, req.user.id, current_stock]
    );

    res.json({ message: 'Inventory item updated successfully.', invId });
  } catch (error) {
    console.error('[Update Inventory Error]:', error);
    res.status(500).json({ error: 'Error updating inventory.' });
  }
});

// GET SUPPLIERS LIST
router.get('/suppliers', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';
    const suppliers = await db.query('SELECT * FROM suppliers WHERE canteen_id = $1', [canteenId]);
    res.json({ suppliers });
  } catch (error) {
    console.error('[Get Suppliers Error]:', error);
    res.status(500).json({ error: 'Error fetching suppliers.' });
  }
});

module.exports = router;
