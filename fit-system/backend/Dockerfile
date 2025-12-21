FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# 添加随机哈希，强制 Docker 重新构建以下步骤
ARG CACHEBUST=$(date +%s)
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
