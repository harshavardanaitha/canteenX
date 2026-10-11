const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET ANNOUNCEMENTS
router.get('/', async (req, res) => {
  try {
    const collegeId = req.query.college_id || 'clg_anurag';
    const announcements = await db.query(
      `SELECT * FROM announcements WHERE college_id = $1 AND is_active = 1 ORDER BY created_at DESC`,
      [collegeId]
    );

    res.json({ announcements });
  } catch (error) {
    console.error('[Get Announcements Error]:', error);
    res.status(500).json({ error: 'Error fetching announcements.' });
  }
});

// CREATE ANNOUNCEMENT (Admin)
router.post('/', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { title, content, target_role = 'ALL' } = req.body;
    const collegeId = req.user.college_id || 'clg_anurag';

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    const ancId = 'anc_' + Date.now();
    await db.query(
      `INSERT INTO announcements (id, college_id, title, content, target_role, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ancId, collegeId, title, content, target_role, req.user.id]
    );

    res.status(201).json({ message: 'Announcement created successfully.', ancId });
  } catch (error) {
    console.error('[Create Announcement Error]:', error);
    res.status(500).json({ error: 'Error creating announcement.' });
  }
});

// GET CAMPUS EVENTS (EVENT MODE)
router.get('/events', async (req, res) => {
  try {
    const collegeId = req.query.college_id || 'clg_anurag';
    const events = await db.query(
      `SELECT * FROM events WHERE college_id = $1 ORDER BY start_date DESC`,
      [collegeId]
    );

    res.json({ events });
  } catch (error) {
    console.error('[Get Events Error]:', error);
    res.status(500).json({ error: 'Error fetching campus events.' });
  }
});

// CREATE CAMPUS EVENT (Admin)
router.post('/events', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, description, event_type, start_date, end_date, is_event_mode_active } = req.body;
    const collegeId = req.user.college_id || 'clg_anurag';

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ error: 'Event name, start date, and end date are required.' });
    }

    const eventId = 'evt_' + Date.now();
    await db.query(
      `INSERT INTO events (id, college_id, name, description, event_type, start_date, end_date, is_event_mode_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [eventId, collegeId, name, description || '', event_type || 'COLLEGE_FEST', start_date, end_date, is_event_mode_active ? 1 : 0]
    );

    res.status(201).json({ message: 'Campus Event created successfully.', eventId });
  } catch (error) {
    console.error('[Create Event Error]:', error);
    res.status(500).json({ error: 'Error creating campus event.' });
  }
});

module.exports = router;
