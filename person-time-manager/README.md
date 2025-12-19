# 个人时间管理工具

一个功能完整的个人时间管理工具，支持任务创建、拆解、依赖关系管理和实时状态同步。

## 功能特性

- ✅ **任务管理**: 创建、编辑、删除任务
- ✅ **任务拆解**: 支持父子任务关系
- ✅ **任务依赖**: 管理任务间的依赖关系
- ✅ **多视图**: 日视图和周视图切换
- ✅ **实时同步**: WebSocket 实时更新任务状态
- ✅ **优先级管理**: 支持任务优先级设置
- ✅ **状态流转**: 待处理、进行中、已完成、已阻塞

## 技术栈

- **前端**: React + Vite + Tailwind CSS
- **后端**: Node.js + Express + WebSocket
- **数据库**: PostgreSQL
- **部署**: Docker Compose

## 快速开始

### 环境要求

- Docker
- Docker Compose

### 部署步骤

1. 克隆或导航到项目目录：
   ```bash
   cd person-time-manager
   ```

2. 使用 Docker Compose 一键部署：
   ```bash
   docker-compose up -d
   ```

3. 访问应用：
   - 前端应用: http://localhost:3006
   - 后端 API: http://localhost:3007
   - 数据库: localhost:5436

### 手动运行（可选）

#### 后端
```bash
cd backend
npm install
npm start
```

#### 前端
```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
person-time-manager/
├── frontend/          # React 前端应用
├── backend/           # Node.js 后端服务
├── postgres/          # 数据库配置和初始化
├── docker-compose.yml # Docker 部署配置
└── README.md          # 项目说明
```

## API 文档

### 任务接口

- `GET /api/tasks` - 获取所有任务
- `POST /api/tasks` - 创建新任务
- `PUT /api/tasks/:id` - 更新任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/:id/dependencies` - 添加任务依赖
- `DELETE /api/task-dependencies/:id` - 删除任务依赖

## 数据库结构

### tasks 表
- `id`: 任务唯一标识
- `title`: 任务标题
- `description`: 任务描述
- `status`: 任务状态（pending/in_progress/completed/blocked）
- `priority`: 优先级（low/medium/high）
- `due_date`: 截止日期
- `parent_id`: 父任务 ID

### task_dependencies 表
- `id`: 依赖关系 ID
- `task_id`: 任务 ID
- `depends_on_task_id`: 依赖的任务 ID

## 开发说明

### 添加新功能

1. 后端修改 `backend/server.js`
2. 前端添加新组件到 `frontend/src/components/`
3. 更新 API 调用 `frontend/src/services/api.js`

### 实时同步

应用使用 WebSocket 实现实时状态同步，确保多个客户端之间的任务状态保持一致。

## 许可证

MIT
