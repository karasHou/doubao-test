const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { sequelize, syncDatabase } = require('./models');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const meetingRoutes = require('./routes/meetings');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

// WebSocket 配置
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket 连接处理
let connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);

  // 用户登录
  socket.on('user:login', (userId) => {
    connectedUsers.set(socket.id, userId);
    console.log(`用户 ${userId} 登录，Socket ID: ${socket.id}`);
    socket.join(`user:${userId}`);
  });

  // 用户加入会议室频道
  socket.on('room:join', (roomId) => {
    socket.join(`room:${roomId}`);
    console.log(`用户 ${connectedUsers.get(socket.id)} 加入会议室 ${roomId} 频道`);
  });

  // 监听会议创建事件
  socket.on('meeting:created', (meeting) => {
    console.log('新会议创建:', meeting);
    // 通知会议室中的所有用户
    io.to(`room:${meeting.roomId}`).emit('meeting:created', meeting);
    // 通知所有参与者
    meeting.participants.forEach(participant => {
      io.to(`user:${participant.userId}`).emit('meeting:invitation', meeting);
    });
  });

  // 监听会议取消事件
  socket.on('meeting:cancelled', (meeting) => {
    console.log('会议取消:', meeting);
    io.to(`room:${meeting.roomId}`).emit('meeting:cancelled', meeting);
    meeting.participants.forEach(participant => {
      io.to(`user:${participant.userId}`).emit('meeting:cancelled', meeting);
    });
  });

  // 监听会议更新事件
  socket.on('meeting:updated', (meeting) => {
    console.log('会议更新:', meeting);
    io.to(`room:${meeting.roomId}`).emit('meeting:updated', meeting);
    meeting.participants.forEach(participant => {
      io.to(`user:${participant.userId}`).emit('meeting:updated', meeting);
    });
  });

  // 监听冲突检测事件
  socket.on('meeting:check-conflict', async (meetingData, callback) => {
    try {
      const { roomId, startTime, endTime, excludeMeetingId } = meetingData;

      // 导入 Meeting 模型
      const { Meeting } = require('./models');

      // 查询冲突的会议
      const conflictingMeetings = await Meeting.findAll({
        where: {
          roomId,
          status: 'scheduled',
          id: excludeMeetingId ? { [require('sequelize').Op.ne]: excludeMeetingId } : { [require('sequelize').Op.not]: null },
          [require('sequelize').Op.or]: [
            {
              startTime: { [require('sequelize').Op.lt]: endTime },
              endTime: { [require('sequelize').Op.gt]: startTime }
            }
          ]
        }
      });

      callback({
        hasConflict: conflictingMeetings.length > 0,
        conflicts: conflictingMeetings
      });
    } catch (error) {
      console.error('冲突检测失败:', error);
      callback({ hasConflict: false, conflicts: [], error: error.message });
    }
  });

  // 断开连接
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    console.log(`用户 ${userId} 断开连接`);
    connectedUsers.delete(socket.id);
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 同步数据库
    await syncDatabase();

    // 启动 HTTP 服务器
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`WebSocket 服务已启动`);
      console.log(`API 文档: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
  }
};

startServer();