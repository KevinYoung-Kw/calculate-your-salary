#!/bin/bash

echo "🚀 开始部署官途算略..."

# 拉取最新代码（如果需要）
# git pull origin main

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 重载 Nginx
echo "♻️  重载 Nginx..."
sudo nginx -s reload

echo "✅ 部署完成！访问 https://gt.kw-aigc.cn"
