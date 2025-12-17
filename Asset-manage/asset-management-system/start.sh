#!/bin/bash

echo "🚀 启动资产管理系统..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null
then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null
then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查是否存在 docker-compose.yml 文件
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ 未找到 docker-compose.yml 文件，请在项目根目录运行此脚本"
    exit 1
fi

# 启动服务
echo "📦 启动所有服务..."
docker-compose up -d

echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "🎉 资产管理系统启动成功！"
echo ""
echo "🌐 访问地址："
echo "  - 前端界面: http://localhost"
echo "  - 后端 API: http://localhost:3001/api/health"
echo "  - 数据库: localhost:5432"
echo ""
echo "📊 默认用户名和密码："
echo "  - 数据库用户名: postgres"
echo "  - 数据库密码: password"
echo ""
echo "💡 常用命令："
echo "  - 查看日志: docker-compose logs -f"
echo "  - 停止服务: docker-compose down"
echo "  - 重启服务: docker-compose restart"
echo ""
echo "📚 详细文档请查看 README.md"