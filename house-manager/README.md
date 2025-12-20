# 房屋租赁信息聚合工具

一个功能完善的房屋租赁信息聚合平台，支持多条件筛选、排序、列表和地图两种展示模式，并集成了搜索和缓存功能，使用 Docker 一键部署。

## 技术栈

- **前端**: Vue3 + Vite + Axios
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **搜索**: Elasticsearch
- **缓存**: Redis
- **部署**: Docker + Docker Compose

## 功能特性

### 核心功能
- 📋 **房源列表展示** - 完整展示所有房源信息
- 🗺️ **地图模式展示** - 直观的地图标记和位置显示
- 🔍 **多条件筛选** - 支持价格、户型、位置等筛选
- ⬆️ **排序功能** - 支持价格升降序排序
- 🔄 **视图切换** - 列表和地图模式无缝切换

### 性能优化
- 🔥 **热门查询缓存** - 使用 Redis 缓存高频请求
- ⚡ **搜索优化** - 集成 Elasticsearch 提供高效搜索
- 📊 **数据库优化** - PostgreSQL 索引和查询优化

## 快速开始

### 环境要求
- Docker 19.03+
- Docker Compose 1.24+

### 启动项目

1. **进入项目目录**
   ```bash
   cd house-manager
   ```

2. **一键启动所有服务**
   ```bash
   docker-compose up -d
   ```

3. **访问应用**
   - 主应用: http://localhost
   - 后端 API: http://localhost:3000
   - 前端开发服务: http://localhost:5173

### 服务结构

| 服务           | 端口 | 说明                  |
|----------------|------|-----------------------|
| frontend       | 5173 | Vue3 前端应用         |
| backend        | 3000 | Node.js 后端 API      |
| nginx          | 80   | 反向代理              |
| postgres       | 5432 | 关系型数据库          |
| redis          | 6379 | 缓存服务              |
| elasticsearch  | 9200 | 搜索服务              |

## 项目结构

```
house-manager/
├── backend/           # Node.js 后端代码
│   ├── package.json   # 后端依赖
│   ├── server.js      # 服务器主文件
│   └── Dockerfile     # 后端 Docker 配置
├── frontend/          # Vue3 前端代码
│   ├── src/           # 源代码
│   │   ├── App.vue    # 主组件
│   │   └── main.js    # 应用入口
│   ├── package.json   # 前端依赖
│   └── Dockerfile     # 前端 Docker 配置
├── nginx/             # Nginx 配置
│   └── nginx.conf     # 反向代理配置
├── data/              # 数据存储目录
│   ├── postgres/      # PostgreSQL 数据
│   └── elasticsearch/ # Elasticsearch 数据
├── docker-compose.yml # Docker 服务编排
└── README.md          # 项目说明
```

## API 接口

### 获取房源列表
```
GET /api/houses?minPrice=5000&maxPrice=10000&rooms=2
```

### 获取单个房源
```
GET /api/houses/:id
```

## 使用说明

1. **筛选功能**: 使用左侧边栏的筛选条件，可以按价格、户型、位置进行筛选
2. **排序功能**: 通过排序下拉菜单选择价格升降序
3. **视图切换**: 点击顶部的"列表模式"和"地图模式"按钮切换展示方式
4. **应用筛选**: 设置好筛选条件后点击"应用筛选"按钮

## 未来规划

- [ ] 用户注册和登录系统
- [ ] 房源收藏功能
- [ ] 搜索历史记录
- [ ] 智能推荐
- [ ] 移动端适配
- [ ] 高级搜索功能

## 许可证

MIT
