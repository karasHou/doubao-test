# 基础镜像
FROM node:18-alpine as builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建生产环境代码
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制构建后的代码
COPY --from=builder /app/dist ./dist

# 复制 package.json 和 package-lock.json
COPY --from=builder /app/package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "start:prod"]
