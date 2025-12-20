# 智能通勤路线规划工具

一个基于 Web 的智能通勤路线规划应用，支持步行、公交、地铁等多种出行方式，提供多种路线方案及地图可视化。

## 技术栈

### 前端
- Vue 3 (Composition API)
- TypeScript
- Vite
- Mapbox GL JS (地图渲染)

### 后端
- Node.js
- Express.js
- PostgreSQL (路线/站点数据存储)
- Redis (缓存)

## 主要功能

1. **多起点终点输入**：支持自定义通勤起点和终点
2. **多交通方式支持**：步行 / 公交 / 地铁 / 组合方案
3. **多条路线推荐**：基于时间、换乘次数、距离等推荐不同方案
4. **智能筛选**：支持"最快"、"最少换乘"等条件筛选
5. **地图可视化**：使用 Mapbox 地图高亮显示路线
6. **响应式缓存**：查询结果缓存提高响应速度

## 部署方式

### Docker 一键部署
```bash
cd /path/to/smart-commute-planner
docker-compose up -d
```

部署完成后：
- 前端访问地址：http://localhost:8080
- 后端 API 地址：http://localhost:3002/api

### 服务说明
- 前端服务：基于 Vue 3 和 Mapbox，负责用户界面和交互
- 后端服务：Node.js + Express，实现路线规划算法
- 数据库：PostgreSQL 存储路线和站点信息
- 缓存：Redis 缓存查询结果，提升系统性能

## 使用说明

1. **访问应用**：打开浏览器访问 http://localhost:8080
2. **输入起点终点**：在左侧侧边栏输入通勤的起点和终点
3. **选择出行方式**：可以选择步行、公交、地铁或全部
4. **选择路线偏好**：根据个人需求选择最快或最少换乘等
5. **查看推荐路线**：系统会在地图上展示多条路线方案
6. **选择路线**：点击任意路线方案查看路线详情和地图显示

## 项目结构
```
smart-commute-planner/
├── backend/              # Node.js 后端代码
│   ├── src/
│   │   └── server.js     # 服务主文件
│   ├── Dockerfile
│   └── package.json
├── frontend/             # Vue 3 前端代码
│   ├── src/
│   │   ├── App.vue      # 主应用组件
│   │   └── main.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.app.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```
