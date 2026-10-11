const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET CAMPUS EVENTS (EVENT MODE)
router.get('/', async (req, res) => {
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
router.post('/', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
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

// TOGGLE EVENT MODE (Admin)
router.patch('/:id/toggle-mode', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const eventId = req.params.id;
    const { is_event_mode_active } = req.body;

    await db.query('UPDATE events SET is_event_mode_active = $1 WHERE id = $2', [is_event_mode_active ? 1 : 0, eventId]);
    res.json({ message: `Event mode ${is_event_mode_active ? 'ACTIVATED' : 'DEACTIVATED'} for event.`, eventId, is_event_mode_active });
  } catch (error) {
    console.error('[Toggle Event Mode Error]:', error);
    res.status(500).json({ error: 'Error toggling event mode.' });
  }
});

module.exports = router;
