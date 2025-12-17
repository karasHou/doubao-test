# 员工请假审批系统

一个功能完整的员工请假审批系统，支持多级审批、假期类型管理、审批记录追踪等功能。

## 技术栈

- **前端**: Vue 3 + Vite + Axios
- **后端**: Node.js + Express + 原生 PostgreSQL 驱动
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **部署**: Docker + Docker Compose + Nginx

## 功能特性

### 📋 核心功能
- **多级审批流程**: 支持主管 → HR 等多级审批
- **假期类型管理**: 年假、病假、事假、婚假、产假、陪产假
- **自定义审批路径**: 不同假期类型可配置不同的审批流程
- **审批操作**: 支持批准、驳回、撤回申请
- **审批记录**: 完整保留所有审批历史记录

### 👥 用户角色
- **员工**: 提交请假申请、查看申请状态、撤回申请
- **主管**: 审批下属的请假申请
- **HR**: 处理需要 HR 审批的请假申请

### 📊 系统特性
- **实时状态更新**: 使用 Redis 缓存审批流状态
- **数据持久化**: 所有申请和审批记录存储在 PostgreSQL
- **一键部署**: 使用 Docker Compose 快速部署整个系统
- **响应式设计**: 支持桌面端和移动端访问

## 快速开始

### 环境要求
- Docker 20.10+
- Docker Compose 2.0+

### 部署步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd employee-leave-system
   ```

2. **启动服务**
   ```bash
   # 使用 Docker Compose 启动所有服务
   docker-compose up -d

   # 查看服务状态
   docker-compose ps

   # 查看服务日志
   docker-compose logs -f
   ```

3. **访问系统**
   - 前端应用: http://localhost
   - 后端 API: http://localhost:3000
   - 数据库: postgresql://postgres:password@localhost:5432/leave_approval

4. **初始数据**
   系统启动时会自动创建以下初始数据：
   - **员工**:
     - EMP001: 张三 (技术部经理)
     - EMP002: 李四 (HR 主管)
     - EMP003: 王五 (工程师，主管：张三)
   - **假期类型**: 年假、病假、事假、婚假、产假、陪产假

### 本地开发

1. **启动后端开发服务器**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **启动前端开发服务器**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **配置环境变量**
   - 复制 `.env.example` 到 `.env`
   - 根据实际环境修改配置

## 系统架构

### 整体架构
```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │ ◄────────────────► │   Nginx Proxy   │
│  (Vue 3 + Vite)│                     │                 │
└─────────────────┘                     └─────────────────┘
                                                │
                                                ▼
┌─────────────────┐    REST API    ┌─────────────────┐
│   Backend API   │ ◄──────────────► │   Application   │
│  (Node.js +     │                   │   Server        │
│   Express)       │                   │  (Express)      │
└─────────────────┘                   └─────────────────┘
                                                │
                                                ▼
                                    ┌─────────────────┐
                                    │   Data Layer    │
                                    │  ┌─────────────┐│
                                    │  │ PostgreSQL  ││
                                    │  │   (DB)      ││
                                    │  └─────────────┘│
                                    │  ┌─────────────┐│
                                    │  │   Redis     ││
                                    │  │  (Cache)    ││
                                    │  └─────────────┘│
                                    └─────────────────┘
```

### 数据库设计

#### 表结构
- **leave_types**: 假期类型配置
- **employees**: 员工信息
- **leave_applications**: 请假申请记录
- **approval_records**: 审批记录表

#### 核心关系
```
employees ──< leave_applications >── leave_types
     │               │
     └───────────── approval_records
```

### API 接口

#### 员工管理
- `GET /api/employees` - 获取所有员工
- `GET /api/employees/:id` - 获取员工详情
- `POST /api/employees` - 创建员工

#### 假期类型
- `GET /api/leave-types` - 获取所有假期类型
- `GET /api/leave-types/:id` - 获取假期类型详情

#### 请假申请
- `GET /api/leave-applications` - 获取所有请假申请
- `GET /api/leave-applications/:id` - 获取申请详情
- `POST /api/leave-applications` - 创建请假申请
- `PATCH /api/leave-applications/:id/withdraw` - 撤回申请

#### 审批管理
- `POST /api/approvals/:application_id` - 审批申请
- `GET /api/approvals/:application_id/history` - 获取审批历史
- `GET /api/approvals/my-pending/:approver_id` - 获取待审批任务

## 部署说明

### Docker Compose 服务
- **postgres**: PostgreSQL 数据库容器
- **redis**: Redis 缓存容器
- **backend**: Node.js 后端服务容器
- **frontend**: Vue3 前端应用容器 (Nginx)

### 数据持久化
- PostgreSQL 数据: `postgres_data` 卷
- Redis 数据: `redis_data` 卷

### 网络配置
- 所有服务在同一 Docker 网络 `leave-approval-network` 中
- 服务间通过服务名通信

## 监控和维护

### 日志查看
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 服务重启
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
```

### 数据备份
```bash
# 备份 PostgreSQL 数据
docker exec -t leave-approval-postgres pg_dumpall -c -U postgres > backup.sql

# 恢复 PostgreSQL 数据
cat backup.sql | docker exec -i leave-approval-postgres psql -U postgres -d leave_approval
```

## 开发指南

### 代码结构
```
employee-leave-system/
├── backend/              # 后端 Node.js 服务
│   ├── routes/          # API 路由
│   ├── models/          # 数据模型
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   ├── package.json     # 后端依赖配置
│   └── server.js        # 后端服务器入口
├── frontend/             # 前端 Vue 3 应用
│   ├── src/
│   │   ├── components/  # Vue 组件
│   │   ├── views/       # 页面组件
│   │   ├── router/      # 路由配置
│   │   ├── store/       # 状态管理
│   │   ├── utils/       # 工具函数
│   │   ├── main.js      # 前端入口
│   │   └── style.css    # 全局样式
│   ├── index.html       # HTML 模板
│   ├── vite.config.js   # Vite 配置
│   └── package.json     # 前端依赖配置
├── postgres/            # 数据库初始化脚本
├── redis/               # Redis 配置
├── docker-compose.yml   # Docker Compose 配置
└── README.md           # 项目说明文档
```

### 开发规范

#### 后端规范
- 使用 RESTful API 设计
- 所有 API 路径以 `/api` 开头
- 统一的响应格式：`{ data: ..., message: ... }`
- 使用 Joi 进行请求参数验证
- 错误处理统一捕获并返回标准格式
- 使用 async/await 处理异步操作

#### 前端规范
- 使用 Vue 3 Composition API
- 组件命名采用 PascalCase
- 路由命名与组件名称保持一致
- API 请求统一封装在 `src/utils/api.js`
- 样式使用 CSS-in-JS 或 scoped CSS
- 响应式设计使用 CSS Grid 和 Flexbox

## 安全说明

### 生产环境配置
- 更改默认数据库密码
- 配置 HTTPS/SSL 证书
- 限制数据库访问 IP
- 配置 Redis 密码
- 启用 Nginx 访问日志和错误日志
- 配置防火墙规则

### API 安全
- 实现身份认证和授权
- 对所有输入参数进行验证
- 防止 SQL 注入和 XSS 攻击
- 使用 HTTPS 加密数据传输
- 配置 CORS 策略
- 限制 API 请求频率

## 许可证

MIT License

## 贡献指南

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件
- 创建 Pull Request

---

**注意**: 这是一个示例项目，生产环境使用时请根据实际需求进行安全加固和性能优化。
