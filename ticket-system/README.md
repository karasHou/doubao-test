# 用户反馈工单系统

一个完整的用户反馈工单系统，支持用户提交问题、客服处理、工单状态流转和历史工单搜索。

## 技术栈

- **前端**: Vue3 + Element Plus + Vite
- **后端**: NestJS + TypeORM + Node.js
- **数据库**: PostgreSQL
- **搜索**: Elasticsearch
- **部署**: Docker + Docker Compose

## 功能特性

1. **用户提交问题**:
   - 支持工单分类（Bug、功能请求、技术支持、其他）
   - 支持优先级设置（低、中、高、紧急）
   - 完整的问题描述

2. **客服处理功能**:
   - 查看所有工单
   - 分配工单给不同客服
   - 更新工单状态
   - 关闭工单

3. **工单状态流转**:
   - 待处理 (open)
   - 处理中 (in_progress)
   - 已解决 (resolved)
   - 已关闭 (closed)

4. **搜索功能**:
   - 支持关键词搜索工单标题和描述
   - 支持按状态、优先级、分类筛选搜索结果
   - 基于 Elasticsearch 的高效全文搜索

5. **权限控制**:
   - 普通用户：提交工单、查看自己的工单
   - 客服：处理工单、转派工单
   - 管理员：所有权限

## 快速开始

### 环境要求

- Docker (版本 20.10 或更高)
- Docker Compose (版本 2.10 或更高)

### 一键部署

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd ticket-system
   ```

2. **启动所有服务**
   ```bash
   docker-compose up -d
   ```

3. **访问系统**
   - 前端应用: http://localhost:3000
   - 后端 API: http://localhost:3001
   - Kibana (Elasticsearch 管理): http://localhost:5601

### 初始数据

系统启动后会自动创建以下初始用户：

| 用户名 | 密码 | 角色 | 邮箱 |
|--------|------|------|------|
| admin | admin | 管理员 | admin@example.com |
| cs001 | cs001 | 客服 | cs001@example.com |
| user001 | user001 | 普通用户 | user001@example.com |

同时会创建 3 个示例工单供测试。

## 项目结构

```
ticket-system/
├── backend/                # NestJS 后端服务
│   ├── src/
│   │   ├── entities/       # 数据库实体
│   │   ├── modules/        # 业务模块
│   │   │   ├── ticket/     # 工单模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── auth/       # 认证模块
│   │   │   └── elasticsearch/  # Elasticsearch 模块
│   │   ├── app.module.ts   # 根模块
│   │   └── main.ts         # 应用入口
│   ├── package.json         # 后端依赖
│   ├── tsconfig.json        # TypeScript 配置
│   ├── nest-cli.json        # NestJS CLI 配置
│   ├── .env                 # 环境变量
│   └── Dockerfile           # 后端 Docker 配置
├── frontend/                # Vue3 前端应用
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── Login.vue   # 登录页面
│   │   │   ├── TicketList.vue  # 工单列表
│   │   │   ├── CreateTicket.vue  # 新建工单
│   │   │   └── TicketDetail.vue  # 工单详情
│   │   ├── router/          # 路由配置
│   │   ├── api/             # API 请求
│   │   └── utils/           # 工具函数
│   ├── index.html           # HTML 模板
│   ├── package.json         # 前端依赖
│   ├── vite.config.js       # Vite 配置
│   └── Dockerfile           # 前端 Docker 配置
├── postgres/                # PostgreSQL 配置
│   └── init.sql             # 数据库初始化脚本
├── elasticsearch/           # Elasticsearch 配置（预留）
├── docker-compose.yml       # Docker Compose 配置
└── README.md                # 项目说明文档
```

## API 接口

### 工单接口

- `POST /tickets` - 创建新工单
- `GET /tickets` - 获取工单列表
- `GET /tickets/:id` - 获取工单详情
- `PUT /tickets/:id` - 更新工单
- `DELETE /tickets/:id` - 删除工单
- `GET /tickets/search/keyword` - 搜索工单

### 用户接口

- `POST /users` - 创建用户
- `GET /users` - 获取用户列表
- `GET /users/:id` - 获取用户详情
- `PUT /users/:id` - 更新用户
- `DELETE /users/:id` - 删除用户

### 认证接口

- `POST /auth/login` - 用户登录

## 开发指南

### 本地开发

#### 后端开发

1. 进入后端目录
   ```bash
   cd backend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run start:dev
   ```

#### 前端开发

1. 进入前端目录
   ```bash
   cd frontend
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```

### 开发环境配置

确保以下服务在开发环境中正常运行：

- PostgreSQL (默认端口: 5432)
- Elasticsearch (默认端口: 9200)

可以使用 Docker Compose 启动这些服务：

```bash
docker-compose up -d postgres elasticsearch
```

## 部署说明

### 生产环境部署

1. 修改 `docker-compose.yml` 中的环境变量配置
2. 更新 `.env` 文件中的生产环境配置
3. 启动服务
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

### 数据备份

#### PostgreSQL 备份

```bash
docker exec -t ticket-system-postgres pg_dump -U postgres ticket_system > backup.sql
```

#### Elasticsearch 备份

可以使用 Elasticsearch 的快照功能进行备份。

## 监控和日志

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 监控

- 使用 Kibana 监控 Elasticsearch: http://localhost:5601
- 使用 Docker 内置命令监控容器状态:
  ```bash
  docker stats
  ```

## 常见问题

1. **Elasticsearch 启动失败**
   - 检查内存是否足够
   - 确保 `elasticsearch_data` 数据卷权限正确

2. **数据库连接失败**
   - 检查 PostgreSQL 服务是否正常运行
   - 确认数据库配置信息正确

3. **前端无法访问后端 API**
   - 检查后端服务是否正常运行
   - 确认 CORS 配置正确

## 许可证

[MIT License]

## 贡献

欢迎提交 Issue 和 Pull Request 来改进项目。
