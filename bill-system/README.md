# 个人账单管理与消费分析工具

一个功能完整的个人财务管理系统，提供消费记录录入、分类管理、统计分析等功能。

## 功能特性

- ✅ 日常支出录入
- ✅ 支持分类管理
- ✅ 标签系统
- ✅ 按时间维度统计
- ✅ 消费趋势图表
- ✅ 消费分类占比
- ✅ 条件过滤与查询
- ✅ Docker 一键部署

## 技术栈

- **前端**: React + TypeScript + ECharts
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **缓存**: Redis
- **部署**: Docker Compose

## 快速开始

### 环境要求

- Docker (19.03 或更高版本)
- Docker Compose (1.24 或更高版本)

### 启动应用

1. 克隆项目到本地：
   ```bash
   git clone <repository-url>
   cd bill-system
   ```

2. 一键启动所有服务：
   ```bash
   docker-compose up
   ```

3. 访问应用：
   - 前端应用: http://localhost:3000
   - 后端 API: http://localhost:3001

### 常用命令

- 启动服务: `docker-compose up`
- 后台启动: `docker-compose up -d`
- 停止服务: `docker-compose down`
- 重新构建: `docker-compose build`

## 项目结构

```
bill-system/
├── frontend/              # React 前端应用
│   ├── public/           # 静态资源
│   ├── src/              # 源代码
│   │   ├── components/  # React 组件
│   │   ├── App.tsx      # 主应用组件
│   │   └── index.tsx    # 入口文件
│   ├── Dockerfile       # 前端 Docker 配置
│   └── package.json     # 前端依赖
├── backend/              # Node.js 后端服务
│   ├── server.js        # 服务入口
│   ├── package.json     # 后端依赖
│   ├── init.sql         # 数据库初始化脚本
│   └── Dockerfile       # 后端 Docker 配置
├── docker-compose.yml   # Docker 编排文件
└── package.json         # 项目配置
```

## API 接口

- `GET /api/expenses` - 获取消费记录
- `POST /api/expenses` - 添加消费记录
- `GET /api/categories` - 获取分类列表
- `GET /api/stats/summary` - 获取消费统计
- `GET /api/stats/trend` - 获取消费趋势

## 数据模型

### Expenses (消费记录)
- id: 主键
- amount: 金额
- description: 描述
- category_id: 分类ID
- tags: 标签数组
- date: 日期

### Categories (分类)
- id: 主键
- name: 名称
- type: 类型 (expense/income)
- color: 颜色

## 性能优化

1. **缓存机制**: 使用 Redis 缓存统计数据，提升查询性能
2. **数据库索引**: 关键查询字段创建索引
3. **图表优化**: 使用 ECharts 异步加载和渲染优化
4. **API 优化**: 查询结果分页处理

## 开发说明

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
