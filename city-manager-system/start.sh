#!/bin/bash

echo "🚀 启动城市公共设施查询工具..."
echo "=================================="

# 检查 Docker 是否可用
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未找到 Docker，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ 错误: 未找到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 启动服务
echo "📦 启动所有服务容器..."
docker-compose up -d

echo ""
echo "✅ 服务启动完成！"
echo "=================================="
echo "🌐 前端应用: http://localhost:8000"
echo "🔌 后端 API: http://localhost:3001"
echo "💾 数据库:   postgres://postgres:password@localhost:5432/city_facilities"
echo ""
echo "📊 查看日志: docker-compose logs -f"
echo "⏹️  停止服务: docker-compose down"
