const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'meeting_booking',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// 定义会议室模型
const MeetingRoom = sequelize.define('MeetingRoom', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  equipment: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'maintenance', 'occupied'),
    defaultValue: 'available'
  }
}, {
  timestamps: true
});

// 定义用户模型
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  }
}, {
  timestamps: true
});

// 定义会议模型
const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
    defaultValue: 'scheduled'
  }
}, {
  timestamps: true
});

// 定义会议参与人模型
const MeetingParticipant = sequelize.define('MeetingParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status: {
    type: DataTypes.ENUM('invited', 'accepted', 'rejected'),
    defaultValue: 'invited'
  }
}, {
  timestamps: true
});

// 定义关联关系
User.hasMany(Meeting, { foreignKey: 'organizerId' });
Meeting.belongsTo(User, { foreignKey: 'organizerId', as: 'Organizer' });

MeetingRoom.hasMany(Meeting, { foreignKey: 'roomId' });
Meeting.belongsTo(MeetingRoom, { foreignKey: 'roomId', as: 'Room' });

Meeting.belongsToMany(User, {
  through: MeetingParticipant,
  foreignKey: 'meetingId',
  as: 'Participants'
});

User.belongsToMany(Meeting, {
  through: MeetingParticipant,
  foreignKey: 'userId',
  as: 'ParticipatedMeetings'
});

// 同步数据库
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('数据库同步成功');

    // 创建默认会议室
    await createDefaultRooms();

  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

// 创建默认会议室
const createDefaultRooms = async () => {
  const rooms = [
    { name: '会议室A', capacity: 15, location: '1楼', equipment: ['投影仪', '音响', '白板'] },
    { name: '会议室B', capacity: 8, location: '2楼', equipment: ['投影仪', '白板'] },
    { name: '会议室C', capacity: 20, location: '3楼', equipment: ['投影仪', '音响', '白板', '视频会议设备'] },
    { name: '小型讨论室', capacity: 4, location: '1楼', equipment: ['白板'] }
  ];

  for (const room of rooms) {
    try {
      await MeetingRoom.findOrCreate({
        where: { name: room.name },
        defaults: room
      });
    } catch (error) {
      console.error('创建默认会议室失败:', error);
    }
  }
};

module.exports = {
  sequelize,
  User,
  MeetingRoom,
  Meeting,
  MeetingParticipant,
  syncDatabase
};