# PM2 CI/CD Implementation Guide

既然项目使用 PM2 管理进程，最经典且稳健的 CI/CD 方案是 **"GitHub Actions + SSH"** 模式。

## 核心思路

CI/CD 的本质是自动化执行手动发布的步骤：
1.  **连接**: CI Runner 通过 SSH 连上服务器。
2.  **更新**: 拉取最新代码 (`git pull`)。
3.  **构建**: 安装依赖并构建 (`pnpm install && pnpm build`)。
4.  **重启**: 通知 PM2 重载进程 (`pm2 reload`)。

## 1. 服务器端部署脚本 (`scripts/deploy-pm2.sh`)

这个脚本位于项目内，逻辑清晰，既可用于 CI 调用，也可用于手动紧急部署。

```bash
#!/bin/bash
set -e  # 遇到错误立即退出

# --- 配置 ---
# 项目部署的绝对路径 (请根据实际情况修改)
PROJECT_DIR="/home/coderisedev/cs"
ECOSYSTEM_FILE="ecosystem.config.cjs"

# --- 1. 进入项目目录 ---
echo "🚀 Starting deployment..."
cd "$PROJECT_DIR" || { echo "❌ Directory not found: $PROJECT_DIR"; exit 1; }

# --- 2. 拉取最新代码 ---
echo "📥 Pulling latest code..."
git fetch origin main
git reset --hard origin/main

# --- 3. 安装依赖 (Monorepo 根目录) ---
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# --- 4. 构建 Medusa ---
echo "🏗️ Building Medusa..."
cd apps/medusa
pnpm build
cd ../..

# --- 5. 构建 Strapi ---
echo "🏗️ Building Strapi..."
cd apps/strapi
pnpm build
cd ../..

# --- 6. 重载 PM2 ---
# 使用 reload 而不是 restart 可以实现 0 停机更新 (如果是 cluster 模式)
echo "🔄 Reloading PM2 processes..."
pm2 reload "$ECOSYSTEM_FILE" --update-env

echo "✅ Deployment finished successfully!"
```

## 2. GitHub Actions Workflow (`.github/workflows/deploy-pm2.yml`)

```yaml
name: Deploy PM2 Production

on:
  push:
    branches: [ "main" ]
  workflow_dispatch: # 允许手动触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Server via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          port: ${{ secrets.SSH_PORT || '22' }}
          script: |
            # 运行我们在第一步创建的脚本
            # 确保脚本有执行权限 (chmod +x scripts/deploy-pm2.sh)
            bash /home/coderisedev/cs/scripts/deploy-pm2.sh
```

## 3. 配置 GitHub Secrets

在 GitHub 仓库页面，进入 **Settings** -> **Secrets and variables** -> **Actions**，添加：

1.  `SERVER_HOST`: 服务器 IP 地址。
2.  `SERVER_USERNAME`: 登录用户名 (如 `coderisedev`)。
3.  `SSH_PRIVATE_KEY`: 私钥内容。
    *   *建议*: 本地生成专用 key: `ssh-keygen -t ed25519 -C "github-actions"`
    *   公钥 (`.pub`) 内容追加到服务器的 `~/.ssh/authorized_keys`。
    *   私钥内容填入 Secrets。
