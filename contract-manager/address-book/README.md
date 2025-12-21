# 通讯录管理工具

一个功能完整的通讯录管理工具，使用 React + Node.js + PostgreSQL + Elasticsearch 技术栈，支持联系人分组、标签、搜索、批量操作等功能。

## 功能特性

- 📇 **联系人管理**：添加、编辑、删除联系人信息
- 🏷️ **分组与标签**：灵活的联系人分类和标记系统
- 🔍 **智能搜索**：基于 Elasticsearch 的高性能全文搜索
- ⏰ **最近联系**：按最近联系时间排序
- 📋 **批量操作**：批量编辑和删除联系人
- 🐳 **Docker 部署**：一键部署所有服务

## 技术栈

- **前端**：React 18, Axios, CSS3
- **后端**：Node.js, Express, PostgreSQL
- **搜索**：Elasticsearch 8.11.0
- **部署**：Docker, Docker Compose

## 快速开始

### 1. 启动服务

```bash
cd address-book
docker-compose up -d
```

### 2. 访问应用

- 前端应用：http://localhost:3005
- 后端 API：http://localhost:3004

### 3. 使用功能

- 添加新联系人
- 使用搜索框搜索联系人
- 选择多个联系人进行批量编辑或删除
- 管理联系人分组和标签

## 项目结构

```
address-book/
├── frontend/           # React 前端应用
│   ├── public/         # 静态资源
│   ├── src/           # 源代码
│   │   ├── components/ # 组件目录
│   │   ├── App.js     # 主应用组件
│   │   └── index.js   # 入口文件
│   └── package.json   # 前端依赖
├── backend/           # Node.js 后端服务
│   ├── server.js      # 服务器入口
│   └── package.json   # 后端依赖
├── docker-compose.yml # Docker 配置
└── README.md         # 项目说明
```

## 主要 API 端点

- `GET /api/contacts` - 获取联系人列表
- `POST /api/contacts` - 创建新联系人
- `DELETE /api/contacts` - 批量删除联系人
- `PUT /api/contacts/batch` - 批量编辑联系人
- `GET /api/groups` - 获取所有分组
- `GET /api/tags` - 获取所有标签

## 开发说明

### 本地开发

1. 分别启动前端和后端服务：
   ```bash
   # 前端
   cd frontend
   npm start

   # 后端
   cd backend
   npm run dev
   ```

2. 确保 PostgreSQL 和 Elasticsearch 服务已启动

## 数据一致性

系统保证数据在 PostgreSQL 和 Elasticsearch 之间的一致性，所有数据修改操作都会同时更新两个数据源，确保搜索结果的准确性。
