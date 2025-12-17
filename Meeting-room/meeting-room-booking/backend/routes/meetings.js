const express = require('express');
const { Meeting, User, MeetingRoom, MeetingParticipant } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// 检查时间冲突
const checkTimeConflict = async (roomId, startTime, endTime, excludeMeetingId = null) => {
  const whereClause = {
    roomId,
    status: 'scheduled',
    [Op.or]: [
      {
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime }
      }
    ]
  };

  if (excludeMeetingId) {
    whereClause.id = { [Op.ne]: excludeMeetingId };
  }

  const conflictingMeetings = await Meeting.findAll({ where: whereClause });
  return conflictingMeetings.length > 0;
};

// 获取所有会议
router.get('/', async (req, res) => {
  try {
    const { userId, roomId, startDate, endDate } = req.query;

    let whereClause = {};

    if (userId) {
      whereClause = {
        [Op.or]: [
          { organizerId: userId },
          {
            id: {
              [Op.in]: Sequelize.literal(`(SELECT meetingId FROM "MeetingParticipants" WHERE "userId" = ${userId})`)
            }
          }
        ]
      };
    }

    if (roomId) {
      whereClause.roomId = roomId;
    }

    if (startDate && endDate) {
      whereClause[Op.and] = [
        { startTime: { [Op.lte]: endDate } },
        { endTime: { [Op.gte]: startDate } }
      ];
    }

    const meetings = await Meeting.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'Organizer' },
        { model: MeetingRoom, as: 'Room' },
        {
          model: User,
          as: 'Participants',
          through: {
            model: MeetingParticipant,
            attributes: ['status']
          }
        }
      ],
      order: [['startTime', 'ASC']]
    });

    res.json(meetings);
  } catch (error) {
    console.error('获取会议列表失败:', error);
    res.status(500).json({ error: '获取会议列表失败' });
  }
});

// 获取单个会议详情
router.get('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Organizer' },
        { model: MeetingRoom, as: 'Room' },
        {
          model: User,
          as: 'Participants',
          through: {
            model: MeetingParticipant,
            attributes: ['status']
          }
        }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ error: '会议不存在' });
    }

    res.json(meeting);
  } catch (error) {
    console.error('获取会议详情失败:', error);
    res.status(500).json({ error: '获取会议详情失败' });
  }
});

// 创建会议
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { title, description, startTime, endTime, roomId, organizerId, participants } = req.body;

    // 验证输入
    if (!title || !startTime || !endTime || !roomId || !organizerId) {
      return res.status(400).json({ error: '标题、时间、会议室和组织者都是必填的' });
    }

    // 检查时间是否有效
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ error: '结束时间必须晚于开始时间' });
    }

    // 检查时间冲突
    const hasConflict = await checkTimeConflict(roomId, startTime, endTime);

    if (hasConflict) {
      return res.status(400).json({ error: '该时间段已有会议，无法预约' });
    }

    // 创建会议
    const meeting = await Meeting.create({
      title,
      description,
      startTime,
      endTime,
      roomId,
      organizerId
    }, { transaction });

    // 处理参与者
    if (participants && participants.length > 0) {
      const participantRecords = participants.map(participant => ({
        meetingId: meeting.id,
        userId: participant.userId,
        status: participant.status || 'invited'
      }));

      await MeetingParticipant.bulkCreate(participantRecords, { transaction });
    }

    await transaction.commit();

    // 加载完整的会议信息
    const fullMeeting = await Meeting.findByPk(meeting.id, {
      include: [
        { model: User, as: 'Organizer' },
        { model: MeetingRoom, as: 'Room' },
        {
          model: User,
          as: 'Participants',
          through: {
            model: MeetingParticipant,
            attributes: ['status']
          }
        }
      ]
    });

    res.status(201).json({
      message: '会议创建成功',
      meeting: fullMeeting
    });
  } catch (error) {
    await transaction.rollback();
    console.error('创建会议失败:', error);
    res.status(500).json({ error: '创建会议失败' });
  }
});

// 更新会议
router.put('/:id', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const meeting = await Meeting.findByPk(req.params.id, { transaction });

    if (!meeting) {
      return res.status(404).json({ error: '会议不存在' });
    }

    const { title, description, startTime, endTime, roomId, status, participants } = req.body;

    // 检查时间冲突（排除当前会议）
    if (roomId && (startTime || endTime)) {
      const hasConflict = await checkTimeConflict(
        roomId,
        startTime || meeting.startTime,
        endTime || meeting.endTime,
        meeting.id
      );

      if (hasConflict) {
        return res.status(400).json({ error: '该时间段已有会议，无法更新' });
      }
    }

    // 更新会议信息
    await meeting.update({
      title: title || meeting.title,
      description: description || meeting.description,
      startTime: startTime || meeting.startTime,
      endTime: endTime || meeting.endTime,
      roomId: roomId || meeting.roomId,
      status: status || meeting.status
    }, { transaction });

    // 处理参与者更新
    if (participants) {
      // 删除旧的参与者记录
      await MeetingParticipant.destroy({
        where: { meetingId: meeting.id },
        transaction
      });

      // 添加新的参与者记录
      const participantRecords = participants.map(participant => ({
        meetingId: meeting.id,
        userId: participant.userId,
        status: participant.status || 'invited'
      }));

      await MeetingParticipant.bulkCreate(participantRecords, { transaction });
    }

    await transaction.commit();

    // 加载完整的会议信息
    const fullMeeting = await Meeting.findByPk(meeting.id, {
      include: [
        { model: User, as: 'Organizer' },
        { model: MeetingRoom, as: 'Room' },
        {
          model: User,
          as: 'Participants',
          through: {
            model: MeetingParticipant,
            attributes: ['status']
          }
        }
      ]
    });

    res.json({
      message: '会议更新成功',
      meeting: fullMeeting
    });
  } catch (error) {
    await transaction.rollback();
    console.error('更新会议失败:', error);
    res.status(500).json({ error: '更新会议失败' });
  }
});

// 处理会议邀请
router.put('/:id/participants/:userId', async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { status } = req.body;

    // 验证状态
    if (!['accepted', 'rejected', 'invited'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const participant = await MeetingParticipant.findOne({
      where: { meetingId: id, userId }
    });

    if (!participant) {
      return res.status(404).json({ error: '参与者不存在' });
    }

    // 更新状态
    await participant.update({ status });

    res.json({
      message: '邀请状态更新成功',
      participant
    });
  } catch (error) {
    console.error('更新邀请状态失败:', error);
    res.status(500).json({ error: '更新邀请状态失败' });
  }
});

// 删除会议
router.delete('/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findByPk(req.params.id);

    if (!meeting) {
      return res.status(404).json({ error: '会议不存在' });
    }

    // 删除会议（级联删除参与者记录）
    await meeting.destroy();

    res.json({ message: '会议删除成功' });
  } catch (error) {
    console.error('删除会议失败:', error);
    res.status(500).json({ error: '删除会议失败' });
  }
});

module.exports = router;