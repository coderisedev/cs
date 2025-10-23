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

---

**参考资料**
- `docs/solution-architecture.md`（整体架构）
- `docs/medusa-railway-setup.md`（Medusa 构建与环境变量说明）
- `docs/runbooks/environment-config.md`（环境变量矩阵与轮换策略）
- `docs/runbooks/status-log.md`（部署与健康检查证据）
- `infra/gcp/README.md`（GCE 主机文件结构与操作步骤）
- `scripts/gce/deploy.sh`（自动化更新脚本）
- `infra/pulumi/vercel.ts`（Vercel 托管逻辑）
