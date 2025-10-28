# GCP Ubuntu 部署要求简报

## 1. 调整目的与目标
- **现状**：Next.js 前端托管在 Vercel；Medusa（电商）与 Strapi（内容）部署在 Railway，并依赖 Railway 提供的 PostgreSQL 与 Redis。
- **目标**：保持 Vercel 前端不变，将 Railway 承载的服务迁移到 GCP 的 Ubuntu Server（建议 22.04 LTS），实现与 Railway 等价的运行效果与稳定性。
- **范围**：Medusa 与 Strapi 两个 Node.js 服务、依赖数据库/缓存、CI/CD 环节中引用的环境变量与密钥、域名与网络拓扑。

## 2. 架构总览（迁移后）
- **Vercel（保持不变）**
  - 代码路径：`apps/storefront`
  - 主要依赖：Pulumi + Vercel provider（`infra/pulumi/vercel.ts`）
  - 触发方式：`main` 分支合并后自动部署，PR 生成 Preview。
- **GCP Ubuntu Server（新增）**
  - 推荐形态：单台 `e2-standard-2` 或同等配置，托管 Medusa 与 Strapi。
  - 操作系统：Ubuntu 22.04 LTS（含 `systemd`）。
  - 访问方式：SSH + GitHub Actions（后续可接入 Runner）。
  - 对外域名：`medusa.cs.com`（或 `api.cs.com`）与 `content.cs.com`，通过 Cloudflare/Nginx 反向代理到本机端口。
- **外部托管服务**
  - 数据库：迁移至 GCP Cloud SQL for PostgreSQL（推荐）或在服务器上通过 Docker 部署 PostgreSQL 15。
  - 缓存：GCP Memorystore for Redis（推荐）或本机 Docker Redis 7。
  - 对象存储：继续使用 Cloudflare R2（保留现有 `R2_*` 变量）。

## 3. 系统与基础依赖
- Node.js 20.x（Medusa 要求），可使用 `nvm` 或直接安装官方二进制。
- pnpm 9.x（`corepack enable`）。
- Python 3 与 build-essential（构建原生依赖）。
- 数据库/缓存客户端：`psql`, `redis-cli` 便于调试。
- 可选：PM2 或以 `systemd` service 方式常驻运行 Medusa、Strapi。

### 首次主机初始化（必做，一次性）
- 使用仓库内的脚本为 docker0 网段放行数据库/缓存、配置 PostgreSQL/Redis，并可选创建 `cs` 用户与数据库：
  ```bash
  # 在主机上（建议 root 或 sudo）
  sudo bash /opt/cs/scripts/gce/first-init.sh --db-password '<YourStrongPass>'
  # 若由 GitHub Actions 触发部署，也可在“Deploy Services”工作流通过开关执行：
  # Actions → Deploy Services → Run workflow → first_init=true [db_password 可选]
  ```
  - 主要动作：设置 PG `listen_addresses` 与 `pg_hba.conf`，为 docker0 开放 5432/6379（UFW/iptables），
    配置 Redis `bind` 与 `protected-mode`，并可创建 `cs` 账户和 `medusa_production`/`strapi_production` 数据库。
  - 脚本位置：`scripts/gce/first-init.sh`（已在 CI 中按需下发到主机）。

## 4. 代码获取与目录结构
1. 在服务器上创建部署用户（如 `csops`），克隆仓库到 `/opt/cs`：
   ```bash
   sudo adduser csops
   sudo su - csops
   git clone git@github.com:coderisedev/cs.git /opt/cs
   cd /opt/cs
   pnpm install --frozen-lockfile
   ```
2. 保持与仓库一致的目录结构（`apps/medusa`, `apps/strapi`, `packages/*`, `infra/` 等）。
3. 后续部署脚本应从仓库根目录执行，以确保 `pnpm` workspace 正常解析。

## 5. 服务运行要求

| 服务 | 代码路径 | 默认端口 | 构建命令 | 启动命令 | 备注 |
| ---- | -------- | -------- | -------- | -------- | ---- |
| Medusa | `apps/medusa` | 9000 | `pnpm --filter medusa build` 或 `pnpm exec medusa build` | `./scripts/railway-medusa-start.sh`（含迁移流程）或 `pnpm exec medusa start` | 启动脚本会执行数据库迁移与链接同步 |
| Strapi | `apps/strapi` | 1337 | `pnpm --filter strapi build` 或 `pnpm strapi build` | `pnpm --filter strapi start` | 首次启动前需要 `pnpm --filter strapi strapi build` |

**推荐 systemd 服务模板（示例）**

