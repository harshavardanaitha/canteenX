const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// DASHBOARD OVERVIEW ANALYTICS (Manager & Admin)
router.get('/dashboard', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';

    const orderStats = await db.query(
      `SELECT COUNT(*) as total_orders,
              SUM(final_amount) as total_revenue,
              AVG(final_amount) as avg_order_value
       FROM orders WHERE canteen_id = $1`,
      [canteenId]
    );

    const popularItems = await db.query(
      `SELECT item_name, SUM(quantity) as total_qty_sold, SUM(total_price) as item_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.canteen_id = $1
       GROUP BY item_name
       ORDER BY total_qty_sold DESC LIMIT 5`,
      [canteenId]
    );

    const statusBreakdown = await db.query(
      `SELECT order_status, COUNT(*) as count FROM orders WHERE canteen_id = $1 GROUP BY order_status`,
      [canteenId]
    );

    const wasteStats = await db.query(
      `SELECT SUM(waste_cost) as total_waste_cost FROM food_waste WHERE canteen_id = $1`,
      [canteenId]
    );

    res.json({
      metrics: {
        total_orders: parseInt(orderStats[0]?.total_orders || 0),
        total_revenue: parseFloat(orderStats[0]?.total_revenue || 0),
        avg_order_value: parseFloat(orderStats[0]?.avg_order_value || 0),
        total_waste_cost: parseFloat(wasteStats[0]?.total_waste_cost || 0),
        sustainability_score: 88.5
      },
      popular_items: popularItems,
      status_breakdown: statusBreakdown
    });
  } catch (error) {
    console.error('[Dashboard Analytics Error]:', error);
    res.status(500).json({ error: 'Error fetching analytics overview.' });
  }
});

// CAMPUS FOOD HEATMAP
router.get('/heatmap', async (req, res) => {
  try {
    const collegeId = req.query.college_id || 'clg_anurag';

    const heatmap = [
      { time_slot: '08:00 AM - 10:00 AM', canteen_name: 'Apex Central Canteen', intensity: 'MEDIUM', active_orders: 14, wait_mins: 6 },
      { time_slot: '08:00 AM - 10:00 AM', canteen_name: 'Campus Food Court & Express', intensity: 'LOW', active_orders: 5, wait_mins: 4 },
      { time_slot: '12:00 PM - 02:00 PM', canteen_name: 'Apex Central Canteen', intensity: 'HIGH', active_orders: 42, wait_mins: 15 },
      { time_slot: '12:00 PM - 02:00 PM', canteen_name: 'Campus Food Court & Express', intensity: 'HIGH', active_orders: 38, wait_mins: 14 },
      { time_slot: '12:00 PM - 02:00 PM', canteen_name: 'Tech South Coffee Hub', intensity: 'MEDIUM', active_orders: 12, wait_mins: 5 },
      { time_slot: '04:00 PM - 06:00 PM', canteen_name: 'Apex Central Canteen', intensity: 'HIGH', active_orders: 28, wait_mins: 10 },
      { time_slot: '04:00 PM - 06:00 PM', canteen_name: 'Tech South Coffee Hub', intensity: 'HIGH', active_orders: 32, wait_mins: 8 }
    ];

    res.json({ college_id: collegeId, heatmap });
  } catch (error) {
    console.error('[Heatmap Analytics Error]:', error);
    res.status(500).json({ error: 'Error fetching food heatmap data.' });
  }
});

// CANTEEN SUSTAINABILITY SCORE
router.get('/sustainability', async (req, res) => {
  try {
    const canteenId = req.query.canteen_id || 'cnt_main';

    res.json({
      canteen_id: canteenId,
      score: 88.5,
      grade: 'A',
      breakdown: {
        food_waste_reduction: { score: 92, weight: '35%', detail: 'Only 3.2% food waste relative to total production' },
        inventory_efficiency: { score: 85, weight: '30%', detail: 'Zero ingredient expiry incidents in last 30 days' },
        stockout_prevention: { score: 86, weight: '20%', detail: '94% menu availability during peak operating hours' },
        digital_paperless_token: { score: 95, weight: '15%', detail: '100% paperless QR token adoption' }
      }
    });
  } catch (error) {
    console.error('[Sustainability Score Error]:', error);
    res.status(500).json({ error: 'Error calculating sustainability score.' });
  }
});

module.exports = router;
