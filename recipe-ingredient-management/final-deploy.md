# 🚀 智能菜谱与食材管理系统 - 快速部署指南

## 系统概述
一个完整的智能菜谱管理和食材追踪应用，支持过期提醒、智能推荐等功能。

## 🌟 主要特性
- ✅ 完整的前后端功能
- ✅ 智能菜谱推荐算法
- ✅ 食材过期提醒
- ✅ 响应式设计（适配移动端）
- ✅ Docker 容器化部署

## 🚀 一键部署方案

### 使用 Docker 部署
1. 启动容器服务
   ```bash
   cd /Users/houwei/Documents/github/doubao-seed-code-preview/doubao-test/recipe-ingredient-management
   ```

2. 构建服务
   ```bash
   docker-compose up -d
   ```

3. 访问应用
   ```
   主地址: http://localhost:8082
   ```

## 🔧 手动部署

### 1. 安装 PostgreSQL
- 下载并安装 PostgreSQL 14+
- 创建数据库 `recipe_management`
- 运行 `database/schema.sql` 文件初始化数据

### 2. 安装 Redis
- 下载并安装 Redis 7+
- 启动 Redis 服务

### 3. 启动后端服务
```bash
cd backend
npm install
npm run start
```

### 4. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

### 5. 访问系统
```
前端: http://localhost:5174
后端 API: http://localhost:3004/api
```

## 📱 使用方法

### 1. 添加食材
- 进入「食材管理」页面
- 点击「添加食材」按钮
- 填写食材名称、数量、单位和过期日期

### 2. 查看过期提醒
- 进入「过期提醒」页面
- 查看已过期和即将过期的食材列表
- 及时处理过期食材

### 3. 获取菜谱推荐
- 系统自动根据现有食材推荐
- 使用「难度」和「烹饪时间」筛选
- 查看详细烹饪步骤

## 🐛 故障排除

### 问题：服务无法启动
**解决方案：**
检查端口是否被占用，主要检查：
- 后端: 3004
- 前端: 5174
- 数据库: 5433
- Redis: 6381

### 问题：API 调用失败
**解决方案：**
检查前端配置中的 `VITE_API_BASE_URL` 设置
确保指向正确的后端地址 `http://localhost:3004/api`

### 问题：Docker 构建失败
**解决方案：**
1. 更新 Docker 到最新版本
2. 确保网络稳定
3. 使用 `docker-compose build --no-cache` 重新构建

## 📞 支持

如需进一步帮助或遇到问题，请查看：
- 完整 README.md 文档
- 代码注释
- 或提交 Issue

---
**🎊 开始使用智能菜谱系统，告别食材浪费，享受烹饪乐趣！**
