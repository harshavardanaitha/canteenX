const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, role = 'STUDENT', phone, college_id, department_id, room_number } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const existingUsers = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = 'usr_' + crypto.randomUUID().substr(0, 12);
    const defaultCollegeId = college_id || 'clg_anurag';
    const defaultDeptId = department_id || 'dept_cse';

    await db.query(
      `INSERT INTO users (id, college_id, department_id, full_name, email, password_hash, role, phone, room_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, defaultCollegeId, defaultDeptId, full_name, email.toLowerCase().trim(), passwordHash, role, phone || null, room_number || null]
    );

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role, full_name, college_id: defaultCollegeId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: userId,
        full_name,
        email: email.toLowerCase().trim(),
        role,
        college_id: defaultCollegeId,
        department_id: defaultDeptId,
        room_number
      }
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ error: 'Server error during user registration.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const users = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    
    // Check password - handle demo default passwords or bcrypt comparison
    let isMatch = false;
    if (password === 'password123' && user.password_hash.startsWith('$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/')) {
      isMatch = true; // Demo password match
    } else {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name, college_id: user.college_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        college_id: user.college_id,
        department_id: user.department_id,
        room_number: user.room_number,
        reward_points: user.reward_points || 0
      }
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// ME (CURRENT USER PROFILE)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.full_name, u.email, u.role, u.phone, u.room_number, u.reward_points, u.college_id, u.department_id,
              c.name as college_name, d.name as department_name, d.building, d.floor
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('[Auth Me Error]:', error);
    res.status(500).json({ error: 'Error fetching profile.' });
  }
});

module.exports = router;
