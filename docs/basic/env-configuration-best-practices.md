# 多环境配置管理最佳实践

针对您目前的架构（Mac 本地 + Ubuntu Dev/Prod 服务器），以及 Next.js + Strapi + Medusa 的技术栈，推荐采用 **"集中管理 + 软链接分发"** 的策略。

## 1. 核心原则

1.  **Local 环境**: 自由、隔离。每个开发者在自己的 `apps/xxx/.env` 中配置，互不影响。
2.  **Server 环境**: 集中、版本化。所有服务器配置统一管理在 `deploy/envs/` 目录下，通过脚本分发。
3.  **安全**: `.env` 文件永远不要提交到 Git（除了加密仓库或私有部署仓库）。

---

## 2. 推荐目录结构

建议在项目根目录创建一个专门的 `deploy/envs` 文件夹来管理所有环境配置：

```text
/
├── apps/
│   ├── strapi/
│   │   ├── .env          <-- [Local] 本地开发用 (Git Ignored)
│   │   └── .env.example  <-- [Git] 模板文件
│   ├── medusa/
│   └── web/
├── deploy/
│   └── envs/             <-- [Server] 集中管理服务器配置
│       ├── .env.dev      <-- Dev 环境全量配置
│       └── .env.prod     <-- Prod 环境全量配置
```

---

## 3. 实施方案

### A. 本地开发 (Mac)
保持现状。
*   开发者 `cp .env.example .env`。
*   修改 `.env` 填入本地数据库地址等。
*   **优点**: 灵活，不影响他人。

### B. 服务器部署 (Ubuntu Dev/Prod)

在服务器上，我们不应该手动去每个 `apps/` 目录下改 `.env`，那样容易乱且难以维护。

**最佳实践步骤**:

1.  **准备大配置文件**:
    在 `deploy/envs/.env.dev` 中，包含**所有应用**需要的环境变量。
    *(您目前的 `deploy/gce/.env.dev` 已经接近这个模式了)*

    ```bash
    # deploy/envs/.env.dev
    
    # --- Strapi Config ---
    STRAPI_DATABASE_HOST=localhost
    STRAPI_AWS_ACCESS_KEY_ID=xxx
    
    # --- Medusa Config ---
    MEDUSA_DATABASE_URL=postgres://...
    
    # --- Next.js Config ---
    NEXT_PUBLIC_API_URL=https://dev-api.example.com
    ```

2.  **编写分发脚本 (deploy/setup-env.sh)**:
    编写一个简单的 Shell 脚本，在部署时自动将配置分发到各个应用目录。

    ```bash
    #!/bin/bash
    # 使用方法: ./deploy/setup-env.sh [dev|prod]
    
    ENV_NAME=$1
    if [ -z "$ENV_NAME" ]; then
      echo "Usage: $0 [dev|prod]"
      exit 1
    fi
    
    echo "🔧 Setting up environment: $ENV_NAME"
    
    # 1. Strapi
    echo "-> Configuring Strapi..."
    cp deploy/envs/.env.$ENV_NAME apps/strapi/.env
    
    # 2. Medusa
    echo "-> Configuring Medusa..."
    cp deploy/envs/.env.$ENV_NAME apps/medusa/.env
    
    # 3. Next.js (Web)
    echo "-> Configuring Web..."
    cp deploy/envs/.env.$ENV_NAME apps/web/.env.local
    
    echo "✅ Configuration done!"
    ```

3.  **部署流程**:
    当您在 Ubuntu 服务器上拉取代码后，只需运行：
    
    ```bash
    # 在 Dev 服务器上
    ./deploy/setup-env.sh dev
    
    # 然后启动服务 (Docker Compose 或 PM2)
    docker-compose up -d
    ```

---

## 4. 为什么这样做更好？

1.  **单一数据源 (Single Source of Truth)**:
    您只需要维护 `deploy/envs/.env.dev` 这一个文件，不用担心漏改了 `apps/strapi/.env` 却忘了改 `apps/medusa/.env`。
    
2.  **避免 Git 污染**:
    服务器上的 `apps/xxx/.env` 是由脚本生成的，不会意外被 `git status` 追踪或提交。

3.  **易于切换**:
    如果想在 Dev 服务器上临时跑一下 Prod 配置测试，只需要 `./deploy/setup-env.sh prod` 即可瞬间切换所有应用的配置。

4.  **CI/CD 友好**:
    未来如果上 Jenkins 或 GitHub Actions，只需要把这个 `.env.dev` 的内容注入到 CI 环境变量中即可，逻辑平滑迁移。

## 5. 针对您当前情况的建议

您目前已经有了 `deploy/gce/.env.dev`。建议：

1.  **标准化命名**: 确保变量名在所有应用中通用，或者在脚本中做映射。
    *   *技巧*: Strapi 读取 `DATABASE_HOST`，Medusa 读取 `DATABASE_URL`。您可以在 `.env.dev` 里把两个都写上。
    
## 6. 安全性与 Git 追踪

**Q: `deploy/envs/` 下的 `.env.dev` 和 `.env.prod` 应该被 Git 跟踪吗？**

**A: 取决于您的仓库类型。**

### 场景 A: 私有安全仓库 (您的情况)
如果您的 Git 仓库是**私有的**，且只有可信的团队成员有访问权限，那么**可以**将这些文件提交到 Git。
*   **优点**: 部署极其方便，配置有版本控制，团队同步简单。
*   **配置**: 确保 `.gitignore` 中**没有**忽略这些文件。
    ```gitignore
    # .gitignore
    !deploy/envs/.env.*
    ```

### 场景 B: 公开仓库或高安全性要求
如果仓库是公开的，或者对安全性有极高要求（如金融合规），则**绝对不应该**提交明文密钥。
*   **推荐**: 使用 `git-crypt` 加密，或在 CI/CD 平台（如 GitHub Actions Secrets）中管理密钥。

### 总结
鉴于您使用的是私有安全仓库，为了运维便利性，**推荐直接跟踪这些配置文件**。我们已经更新了 `.gitignore` 允许跟踪 `deploy/envs/` 和 `deploy/gce/` 下的环境变量文件。

