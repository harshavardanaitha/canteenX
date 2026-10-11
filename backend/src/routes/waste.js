const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// RECORD FOOD WASTE
router.post('/', authenticateToken, requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const { canteen_id, menu_item_id, prepared_quantity, sold_quantity, wasted_quantity, waste_reason } = req.body;

    if (!canteen_id || !wasted_quantity || !waste_reason) {
      return res.status(400).json({ error: 'Canteen ID, wasted quantity, and waste reason are required.' });
    }

    let unitCost = 25.00;
    if (menu_item_id) {
      const items = await db.query('SELECT price FROM menu_items WHERE id = $1', [menu_item_id]);
      if (items.length > 0) unitCost = parseFloat(items[0].price) * 0.4; // 40% cost factor
    }

    const wasteCost = parseFloat(wasted_quantity) * unitCost;
    const wasteId = 'wst_' + Date.now();

    await db.query(
      `INSERT INTO food_waste (id, canteen_id, menu_item_id, prepared_quantity, sold_quantity, wasted_quantity, waste_cost, waste_reason, recorded_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [wasteId, canteen_id, menu_item_id || null, prepared_quantity || 0, sold_quantity || 0, wasted_quantity, wasteCost, waste_reason, req.user.id]
    );

    res.status(201).json({ message: 'Food waste record saved successfully.', wasteId, wasteCost });
  } catch (error) {
    console.error('[Record Waste Error]:', error);
    res.status(500).json({ error: 'Error recording food waste.' });
  }
});

// GET FOOD WASTE RECORDS & ANALYTICS
router.get('/analytics', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN'), async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';

    const records = await db.query(
      `SELECT fw.*, m.name as item_name
       FROM food_waste fw
       LEFT JOIN menu_items m ON fw.menu_item_id = m.id
       WHERE fw.canteen_id = $1
       ORDER BY fw.created_at DESC`,
      [canteenId]
    );

    const totalCostRes = await db.query(
      `SELECT SUM(waste_cost) as total_cost, SUM(wasted_quantity) as total_qty FROM food_waste WHERE canteen_id = $1`,
      [canteenId]
    );

    const reasonStats = await db.query(
      `SELECT waste_reason, COUNT(*) as count, SUM(waste_cost) as reason_cost
       FROM food_waste WHERE canteen_id = $1
       GROUP BY waste_reason`,
      [canteenId]
    );

    res.json({
      records,
      total_waste_cost: parseFloat(totalCostRes[0]?.total_cost || totalCostRes[0]?.TOTAL_COST || 0),
      total_wasted_quantity: parseFloat(totalCostRes[0]?.total_qty || totalCostRes[0]?.TOTAL_QTY || 0),
      reasons_breakdown: reasonStats
    });
  } catch (error) {
    console.error('[Waste Analytics Error]:', error);
    res.status(500).json({ error: 'Error fetching food waste analytics.' });
  }
});

module.exports = router;
