# 城市停车位查询工具

一个基于 Vue3、Node.js、PostgreSQL 和 Mapbox GL 的智能城市停车位查询系统。

## 🚀 功能特性

- 🗺️ **交互式地图**：使用 Mapbox GL 展示停车场位置和实时信息
- 📊 **实时数据**：显示各停车场剩余车位数和总车位数
- 🔍 **智能筛选**：支持按价格筛选
- 📈 **车位预测**：基于时间模式的高峰时段车位数量预测
- 🚀 **高性能**：使用 Redis 缓存查询结果
- 🐳 **一键部署**：Docker Compose 快速部署
- 🔄 **现代化技术栈**：Vue3 + TypeScript + Node.js + PostgreSQL

## 🛠 技术栈

- **前端**：Vue3 + TypeScript + Vite + Mapbox GL
- **后端**：Node.js + Express + TypeScript
- **数据库**：PostgreSQL
- **缓存**：Redis
- **部署**：Docker Compose

## 📦 快速开始

### 1. 一键启动

```bash
cd parking-system
./start.sh
```

### 2. 或使用 Docker Compose

```bash
cd parking-system
docker-compose up -d
```

### 3. 访问应用

- 🌐 **前端应用**: http://localhost:5174
- 📡 **后端 API**: http://localhost:3004/api/health
- 🧪 **系统测试**: `node test-system.js`

## API 文档

### 获取所有停车场

```bash
GET http://localhost:3000/api/parking/lots
```

### 获取单个停车场信息

```bash
GET http://localhost:3000/api/parking/lots/:id
```

### 获取停车场实时可用车位

```bash
GET http://localhost:3000/api/parking/lots/:id/availability
```

### 获取车位预测

```bash
GET http://localhost:3000/api/parking/lots/:id/predict?hour=17
```

## 项目结构

```
parking-system/
├── backend/            # 后端服务
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── services/     # 业务逻辑
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/           # 前端应用
│   ├── src/
│   │   ├── components/   # Vue 组件
│   │   ├── styles/       # 样式文件
│   │   └── utils/        # 工具函数
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── db/                 # 数据库初始化
│   └── init.sql
├── docker-compose.yml  # Docker 配置
└── README.md
```

## 核心功能

### 1. 预测模型
后端使用基于历史数据和时间模式的预测算法，分析不同时段的车位使用率。

### 2. 缓存机制
使用 Redis 缓存查询结果，减少数据库负载，提高响应速度。

### 3. 地图渲染
Mapbox GL 提供流畅的地图体验，支持标记点自定义样式。

## 开发

### 本地开发

```bash
# 启动后端开发服务器
cd backend
npm run dev

# 启动前端开发服务器
cd frontend
npm run dev
```

### 构建生产版本

```bash
# 构建后端
cd backend
npm run build
npm start

# 构建前端
cd frontend
npm run build
npm run preview
```

## 部署说明

使用 Docker Compose 部署时，系统会自动创建并配置：
- 前端服务 (端口 5173)
- 后端服务 (端口 3000)
- PostgreSQL 数据库 (端口 5432)
- Redis 缓存 (端口 6379)

## 许可证

MIT