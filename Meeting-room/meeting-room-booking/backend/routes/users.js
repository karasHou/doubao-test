const express = require('express');
const { User, Meeting, MeetingParticipant } = require('../models');

const router = express.Router();

// 获取所有用户
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = {};

    if (search) {
      whereClause = {
        [require('sequelize').Op.or]: [
          { username: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
          { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取单个用户详情
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Meeting,
          as: 'Meetings',
          through: {
            model: MeetingParticipant,
            attributes: ['status']
          },
          include: [
            { model: User, as: 'Organizer' },
            { model: require('../models').MeetingRoom, as: 'Room' }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const { name, email, role } = req.body;

    // 检查邮箱是否已存在（排除当前用户）
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: '邮箱已存在' });
      }
    }

    // 更新用户信息
    await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role
    });

    // 返回不包含密码的用户信息
    const { password, ...userWithoutPassword } = user.toJSON();

    res.json({
      message: '用户信息更新成功',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 删除用户
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 检查用户是否是任何会议的组织者
    const organizedMeetings = await Meeting.count({ where: { organizerId: req.params.id, status: 'scheduled' } });

    if (organizedMeetings > 0) {
      return res.status(400).json({ error: '该用户还有未完成的会议，无法删除' });
    }

    // 删除用户
    await user.destroy();

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

module.exports = router;