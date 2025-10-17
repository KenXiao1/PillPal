# Netlify 部署设置指南

## 环境变量配置

要修复白屏问题，你需要在 Netlify 控制台中配置以下环境变量：

### 步骤：

1. 登录 [Netlify](https://app.netlify.com/)
2. 进入你的网站项目
3. 点击 **Site configuration** -> **Environment variables**
4. 添加以下两个环境变量：

#### 变量 1:
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://pygfrbopvwyaxinzrjkg.supabase.co`

#### 变量 2:
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z2ZyYm9wdnd5YXhpbnpyamtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NjYyNTgsImV4cCI6MjA3NjI0MjI1OH0.962rwi1sSzM4MFVgcyujZrN4sknGkNx6ctQI_icMpA4`

5. 保存后，点击 **Deploys** -> **Trigger deploy** -> **Deploy site**

## 配置文件说明

项目已包含以下配置文件：

- `netlify.toml` - Netlify 构建配置
- `dist/_redirects` - 单页应用路由重定向规则

这些文件确保 React 单页应用在 Netlify 上正确运行。

## 验证部署

配置完环境变量并重新部署后：
1. 打开你的 Netlify 网站 URL
2. 应该能看到登录界面（不再是白屏）
3. 可以注册新用户或登录

## 故障排除

如果仍然看到白屏：
1. 检查浏览器控制台是否有错误
2. 确认环境变量已正确配置
3. 确认已触发新的部署
4. 清除浏览器缓存后重试
