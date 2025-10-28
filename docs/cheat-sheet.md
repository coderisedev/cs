# GCE 部署与运维速查表

本速查表按“首机 / 日常 / 验证 / 排障 / 回滚”五段提供最少命令集。

## 1) 首机（一次性）
- 初始化主机数据库/防火墙/Redis 并可选创建 `cs` 账户与 DB：
  - `sudo bash scripts/gce/first-init.sh --db-password '<StrongPass>'`
- 或在 GitHub Actions 手动运行 Deploy Services：
  - 勾选 `first_init=true`，可填 `db_password`

## 2) 日常部署
- 推送：`git push origin main`
- 或手动：Actions → Deploy Services → Run workflow

## 3) 快速验证
- 本地/公网（Cloudflare Tunnel 后）
  - `curl -I https://api.aidenlux.com/health`  # 200
  - `curl -I https://content.aidenlux.com/_health`  # 204（或 /health 200）
- 管理后台
  - Medusa Admin：`https://api.aidenlux.com/app/admin`
  - Strapi Admin：`https://content.aidenlux.com/admin`

## 4) 主机侧常用
- 查看 TAG 与容器：
  - `awk -F= '/^TAG/{print $0}' /srv/cs/.env`
  - `docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'`
- 端口/进程：
  - `ss -ltnp | egrep ':(9000|1337|5432|6379)\b'`
- 直接健康探针（回环）：
  - `curl -I http://127.0.0.1:9000/health`
  - `curl -I http://127.0.0.1:1337/_health`

## 5) 排障指引（最短路径）
- 构建失败：看 Actions “Build and push * image” 步骤日志
- GHCR 拉取拒绝：
  - 工作流现为“PAT 优先，GITHUB_TOKEN 回退”；检查 Secrets `GHCR_USERNAME/GHCR_PAT`
- 端口占用：
  - `docker compose -f /srv/cs/docker-compose.yml down`；若仍占用检查 systemd/PM2
- DB 超时：
  - `pg_isready -h 127.0.0.1 -p 5432`
  - PG `listen_addresses`、`pg_hba` 放行 docker0；UFW/iptables 放行 5432/6379
- 健康探针错用：
  - Medusa 用 `/health`；Strapi 用 `/_health` 或 `/health`
- Medusa Admin 401：
  - GUI 入口在 `/app/admin`；如需 `/admin`，在 Cloudflare 做 301 到 `/app/admin`

## 6) 回滚（简化）
- 切换至上一个稳定 Tag（`<sha>` 替换为目标）
  - 编辑 `/srv/cs/.env` 中 `TAG=<sha>` 后：
    - `cd /srv/cs && docker compose pull && docker compose up -d --remove-orphans`
- 验证健康与后台可用，再决定是否回滚数据库（如需要）

---

相关文档：
- `docs/ci-cd-gce-flow-2025-10-26.md`（端到端流程）
- `docs/ci-cd-gce-retrospective-2025-10-26.md`（全面复盘）
- `docs/gcp-ubuntu-deployment-brief.md`（部署简报 / 首机第 11 节）

## 7) Playwright E2E（本地与CI）
- 安装浏览器依赖（一次性）
  - `pnpm test:e2e:install`
- 本地运行（需设置目标 URL）
  - 预览/生产：
    - `WEB_BASE_URL='https://<web-host>' pnpm test:e2e -- --grep "smoke"`
    - `MEDUSA_BASE_URL='https://api.aidenlux.com' STRAPI_BASE_URL='https://content.aidenlux.com' pnpm test:e2e -- tests/e2e/admin.apps.spec.ts tests/e2e/health.postdeploy.spec.ts`
- CI 产物与调试
  - 预览分支：CI 会运行“Preview Smoke Tests”，上传 `playwright-report/` 工件
  - 查看 HTML 报告：下载工件后打开 `index.html`，或本地运行 `pnpm exec playwright show-report`
  - Trace：测试在重试时会采集 trace（`trace.zip`），方便复盘失败现场
