const express = require('express');
const { MeetingRoom, Meeting } = require('../models');

const router = express.Router();

// 获取所有会议室
router.get('/', async (req, res) => {
  try {
    const rooms = await MeetingRoom.findAll({
      order: [['name', 'ASC']]
    });

    res.json(rooms);
  } catch (error) {
    console.error('获取会议室列表失败:', error);
    res.status(500).json({ error: '获取会议室列表失败' });
  }
});

// 获取单个会议室详情
router.get('/:id', async (req, res) => {
  try {
    const room = await MeetingRoom.findByPk(req.params.id, {
      include: [
        {
          model: Meeting,
          where: { status: 'scheduled' },
          required: false
        }
      ]
    });

    if (!room) {
      return res.status(404).json({ error: '会议室不存在' });
    }

    res.json(room);
  } catch (error) {
    console.error('获取会议室详情失败:', error);
    res.status(500).json({ error: '获取会议室详情失败' });
  }
});

// 创建会议室（管理员权限）
router.post('/', async (req, res) => {
  try {
    const { name, capacity, equipment, location, status } = req.body;

    // 验证输入
    if (!name || !capacity || !location) {
      return res.status(400).json({ error: '名称、容量和位置都是必填的' });
    }

    // 检查会议室名称是否已存在
    const existingRoom = await MeetingRoom.findOne({ where: { name } });

    if (existingRoom) {
      return res.status(400).json({ error: '会议室名称已存在' });
    }

    // 创建会议室
    const room = await MeetingRoom.create({
      name,
      capacity,
      equipment: equipment || [],
      location,
      status: status || 'available'
    });

    res.status(201).json({
      message: '会议室创建成功',
      room
    });
  } catch (error) {
    console.error('创建会议室失败:', error);
    res.status(500).json({ error: '创建会议室失败' });
  }
});

// 更新会议室（管理员权限）
router.put('/:id', async (req, res) => {
  try {
    const room = await MeetingRoom.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ error: '会议室不存在' });
    }

    const { name, capacity, equipment, location, status } = req.body;

    // 检查新名称是否已存在（排除当前会议室）
    if (name && name !== room.name) {
      const existingRoom = await MeetingRoom.findOne({ where: { name } });
      if (existingRoom) {
        return res.status(400).json({ error: '会议室名称已存在' });
      }
    }

    // 更新会议室信息
    await room.update({
      name: name || room.name,
      capacity: capacity || room.capacity,
      equipment: equipment || room.equipment,
      location: location || room.location,
      status: status || room.status
    });

    res.json({
      message: '会议室更新成功',
      room
    });
  } catch (error) {
    console.error('更新会议室失败:', error);
    res.status(500).json({ error: '更新会议室失败' });
  }
});

// 删除会议室（管理员权限）
router.delete('/:id', async (req, res) => {
  try {
    const room = await MeetingRoom.findByPk(req.params.id);

    if (!room) {
      return res.status(404).json({ error: '会议室不存在' });
    }

    // 检查是否有关联的会议
    const meetings = await Meeting.count({ where: { roomId: req.params.id, status: 'scheduled' } });

    if (meetings > 0) {
      return res.status(400).json({ error: '该会议室还有未完成的会议，无法删除' });
    }

    // 删除会议室
    await room.destroy();

    res.json({ message: '会议室删除成功' });
  } catch (error) {
    console.error('删除会议室失败:', error);
    res.status(500).json({ error: '删除会议室失败' });
  }
});

module.exports = router;