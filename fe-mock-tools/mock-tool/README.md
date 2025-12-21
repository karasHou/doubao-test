# API Mock 工具

一个功能完整的前端接口 Mock 工具，支持多场景配置和动态参数。

## 技术栈

- **前端**: Vue3 + TypeScript + Vite
- **后端**: Node.js + Express
- **数据库**: PostgreSQL（预留）
- **缓存**: Redis（预留）
- **部署**: Docker + Docker Compose

## 主要功能

1. **Mock 规则管理**: 支持创建、编辑、删除 Mock 规则
2. **多场景支持**: 正常场景、异常场景、边界场景
3. **动态参数**: 支持从请求中获取参数并替换到响应中
4. **即时切换**: 一键切换当前 Mock 场景，更改即时生效
5. **多人协作**: 通过统一配置实现多人协作开发

## 快速开始

### 使用 Docker 部署（推荐）

```bash
# 进入项目目录
cd mock-tool

# 使用 Docker Compose 启动所有服务
docker-compose up -d
```

### 手动启动

#### 后端服务
```bash
cd backend
npm install
npm start
```

#### 前端服务
```bash
cd frontend
npm install
npm run dev
```

## 使用说明

### 1. 访问界面
打开浏览器访问: http://localhost:3000

### 2. 创建 Mock 规则
- 选择 HTTP 方法（GET/POST/PUT/DELETE）
- 输入接口路径（例如：/api/user/:id）
- 配置不同场景的响应：
  - 正常场景：返回 200 状态码和成功数据
  - 异常场景：返回 500 状态码和错误信息
  - 边界场景：返回 400 状态码和边界情况处理

### 3. 使用 Mock 接口
直接向 http://localhost:3001 发起请求，系统会根据当前选择的场景返回对应的 Mock 数据。

例如：
```bash
# 获取用户信息（正常场景）
curl -X GET http://localhost:3001/api/user/123

# 获取用户信息（异常场景）
# 先在界面切换到异常场景，再执行请求
curl -X GET http://localhost:3001/api/user/123
```

### 4. 动态参数
响应数据中可以使用 `{{param}}` 格式引用请求参数：
```json
{
  "user_id": "{{id}}",
  "message": "Hello {{name}}"
}
```

## 项目结构

```
mock-tool/
├── backend/           # Node.js 后端服务
│   ├── index.js      # 主服务文件
│   ├── package.json  # 后端依赖
│   └── Dockerfile    # 后端 Docker 配置
├── frontend/          # Vue3 前端应用
│   ├── src/          # 前端源码
│   │   ├── App.vue  # 主组件
│   │   └── main.js  # 入口文件
│   ├── package.json  # 前端依赖
│   └── Dockerfile    # 前端 Docker 配置
└── docker-compose.yml # Docker 编排文件
```

## 开发说明

- 后端服务运行在端口 3001
- 前端服务运行在端口 3000
- 前端通过代理访问后端 API
- 所有数据当前存储在内存中（重启后会丢失）

## 扩展计划

- [ ] 集成 PostgreSQL 数据库持久化存储
- [ ] 集成 Redis 缓存提升性能
- [ ] 添加用户认证和权限管理
- [ ] 支持团队协作和规则版本控制
- [ ] 添加接口测试和验证功能
- [ ] 支持更多数据格式和响应类型