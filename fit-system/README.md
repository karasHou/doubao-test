# Fit System - 健身训练计划工具

一个完整的健身训练计划管理系统，支持训练计划制定、训练数据记录、强度动态调整和周期性统计功能。

## 技术栈

- **前端**: Vue3 + Vite + TailwindCSS
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **缓存**: Redis
- **部署**: Docker + Docker Compose

## 功能特性

### 1. 训练计划制定
- 创建、编辑、删除训练计划
- 定义训练周期和强度级别
- 配置具体训练项目

### 2. 训练数据记录
- 记录每次训练的详细数据
- 记录训练表现评分
- 添加训练备注

### 3. 强度动态调整
- 根据训练记录智能调整强度
- 基于表现评分优化训练计划

### 4. 周期性统计
- 提供周度、月度训练统计
- 训练进度可视化
- 运动项目频率分析

## 快速开始

### 环境要求
- Docker
- Docker Compose

### 启动项目

1. 进入项目目录
2. 启动所有服务：
```bash
docker-compose up -d --build
```

3. 访问应用：
- 前端应用: http://localhost:8080
- 后端 API: http://localhost:3000

### 停止项目
```bash
docker-compose down
```

## 项目结构

```
fit-system/
├── docker-compose.yml      # Docker Compose 配置
├── backend/               # 后端代码目录
│   ├── Dockerfile        # 后端 Docker 配置
│   ├── package.json      # 后端依赖配置
│   └── src/              # 后端源代码
│       ├── app.js       # 主应用文件
│       ├── models/      # 数据库模型
│       ├── routes/      # API 路由
│       └── services/    # 业务服务
└── frontend/             # 前端代码目录
    ├── Dockerfile       # 前端 Docker 配置
    ├── package.json     # 前端依赖配置
    ├── src/             # 前端源代码
    │   ├── components/ # Vue 组件
    │   ├── services/   # API 服务
    │   └── App.vue     # 主应用组件
    ├── vite.config.js  # Vite 配置
    └── nginx.conf      # Nginx 配置
```

## API 端点

### 训练计划
- `GET /api/plans` - 获取所有训练计划
- `GET /api/plans/:id` - 获取单个训练计划
- `POST /api/plans` - 创建新训练计划
- `PUT /api/plans/:id` - 更新训练计划
- `DELETE /api/plans/:id` - 删除训练计划

### 训练记录
- `GET /api/records` - 获取所有训练记录
- `GET /api/records/:id` - 获取单个训练记录
- `POST /api/records` - 创建新训练记录
- `PUT /api/records/:id` - 更新训练记录
- `DELETE /api/records/:id` - 删除训练记录

### 统计数据
- `GET /api/stats/weekly` - 获取周度统计
- `GET /api/stats/monthly` - 获取月度统计
- `GET /api/stats/progress` - 获取训练进度
- `GET /api/stats/exercise-frequency` - 获取运动频率统计

## 开发

如需在本地开发，请分别启动前后端服务：

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
npm run dev
```

## 许可证

MIT