```ini
[Unit]
Description=CS Medusa Service
After=network.target

[Service]
User=csops
WorkingDirectory=/opt/cs
EnvironmentFile=/opt/cs/env/medusa.production.env
ExecStart=/usr/bin/env bash -lc "./scripts/railway-medusa-start.sh"
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Strapi 可复用类似模板，`ExecStart=/usr/bin/env bash -lc "cd apps/strapi && pnpm strapi start"`。

## 6. 环境变量与密钥

### 6.1 配置生成
- 使用仓库提供的模板复制到生产目录：
  ```bash
  sudo mkdir -p /srv/cs/env
  sudo cp infra/gcp/.env.example /srv/cs/.env
  sudo cp infra/gcp/env/medusa.env.example /srv/cs/env/medusa.env
  sudo cp infra/gcp/env/strapi.env.example /srv/cs/env/strapi.env
  sudo cp infra/gcp/bin/collect-health.sh /srv/cs/bin/collect-health.sh
  ```
- 填入真实凭据并限制权限（`chmod 600`）。部署脚本 `scripts/gce/deploy.sh` 会自动刷新 `.env` 内的 `TAG=`。

### 6.2 Medusa 关键变量（`apps/medusa/.env`）
- `DATABASE_URL`（Cloud SQL 连接串，如 `postgresql://user:pass@HOST:5432/medusa`）
- `REDIS_URL`（Memorystore 连接，如 `redis://HOST:6379`，需开启 AUTH 可追加密码）
- `JWT_SECRET`, `COOKIE_SECRET`
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`（需包含 Vercel 域名与自定义域）
- 支付与第三方集成：`PAYPAL_*`, `STRIPE_*`, `SENDGRID_API_KEY`, `R2_*`, `SENTRY_*`

### 6.3 Strapi 关键变量（`apps/strapi/.env`）
- `DATABASE_URL` 或 `DATABASE_*` 六元组
- 安全密钥：`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`
- 域名：`URL`, `ADMIN_URL`
- 存储与集成：`R2_*`, `SENDGRID_*`, `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, `SENTRY_*`
- 功能开关：`ENABLE_ANALYTICS`, `ENABLE_COMMUNITY_INTEGRATIONS` 等

### 6.4 变量管理
- 将生产密钥放入 GCP Secret Manager 或 1Password，systemd `EnvironmentFile` 指向解密后的 `.env`。
- 保持与 `docs/runbooks/environment-config.md` 中的轮换策略一致（季度轮换）。

## 7. 数据库与缓存迁移指南
- **PostgreSQL**
  - 创建两个数据库：`medusa_production`, `strapi_production`。
  - 启用自动备份、最小 7 天保留，开启高可用（可选）。
  - 允许来自 Ubuntu Server 的私网/公网访问（推荐使用 GCP VPC Peering）。
- **Redis**
  - 创建 Redis 实例（Memorystore 兼容 Redis 7）。
  - 开启高可用与自动故障转移。
  - 提供给 Medusa 的 `REDIS_URL`，Strapi 当前不依赖 Redis。
- **数据迁移步骤**
  1. 导出现有 Railway 数据（`railway dump` 或 PostgreSQL `pg_dump`）。
  2. 导入到 Cloud SQL：`psql -h <host> -U <user> -d medusa_production -f dump.sql`。
  3. 验证迁移后表结构与数据完整性。

## 8. 网络与安全
- 在 Ubuntu Server 上配置 Nginx/Traefik 反向代理：
  - `medusa.cs.com` → `http://127.0.0.1:9000`
  - `content.cs.com` → `http://127.0.0.1:1337`
  - 强制 HTTPS（Let’s Encrypt 或 Cloudflare TLS）。
- 开启防火墙，仅开放 80/443（及 SSH），内部端口通过 localhost 访问。
- 通过 Cloudflare 维护 DNS，保留现有 CDN 与 R2 配置。
- 确保 webhook（Strapi → Next.js、Medusa webhooks）更新为新域名。

## 9. CI/CD 与运维配合
- `.github/workflows/deploy-services.yml` 现负责后端部署：
  1. 通过 `apps/medusa/Dockerfile`、`apps/strapi/Dockerfile` 构建镜像并推送到 `ghcr.io/<org>/cs-*`。
  2. 将 `scripts/gce/deploy.sh`、`infra/gcp/bin/collect-health.sh` 拷贝到主机并执行 `deploy.sh --tag <sha>`。
  3. 采集 `/srv/cs/logs/deploy-*.log` 和健康检查输出，附加在 Actions Summary。
- Pulumi 仍然管理 Vercel 资源；后端主机配置通过此文档与 shell 脚本维护，后续可选择引入 GCP Provider。
- 部署完成后在工作站运行：
  ```bash
  curl https://api.<domain>/store/health
  curl https://content.<domain>/health
  ```
  将结果写入 `docs/runbooks/status-log.md` 并附上 GitHub Actions 运行链接。
- 同步更新 `docs/runbooks/environment-config.md` 记录变量哈希和轮换计划。

## 10. 验证清单
- [ ] `pnpm install`、构建与启动在服务器上顺利完成。
- [ ] Medusa 能成功运行迁移脚本并连接 Cloud SQL/Postgres。
- [ ] Strapi 管理后台可登录，媒体上传指向 Cloudflare R2。
- [ ] Next.js 前端通过新域名成功访问 API（CORS 正确）。
- [ ] Webhook、支付、邮件等集成测试通过。
- [ ] systemd 服务启停正常，日志写入 `journalctl -u medusa/strapi`。
- [ ] 制定数据库与密钥的备份/轮换计划。

