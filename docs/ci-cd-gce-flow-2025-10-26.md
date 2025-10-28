# CI/CD → GCE 端到端流转梳理（2025-10-26）

本稿梳理从 `git push` 开始到业务可用的完整链路，包含关键节点、常见故障定位点与运维要点。

## 一图看全（push → 线上）
- 开发机：`git push` → `main`
- GitHub Actions：触发 `.github/workflows/deploy-services.yml`
  - 构建镜像（Medusa/Strapi）→ 推送 GHCR
  - 拷贝脚本到主机（scp）
  - 可选：GCE 首机初始化（first-init）
  - 远端部署（ssh 执行 `deploy.sh`）
- GCE 主机：拉取镜像 → 迁移 → compose up → 健康检查
- Cloudflare Tunnel：主机名路由（api/content）→ 外网可用
- 验证：健康探针与后台登录页打开

## 触发与权限
- 触发
  - push：`main` / `staging`
  - 手动：`workflow_dispatch`（支持 `first_init=true` 与 `db_password`）
- Secrets 必备
  - `GCE_HOST`、`GCE_USER`、`GCE_SSH_KEY`
  - GHCR 登录：`GHCR_USERNAME`、`GHCR_PAT`（只读 `read:packages`），回退 `GITHUB_TOKEN`
- 变量可选
  - `vars.GCE_FIRST_INIT='true'`（推送即执行首机初始化）

## 构建阶段（GitHub Runner）
- 登录 GHCR（`GITHUB_TOKEN`）→ Buildx 构建
- Medusa 镜像
  - 固定 pnpm → 安装 + 构建
  - 构建期打包 Admin UI 至 `apps/medusa/public/admin`
- Strapi 镜像
  - 固定 pnpm → 安装 + 构建
- Tag 规则
  - 短 SHA：`image_tag`（如 `a46f7a65fcff`）
  - 渠道：`prod`（main）/ `staging`

## 分发与主机准备
- scp 到 `/tmp/cs-deploy`
  - `scripts/gce/deploy.sh`
  - `scripts/gce/first-init.sh`
  - `infra/gcp/bin/collect-health.sh`
- 首机初始化（可选）
  - `first-init.sh`：PG/Redis 配置、UFW/iptables 放行 docker0→5432/6379、可创建 `cs` 用户与 DB
  - 仅首次/首台执行，幂等设计

## 远端部署（GCE）
- GHCR 登录（PAT 优先，回退 `GITHUB_TOKEN`）
- 安装脚本至 `/srv/cs/bin`
- `deploy.sh` 执行：
  - `compose down` 释放端口
  - 端口预检：9000/1337（冲突直接报错）
  - 预跑迁移：`pnpm medusa db:migrate`（容错继续）
  - `compose pull` 拉取新 TAG
  - `compose up -d --remove-orphans`
  - 采集健康日志至 `/srv/cs/logs`
- 健康检查端点（已对齐）
  - Medusa：`http://127.0.0.1:9000/health`（200）
  - Strapi：`http://127.0.0.1:1337/_health`（204）或 `/health`（200）

## 域名、Tunnel 与后台路径
- Cloudflare Tunnel 主机名路由
  - `api.aidenlux.com` → `http://127.0.0.1:9000`
  - `content.aidenlux.com` → `http://127.0.0.1:1337`
- 后台入口
  - Medusa Admin：`https://api.aidenlux.com/app/admin`（`/admin` 为 API，未登录 401）
  - Strapi Admin：`https://content.aidenlux.com/admin`
- CORS/ENV（主机）
  - `/srv/cs/env/medusa.env`：仅保留 `https://api.aidenlux.com`
  - `/srv/cs/env/strapi.env`：`URL/ADMIN_URL` 指向 `content.aidenlux.com`

## 运维（最少步骤）
- 首机一次性
  - 主机：`sudo bash scripts/gce/first-init.sh --db-password '<StrongPass>'`
  - 或 Actions 勾选 `first_init=true` 并传 `db_password`
- 日常部署
  - `git push origin main` 或 Actions 手动 Run workflow
- 快速验证
  - `curl -I https://api.aidenlux.com/health` → 200
  - `curl -I https://content.aidenlux.com/_health` → 204（或 `/health` 200）
  - 打开后台：`/app/admin` 与 `/admin`

## 常见故障与定位
- 构建失败：确认去掉 `--prod`、固定 pnpm；查看 Build 步骤日志
- scp 失败：sources 需“单行逗号分隔”；远端安装路径与结构一致
- GHCR denied：主机侧 `docker login`；现已“PAT 优先，GITHUB_TOKEN 回退”
- 端口占用：`deploy.sh` 已 down + 预检；如 systemd/PM2 自启需停用
- DB 超时：PG 监听 docker0、pg_hba 放行、UFW/iptables 放行；检查 `DATABASE_URL`/密码
- 健康探针：Medusa `/health`；Strapi `/_health` 或 `/health`
- Medusa Admin 401：GUI 在 `/app/admin`，可用 CF 301 将 `/admin` 跳转

## 关键文件索引
- 工作流：`.github/workflows/deploy-services.yml`
- 脚本：`scripts/gce/deploy.sh`、`scripts/gce/first-init.sh`
- 健康：`infra/gcp/bin/collect-health.sh`、`infra/gcp/docker-compose.yml`
- Dockerfiles：`apps/medusa/Dockerfile`、`apps/strapi/Dockerfile`
- Strapi 健康路由：`apps/strapi/src/api/health/*`
- 文档：
  - `docs/gcp-ubuntu-deployment-brief.md`
  - `docs/ci-cd-gce-retrospective-2025-10-26.md`
  - `docs/ci-cd-gce-qa-retrospective-2025-10-26.md`

