#!/bin/bash

# 电商购物车系统启动脚本

echo "============================================"
echo "  电商购物车系统"
echo "============================================"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"
echo ""

# 启动后端
echo "🚀 启动后端服务..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 安装后端依赖..."
    npm install
fi

echo "▶️  启动后端服务器 (端口: 3000)"
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "✅ 后端服务启动成功 (PID: $BACKEND_PID)"
echo ""

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端
echo "🚀 启动前端服务..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 安装前端依赖..."
    npm install
fi

echo "▶️  启动前端开发服务器 (端口: 3001)"
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ 前端服务启动成功 (PID: $FRONTEND_PID)"
echo ""

echo "============================================"
echo "  🎉 服务启动完成！"
echo ""
echo "  📱 前端地址: http://localhost:3001"
echo "  🔧 后端地址: http://localhost:3000"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "============================================"

# 等待用户中断
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '✅ 服务已停止'; exit 0" INT

# 保持脚本运行
wait

