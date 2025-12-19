# 游戏资源地图查询系统 - 前端 Dockerfile

# 使用 Node.js 20 作为基础镜像 (支持 Vite 5.x)
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 Vue3 应用
RUN npm run build

# 暴露端口
EXPOSE 5173

# 启动开发服务器 (生产环境推荐使用 Nginx 部署静态文件)
CMD ["npm", "run", "dev"]
