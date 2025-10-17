# 快速修复 Netlify 白屏问题

## 问题原因
Netlify 部署时没有读取 `.env` 文件，导致应用无法连接到 Supabase 数据库。

## 解决方案（3步）

### 1️⃣ 在 Netlify 配置环境变量

访问: https://app.netlify.com/sites/你的网站名/configuration/env

添加这两个变量：

```
VITE_SUPABASE_URL=https://pygfrbopvwyaxinzrjkg.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z2ZyYm9wdnd5YXhpbnpyamtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjYyNTgsImV4cCI6MjA3NjI0MjI1OH0.962rwi1sSzM4MFVgcyujZrN4sknGkNx6ctQI_icMpA4
```

### 2️⃣ 提交代码变更

确保以下文件已提交到 Git：
- ✅ `netlify.toml` - Netlify 配置
- ✅ `public/_redirects` - SPA 路由重定向
- ✅ `vite.config.ts` - 构建配置

### 3️⃣ 触发重新部署

在 Netlify 控制台:
1. 点击 **Deploys**
2. 点击 **Trigger deploy**
3. 选择 **Deploy site**

## 验证

部署完成后，打开网站应该看到登录界面，而不是白屏。

## 还有问题？

打开浏览器开发者工具 (F12)，查看 Console 标签页中的错误信息。
