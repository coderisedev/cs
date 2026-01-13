# GitHub Actions CI/CD 指南 (基于当前项目)

本指南旨在解释 `cs` 项目中基于 GitHub Actions 实现的持续集成 (CI) 和持续部署 (CD) 流程。

---

## 1. 核心概念

### CI (Continuous Integration / 持续集成)
**“频繁合并，自动检测。”**
每次提交代码时，流水线会自动运行，检查代码规范、TypeScript 类型、并运行单元测试。
- **目的：** 尽早发现 Bug，确保代码质量。
- **对应文件：** `.github/workflows/ci.yml`

### CD (Continuous Delivery/Deployment / 持续交付/部署)
**“自动打包，自动发布。”**
当代码通过 CI 检查并合并到主分支后，流水线会自动构建 Docker 镜像或部署前端到 Vercel。
- **目的：** 快速、安全地将新功能发布上线。
- **对应文件：**
  - 后端服务：`.github/workflows/deploy-services.yml`
  - 前端网页：`.github/workflows/deploy-web.yml`

---

## 2. 项目流水线详解

### A. 质量检查与预览 (`ci.yml`)
**触发条件：** 推送 (Push) 或 拉取请求 (Pull Request)。

1.  **Lint & Typecheck:** 使用 `eslint` 检查代码规范，`tsc` 检查类型错误。
2.  **Unit Tests:** 并行运行各个子项目 (`storefront`, `medusa`, `strapi`) 的测试。
3.  **Build Verification:** 验证所有包是否能成功构建。
4.  **Preview Deployment (仅限 PR):**
    - 自动部署一个临时的 Vercel 预览环境。
    - 将预览链接作为评论自动回复在 PR 下方。
5.  **Smoke Tests:** 针对预览环境运行 Playwright 冒烟测试，确保基础页面可访问。

### B. 后端服务部署 (`deploy-services.yml`)
**触发条件：** 推送至 `main` (生产) 或 `staging` (测试) 分支。

1.  **Docker Build:** 构建 Medusa 和 Strapi 的生产环境镜像。
2.  **Registry Push:** 将镜像推送到 GitHub Container Registry (`ghcr.io`)。
3.  **SSH Deploy:**
    - 登录到 GCE (Google Compute Engine) 服务器。
    - 执行 `/srv/cs/bin/deploy.sh` 脚本。
    - 通过 Docker Compose 重启服务。

### C. 前端网页部署 (`deploy-web.yml`)
**触发条件：** `main` 或 `staging` 分支更新，且 `CI` 流水线通过。

1.  **Pulumi/Vercel:** 调用 Vercel 部署接口。
2.  **Environment Sync:** 根据分支自动切换生产/测试环境配置。
3.  **Status Callback:** 将部署结果回传给 GitHub Commit 状态。

---

## 3. 配置清单 (Secrets)

要让这些流水线正常工作，必须在 GitHub 仓库的 **Settings -> Secrets and variables -> Actions** 中配置以下密钥：

| 类别 | Secret 名称 | 说明 |
| :--- | :--- | :--- |
| **服务器** | `GCE_HOST` | 服务器 IP 地址 |
| | `GCE_USER` | SSH 登录用户名 |
| | `GCE_SSH_KEY` | SSH 私钥 |
| **Vercel** | `VERCEL_TOKEN` | Vercel 访问令牌 |
| | `VERCEL_ORG_ID` | Vercel 组织 ID |
| | `VERCEL_PROJECT_ID` | Vercel 项目 ID |
| **其他** | `GITHUB_TOKEN` | (GitHub 自动提供，无需手动配置) |

---

## 4. 日常开发工作流

1.  **开发：** 在功能分支开发并 `push` 到 GitHub。
2.  **检查：** 在 PR 页面查看 `CI` 运行结果和 `Preview` 预览效果。
3.  **合并：** 确认无误后合并到 `main`。
4.  **发布：** 观察 `Deploy` 流水线自动将新代码推送到线上服务器。
