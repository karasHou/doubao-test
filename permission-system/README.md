# 权限系统

一个基于 Vue3 + NestJS + PostgreSQL + Redis 的完整权限系统，同时支持 RBAC 和 ABAC 权限模型。

## 技术栈

### 前端
- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vue Router 4**: 官方路由管理库
- **Pinia**: 新一代状态管理库
- **Axios**: HTTP 客户端库

### 后端
- **Node.js**: JavaScript 运行时环境
- **NestJS**: 企业级 Node.js 框架
- **TypeORM**: TypeScript 兼容的 ORM 库
- **PostgreSQL**: 关系型数据库
- **Redis**: 缓存数据库
- **JWT**: 身份验证机制
- **bcryptjs**: 密码加密库

## 功能特性

### 权限模型
- ✅ **RBAC**: 基于角色的访问控制
- ✅ **ABAC**: 基于属性的动态策略控制

### 权限控制
- ✅ **路由级权限**: 动态生成可访问路由
- ✅ **按钮级权限**: 细粒度的操作权限控制
- ✅ **权限快照**: 登录时一次性拉取所有权限信息

### 核心功能
- ✅ **用户管理**: 用户的增删改查和角色分配
- ✅ **角色管理**: 角色的增删改查和权限分配
- ✅ **权限管理**: 权限的增删改查
- ✅ **策略管理**: ABAC 策略的管理
- ✅ **登录认证**: JWT 方式的身份验证

### 性能优化
- ✅ **Redis 缓存**: 权限快照和其他热点数据缓存
- ✅ **权限预加载**: 登录时一次性加载所有权限

## 项目结构

```
permission-system/
├── backend/                 # 后端代码目录
│   ├── src/
│   │   ├── main.ts         # 应用入口文件
│   │   ├── app.module.ts   # 根模块
│   │   ├── modules/        # 业务模块目录
│   │   │   ├── auth/       # 认证模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── role/       # 角色模块
│   │   │   ├── permission/ # 权限模块
│   │   │   └── policy/     # 策略模块
│   │   └── shared/         # 共享模块目录
│   │       └── redis/      # Redis 缓存模块
│   ├── docs/                # 文档目录
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # 前端代码目录
│   ├── src/
│   │   ├── main.ts         # 应用入口文件
│   │   ├── App.vue         # 根组件
│   │   ├── router/         # 路由配置
│   │   ├── store/          # 状态管理
│   │   ├── components/      # 通用组件
│   │   ├── views/           # 页面组件
│   │   ├── directives/      # 自定义指令
│   │   ├── utils/           # 工具函数
│   │   └── types/           # 类型定义
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md                 # 项目说明文档
```

## 数据模型

### 核心表结构
- **users**: 用户表
- **roles**: 角色表
- **permissions**: 权限表
- **policies**: ABAC 策略表
- **user_roles**: 用户角色关联表
- **role_permissions**: 角色权限关联表
- **user_policies**: 用户策略关联表
- **role_policies**: 角色策略关联表

详细的数据模型设计请参考 `backend/docs/permission-model.md`。

## 快速开始

### 环境要求
- **Node.js**: >= 16.0.0
- **PostgreSQL**: >= 12.0
- **Redis**: >= 5.0

### 安装依赖

#### 后端
```bash
cd backend
npm install
```

#### 前端
```bash
cd frontend
npm install
```

### 配置环境变量

#### 后端
在 `backend` 目录下创建 `.env` 文件：
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=permission_system

# Redis 配置
REDIS_URL=redis://localhost:6379

# JWT 配置
JWT_SECRET=your-secret-key

# 运行环境
NODE_ENV=development
```

#### 前端
在 `frontend` 目录下创建 `.env` 文件：
```bash
# API 基础地址
VITE_API_BASE_URL=http://localhost:3000

# 开发模式
VITE_MODE=development
```

### 数据库初始化

1. 创建 PostgreSQL 数据库：
```sql
CREATE DATABASE permission_system;
```

2. 运行 TypeORM 自动迁移：
```bash
cd backend
npm run typeorm migration:run
```

### 启动应用

#### 后端
```bash
cd backend
npm run start:dev
```
后端服务将在 `http://localhost:3000` 启动。

#### 前端
```bash
cd frontend
npm run dev
```
前端应用将在 `http://localhost:5173` 启动。

## API 文档

### 认证相关
- `POST /auth/login`: 用户登录
- `POST /auth/logout`: 用户登出
- `GET /auth/profile`: 获取用户信息
- `GET /auth/permissions`: 获取用户权限

