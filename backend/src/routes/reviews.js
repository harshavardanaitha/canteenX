const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET REVIEWS (by canteen_id or menu_item_id, optional rating filter)
router.get('/', async (req, res) => {
  try {
    const { canteen_id, menu_item_id, min_rating, search, limit = 50 } = req.query;
    let sql = `SELECT r.*, u.full_name as reviewer_name, u.role as reviewer_role, m.name as item_name, c.name as canteen_name
               FROM reviews r
               JOIN users u ON r.user_id = u.id
               JOIN canteens c ON r.canteen_id = c.id
               LEFT JOIN menu_items m ON r.menu_item_id = m.id
               WHERE 1=1`;
    let params = [];
    if (canteen_id) {
      sql += ' AND r.canteen_id = $' + (params.length + 1);
      params.push(canteen_id);
    }
    if (menu_item_id) {
      sql += ' AND r.menu_item_id = $' + (params.length + 1);
      params.push(menu_item_id);
    }
    if (min_rating) {
      sql += ' AND r.rating >= $' + (params.length + 1);
      params.push(parseInt(min_rating));
    }
    if (search) {
      sql += ' AND (LOWER(r.comment) LIKE $' + (params.length + 1) + ' OR LOWER(m.name) LIKE $' + (params.length + 1) + ')';
      params.push(`%${search.toLowerCase()}%`);
    }
    sql += ' ORDER BY r.created_at DESC LIMIT $' + (params.length + 1);
    params.push(parseInt(limit));

    const reviews = await db.query(sql, params);

    // Calculate rating breakdown
    const statsRes = await db.query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews`
    );
    const avgRating = parseFloat(statsRes[0]?.avg_rating || statsRes[0]?.AVG_RATING || 4.5);
    const totalReviews = parseInt(statsRes[0]?.total_reviews || statsRes[0]?.TOTAL_REVIEWS || 0);

    res.json({
      reviews,
      stats: {
        avg_rating: avgRating.toFixed(1),
        total_reviews: totalReviews
      }
    });
  } catch (error) {
    console.error('[Get Reviews Error]:', error);
    res.status(500).json({ error: 'Error fetching reviews.' });
  }
});

// SUBMIT REVIEW (Student / Faculty / Customer)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { canteen_id, menu_item_id, order_id, rating, comment } = req.body;

    if (!canteen_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid canteen_id and rating (1-5) are required.' });
    }

    const reviewId = 'rev_' + Date.now();
    await db.query(
      `INSERT INTO reviews (id, order_id, user_id, canteen_id, menu_item_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [reviewId, order_id || null, req.user.id, canteen_id, menu_item_id || null, parseInt(rating), comment || '']
    );

    // Update menu_item average rating if item is rated
    if (menu_item_id) {
      const avgRes = await db.query(
        'SELECT AVG(rating) as avg_rating, COUNT(*) as cnt FROM reviews WHERE menu_item_id = $1',
        [menu_item_id]
      );
      const avg = parseFloat(avgRes[0]?.avg_rating || avgRes[0]?.AVG_RATING || 4.5);
      const cnt = parseInt(avgRes[0]?.cnt || avgRes[0]?.CNT || 1);
      await db.query('UPDATE menu_items SET rating = $1, rating_count = $2 WHERE id = $3', [avg, cnt, menu_item_id]);
    }

    // Award +5 loyalty points for leaving food feedback
    await db.query('UPDATE users SET reward_points = reward_points + 5 WHERE id = $1', [req.user.id]).catch(() => {});

    res.status(201).json({
      message: 'Review submitted successfully. +5 Reward points earned!',
      reviewId
    });
  } catch (error) {
    console.error('[Submit Review Error]:', error);
    res.status(500).json({ error: 'Error submitting review.' });
  }
});

// DELETE REVIEW (Manager / Admin moderation)
router.delete('/:id', authenticateToken, requireRole('CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const reviewId = req.params.id;
    await db.query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('[Delete Review Error]:', error);
    res.status(500).json({ error: 'Error deleting review.' });
  }
});

module.exports = router;
