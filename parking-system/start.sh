#!/bin/bash

echo "🚀 启动城市停车位查询系统..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "📦 构建并启动服务..."
docker-compose up -d --build

echo -e "\n⏳ 等待服务初始化..."
sleep 10

echo -e "\n✅ 服务启动完成！"
echo -e "\n📱 访问地址："
echo "   前端应用: http://localhost:5174"
echo "   后端 API: http://localhost:3004/api"
echo -e "\n📊 功能说明："
echo "   • 地图展示停车场位置"
echo "   • 实时剩余车位显示"
echo "   • 按价格筛选"
echo "   • 车位预测功能"
echo -e "\n🛑 停止服务命令: docker-compose down"
echo -e "\n📋 查看日志: docker-compose logs -f"