### 用户管理
- `GET /users`: 获取用户列表
- `POST /users`: 创建用户
- `GET /users/:id`: 获取用户详情
- `PATCH /users/:id`: 更新用户
- `DELETE /users/:id`: 删除用户
- `POST /users/:id/roles`: 为用户分配角色
- `DELETE /users/:id/roles/:roleId`: 移除用户角色

### 角色管理
- `GET /roles`: 获取角色列表
- `POST /roles`: 创建角色
- `GET /roles/:id`: 获取角色详情
- `PATCH /roles/:id`: 更新角色
- `DELETE /roles/:id`: 删除角色
- `POST /roles/:id/permissions`: 为角色分配权限
- `DELETE /roles/:id/permissions/:permissionId`: 移除角色权限
- `POST /roles/:id/policies`: 为角色分配策略
- `DELETE /roles/:id/policies/:policyId`: 移除角色策略

### 权限管理
- `GET /permissions`: 获取权限列表
- `POST /permissions`: 创建权限
- `GET /permissions/:id`: 获取权限详情
- `PATCH /permissions/:id`: 更新权限
- `DELETE /permissions/:id`: 删除权限

### 策略管理
- `GET /policies`: 获取策略列表
- `POST /policies`: 创建策略
- `GET /policies/:id`: 获取策略详情
- `PATCH /policies/:id`: 更新策略
- `DELETE /policies/:id`: 删除策略
- `POST /policies/:id/users`: 为用户分配策略
- `DELETE /policies/:id/users/:userId`: 移除用户策略
- `POST /policies/evaluate`: 评估策略

## 权限控制

### 前端权限控制

#### 路由级权限
在 `router/index.ts` 中通过 `meta.requiresAuth` 和 `meta.permission` 配置路由权限：
```typescript
{
  path: '/users',
  name: 'UserManagement',
  component: () => import('../views/UserManagement.vue'),
  meta: { 
    title: '用户管理', 
    requiresAuth: true, 
    permission: 'user:manage' 
  },
}
```

#### 按钮级权限
使用 `v-permission` 指令控制按钮显示：
```vue
<button v-permission="'user:create'">新增用户</button>
<button v-permission="['user:update', 'user:delete']">编辑/删除</button>
```

### 后端权限控制

#### 认证守卫
使用 `JwtAuthGuard` 保护需要登录的接口：
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user;
}
```

#### 权限守卫
自定义权限守卫验证用户是否具有特定权限：
```typescript
@UseGuards(PermissionGuard('user:manage'))
@Get('users')
async findAll() {
  return this.userService.findAll();
}
```

## ABAC 策略引擎

### 策略结构
```typescript
interface Policy {
  id: number;
  name: string;
  code: string;
  effect: 'allow' | 'deny';
  conditions: any;
  actions: string[];
  resources: string[];
}
```

### 策略示例
```json
{
  "name": "管理员可以查看所有用户",
  "code": "admin-view-all-users",
  "effect": "allow",
  "conditions": {
    "and": [
      { "attribute": "user.role", "operator": "eq", "value": "admin" }
    ]
  },
  "actions": ["view"],
  "resources": ["user:*"]
}
```

## 缓存机制

### 权限快照缓存
用户登录时生成权限快照并存储在 Redis 中，缓存有效期为 24 小时：
```typescript
{
  userId: 1,
  roles: [...],
  permissions: [...],
  policies: [...],
  createdAt: 1234567890,
  expiresAt: 1234654290
}
```

### 缓存管理
- `generateSnapshot(userId: number)`: 生成权限快照
- `getSnapshot(userId: number)`: 获取权限快照
- `clearSnapshot(userId: number)`: 清除指定用户快照
- `clearAllSnapshots()`: 清除所有快照

## 部署说明

### 生产环境部署

#### 后端
```bash
cd backend
npm run build
node dist/main
```

#### 前端
```bash
cd frontend
npm run build
# 使用 Nginx 或其他静态文件服务器部署
```

### Docker 部署
（可选）可以使用 Docker Compose 一键部署整个应用：
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: permission_system
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: postgres
      DB_PASSWORD: password
      DB_NAME: permission_system
      REDIS_URL: redis://redis:6379
      JWT_SECRET: your-secret-key
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE_URL: http://backend:3000
      VITE_MODE: production
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

## 开发指南

### 代码规范
- **TypeScript**: 严格的类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化

### 提交规范
遵循 Conventional Commits 规范：
```
<type>(<scope>): <subject>

<body>

<footer>
```

常见的 type 有：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式更改
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或工具相关

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## License

MIT License

## Contact

如有问题或建议，请联系：
- 项目地址: https://github.com/your-username/permission-system
- 邮箱: your-email@example.com
