const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET CAMPUSES
router.get('/', async (req, res) => {
  try {
    const collegeId = req.query.college_id;
    let sql = `SELECT cmp.*, c.name as college_name,
                      (SELECT COUNT(*) FROM canteens cnt WHERE cnt.campus_id = cmp.id) as canteen_count
               FROM campuses cmp
               JOIN colleges c ON cmp.college_id = c.id`;
    let params = [];
    if (collegeId) {
      sql += ' WHERE cmp.college_id = $1';
      params.push(collegeId);
    }
    sql += ' ORDER BY cmp.name ASC';
    const campuses = await db.query(sql, params);
    res.json({ campuses });
  } catch (error) {
    console.error('[Get Campuses Error]:', error);
    res.status(500).json({ error: 'Error fetching campuses.' });
  }
});

// CREATE CAMPUS (College Admin or Super Admin)
router.post('/', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { college_id, name, code, address } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Campus name and code are required.' });
    }
    const cId = college_id || req.user.college_id || 'clg_anurag';
    const campusId = 'cmp_' + Date.now();
    await db.query(
      `INSERT INTO campuses (id, college_id, name, code, address) VALUES ($1, $2, $3, $4, $5)`,
      [campusId, cId, name, code.toUpperCase(), address || null]
    );
    res.status(201).json({ message: 'Campus created successfully.', campusId });
  } catch (error) {
    console.error('[Create Campus Error]:', error);
    res.status(500).json({ error: 'Error creating campus.' });
  }
});

module.exports = router;
