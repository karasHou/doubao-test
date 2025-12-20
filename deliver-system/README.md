# 个人快递管理工具

一个功能完整的个人快递管理工具，支持快递单号录入、自动物流状态更新、异常包裹提醒等功能。

## 功能特性

- 📦 **快递录入**: 支持手动录入快递单号和快递公司信息
- 📊 **状态分类**: 按物流状态分类展示（待处理、运输中、派送中、已签收、异常）
- 🔄 **自动同步**: 使用队列系统异步更新物流状态
- ⚠️ **异常提醒**: 自动检测和标记异常包裹
- 🚀 **高性能**: 优化的数据库查询和缓存设计
- 🐳 **一键部署**: 使用 Docker 容器化部署

## 技术栈

### 前端
- React 18 + TypeScript
- Axios 用于 API 请求
- CSS3 组件样式

### 后端
- Node.js + Express
- PostgreSQL 数据库
- Redis + Bull 队列系统
- Docker 容器化

## 项目结构

```
deliver-system/
├── backend/           # 后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务服务
│   │   ├── queues/        # 队列系统
│   │   └── config/        # 配置文件
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── frontend/          # 前端应用
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── services/      # API 服务
│   │   ├── types/         # TypeScript 类型定义
│   │   └── App.tsx        # 主应用
│   ├── package.json
│   ├── Dockerfile
│   └── tsconfig.json
├── db/                # 数据库脚本
│   └── init.sql
├── docker-compose.yml # Docker Compose 配置
└── README.md
```

## 部署说明

### 1. 环境要求
- Docker 19.03+
- Docker Compose 1.25+

### 2. 一键启动

```bash
cd deliver-system
docker-compose up -d
```

### 3. 访问应用

- 前端界面: http://localhost:3001
- 后端 API: http://localhost:3000

## 使用说明

1. **录入快递**: 在首页输入快递单号和快递公司信息
2. **查看列表**: 快递会按状态分类展示
3. **手动同步**: 点击"同步物流"按钮手动更新物流状态
4. **删除快递**: 点击"删除"按钮移除不需要的快递

## 配置说明

### 后端环境变量
```env
PORT=3000
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=deliver_system
REDIS_URL=redis://redis:6379
```

## 开发说明

### 本地开发

1. **启动后端**
```bash
cd backend
npm install
npm run dev
```

2. **启动前端**
```bash
cd frontend
npm install
npm start
```

### 物流 API 配置

当前使用模拟数据，生产环境需要替换为真实的物流 API：
- 修改 `backend/src/services/物流Service.js`
- 替换 `获取物流信息` 方法中的 API 调用

## 架构设计

### 核心功能
- **异步处理**: 使用 Bull 队列处理物流状态更新
- **状态管理**: 统一的状态解析和更新机制
- **数据持久化**: PostgreSQL 存储所有快递信息
- **缓存**: Redis 用于队列和缓存

### 可靠性设计
- 队列任务失败重试机制
- 数据库事务处理
- 异常状态检测和提醒

## 扩展功能

- [ ] 实时通知（邮件/推送）
- [ ] 多用户支持
- [ ] 快递统计报表
- [ ] 批量导入功能
- [ ] 移动端适配

## License

MIT
