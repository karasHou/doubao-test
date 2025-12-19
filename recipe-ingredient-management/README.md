# 智能菜谱与食材管理系统

一个完整的智能菜谱与食材管理系统，帮助用户管理家中食材库存，提供过期提醒，并根据现有食材推荐合适的菜谱。

## 🎯 功能特性

### 🥬 食材管理
- 添加/编辑/删除食材信息
- 食材分类管理
- 数量与单位记录
- 过期日期追踪

### ⏰ 过期提醒
- 已过期食材提醒
- 即将过期食材预警（3天内）
- 过期状态自动更新

### 🍳 智能推荐
- 根据现有食材智能匹配菜谱
- 多条件筛选（难度/烹饪时间/菜系）
- 推荐结果缓存优化
- 详细菜谱信息和步骤

### 📱 用户体验
- 响应式设计，完美适配手机
- 直观的操作界面
- 流畅的交互体验
- 现代化设计风格

## 🛠️ 技术栈

### 前端
- Vue3 + TypeScript
- Vite 快速构建
- Pinia 状态管理

### 后端
- Node.js + NestJS
- TypeORM 数据库操作
- PostgreSQL 数据存储
- Redis 缓存系统

### 部署
- Docker 容器化
- Docker Compose 一键部署
- Nginx 反向代理

## 🚀 快速开始

### 环境要求
- Docker (推荐版本 20+)
- Docker Compose

### 步骤 1: 启动服务
直接使用 Docker 一键部署：

```bash
cd /Users/houwei/Documents/github/doubao-seed-code-preview/doubao-test/recipe-ingredient-management
docker-compose up -d
```

### 步骤 2: 访问系统
服务启动成功后，访问以下地址：

- 🌐 **主应用界面**: http://localhost:8082
- 🛡️ **后端 API 测试**: http://localhost:3004/api/ingredients
- 📊 **数据库连接**: localhost:5433
- 💾 **Redis 缓存**: localhost:6381

### 步骤 3: 初始数据
系统已预设了一些示例数据：
- 食材: 西红柿、鸡蛋、面粉等
- 菜谱: 西红柿炒蛋等

## 📁 项目结构

```
recipe-ingredient-management/
├── backend/              # NestJS 后端服务
│   ├── src/
│   │   ├── ingredients/   # 食材管理模块
│   │   ├── recipes/       # 菜谱管理模块
│   │   ├── recommendations/ # 推荐算法
│   │   └── cache/        # Redis 缓存配置
│   └── Dockerfile
├── frontend/             # Vue3 前端应用
│   ├── src/
│   │   ├── components/   # 功能组件
│   │   ├── store/        # Pinia 状态管理
│   │   └── services/     # API 调用
│   └── Dockerfile
├── database/             # PostgreSQL 初始化脚本
├── nginx/               # Nginx 配置
└── docker-compose.yml   # 部署配置
```

## 📖 使用指南

### 食材管理
1. 在「食材管理」标签页可以添加新食材
2. 记录食材名称、数量、单位和过期日期
3. 系统会自动标记过期食材
4. 可以编辑或删除现有食材

### 过期提醒
1. 查看「过期提醒」标签页
2. 系统显示已过期和即将过期的食材
3. 及时处理避免浪费

### 菜谱推荐
1. 查看「菜谱推荐」标签页
2. 系统根据现有食材智能推荐
3. 支持按难度、烹饪时间筛选
4. 查看详细烹饪步骤

## 🔌 API 接口

### 食材管理 (Ingredients)
- `GET /api/ingredients` - 获取全部食材
- `POST /api/ingredients` - 添加新食材
- `DELETE /api/ingredients/{id}` - 删除食材
- `GET /api/ingredients/status/expired` - 获取已过期食材

### 菜谱 (Recipes)
- `GET /api/recipes` - 获取菜谱列表
- `GET /api/recipes/{id}` - 查看详细菜谱
- `GET /api/recipes?difficulty=简单` - 按难度筛选

### 智能推荐 (Recommendations)
- `GET /api/recommendations` - 获取推荐菜谱
- `GET /api/recommendations/by-ingredients?ingredient_ids=1,2` - 指定食材推荐

## 📝 自定义开发

### 本地开发环境
如需自定义开发，可以使用以下命令：

#### 启动后端开发
```bash
cd backend
npm install
npm run start:dev
```

#### 启动前端开发
```bash
cd frontend
npm install
npm run dev
```

### 配置项
主要环境变量在 `docker-compose.yml` 中：
- `POSTGRES_PASSWORD`: 数据库密码
- `REDIS_PASSWORD`: Redis 密码
- `VITE_API_BASE_URL`: API 地址

## 🔧 常见问题

### 问题 1: 服务启动失败
**解决**: 检查端口是否被占用，特别是 3004, 5174, 8082 端口

### 问题 2: 前端无法访问后端 API
**解决**: 检查 `VITE_API_BASE_URL` 配置，确保指向正确的后端地址

### 问题 3: 数据库连接失败
**解决**: 确保 `postgres` 服务已正常启动，检查环境变量配置

## 📄 License
MIT License - 可自由使用和修改

## 🤝 贡献
欢迎提交 Issue 和 Pull Request！
