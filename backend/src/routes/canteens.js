const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET ALL CANTEENS FOR COLLEGE
router.get('/', async (req, res) => {
  try {
    const collegeId = req.query.college_id || 'clg_anurag';
    const canteens = await db.query(
      `SELECT c.*, cmp.name as campus_name,
              (SELECT COUNT(*) FROM orders o WHERE o.canteen_id = c.id AND o.order_status IN ('PLACED', 'ACCEPTED', 'PREPARING')) as live_queue_count
       FROM canteens c
       JOIN campuses cmp ON c.campus_id = cmp.id
       WHERE cmp.college_id = $1 AND c.is_active = 1
       ORDER BY c.name ASC`,
      [collegeId]
    );

    res.json({ canteens });
  } catch (error) {
    console.error('[Canteens Error]:', error);
    res.status(500).json({ error: 'Error fetching canteens list.' });
  }
});

// GET CANTEEN DETAILS
router.get('/:id', async (req, res) => {
  try {
    const canteens = await db.query(
      `SELECT c.*, cmp.name as campus_name
       FROM canteens c
       JOIN campuses cmp ON c.campus_id = cmp.id
       WHERE c.id = $1`,
      [req.params.id]
    );

    if (canteens.length === 0) {
      return res.status(404).json({ error: 'Canteen not found.' });
    }

    const canteen = canteens[0];

    // Compute live active order count
    const activeOrders = await db.query(
      `SELECT COUNT(*) as active_count FROM orders WHERE canteen_id = $1 AND order_status IN ('PLACED', 'ACCEPTED', 'PREPARING')`,
      [req.params.id]
    );

    const activeCount = parseInt(activeOrders[0]?.active_count || activeOrders[0]?.ACTIVE_COUNT || 0);
    canteen.current_queue_count = activeCount;
    canteen.estimated_wait_mins = Math.max(5, activeCount * Math.round(canteen.avg_prep_time_mins / 3));

    res.json({ canteen });
  } catch (error) {
    console.error('[Canteen Detail Error]:', error);
    res.status(500).json({ error: 'Error fetching canteen details.' });
  }
});

// GET CAMPUSES LIST
router.get('/campuses/list', async (req, res) => {
  try {
    const collegeId = req.query.college_id || 'clg_anurag';
    const campuses = await db.query(
      `SELECT * FROM campuses WHERE college_id = $1`,
      [collegeId]
    );
    res.json({ campuses });
  } catch (error) {
    console.error('[Campuses Error]:', error);
    res.status(500).json({ error: 'Error fetching campuses.' });
  }
});

module.exports = router;
