const express = require('express');
const router = express.Router();
const { pool, redisClient } = require('../server');

// 审批请假申请
router.post('/:application_id', async (req, res) => {
  try {
    const { application_id } = req.params;
    const { approver_id, action, comment } = req.body;

    // 获取申请信息
    const applicationResult = await pool.query(
      'SELECT * FROM leave_applications WHERE id = $1',
      [application_id]
    );

    if (applicationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Leave application not found' });
    }

    const application = applicationResult.rows[0];

    // 检查当前审批人是否正确
    if (application.current_approver_id !== parseInt(approver_id)) {
      return res.status(400).json({ error: 'You are not authorized to approve this application' });
    }

    // 获取假期类型的审批路径
    const leaveTypeResult = await pool.query(
      'SELECT approval_path FROM leave_types WHERE id = $1',
      [application.leave_type_id]
    );

    const approval_path = leaveTypeResult.rows[0].approval_path;

    // 获取当前审批步骤
    let current_step = 0;
    if (application.approval_history && application.approval_history.length > 0) {
      current_step = application.approval_history.length;
    }

    // 记录审批结果
    const approval_record = {
      approver_id: parseInt(approver_id),
      action: action,
      comment: comment,
      approved_at: new Date().toISOString()
    };

    let new_status = application.status;
    let next_approver_id = null;

    if (action === 'approved') {
      // 检查是否还有下一步审批
      if (current_step < approval_path.length - 1) {
        current_step += 1;
        // 获取下一个审批人
        if (approval_path[current_step].role === 'manager') {
          // 对于多级经理审批，这里可以根据实际逻辑获取下一级经理
          next_approver_id = application.current_approver_id;
        } else if (approval_path[current_step].role === 'hr') {
          // 获取 HR 主管
          const hrResult = await pool.query(
            'SELECT id FROM employees WHERE position LIKE $1',
            ['%HR%']
          );
          next_approver_id = hrResult.rows[0]?.id || null;
        }
        new_status = 'pending';
      } else {
        // 所有审批完成
        new_status = 'approved';
        next_approver_id = null;
      }
    } else if (action === 'rejected') {
      // 申请被驳回
      new_status = 'rejected';
      next_approver_id = null;
    }

    // 更新审批历史
    const approval_history = application.approval_history || [];
    approval_history.push(approval_record);

    // 更新请假申请
    const updatedApplication = await pool.query(`
      UPDATE leave_applications
      SET status = $1, current_approver_id = $2, approval_history = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [new_status, next_approver_id, approval_history, application_id]);

    // 插入审批记录到审批记录表
    await pool.query(`
      INSERT INTO approval_records (application_id, approver_id, approval_order, action, comment, approved_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [application_id, approver_id, current_step, action, comment, new Date()]);

    // 更新 Redis 缓存
    await redisClient.set(`application:${application_id}`, JSON.stringify(updatedApplication.rows[0]));

    res.json(updatedApplication.rows[0]);
  } catch (err) {
    console.error('Error approving leave application:', err);
    res.status(500).json({ error: 'Failed to approve leave application' });
  }
});

// 获取申请的审批记录
router.get('/:application_id/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ar.*, e.name as approver_name
      FROM approval_records ar
      LEFT JOIN employees e ON ar.approver_id = e.id
      WHERE ar.application_id = $1
      ORDER BY ar.approval_order ASC
    `, [req.params.application_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching approval history:', err);
    res.status(500).json({ error: 'Failed to fetch approval history' });
  }
});

// 获取待我审批的申请
router.get('/my-pending/:approver_id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT la.*, e.name as employee_name, lt.name as leave_type_name
      FROM leave_applications la
      LEFT JOIN employees e ON la.employee_id = e.id
      LEFT JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.current_approver_id = $1 AND la.status = 'pending'
      ORDER BY la.created_at DESC
    `, [req.params.approver_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching pending approvals:', err);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

module.exports = router;
