# Vercel 部署详细教程

本文档提供了将"官途算略"项目部署到 Vercel 的详细步骤，并配置自定义域名 `gt.kw-aigc.cn`。

## 📋 前置准备

- GitHub 账号
- Vercel 账号（可使用 GitHub 登录）
- 域名 `kw-aigc.cn` 的 DNS 管理权限
- Node.js 环境（本地测试用）

## 🚀 部署步骤

### 第一步：准备 GitHub 仓库

1. **创建 GitHub 仓库**
   ```bash
   # 在项目目录下初始化 Git
   cd calculate-your-salary
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit: 官途算略项目"
   
   # 关联远程仓库（替换为你的仓库地址）
   git remote add origin https://github.com/your-username/calculate-your-salary.git
   
   # 推送到远程
   git push -u origin main
   ```

2. **确认文件结构**
   确保以下文件已提交：
   - `package.json`
   - `vite.config.ts`
   - `vercel.json`（可选，已配置）
   - `index.html`
   - `src/` 目录及所有源码
   - `public/` 目录及所有静态资源

### 第二步：连接 Vercel

1. **登录 Vercel**
   - 访问 [https://vercel.com](https://vercel.com)
   - 点击 "Sign Up" 或 "Log In"
   - 选择 "Continue with GitHub"
   - 授权 Vercel 访问你的 GitHub 账号

2. **导入项目**
   - 在 Vercel Dashboard 点击 "Add New..." → "Project"
   - 在列表中找到 `calculate-your-salary` 仓库
   - 如果没有看到，点击 "Adjust GitHub App Permissions" 添加仓库访问权限
   - 点击 "Import" 按钮

### 第三步：配置项目构建

Vercel 会自动检测到这是一个 Vite 项目，并自动填充配置。确认以下设置：

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x （推荐）
```

**环境变量（如果需要）**：

项目当前不需要环境变量，但如果未来需要，可以在此处添加：
- 点击 "Environment Variables"
- 添加键值对，例如：
  - `VITE_API_URL` = `https://api.example.com`

### 第四步：首次部署

1. 点击 "Deploy" 按钮
2. Vercel 开始构建和部署：
   ```
   ▲ Vercel CLI 28.4.8
   🔗  Linked to your-username/calculate-your-salary
   🔍  Inspect: https://vercel.com/...
   ✅  Production: https://calculate-your-salary.vercel.app [1m 23s]
   ```
3. 等待构建完成（通常 1-2 分钟）
4. 获得默认域名：`https://your-project-name.vercel.app`
5. 点击 "Visit" 按钮预览网站

### 第五步：配置自定义域名 gt.kw-aigc.cn

#### 5.1 在 Vercel 添加域名

1. 进入项目 Dashboard
2. 点击顶部导航栏的 "Settings"
3. 在左侧菜单选择 "Domains"
4. 在输入框中输入 `gt.kw-aigc.cn`
5. 点击 "Add" 按钮

#### 5.2 查看 DNS 配置要求

Vercel 会显示需要添加的 DNS 记录，通常有两种配置方式：

**推荐方式：CNAME 记录**
```
类型: CNAME
主机记录: gt
记录值: cname.vercel-dns.com
TTL: 自动或 600
```

**备用方式：A 记录**
```
类型: A
主机记录: gt
记录值: 76.76.21.21
TTL: 自动或 600
```

#### 5.3 配置 DNS（以阿里云为例）

1. **登录阿里云控制台**
   - 访问 [https://dns.console.aliyun.com](https://dns.console.aliyun.com)
   - 找到域名 `kw-aigc.cn`
   - 点击 "解析设置"

2. **添加 CNAME 记录**
   - 点击 "添加记录"
   - 填写以下信息：
     ```
     记录类型: CNAME
     主机记录: gt
     解析线路: 默认
     记录值: cname.vercel-dns.com
     TTL: 10 分钟（或默认）
     ```
   - 点击 "确认"

3. **等待 DNS 生效**
   - DNS 记录通常在 1-10 分钟内生效
   - 可以使用以下命令检查：
     ```bash
     # 检查 CNAME 记录
     nslookup gt.kw-aigc.cn
     
     # 或使用 dig
     dig gt.kw-aigc.cn
     ```

#### 5.4 验证域名

1. 返回 Vercel Dashboard 的 Domains 页面
2. 等待域名旁边显示 "Valid Configuration" ✅
3. SSL 证书会自动配置（Let's Encrypt）
4. 通常在 5-10 分钟内完成

#### 5.5 强制 HTTPS（推荐）

1. 在 Domains 页面找到 `gt.kw-aigc.cn`
2. 点击域名进入详情
3. 确保 "Force HTTPS" 已开启（默认开启）

#### 5.6 设置为主域名（可选）

如果你希望访问 `.vercel.app` 域名时自动跳转到 `gt.kw-aigc.cn`：

1. 在 Domains 列表中找到 `gt.kw-aigc.cn`
2. 点击右侧的三点菜单 "..."
3. 选择 "Set as Primary Domain"

## 🔄 自动部署

配置完成后，Vercel 会自动监听 GitHub 仓库的变化：

- **主分支（main/master）推送** → 自动部署到生产环境
- **PR 创建** → 自动创建预览部署
- **分支推送** → 自动创建开发环境部署

### 手动触发部署

如果需要手动重新部署：

1. 进入项目 Dashboard
2. 点击 "Deployments" 标签
3. 找到最新的部署记录
4. 点击右侧三点菜单 → "Redeploy"

## 🛠️ 常见问题

### Q1: 域名显示 "Invalid Configuration"

**原因**：DNS 记录未生效或配置错误

**解决方案**：
1. 检查 DNS 记录是否正确添加
2. 使用 `nslookup gt.kw-aigc.cn` 验证 DNS 解析
3. 等待 DNS 完全生效（最长可能需要 24 小时，但通常 10 分钟内）
4. 尝试清除 DNS 缓存：
   ```bash
   # macOS
   sudo dscacheutil -flushcache
   
   # Windows
   ipconfig /flushdns
   ```

### Q2: 构建失败 "Build Error"

**原因**：依赖安装失败或构建命令错误

**解决方案**：
1. 检查 `package.json` 中的依赖是否完整
2. 本地运行 `npm run build` 测试构建
3. 查看 Vercel 构建日志中的详细错误信息
4. 确认 Node.js 版本兼容（推荐 18.x）

### Q3: 404 错误（刷新页面时）

**原因**：SPA 路由配置问题

**解决方案**：
已在 `vercel.json` 中配置了 rewrite 规则，确保该文件已提交到仓库：
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Q4: 图片资源无法加载

**原因**：路径配置错误

**解决方案**：
1. 确保所有静态资源在 `public/` 目录下
2. 在代码中使用绝对路径：`/logo.svg` 而非 `./logo.svg`
3. 检查 `vite.config.ts` 中的 `base` 配置

### Q5: SSL 证书未生成

**原因**：域名验证未完成

**解决方案**：
1. 确认 DNS 记录已正确配置
2. 等待域名验证完成（通常 5-10 分钟）
3. 如果超过 1 小时，尝试删除域名后重新添加

## 📊 性能优化建议

### 1. 启用压缩

Vercel 默认启用 Gzip/Brotli 压缩，无需额外配置。

### 2. 图片优化

建议将图片转为 WebP 格式：
```bash
# 使用 cwebp 工具转换
cwebp -q 80 input.png -o output.webp
```

### 3. 缓存策略

已在 `vercel.json` 中配置了缓存头：
- 静态资源（图片、CSS、JS）：1 年强缓存
- HTML：不缓存，确保获取最新内容

### 4. 代码分割

Vite 默认会进行代码分割，无需额外配置。

## 📈 监控与分析

### 查看部署日志

1. 进入项目 Dashboard
2. 点击 "Deployments"
3. 选择任意部署记录
4. 查看 "Build Logs" 和 "Function Logs"

### 访问统计

Vercel Pro 版本提供详细的分析报告：
- 访问量统计
- 地理位置分布
- 性能指标
- 错误监控

## 🔐 安全配置

已在 `vercel.json` 中配置了安全响应头：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📞 技术支持

如遇到部署问题，可以：

1. **查看 Vercel 文档**：https://vercel.com/docs
2. **Vercel 社区**：https://github.com/vercel/vercel/discussions
3. **联系作者**：[www.kw-aigc.cn](https://www.kw-aigc.cn)

---

**祝部署顺利！** 🎉

如果本教程对你有帮助，欢迎 Star 项目仓库。
