const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET ALL USERS (Admin)
router.get('/', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.phone, u.room_number, u.reward_points, u.created_at,
              c.name as college_name, d.name as department_name
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY u.created_at DESC`
    );

    res.json({ users });
  } catch (error) {
    console.error('[Get Users Error]:', error);
    res.status(500).json({ error: 'Error fetching users.' });
  }
});

// GET DEPARTMENTS LIST
router.get('/departments', async (req, res) => {
  try {
    const collegeId = req.query.college_id || 'clg_anurag';
    const departments = await db.query('SELECT * FROM departments WHERE college_id = $1', [collegeId]);
    res.json({ departments });
  } catch (error) {
    console.error('[Get Departments Error]:', error);
    res.status(500).json({ error: 'Error fetching departments.' });
  }
});

// UPDATE CURRENT USER PROFILE
router.patch('/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.id;

    if (name) {
      await db.query(`UPDATE users SET full_name = $1 WHERE id = $2`, [name, userId]);
    }
    if (phone !== undefined) {
      await db.query(`UPDATE users SET phone = $1 WHERE id = $2`, [phone, userId]);
    }

    const updated = await db.query(
      `SELECT u.id, u.full_name as name, u.email, u.role, u.phone, u.reward_points,
              u.created_at, c.name as college_name, d.name as department
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [userId]
    );


    res.json({ success: true, user: updated[0] });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;