## 11. GCE 防火墙与 pg_hba 配置（Docker 容器访问主机数据库）

当 Medusa/Strapi 在容器内运行，而 PostgreSQL/Redis 在主机上运行时，需要允许 docker0 网桥网段
访问主机 5432/6379，否则应用会在启动阶段出现数据库连接超时。

1. 识别 docker0 网段
   - 典型默认：`172.17.0.0/16`（网关通常为 `172.17.0.1`）
   - 命令确认：
     ```bash
     ip -4 addr show docker0 | awk '/inet /{print $2}'  # 例：172.17.0.1/16
     ```

2. PostgreSQL 配置
   - 编辑 `postgresql.conf`（版本路径示例 `/etc/postgresql/14/main/postgresql.conf`）：
     - 将 `listen_addresses` 设为仅本机与 docker0 网关：
       ```
       listen_addresses = '127.0.0.1,172.17.0.1'
       ```
       如需临时排障可使用 `'*'`，但不建议在长期生产环境中保留。
   - 编辑 `pg_hba.conf`（同版本目录）：
     - 追加一行，允许 docker0 网段基于密码访问：
       ```
       host all all 172.17.0.0/16 scram-sha-256
       ```
       若实例仍使用 md5，可改为 `md5`。
   - 重启并验证：
     ```bash
     sudo systemctl restart postgresql
     pg_isready -h 127.0.0.1 -p 5432   # 应 ready
     pg_isready -h 172.17.0.1 -p 5432 # 应 ready
     ```

3. Redis 配置（二选一）
   - 推荐做法：仅绑定本机与 docker0 网关，同时保持保护模式开启：
     - `/etc/redis/redis.conf`：
       ```
       bind 127.0.0.1 172.17.0.1
       protected-mode yes
       ```
   - 兼容做法（依赖防火墙严格限制来源）：
       ```
       bind 0.0.0.0
       protected-mode no
       ```
   - 重启并验证：
     ```bash
     sudo systemctl restart redis-server
     ss -ltnp | grep ':6379'
     ```

4. 主机防火墙放行 docker0 网段到数据库/缓存
   - 使用 UFW：
     ```bash
     sudo ufw allow from 172.17.0.0/16 to any port 5432 proto tcp
     sudo ufw allow from 172.17.0.0/16 to any port 6379 proto tcp
     sudo ufw reload
     sudo ufw status
     ```
   - 或使用 iptables（即时生效，注意持久化）：
     ```bash
     sudo iptables -C INPUT -i docker0 -p tcp -m multiport --dports 5432,6379 -j ACCEPT \
       || sudo iptables -I INPUT -i docker0 -p tcp -m multiport --dports 5432,6379 -j ACCEPT
     ```
     nftables 环境可用：
     ```bash
     sudo nft add rule inet filter input iif "docker0" tcp dport {5432,6379} accept
     ```

5. 容器连通性与凭据校验
   - 解析宿主：
     ```bash
     docker exec cs-medusa-1 getent hosts host.docker.internal
     ```
   - TCP 直连探测：
     ```bash
     docker exec cs-medusa-1 bash -lc 'exec 3<>/dev/tcp/host.docker.internal/5432 && echo ok || echo fail'
     docker exec cs-medusa-1 bash -lc 'exec 3<>/dev/tcp/host.docker.internal/6379 && echo ok || echo fail'
     ```
   - 数据库密码校验（从主机侧）：
     ```bash
     export PGPASSWORD='<cs-password>'
     psql -h 127.0.0.1 -U cs -d medusa_production -c 'select 1;'
     psql -h 127.0.0.1 -U cs -d strapi_production -c 'select 1;'
     ```

6. 健康检查端点（与 Compose/脚本一致）
   - Medusa：`http://127.0.0.1:9000/health`（无需发布密钥）；`/store/health` 需携带 `x-publishable-api-key`。
   - Strapi：`http://127.0.0.1:1337/health` 或 `/_health`（已在应用内实现 200）。

安全提示：仅放行 docker0 网段到 5432/6379，避免 `0.0.0.0/0`；数据库用户 `cs` 的口令需纳入密钥轮换，
并与 `/srv/cs/env/*.env` 中的 `DATABASE_URL` 保持一致。

---

**参考资料**
- `docs/solution-architecture.md`（整体架构）
- `docs/medusa-railway-setup.md`（Medusa 构建与环境变量说明）
- `docs/runbooks/environment-config.md`（环境变量矩阵与轮换策略）
- `docs/runbooks/status-log.md`（部署与健康检查证据）
- `infra/gcp/README.md`（GCE 主机文件结构与操作步骤）
- `scripts/gce/deploy.sh`（自动化更新脚本）
- `infra/pulumi/vercel.ts`（Vercel 托管逻辑）
 - `docs/ci-cd-gce-qa-retrospective-2025-10-26.md`（本次 Chat 的完整问答与复盘）
