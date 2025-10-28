# CI/CD → GCE 全面复盘（2025-10-26）

以下是围绕本次 Chat 实现“GitHub Actions → GHCR → GCE（Cloudflare Tunnel 暴露）”的完整复盘。最初设想是“一次 push 即自动发布”，实操落地涉及镜像构建、主机网络/数据库、防火墙、健康检查、Tunnel 与 CORS/域名等多环节协同，细节较多，现汇总如下，便于后续复用与排障。

## 复盘概览
- 目标：从零搭建稳定的后端 CI/CD，将 Medusa/Strapi 自动部署到 GCE，并通过 Cloudflare Tunnel 对外提供域名。
- 现状：流水线与主机均稳定；容器 healthy；/health（Medusa 200）、/_health（Strapi 204/health 200）通过；域名与 CORS 已对齐。

## 关键问题与修复轨迹
- 镜像构建失败（dev 依赖缺失）
  - 症状：`pnpm install --filter ... --prod` 使 builder 缺少 devDependencies，导致构建失败。
  - 处理：去掉 `--prod`，在 Dockerfile 固定 pnpm；builder 阶段保留 dev 依赖，runtime 仍是精简层。
  - 文件：`apps/medusa/Dockerfile`、`apps/strapi/Dockerfile`。
- scp 传输与远端路径错误
  - 症状：`tar: empty archive`、远端 `install` 找不到路径。
  - 处理：scp 源使用单行逗号分隔；修正远端安装路径并新增“源文件存在”预检。
  - 文件：`.github/workflows/deploy-services.yml`。
- GHCR 拉取被拒绝
  - 症状：主机 compose pull 报 `denied: denied`。
  - 处理：在主机侧 `docker login ghcr.io`（工作流中注入）；后续可改用只读 PAT。
  - 文件：`.github/workflows/deploy-services.yml`。
- 端口占用（1337/9000）
  - 处理：部署脚本先 `compose down`；加入端口预检，阻断并提示具体占用信息。
  - 文件：`scripts/gce/deploy.sh`。
- 容器连接 DB 超时
  - 根因：PostgreSQL 仅回环监听；pg_hba/防火墙未放 docker0 网段；Redis 保护模式。
  - 处理：
    - PG：`listen_addresses='127.0.0.1,172.17.0.1'`，`pg_hba` 允许 `172.17.0.0/16`。
    - UFW/iptables：放行 docker0→5432/6379。
    - Redis：绑定 `127.0.0.1 172.17.0.1` 且 `protected-mode yes`（或临时放开并依赖防火墙）。
    - 统一 `cs` 密码与 `DATABASE_URL`。
  - 自动化：新增首机脚本一键完成上述配置。
  - 文件：`scripts/gce/first-init.sh`、`docs/gcp-ubuntu-deployment-brief.md`（新增第 11 节）。
- 健康检查不匹配
  - 处理：统一 Medusa `/health`、Strapi `/_health`（并实现 `/health`=200）；更新 compose 与健康脚本。
  - 文件：`infra/gcp/docker-compose.yml`、`infra/gcp/bin/collect-health.sh`、`apps/strapi/src/api/health/*`。
- Medusa Admin 打包与入口路径
  - 处理：镜像构建阶段运行 `@medusajs/admin-bundler` 产出 `public/admin`；确认 GUI 入口在 `/app/admin`（`/admin` 为 API 返回 401）。
  - 文件：`apps/medusa/Dockerfile`。
- CI 表达式错误（`github.sha.substring`）
  - 处理：用 `github-script` 的 JS `slice(0,7)` 生成短 SHA；移除不被支持的表达式。
  - 文件：`.github/workflows/ci.yml`。

## 现在的流水线与脚本
- 部署工作流：`.github/workflows/deploy-services.yml`
  - 触发：push main/staging、workflow_dispatch。
  - 流程：Build&Push → scp 工具 → 可选首机初始化（first-init）→ 远端 `deploy.sh`（pull+迁移+up）→ 汇总。
  - 首机开关：workflow_dispatch 勾选 `first_init`（可传 `db_password`），或设置仓库变量 `vars.GCE_FIRST_INIT='true'`。
- 首机脚本：`scripts/gce/first-init.sh`
  - PG/Redis 配置、UFW/iptables 放行 docker0、可选创建 `cs` 用户与数据库（密码写入 `/root/cs-db-password.txt`）。
- 部署脚本：`scripts/gce/deploy.sh`
  - `compose down` → 端口预检 → `compose pull` → 预跑 Medusa 迁移 → `compose up -d` → 健康采集。
- 健康脚本：`infra/gcp/bin/collect-health.sh`
  - Medusa `/health`、Strapi `/_health`。

## 域名 / Tunnel / 访问路径
- Cloudflare Tunnel 主机名路由：
  - `api.aidenlux.com` → `http://127.0.0.1:9000`
  - `content.aidenlux.com` → `http://127.0.0.1:1337`
- 后台路径：
  - Medusa Admin：`/app/admin`（建议在 CF 做 `/admin` → `/app/admin` 301 以兼容习惯）。
  - Strapi Admin：`/admin`。
- CORS：Medusa 仅保留 `https://api.aidenlux.com`；Strapi 设置 `URL/ADMIN_URL` 为 `https://content.aidenlux.com[/admin]`。

## 当前主机健康回放（验证点）
- 容器：`cs-medusa-1`、`cs-strapi-1` 均 healthy。
- 探针：`/health`（Medusa 200）、`/_health`（Strapi 204；`/health` 200 亦可）。
- DB：`pg_isready` ready；容器→host.docker.internal 的 5432/6379 连通。

## 一键操作手册
- 首机（一次性）：
  - `sudo bash scripts/gce/first-init.sh --db-password '<StrongPass>'`
  - 或在 Deploy Services 手动运行时勾选 `first_init=true` 并填 `db_password`。
- 日常部署：
  - push main 或 Actions → Deploy Services → Run workflow。
- 验证：
  - `curl -I https://api.aidenlux.com/health` → 200
  - `curl -I https://content.aidenlux.com/_health` → 204（或 `/health` 200）
  - 打开：`https://api.aidenlux.com/app/admin`、`https://content.aidenlux.com/admin`

## 经验与教训
- Builder 需要 dev 依赖，运行阶段再精简。
- scp 源格式与远端路径要一一对应；失败前加本地预检。
- GHCR 在“主机侧”也要认证；优先采用最小权限的 PAT。
- 容器→主机 DB 不是只改 env 就通，需要 PG/Redis/防火墙三项协同。
- 健康端点要与真实行为一致，避免受鉴权路由作为探针。
- 端口预检与日志采集能显著降低故障排查成本。

## 建议的后续加固
- 用只读 PAT 替换主机 GHCR 登录；
- Cloudflare Access 仅保护后台路径（Medusa `/app/admin/*`、Strapi `/admin/*`），对健康端点设置 Bypass；
- 在部署后加入端到端冒烟测试（/health、/admin 302/200、DB ping）作为通过门槛；
- 将 `cs` 口令、R2/邮件等密钥纳入 Secret Manager，执行季度轮换。

---

- 参考：
  - `.github/workflows/deploy-services.yml`
  - `scripts/gce/deploy.sh`、`scripts/gce/first-init.sh`
  - `infra/gcp/bin/collect-health.sh`、`infra/gcp/docker-compose.yml`
  - `apps/medusa/Dockerfile`、`apps/strapi/Dockerfile`、`apps/strapi/src/api/health/*`
  - `docs/gcp-ubuntu-deployment-brief.md`

