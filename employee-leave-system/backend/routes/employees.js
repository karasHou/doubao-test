const express = require('express');
const router = express.Router();
const { pool } = require('../server');

// 获取所有员工
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// 根据 ID 获取员工
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// 获取员工的主管
router.get('/:id/manager', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.id
      WHERE e.id = $1
    `, [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching manager:', err);
    res.status(500).json({ error: 'Failed to fetch manager' });
  }
});

// 创建员工
router.post('/', async (req, res) => {
  try {
    const { employee_id, name, email, department, position, manager_id } = req.body;
    const result = await pool.query(`
      INSERT INTO employees (employee_id, name, email, department, position, manager_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [employee_id, name, email, department, position, manager_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

module.exports = router;
