# CI/CD → GCE 全流程问答与复盘（2025-10-26）

本文记录你在将 Medusa 与 Strapi 通过 GitHub Actions 部署到 GCE（并经 Cloudflare
Tunnel 暴露）过程中的关键提问与我的回答，附带最终复盘与操作要点，方便后续团队复用。

---

## 问答实录（按时间序）

Q1. 我如何验证 Story 1.6，git push main 就会生成镜像并发布到 GCE 吗？
A1. 是的，若 `.github/workflows/deploy-services.yml` 配置了 `on: push: main` 且必要
    secrets 就绪，push main 会触发 CI：构建 GHCR 镜像 → SSH 到 GCE 执行部署 → 拉取
    新镜像并 `docker compose up -d`，最后做健康检查。给出 AC 对齐的验证清单
    （端口与健康探针、Cloudflare、GHCR 包验证、Dev 本地对齐等）。

Q2. 打开 `.github/workflows/deploy-services.yml` 帮我确认触发和 secrets 映射？
A2. 触发：push main/staging 与 workflow_dispatch；权限已配置 `packages: write`；
    需要的 secrets：`GCE_HOST`、`GCE_USER`、`GCE_SSH_KEY`；仓库 Settings→Actions 需
    启用 “Read and write permissions”。

Q3. `GITHUB_TOKEN` 是我自己设置的吗，在哪里获取？
A3. 不是。GitHub 为每次 Actions 运行自动注入临时 `GITHUB_TOKEN`，工作流中以
    `${{ secrets.GITHUB_TOKEN }}` 使用；若需跨组织或本地推送 GHCR，用 PAT。

Q4. 我按《gce-backend-playbook》做完主机与 GitHub 配置，如何验证能正常工作？
A4. 给出端到端验证清单：Secrets、/srv/cs 目录、Compose 校验、push 或手动运行
    工作流、GCE 上 curl 健康探针与 docker ps、Cloudflare 公网探针、GHCR 包页确认
    以及证据写入 runbook。

Q5. 主机上的 `/srv/cs/.env` 用谁的 GHCR 命名空间？
A5. 你不是组织用户，直接用你的 GitHub 用户名。示例：
    `MEDUSA_IMAGE=ghcr.io/coderisedev/cs-medusa`、
    `STRAPI_IMAGE=ghcr.io/coderisedev/cs-strapi`。

Q6. 帮我生成一条命令在 GCE 上修正 `.env` 两个镜像前缀并回显？
A6. 提供单条 SSH 命令：备份 `.env`、修正/追加两行、grep 确认；如无 sudo 权限可
    去掉 sudo；随后我实际在 GCE 上执行并回显确认。

Q7. Deploy Services 运行仅 1–2 分钟就结束，这是正常吗？
A7. 不正常。通常是早期失败（缺 secrets、GHCR 权限或 scp/ssh 失败）。建议打开
    失败步骤日志定位具体错误。

Q8. 构建失败：`pnpm install --filter xxx --prod --frozen-lockfile` 退出 1？
A8. Builder 阶段需要 devDependencies 才能产物打包，移除 `--prod` 并固定 pnpm
    版本（corepack prepare）。我已修正两份 Dockerfile 并推送。

Q9. scp 步骤报 `tar: empty archive` 或远端安装路径 `install ... /tmp/cs-***/***.sh` 不存在？
A9. scp Action 要用单行逗号分隔源；远端路径要匹配 scp 的目录结构。我修正了
    `source` 表达与远端 install 路径，并新增“预校验源文件存在”的步骤。

Q10. Workflow 报 `github.sha.substring(0,7)` 表达式非法？
A10. GitHub 表达式不支持调用方法。我改为在 `github-script` 里用
     `const shortSha = (context.sha||...).slice(0,7)` 后再插入模板。

Q11. 1337 端口被占用，如何彻底释放？
A11. 先 `docker compose down`；若仍占用，找 systemd/PM2/自启进程 `ss -ltnp`
     + `systemctl`/`pm2` 停用；我也将部署脚本加入 down 与端口预检，提示清晰错误。

Q12. 拉取 GHCR 被拒绝 `denied: denied`？
A12. 在主机侧也要 `docker login ghcr.io`。我在部署步骤里加入 GHCR 登录（可改为 PAT）。

Q13. 容器启动后 DB 连接仍超时？
A13. 需要三件事：PostgreSQL 监听 docker0 网关、pg_hba 放行 docker0 网段、主机
     防火墙允许 docker0→5432/6379。我提供并执行了检查与修复；同时校验了
     `cs` 用户密码与 `DATABASE_URL` 一致性。

