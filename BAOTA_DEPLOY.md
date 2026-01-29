# 宝塔面板部署指南

## 🎯 部署方式：Nginx 静态托管

现在使用 **Nginx 直接托管 dist 静态文件**，无需运行 Node.js 服务。

---

## 📦 首次部署

### 1. 将项目上传到服务器

```bash
/www/wwwroot/calculate-your-salary/
```

### 2. 修改 Nginx 配置

在宝塔面板找到你的站点 `gt.kw-aigc.cn`，复制 `nginx.conf` 的内容到站点配置。

**关键配置**：
```nginx
root /www/wwwroot/calculate-your-salary/dist;  # 指向 dist 目录
index index.html;

location / {
    try_files $uri $uri/ /index.html;  # SPA 路由支持
}
```

### 3. 首次构建

```bash
cd /www/wwwroot/calculate-your-salary
npm install
npm run build
```

### 4. 重载 Nginx

```bash
nginx -s reload
```

---

## 🔄 日常更新（只需一行命令）

每次修改代码后，只需运行：

```bash
npm run build
```

或者使用一键部署脚本：

```bash
bash deploy.sh
```

**就这么简单！** Nginx 会自动读取最新的 `dist/` 文件。

---

## 📝 deploy.sh 脚本说明

```bash
#!/bin/bash
echo "🚀 开始部署官途算略..."

# 安装依赖
npm install

# 构建项目
npm run build

# 重载 Nginx
sudo nginx -s reload

echo "✅ 部署完成！访问 https://gt.kw-aigc.cn"
```

---

## 🔧 目录结构

```
/www/wwwroot/calculate-your-salary/
├── dist/              # 构建输出目录（Nginx 托管这里）
│   ├── index.html
│   ├── assets/
│   └── ...
├── src/               # 源代码
├── public/            # 静态资源
├── deploy.sh          # 一键部署脚本
├── nginx.conf         # Nginx 配置参考
└── package.json
```

---

## ✅ 优势

| 方式 | 优点 | 缺点 |
|------|------|------|
| **Nginx 静态托管（当前）** | ✅ 更新简单（npm run build）<br>✅ 性能极佳<br>✅ 无需后台进程<br>✅ 稳定可靠 | ❌ 无 |
| ~~Node.js 服务~~ | ✅ 支持 SSR | ❌ 需要 PM2<br>❌ 占用内存<br>❌ 更新复杂 |

---

## 🐛 常见问题

### Q: 更新后页面没变化？
A: 清除浏览器缓存（Ctrl + Shift + R）或使用无痕模式

### Q: 404 错误？
A: 检查 Nginx 配置中的 `try_files $uri $uri/ /index.html;`

### Q: 图片加载慢？
A: 静态文件已配置 1 年缓存，第二次访问会快很多

### Q: 如何回滚？
A: 
```bash
git checkout <旧版本commit>
npm run build
```

---

## 🚀 CI/CD 自动化（可选）

如果想实现 Git push 自动部署，可以配置 Webhook：

1. 在宝塔面板添加 Webhook
2. 触发 URL 指向你的服务器
3. 执行脚本：
```bash
cd /www/wwwroot/calculate-your-salary
git pull
npm install
npm run build
```

---

## 📊 性能优化建议

1. **开启 Gzip 压缩**（宝塔面板 → 网站设置 → 性能优化）
2. **CDN 加速**（推荐又拍云、七牛云）
3. **图片优化**（使用 WebP 格式）

---

## 📞 技术支持

- 作者：Kevin Young
- 网站：https://www.kw-aigc.cn
- GitHub：https://github.com/KevinYoung-Kw/calculate-your-salary
