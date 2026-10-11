const express = require('express');
const db = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET DEPARTMENTS
router.get('/', async (req, res) => {
  try {
    const collegeId = req.query.college_id;
    let sql = 'SELECT d.*, c.name as college_name FROM departments d JOIN colleges c ON d.college_id = c.id';
    let params = [];
    if (collegeId) {
      sql += ' WHERE d.college_id = $1';
      params.push(collegeId);
    }
    sql += ' ORDER BY d.name ASC';
    const departments = await db.query(sql, params);
    res.json({ departments });
  } catch (error) {
    console.error('[Get Departments Error]:', error);
    res.status(500).json({ error: 'Error fetching departments.' });
  }
});

// CREATE DEPARTMENT (College Admin)
router.post('/', authenticateToken, requireRole('COLLEGE_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { college_id, name, code, building, floor } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required.' });
    }
    const cId = college_id || req.user.college_id || 'clg_anurag';
    const deptId = 'dept_' + Date.now();
    await db.query(
      `INSERT INTO departments (id, college_id, name, code, building, floor) VALUES ($1, $2, $3, $4, $5, $6)`,
      [deptId, cId, name, code.toUpperCase(), building || null, floor || null]
    );
    res.status(201).json({ message: 'Department created successfully.', deptId });
  } catch (error) {
    console.error('[Create Department Error]:', error);
    res.status(500).json({ error: 'Error creating department.' });
  }
});

module.exports = router;
