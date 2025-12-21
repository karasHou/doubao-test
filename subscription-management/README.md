# 订阅服务管理工具

一个功能完善的订阅服务管理工具，帮助您轻松管理各类订阅服务，自动计算月度/年度支出，并提供到期提醒。

## 功能特性

- 📝 **订阅管理**: 添加、编辑、删除各类订阅服务
- 💰 **费用统计**: 自动计算月度/年度总支出
- 📅 **到期提醒**: 基于 cron 任务的自动扣费提醒
- 📊 **状态管理**: 支持活跃/暂停/取消等多种订阅状态
- 🐳 **一键部署**: 使用 Docker Compose 快速部署整个应用

## 技术栈

- **前端**: React 18 + Axios + CSS3
- **后端**: Node.js + Express + node-cron
- **数据库**: 内存存储（可扩展为 PostgreSQL）
- **容器化**: Docker + Docker Compose

## 快速开始

### 1. 启动 Docker

确保您的系统已安装 Docker 并处于运行状态。

### 2. 部署应用

```bash
cd subscription-management
docker-compose up -d --build
```

### 3. 访问应用

应用启动后，在浏览器中访问:
- 前端界面: http://localhost:80
- 后端 API: http://localhost:3001

## 项目结构

```
subscription-management/
├── backend/                 # Node.js 后端服务
│   ├── package.json         # 后端依赖配置
│   ├── server.js           # 主服务文件
│   └── Dockerfile          # 后端 Docker 配置
├── frontend/               # React 前端应用
│   ├── public/
│   │   └── index.html      # HTML 模板
│   ├── src/
│   │   ├── App.js         # 主应用组件
│   │   ├── App.css        # 样式文件
│   │   └── index.js       # 入口文件
│   ├── package.json       # 前端依赖配置
│   ├── Dockerfile         # 前端 Docker 配置
│   └── nginx.conf        # Nginx 配置
└── docker-compose.yml     # Docker Compose 配置
```

## API 接口

- `GET /api/subscriptions` - 获取所有订阅
- `POST /api/subscriptions` - 添加新订阅
- `PUT /api/subscriptions/:id` - 更新订阅信息
- `DELETE /api/subscriptions/:id` - 删除订阅
- `GET /api/stats` - 获取统计信息

## 使用说明

1. **添加订阅**: 点击 "添加订阅" 按钮，填写服务名称、类型、金额等信息
2. **查看统计**: 页面顶部显示月度支出、年度支出和活跃订阅数量
3. **管理订阅**: 可以编辑或删除现有订阅
4. **状态管理**: 支持将订阅设置为活跃、暂停或取消状态

## 注意事项

- 数据当前存储在内存中，重启服务会丢失数据
- 生产环境建议配置 PostgreSQL 数据库
- 定时任务每天凌晨 0 点执行，检查即将到期的订阅
- 如需修改端口配置，可编辑 docker-compose.yml 文件

## 未来规划

- [ ] 集成 PostgreSQL 数据库
- [ ] 添加用户认证功能
- [ ] 支持邮件/短信提醒
- [ ] 数据导出功能
- [ ] 订阅使用分析图表