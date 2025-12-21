# 购物清单与比价工具

一个功能完整的购物清单与比价工具，支持商品管理、价格对比、历史价格追踪等功能。

## 功能特性

- 📋 **购物清单管理**: 添加和管理需要购买的商品
- 📊 **同类商品比价**: 在不同平台间比较相同商品的价格
- 📈 **历史价格趋势**: 查看商品价格的历史变化
- 🔍 **条件筛选**: 按分类、平台等筛选商品
- ⬆️ **排序功能**: 按价格、名称等排序
- 🚀 **高性能**: 使用 Redis 缓存提高查询速度

## 技术栈

- **前端**: Vue3 + Vite + Axios
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **缓存**: Redis
- **部署**: Docker Compose

## 快速开始

### 1. 启动服务

```bash
docker-compose up -d --build
```

### 2. 访问应用

- 前端应用: http://localhost:3000
- 后端 API: http://localhost:3001

### 3. 停止服务

```bash
docker-compose down
```

## 项目结构

```
shop-compare/
├── frontend/          # Vue3 前端应用
│   ├── src/
│   │   └── App.vue    # 主组件
│   ├── package.json
│   └── Dockerfile
├── backend/           # Node.js 后端服务
│   ├── server.js      # 服务入口
│   ├── package.json
│   └── Dockerfile
├── db/                # 数据库配置
│   └── init.sql       # 初始化脚本
├── docker-compose.yml # Docker 配置
└── README.md
```

## API 接口

- `GET /api/products`: 获取所有商品
- `POST /api/products`: 添加新商品
- `GET /api/categories`: 获取商品分类
- `GET /api/stores`: 获取购买平台列表

## 数据结构

- **商品表 (products)**: 存储商品基本信息
- **价格历史表 (price_history)**: 存储商品价格历史记录