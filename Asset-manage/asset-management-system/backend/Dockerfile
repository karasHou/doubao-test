FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 安装 Python3 和必要的库
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --upgrade pip --break-system-packages && \
    pip3 install openpyxl fpdf --break-system-packages

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["npm", "start"]