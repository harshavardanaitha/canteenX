const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET ALL COLLEGES
router.get('/', async (req, res) => {
  try {
    const colleges = await db.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM campuses cmp WHERE cmp.college_id = c.id) as campus_count,
              (SELECT COUNT(*) FROM canteens cnt JOIN campuses cmp ON cnt.campus_id = cmp.id WHERE cmp.college_id = c.id) as canteen_count,
              (SELECT COUNT(*) FROM users u WHERE u.college_id = c.id) as user_count
       FROM colleges c
       ORDER BY c.created_at DESC`
    );
    res.json({ colleges });
  } catch (error) {
    console.error('[Get Colleges Error]:', error);
    res.status(500).json({ error: 'Error fetching colleges.' });
  }
});

// GET SINGLE COLLEGE
router.get('/:id', async (req, res) => {
  try {
    const colleges = await db.query('SELECT * FROM colleges WHERE id = $1', [req.params.id]);
    if (colleges.length === 0) {
      return res.status(404).json({ error: 'College not found.' });
    }
    const college = colleges[0];
    const campuses = await db.query('SELECT * FROM campuses WHERE college_id = $1', [college.id]);
    const departments = await db.query('SELECT * FROM departments WHERE college_id = $1', [college.id]);
    res.json({ college, campuses, departments });
  } catch (error) {
    console.error('[Get College Error]:', error);
    res.status(500).json({ error: 'Error fetching college.' });
  }
});

// CREATE COLLEGE (Super Admin)
router.post('/', authenticateToken, requireRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const { name, code, address, city, state, contact_email, contact_phone } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'College name and unique code are required.' });
    }

    const collegeId = 'clg_' + Date.now();
    await db.query(
      `INSERT INTO colleges (id, name, code, address, city, state, contact_email, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [collegeId, name, code.toUpperCase(), address || null, city || null, state || null, contact_email || null, contact_phone || null]
    );

    // Create a default campus for the college
    const campusId = 'cmp_' + Date.now();
    await db.query(
      `INSERT INTO campuses (id, college_id, name, code, address)
       VALUES ($1, $2, $3, $4, $5)`,
      [campusId, collegeId, `${name} Main Campus`, `${code}-MAIN`, address || 'Main Campus Gate']
    );

    res.status(201).json({ message: 'College registered successfully.', collegeId, campusId });
  } catch (error) {
    console.error('[Create College Error]:', error);
    res.status(500).json({ error: 'Error registering college.' });
  }
});

module.exports = router;
