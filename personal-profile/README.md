# 学习资料管理工具

一个功能完善的学习资料管理工具，支持上传、标签分类、全文搜索和最近访问排序。

## 技术栈

- **前端**: React 18
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **搜索**: Elasticsearch
- **部署**: Docker Compose

## 功能特性

- ✅ 学习资料上传
- ✅ 标签与分类管理
- ✅ 全文搜索（Elasticsearch 驱动）
- ✅ 最近访问排序
- ✅ Docker 一键部署
- ✅ 支持大量数据扩展

## 快速开始

### 1. 部署服务

```bash
docker-compose up
```

### 2. 访问应用

应用启动后，您可以通过以下地址访问：

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:3001

### 3. 使用功能

- 在上传区域上传学习资料
- 使用搜索框搜索资料
- 使用标签和分类管理资料
- 最近访问的资料会优先显示

## 项目结构

```
learning-material-manager/
├── backend/                # Node.js 后端
│   ├── server.js         # 主服务文件
│   ├── package.json      # 依赖配置
│   ├── Dockerfile        # 后端容器配置
│   └── init.sql          # 数据库初始化脚本
├── frontend/              # React 前端
│   ├── src/              # 源代码
│   │   ├── App.js       # 主应用组件
│   │   └── index.js     # 入口文件
│   ├── package.json      # 依赖配置
│   ├── Dockerfile        # 前端容器配置
│   └── public/           # 静态资源
└── docker-compose.yml    # 多容器部署配置
```

## API 接口

- `POST /api/materials`: 上传新资料
- `GET /api/materials`: 获取资料列表（支持搜索参数）
- `POST /api/categories`: 创建新分类
- `GET /api/categories`: 获取分类列表
- `GET /api/tags`: 获取标签列表
- `PUT /api/materials/:id/access`: 更新访问时间

## 搜索功能

使用 Elasticsearch 实现全文搜索，支持：
- 标题搜索（权重更高）
- 描述搜索
- 标签搜索
- 多字段匹配

## 数据持久化

所有数据都持久化存储在 PostgreSQL 数据库中，Elasticsearch 作为搜索索引。

## 许可证

MIT License