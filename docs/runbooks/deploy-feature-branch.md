# Feature Branch Deployment Runbook

本文档记录了如何在 Ubuntu 服务器 (Dev/Prod) 上拉取新功能分支并进行部署的标准流程。

## 1. 获取代码 (Get Code)

登录到服务器后，进入项目根目录：

```bash
cd /path/to/your/project
```

执行 Git 操作以获取新分支：

```bash
# 1. 获取远程所有分支的更新
git fetch origin

# 2. 切换到目标分支 (例如 feature/apple-homepage-strapi)
git checkout feature/apple-homepage-strapi

# 3. 拉取最新代码 (确保本地是最新状态)
git pull origin feature/apple-homepage-strapi
```

---

## 2. 部署更新 (Build & Deploy)

当更新包含 Strapi Schema 变更或新依赖时，必须执行以下步骤：

```bash
# 1. 安装依赖 (因为可能增加了新包)
npm install

# 2. 配置环境变量 (推荐使用 setup-env.sh 脚本)
# ./deploy/setup-env.sh dev

# 3. 重新构建 Strapi (关键！Schema 变更需要重新 build)
cd apps/strapi
npm run build

# 4. 启动/重启服务
# 方式 A: 直接启动 (调试用)
npm run start

# 方式 B: 使用 PM2 (生产/常驻)
# pm2 restart strapi
```

---

## 3. 导入数据 (Data Seeding)

**仅当**这是您第一次在该环境部署此功能，且需要初始化数据时执行：

```bash
# 确保在 apps/strapi 目录下
cd apps/strapi

# 运行种子脚本 (例如导入首页数据)
npm run seed:homepage
```

> **注意**: 种子脚本通常设计为幂等的或安全的，但重复运行可能会导致数据重复，请根据脚本具体逻辑谨慎操作。
