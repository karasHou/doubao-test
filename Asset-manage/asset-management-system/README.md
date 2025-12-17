# 资产管理系统

一个完整的企业级资产管理系统，支持资产的全生命周期管理。

## 🚀 功能特性

- **资产入库**: 快速录入新资产信息
- **资产领用**: 管理资产的借用和分配
- **资产归还**: 跟踪资产的归还情况
- **使用人记录**: 完整记录资产使用人员信息
- **状态流转**: 资产状态实时更新（库存中、使用中、维修中、已报废）
- **报表导出**: 支持 Excel、PDF、CSV 三种格式的报表导出
- **数据统计**: 资产使用情况的实时统计和分析

## 🛠️ 技术栈

- **前端**: Vue3 + Element Plus + Vite
- **后端**: Node.js + Express + PostgreSQL
- **报表**: Python + openpyxl + fpdf
- **部署**: Docker + Docker Compose

## 📦 快速开始

### 环境要求

- Docker (版本 20.10 或更高)
- Docker Compose (版本 2.0 或更高)

### 一键部署

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd asset-management-system
   ```

2. **启动服务**
   ```bash
   # 使用 docker-compose 启动所有服务
   docker-compose up -d
   ```

3. **访问系统**
   - 前端界面: http://localhost
   - 后端 API: http://localhost:3001/api/health
   - 数据库: localhost:5432 (用户名: postgres, 密码: password)

### 手动部署（可选）

#### 后端部署

```bash
cd backend
npm install
npm run migrate  # 初始化数据库
npm start
```

#### 前端部署

```bash
cd frontend
npm install
npm run build  # 构建生产版本
npm run preview  # 预览生产版本
```

#### 报表服务

```bash
cd report
pip install -r requirements.txt
```

## 📁 项目结构

```
asset-management-system/
├── frontend/                # 前端 Vue3 项目
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── utils/           # 工具函数
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 入口文件
│   ├── public/              # 静态资源
│   ├── package.json         # 依赖配置
│   ├── vite.config.js       # Vite 配置
│   ├── Dockerfile           # 前端 Docker 配置
│   └── nginx.conf           # Nginx 配置
├── backend/                 # 后端 Node.js 项目
│   ├── src/
│   │   ├── routes/          # 路由定义
│   │   ├── models/          # 数据模型
│   │   ├── controllers/     # 控制器
│   │   ├── utils/           # 工具函数
│   │   ├── migrations/      # 数据库迁移
│   │   └── server.js        # 服务器入口
│   ├── package.json         # 依赖配置
│   ├── .env                 # 环境变量
│   └── Dockerfile           # 后端 Docker 配置
├── report/                  # Python 报表服务
│   ├── generate_report.py  # 报表生成脚本
│   └── requirements.txt     # Python 依赖
├── db/                      # 数据库配置
│   └── init.sql             # 数据库初始化脚本
├── docker/                  # Docker 相关配置
├── docker-compose.yml       # Docker Compose 配置
└── README.md                # 项目说明文档
```

## 🎯 使用指南

### 资产入库

1. 进入系统主页，点击左侧导航栏的 "资产入库"
2. 填写资产信息：
   - 资产编号（必填）
   - 资产名称（必填）
   - 资产分类（必填）
   - 购买日期（必填）
   - 价格（必填）
   - 供应商（可选）
   - 备注（可选）
3. 点击 "提交入库" 完成资产录入

### 资产领用

1. 进入系统主页，点击左侧导航栏的 "资产领用"
2. 在资产列表中选择要领用的资产
3. 点击 "办理领用"，填写领用信息：
   - 领用人员（必填）
   - 部门（必填）
   - 领用日期（必填）
   - 领用原因（可选）
4. 点击 "确认领用" 完成资产领用

### 资产归还

1. 进入系统主页，点击左侧导航栏的 "资产归还"
2. 在资产列表中选择要归还的资产
3. 点击 "办理归还"，填写归还信息：
   - 归还日期（必填）
   - 归还状态（必填：完好无损/轻微损坏/严重损坏/无法使用）
   - 备注（可选）
4. 点击 "确认归还" 完成资产归还

### 报表导出

1. 进入系统主页，点击左侧导航栏的 "报表导出"
2. 选择报表类型：
   - 资产总览
   - 使用中资产
   - 库存资产
   - 资产领用记录
   - 资产归还记录
3. 选择导出格式（Excel/PDF/CSV）
4. 可选：设置日期范围
5. 点击 "导出报表" 下载报表

## 🛠️ API 文档

### 资产管理 API

- `GET /api/assets` - 获取资产列表
- `GET /api/assets/:id` - 获取单个资产信息
- `POST /api/assets` - 创建新资产
- `PUT /api/assets/:id` - 更新资产信息
- `DELETE /api/assets/:id` - 删除资产
- `POST /api/assets/:id/transfer` - 领用资产
- `POST /api/assets/:id/return` - 归还资产

### 报表 API

- `GET /api/report/stats` - 获取资产统计信息
- `GET /api/report/assets` - 导出资产报表

## 🗄️ 数据库结构

### assets 表（资产表）

| 字段名         | 类型         | 描述               |
|----------------|--------------|--------------------|
| id             | SERIAL       | 资产 ID（主键）   |
| asset_number   | VARCHAR(50)  | 资产编号（唯一）   |
| name           | VARCHAR(100) | 资产名称           |
| category       | VARCHAR(50)  | 资产分类           |
| status         | VARCHAR(20)  | 资产状态           |
| user           | VARCHAR(100) | 使用人             |
| department     | VARCHAR(100) | 部门               |
| purchase_date  | DATE         | 购买日期           |
| price          | DECIMAL(10,2)| 价格               |
| supplier       | VARCHAR(100) | 供应商             |
| description    | TEXT         | 备注               |
| created_at     | TIMESTAMP    | 创建时间           |
| updated_at     | TIMESTAMP    | 更新时间           |

### asset_transfers 表（领用记录表）

| 字段名         | 类型         | 描述               |
|----------------|--------------|--------------------|
| id             | SERIAL       | 记录 ID（主键）   |
| asset_id       | INTEGER      | 资产 ID（外键）   |
| user           | VARCHAR(100) | 领用人员           |
| department     | VARCHAR(100) | 部门               |
| transfer_date  | DATE         | 领用日期           |
| reason         | TEXT         | 领用原因           |
| created_at     | TIMESTAMP    | 创建时间           |

### asset_returns 表（归还记录表）

| 字段名         | 类型         | 描述               |
|----------------|--------------|--------------------|
| id             | SERIAL       | 记录 ID（主键）   |
| asset_id       | INTEGER      | 资产 ID（外键）   |
| user           | VARCHAR(100) | 归还人员           |
| return_date    | DATE         | 归还日期           |
| condition      | VARCHAR(50)  | 归还状态           |
| notes          | TEXT         | 备注               |
| created_at     | TIMESTAMP    | 创建时间           |

## 🔧 开发指南

### 本地开发环境搭建

1. **安装依赖**
   ```bash
   # 前端依赖
   cd frontend
   npm install

   # 后端依赖
   cd ../backend
   npm install

   # Python 依赖
   cd ../report
   pip install -r requirements.txt
   ```

2. **启动开发服务**
   ```bash
   # 启动 PostgreSQL 数据库（可使用 Docker）
   docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

   # 启动后端服务
   cd backend
   npm run dev

   # 启动前端服务
   cd ../frontend
   npm run dev
   ```

3. **访问开发环境**
   - 前端: http://localhost:3000
   - 后端: http://localhost:3001
   - 数据库: localhost:5432

### 开发规范

- **前端**: 遵循 Vue3 Composition API 规范，使用 Element Plus 组件库
- **后端**: 遵循 RESTful API 设计规范，使用 Express 框架
- **数据库**: 使用 PostgreSQL，遵循 SQL 最佳实践
- **代码风格**: 统一使用 ESLint 和 Prettier 进行代码格式化

## 📝 更新日志

### v1.0.0 (2023-XX-XX)

- ✨ 新增资产入库功能
- ✨ 新增资产领用功能
- ✨ 新增资产归还功能
- ✨ 新增资产状态流转
- ✨ 新增使用人记录
- ✨ 新增报表导出功能（Excel/PDF/CSV）
- ✨ 新增数据统计功能
- 🐳 新增 Docker 一键部署
- 📚 新增项目文档

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送到分支: `git push origin feature/AmazingFeature`
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 常见问题

### Q: Docker 启动失败怎么办？

A: 请检查以下几点：
1. Docker 和 Docker Compose 是否已正确安装
2. 端口是否被占用（80、3001、5432）
3. 网络连接是否正常
4. 查看日志: `docker-compose logs [服务名]`

### Q: 如何重置数据库？

A: 执行以下命令：
```bash
# 停止服务
docker-compose down

# 删除数据库卷
docker volume rm asset-management-system_db_data

# 重新启动服务
docker-compose up -d
```

### Q: 报表导出功能无法使用怎么办？

A: 请检查以下几点：
1. 后端服务是否正常运行
2. Python3 是否已正确安装
3. 查看后端日志: `docker-compose logs backend`

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: [your-email@example.com]
- 项目地址: [GitHub Repository URL]

---

**注意**: 这是一个示例项目，用于演示完整的资产管理系统架构。在生产环境中使用前，请根据实际需求进行安全加固和性能优化。