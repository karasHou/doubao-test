# 会议预约系统

一个功能完善的会议预约系统，支持实时冲突检测、多人邀请等功能。

## 技术栈

- **前端**: React 18 + TypeScript + FullCalendar + Styled Components
- **后端**: Node.js + Express + Socket.io
- **数据库**: PostgreSQL + Sequelize ORM
- **部署**: Docker + Docker Compose

## 主要功能

### 📅 日历系统
- 周视图 / 月视图 切换
- 直观的时间轴显示
- 拖拽创建会议

### 🏢 会议室管理
- 多会议室支持
- 容量和设备信息管理
- 实时状态显示

### ⚡ 实时功能
- WebSocket 实时通信
- 会议创建/取消/更新 即时通知
- 实时冲突检测和提示

### 🤝 协作功能
- 会议邀请功能
- 接受/拒绝邀请
- 参与者状态跟踪

### 🔒 安全特性
- 用户认证和授权
- JWT Token 验证
- 密码加密存储

## 快速开始

### 前提条件
- Docker 和 Docker Compose 已安装
- Node.js 18+ (可选，用于开发)

### 一键部署

1. **克隆项目**
   ```bash
   git clone [项目地址]
   cd meeting-room-booking
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   - 前端应用: http://localhost:3000
   - 后端 API: http://localhost:5000/api
   - 健康检查: http://localhost:5000/api/health

### 示例账户

- **管理员**:
  - 用户名: admin
  - 密码: 123456

- **普通用户**:
  - 用户名: user1
  - 密码: 123456

  - 用户名: user2
  - 密码: 123456

## 项目结构

```
meeting-room-booking/
├── backend/              # 后端服务
│   ├── models/          # 数据库模型
│   ├── routes/          # API 路由
│   ├── middleware/      # 中间件
│   ├── services/        # 业务逻辑
│   ├── server.js        # 服务器入口
│   ├── package.json     # 依赖配置
│   └── Dockerfile       # Docker 配置
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── hooks/       # 自定义 Hooks
│   │   ├── services/    # API 和 WebSocket 服务
│   │   ├── types/       # TypeScript 类型定义
│   │   ├── utils/       # 工具函数
│   │   └── App.tsx      # 应用入口
│   ├── package.json     # 依赖配置
│   └── Dockerfile       # Docker 配置
├── docker/              # Docker 相关文件
│   └── init.sql         # 数据库初始化脚本
├── docker-compose.yml   # Docker Compose 配置
└── README.md            # 项目说明文档
```

## API 文档

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户管理

- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

### 会议室管理

- `GET /api/rooms` - 获取会议室列表
- `GET /api/rooms/:id` - 获取会议室详情
- `POST /api/rooms` - 创建会议室
- `PUT /api/rooms/:id` - 更新会议室信息
- `DELETE /api/rooms/:id` - 删除会议室

### 会议管理

- `GET /api/meetings` - 获取会议列表
- `GET /api/meetings/:id` - 获取会议详情
- `POST /api/meetings` - 创建会议
- `PUT /api/meetings/:id` - 更新会议信息
- `DELETE /api/meetings/:id` - 删除会议
- `PUT /api/meetings/:id/participants/:userId` - 更新参与者状态

## WebSocket 事件

### 客户端发送

- `user:login` - 用户登录
- `room:join` - 加入会议室频道
- `meeting:check-conflict` - 检查会议冲突
- `meeting:created` - 新会议创建
- `meeting:cancelled` - 会议取消
- `meeting:updated` - 会议更新

### 服务端发送

- `meeting:created` - 通知新会议创建
- `meeting:cancelled` - 通知会议取消
- `meeting:updated` - 通知会议更新
- `meeting:invitation` - 通知会议邀请

## 开发说明

### 后端开发

```bash
cd backend
npm install
npm run dev
```

### 前端开发

```bash
cd frontend
npm install
npm start
```

## 配置说明

### 环境变量

#### 后端环境变量 (backend/.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=meeting_booking
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=meeting-booking-secret-key
```

#### 前端环境变量 (frontend/.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 数据库设计

### 主要表结构

- `Users` - 用户信息表
- `MeetingRooms` - 会议室信息表
- `Meetings` - 会议信息表
- `MeetingParticipants` - 会议参与者关联表

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！