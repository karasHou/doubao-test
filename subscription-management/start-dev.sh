#!/bin/bash

echo "启动订阅服务管理工具 (开发模式)"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "请先安装 Node.js"
    exit 1
fi

# 启动后端服务
echo "启动后端服务..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi
npm start &
BACKEND_PID=$!
cd ..

# 等待后端服务启动
sleep 5

# 启动前端服务
echo "启动前端服务..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi
BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

echo "服务已启动!"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
wait $BACKEND_PID $FRONTEND_PID