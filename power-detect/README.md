# 家庭能耗监控系统

一个完整的家庭能耗监控工具，使用 React、Node.js、TimescaleDB 和 Docker 构建。

## 功能特性

- 📊 **能耗曲线展示**: 使用 Chart.js 实时显示设备能耗数据
- ⚡ **实时数据更新**: WebSocket 技术实现数据实时推送
- 📈 **时间段统计**: 支持按小时、日、周、月统计能耗
- 🚨 **异常能耗提醒**: 自动检测并提醒异常能耗
- 🐳 **Docker 一键部署**: 使用 Docker Compose 轻松部署

## 技术栈

- **前端**: React 18 + Chart.js
- **后端**: Node.js + Express + WebSocket
- **数据库**: TimescaleDB (PostgreSQL)
- **部署**: Docker + docker-compose

## 快速开始

### 1. 克隆项目

```bash
git clone <项目地址>
cd power-detect
```

### 2. 启动服务

```bash
docker-compose up -d
```

### 3. 访问应用

- 前端应用: http://localhost:3000
- 后端 API: http://localhost:3001/api

## 项目结构

```
power-detect/
├── frontend/           # React 前端应用
├── backend/            # Node.js 后端服务
├── db/                 # 数据库配置和初始化脚本
├── docker-compose.yml  # Docker Compose 配置
└── README.md
```

## 主要功能说明

### 能耗监控
- 实时显示各设备的功率和能耗数据
- 支持查看不同时间段的能耗曲线
- 多设备数据对比

### 异常提醒
- 当设备功率超过阈值时自动触发提醒
- 记录所有异常事件
- 实时推送通知

### 统计分析
- 按小时/日/周/月统计能耗
- 平均功率和总能耗计算
- 历史数据查询

## API 接口

- `GET /api/devices` - 获取设备列表
- `GET /api/energy/history` - 获取能耗历史数据
- `GET /api/energy/stats/:period` - 获取能耗统计
- `GET /api/alerts` - 获取异常提醒

## 开发

### 前端开发
```bash
cd frontend
npm install
npm start
```

### 后端开发
```bash
cd backend
npm install
npm run dev
```

## 许可证

MIT
