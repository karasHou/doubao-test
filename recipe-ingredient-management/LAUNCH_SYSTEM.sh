#!/bin/bash

echo "🚀 启动智能菜谱与食材管理系统"
echo "================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

# 安装必要的依赖
echo "📦 安装依赖..."
npm install express cors sqlite3

# 启动系统
echo " "
echo "🍳 系统正在启动..."
echo " "
node RUN_ME_EMERGENCY.js