Q14. 健康检查路径不一致怎么办？
A14. 统一：Medusa 用 `/health`，Strapi 用 `/_health`（我也实现了 `/health`=200）。
     更新了健康脚本与 compose 的 healthcheck。

Q15. 需要将 Medusa 管理端打包进镜像？
A15. 是。我在镜像构建阶段运行 `@medusajs/admin-bundler` 产出 `public/admin`。最终
     后台入口在 `/app/admin`，而 `/admin` 是受保护 API（未登录 401）。

Q16. 想要一键初始化首台主机？
A16. 我新增 `scripts/gce/first-init.sh`，负责 PG/Redis 防火墙与配置、docker0 放行、
     可选创建 `cs` 用户与两个生产库；并把它作为工作流的可选前置开关。

Q17. 我将域名改为 `api.aidenlux.com` 与 `content.aidenlux.com`，需要更新哪里？
A17. 我在主机上更新了 `/srv/cs/env/medusa.env` 的 CORS（仅保留 api），以及
     `/srv/cs/env/strapi.env` 的 URL/ADMIN_URL，并重启容器验证健康 200/204。

Q18. 是否要用 Cloudflare Access 保护后台？
A18. 可选。仅应用登录也能保护；但推荐为 `/app/admin`（Medusa）与 `/admin`（Strapi）
     加一层 Access（SSO/MFA/策略），并为健康路径加 Bypass。

Q19. 访问 `https://api.aidenlux.com/admin` 返回 401 `{"message":"Unauthorized"}`，为什么？
A19. `/admin` 是 API 受保护入口；管理员 GUI 在 `/app/admin`。可在 Cloudflare 做 301
     将 `/admin` 跳转到 `/app/admin`，也可直接用 `/app/admin`。

Q20. 请输出一次全面复盘。
A20. 已提供（见“复盘总结与现状快照”）。

---

## 复盘总结与现状快照

- 关键修复：
  - Dockerfile devDeps 与 pnpm 固定；scp 源与远端路径修正；GHCR 登录；端口预检；
    PG/Redis 与防火墙连通；统一健康探针；Medusa Admin 打包；Strapi `/health`；
    首机初始化脚本；CI 表达式修复。

- 状态：
  - GCE 上容器 healthy；`/health`（Medusa 200）与 `/_health`（Strapi 204）通过；
    Cloudflare 主机名路由就绪。

- 入口：
  - Medusa Admin：`https://api.aidenlux.com/app/admin`
  - Strapi Admin：`https://content.aidenlux.com/admin`

- 一键运维：
  - 首机：`sudo bash scripts/gce/first-init.sh --db-password '<StrongPass>'`
  - 部署：push main 或手动 Run workflow（可勾 `first_init`）

- 主要改动文件（节选）：
  - `.github/workflows/deploy-services.yml`
  - `apps/medusa/Dockerfile`、`apps/strapi/Dockerfile`
  - `apps/strapi/src/api/health/*`
  - `infra/gcp/bin/collect-health.sh`、`infra/gcp/docker-compose.yml`
  - `scripts/gce/deploy.sh`、`scripts/gce/first-init.sh`
  - `docs/gcp-ubuntu-deployment-brief.md`

---

## Cloudflare Tunnel 与 Access 速记

- 主机名路由：
  - `api.aidenlux.com` → `http://127.0.0.1:9000`
  - `content.aidenlux.com` → `http://127.0.0.1:1337`
- 可选 Access：
  - Medusa：Self‑hosted 应用 `/app/admin/*`；Bypass `/health`
  - Strapi：Self‑hosted 应用 `/admin/*`；Bypass `/health` 与 `/_health`

---

## 附：常用排障清单

- GHCR 401：仓库 Actions 权限改为 Read and write；或改用 PAT 登录。
- 1337/9000 占用：`docker compose down`；如仍占用，`systemctl`/`pm2` 停止对应服务。
- 容器连 DB 超时：检查 `listen_addresses`、`pg_hba`、UFW/iptables 与 `DATABASE_URL`。
- 健康探针失败：确认使用 `/health`（Medusa）与 `/_health` 或 `/health`（Strapi）。
- scp 失败：sources 单行逗号分隔；远端安装路径要匹配 scp 目录结构。

---

（本文由对话整理生成，覆盖 CI/CD→GCE 实战中出现的全部关键问题与修复措施。）

