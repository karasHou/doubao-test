# 二手物品管理工具

一个功能完整的二手物品管理系统，支持物品录入、自动估价、分类筛选和价格趋势分析。

## 技术栈

- **前端**: Vue3 + Vite + Element Plus
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **缓存**: Redis
- **部署**: Docker + Docker Compose

## 功能特性

1. **物品管理**
   - 录入新物品信息
   - 查看物品列表
   - 删除不需要的物品
   - 按分类筛选

2. **自动估价系统**
   - 基于物品状况和购买日期自动估算价格
   - 可扩展的估价算法架构
   - 支持自定义估价规则

3. **价格趋势分析**
   - 记录物品价格历史
   - 可视化价格变动趋势
   - 图表展示价格走势

4. **性能优化**
   - Redis 缓存提升列表性能
   - 数据库索引优化
   - 前端虚拟列表（待实现）

## 快速开始

### 一键部署

确保你已经安装了 Docker 和 Docker Compose。

```bash
cd second-hands-goods
docker-compose up -d
```

访问应用：
- 前端界面: http://localhost
- 后端 API: http://localhost:3000/api

### 手动启动

#### 后端启动

```bash
cd backend
npm install
npm run dev
```

#### 前端启动

```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
second-hands-goods/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── models/         # 数据模型
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑服务
│   │   ├── estimators/     # 估价器插件
│   │   └── server.js       # 主服务器文件
│   ├── init.sql           # 数据库初始化脚本
│   ├── package.json       # 依赖配置
│   └── Dockerfile         # 后端容器配置
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── utils/         # 工具函数
│   │   ├── App.vue        # 主应用组件
│   │   └── main.js        # 入口文件
│   ├── index.html         # HTML 模板
│   ├── package.json       # 依赖配置
│   ├── vite.config.js     # Vite 配置
│   ├── nginx.conf        # Nginx 配置
│   └── Dockerfile        # 前端容器配置
├── docker-compose.yml     # Docker 一键部署配置
└── README.md             # 项目说明
```

## API 接口

### 物品管理
- `GET /api/items` - 获取物品列表
- `POST /api/items` - 创建新物品
- `GET /api/items/:id` - 获取单个物品
- `PUT /api/items/:id` - 更新物品信息
- `DELETE /api/items/:id` - 删除物品
- `GET /api/items/:id/price-history` - 获取价格历史

### 分类管理
- `GET /api/categories` - 获取分类列表

## 自定义估价

估价系统采用插件化设计，你可以通过继承 `BaseEstimator` 类来实现自定义估价规则。

```javascript
const BaseEstimator = require('./base-estimator');

class MyEstimator extends BaseEstimator {
  async estimate(item) {
    // 自定义估价逻辑
  }
}
```

## 开发

### 开发环境
- Node.js >= 16.0
- PostgreSQL >= 13
- Redis >= 6

### 数据库配置
修改 `backend/.env` 文件配置数据库连接信息。

## 许可证

MIT