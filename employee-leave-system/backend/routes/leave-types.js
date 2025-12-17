const express = require('express');
const router = express.Router();
const { pool } = require('../server');

// 获取所有假期类型
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_types ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching leave types:', err);
    res.status(500).json({ error: 'Failed to fetch leave types' });
  }
});

// 根据 ID 获取假期类型
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_types WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave type not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching leave type:', err);
    res.status(500).json({ error: 'Failed to fetch leave type' });
  }
});

// 创建假期类型
router.post('/', async (req, res) => {
  try {
    const { name, description, approval_path, max_days_per_year } = req.body;
    const result = await pool.query(`
      INSERT INTO leave_types (name, description, approval_path, max_days_per_year)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, approval_path, max_days_per_year]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating leave type:', err);
    res.status(500).json({ error: 'Failed to create leave type' });
  }
});

module.exports = router;
