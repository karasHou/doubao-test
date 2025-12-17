const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { pool, redisClient } = require('../server');

// 获取所有请假申请
router.get('/', async (req, res) => {
  try {
    const { employee_id, status, page = 1, limit = 10 } = req.query;
    let query = 'SELECT * FROM leave_applications';
    let params = [];
    let conditions = [];

    if (employee_id) {
      conditions.push(`employee_id = $${params.length + 1}`);
      params.push(employee_id);
    }

    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    // 添加分页
    const offset = (page - 1) * limit;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit));
    params.push(offset);

    const result = await pool.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) FROM leave_applications';
    let countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      countParams = params.slice(0, -2); // 移除分页参数
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error('Error fetching leave applications:', err);
    res.status(500).json({ error: 'Failed to fetch leave applications' });
  }
});

// 根据 ID 获取请假申请
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM leave_applications WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching leave application:', err);
    res.status(500).json({ error: 'Failed to fetch leave application' });
  }
});

// 创建请假申请
router.post('/', async (req, res) => {
  try {
    const { employee_id, leave_type_id, start_date, end_date, days, reason } = req.body;

    // 生成唯一申请编号
    const application_id = 'LA' + Date.now() + Math.floor(Math.random() * 1000);

    // 获取假期类型的审批路径
    const leaveTypeResult = await pool.query('SELECT approval_path FROM leave_types WHERE id = $1', [leave_type_id]);
    if (leaveTypeResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid leave type' });
    }

    const approval_path = leaveTypeResult.rows[0].approval_path;

    // 获取第一个审批人（通常是主管）
    let current_approver_id = null;
    if (approval_path.length > 0 && approval_path[0].role === 'manager') {
      const employeeResult = await pool.query('SELECT manager_id FROM employees WHERE id = $1', [employee_id]);
      current_approver_id = employeeResult.rows[0].manager_id;
    }

    const result = await pool.query(`
      INSERT INTO leave_applications (application_id, employee_id, leave_type_id, start_date, end_date, days, reason, current_approver_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [application_id, employee_id, leave_type_id, start_date, end_date, days, reason, current_approver_id]);

    // 更新 Redis 缓存
    await redisClient.set(`application:${result.rows[0].id}`, JSON.stringify(result.rows[0]));

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating leave application:', err);
    res.status(500).json({ error: 'Failed to create leave application' });
  }
});

// 撤回请假申请
router.patch('/:id/withdraw', async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE leave_applications
      SET status = 'withdrawn', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot withdraw application' });
    }

    // 更新 Redis 缓存
    await redisClient.set(`application:${req.params.id}`, JSON.stringify(result.rows[0]));

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error withdrawing leave application:', err);
    res.status(500).json({ error: 'Failed to withdraw leave application' });
  }
});

module.exports = router;
