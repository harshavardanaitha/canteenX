const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET USER NOTIFICATIONS
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await db.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );

    const unreadCountRes = await db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = 0`,
      [req.user.id]
    );
    const unreadCount = parseInt(unreadCountRes[0]?.count || unreadCountRes[0]?.COUNT || 0);

    res.json({ notifications, unread_count: unreadCount });
  } catch (error) {
    console.error('[Get Notifications Error]:', error);
    res.status(500).json({ error: 'Error fetching notifications.' });
  }
});

// MARK NOTIFICATION AS READ
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('[Mark Read Error]:', error);
    res.status(500).json({ error: 'Error updating notification status.' });
  }
});

// MARK ALL AS READ
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[Mark All Read Error]:', error);
    res.status(500).json({ error: 'Error updating notifications.' });
  }
});

module.exports = router;
