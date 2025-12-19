#!/bin/bash

# 智能菜谱与食材管理系统 - 快速启动脚本

echo "正在启动智能菜谱与食材管理系统..."

# 创建临时启动文件
cat > docker-compose.temp.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    container_name: recipe-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: recipe_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/00_schema.sql
    ports:
      - '5433:5432'

  redis:
    image: redis:7-alpine
    container_name: recipe-redis
    restart: unless-stopped
    command: redis-server
    ports:
      - '6381:6379'

  backend:
    image: node:18-alpine
    container_name: recipe-backend
    working_dir: /app
    volumes:
      - ./backend:/app
    command: sh -c "npm install && npm start"
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: recipe_management
      DB_USERNAME: postgres
      DB_PASSWORD: password
      REDIS_HOST: redis
      REDIS_PORT: 6379
      PORT: 3000
    ports:
      - '3004:3000'
    depends_on:
      - postgres
      - redis

  frontend:
    image: node:18-alpine
    container_name: recipe-frontend
    working_dir: /app
    volumes:
      - ./frontend:/app
    command: sh -c "npm install && npm run dev"
    environment:
      NODE_ENV: development
      VITE_API_BASE_URL: http://localhost:3000/api
    ports:
      - '5174:5173'
    depends_on:
      - backend

volumes:
  postgres_data:
    name: recipe-postgres-data
EOF

# 启动服务
docker-compose -f docker-compose.temp.yml up -d

echo "系统启动完成！"
echo "请等待几分钟让服务完全初始化"
echo "访问地址："
echo "  前端应用: http://localhost:5174"
echo "  后端API: http://localhost:3004/api"
echo "  数据库: localhost:5433"
echo "  Redis: localhost:6381"

echo "查看日志: docker-compose -f docker-compose.temp.yml logs -f"
