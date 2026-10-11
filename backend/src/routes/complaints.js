const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// POST /api/complaints - Submit a complaint
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { canteen_id, order_id, category, subject, description } = req.body;
    if (!canteen_id || !category || !subject || !description) {
      return res.status(400).json({ error: 'canteen_id, category, subject, description are required' });
    }
    const id = `cmp_${Date.now()}`;
    await query(
      `INSERT INTO complaints (id, user_id, canteen_id, order_id, category, subject, description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'OPEN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, req.user.id, canteen_id, order_id || null, category, subject, description]
    );
    res.status(201).json({ id, message: 'Complaint submitted successfully', status: 'OPEN' });
  } catch (err) {
    console.error('[Complaints POST]:', err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
});

// GET /api/complaints - Get complaints (own for students/faculty, all for staff+)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { canteen_id, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const allowedManagerRoles = ['CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'];
    const isManager = allowedManagerRoles.includes(req.user.role);

    let sql = `
      SELECT c.*, u.full_name AS user_name, u.college_id AS user_college_id,
             can.name AS canteen_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN canteens can ON c.canteen_id = can.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (!isManager) {
      sql += ` AND c.user_id = $${idx++}`;
      params.push(req.user.id);
    } else if (canteen_id) {
      sql += ` AND c.canteen_id = $${idx++}`;
      params.push(canteen_id);
    }

    if (status) {
      sql += ` AND c.status = $${idx++}`;
      params.push(status);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(parseInt(limit), parseInt(offset));

    const complaints = await query(sql, params);
    res.json({ complaints, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('[Complaints GET]:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// GET /api/complaints/:id - Get single complaint
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const rows = await query(
      `SELECT c.*, u.full_name AS user_name, can.name AS canteen_name
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN canteens can ON c.canteen_id = can.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Complaint not found' });
    const complaint = rows[0];
    // Allow only owner or staff+
    const allowedRoles = ['CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'];
    if (complaint.user_id !== req.user.id && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get responses
    const responses = await query(
      `SELECT cr.*, u.full_name AS responder_name, u.role AS responder_role
       FROM complaint_responses cr
       LEFT JOIN users u ON cr.responder_id = u.id
       WHERE cr.complaint_id = $1
       ORDER BY cr.created_at ASC`,
      [req.params.id]
    );
    res.json({ ...complaint, responses });
  } catch (err) {
    console.error('[Complaints GET/:id]:', err);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// PATCH /api/complaints/:id/status - Update complaint status (staff+)
router.patch('/:id/status',
  authenticateToken,
  requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { status, response } = req.body;
      const validStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
      }
      await query(
        `UPDATE complaints SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [status, req.params.id]
      );
      if (response) {
        const rid = `cr_${Date.now()}`;
        await query(
          `INSERT INTO complaint_responses (id, complaint_id, responder_id, message, created_at)
           VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
          [rid, req.params.id, req.user.id, response]
        );
      }
      res.json({ message: 'Complaint updated', status });
    } catch (err) {
      console.error('[Complaints PATCH status]:', err);
      res.status(500).json({ error: 'Failed to update complaint' });
    }
  }
);

// POST /api/complaints/:id/respond - Add a response to a complaint
router.post('/:id/respond',
  authenticateToken,
  requireRole('CANTEEN_STAFF', 'CANTEEN_MANAGER', 'COLLEGE_ADMIN', 'SUPER_ADMIN'),
  async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: 'message is required' });
      const rid = `cr_${Date.now()}`;
      await query(
        `INSERT INTO complaint_responses (id, complaint_id, responder_id, message, created_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
        [rid, req.params.id, req.user.id, message]
      );
      res.status(201).json({ id: rid, message: 'Response added' });
    } catch (err) {
      console.error('[Complaints POST respond]:', err);
      res.status(500).json({ error: 'Failed to add response' });
    }
  }
);

module.exports = router;
