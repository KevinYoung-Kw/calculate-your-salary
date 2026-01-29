#!/bin/bash

echo "🚀 开始部署官途算略..."

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 停止旧进程
echo "🛑 停止旧进程..."
pm2 delete calculate-salary 2>/dev/null || true

# 启动新进程
echo "✨ 启动新进程（端口 8527）..."
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

echo "✅ 部署完成！访问地址：http://你的服务器IP:8527"
