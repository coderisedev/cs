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

---

## 4. 深入理解：GitHub Actions 工作原理

您的理解非常准确。整个 CI/CD 流程完全依赖于 **GitHub + GitHub Actions** 的生态。以下是针对本方案的底层原理拆解：

### 4.1 "Runner" 是什么？

*   **本质**: Runner 是 GitHub 提供的一台**临时虚拟机**（通常运行 Ubuntu Linux）。
*   **生命周期**: 每次 Workflow 被触发时，GitHub 都会动态分配一台全新的、干净的虚拟机。任务结束后，这台机器会被立即销毁，数据不会保留。
*   **角色**: 在本方案中，Runner 扮演的是 **"指挥官"** 的角色。

### 4.2 "指挥" 与 "干活" 的区别

我们采用的 PM2/SSH 模式与传统的 Docker 模式有本质区别：

| 特性 | Docker 镜像模式 (云端构建) | PM2/SSH 脚本模式 (本案采用) |
| :--- | :--- | :--- |
| **构建地点 (Build)** | **CI Runner (云端)** | **生产服务器 (本地)** |
| **流程** | 1. Runner 下载代码<br>2. `docker build` (消耗云端 CPU)<br>3. 推送到镜像仓库<br>4. 服务器 `docker pull` | 1. Runner 远程 SSH 连入服务器<br>2. 发送指令让服务器 `git pull`<br>3. 服务器本机执行 `npm build` |
| **服务器负载** | 低 (只负责运行) | 高 (构建时会占用 CPU/内存) |
| **配置复杂度** | 高 (需维护镜像仓库、Dockerfile) | **低** (仅需简单的 Shell 脚本) |
| **更新速度** | 较慢 (涉及镜像上传下载) | **极快** (利用服务器本地缓存) |

### 4.3 流程总结

1.  **Code (代码托管)**: 存放在 **GitHub 仓库**。
2.  **CI (触发与编排)**: **GitHub Actions Runner** 监听到代码变更，启动虚拟机。
3.  **CD (部署执行)**: Runner 通过 SSH 协议，远程登录到您的服务器，并执行 `scripts/deploy-pm2.sh`。
4.  **Work (实际构建)**: 您的服务器接收到指令，开始拉取代码、构建项目、重启 PM2。

虽然真正干苦力（构建、重启）的是您的服务器，但整个流程的**大脑和触发器**都在 GitHub Actions 手中。