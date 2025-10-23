

# 一、目标与取舍（共识）

* **前端**：部署在 **Vercel**（域名自行绑定）。
* **后端（Prod）**：在 **GCE Ubuntu** 上用 **Docker** 跑 **Medusa(9000)** / **Strapi(1337)**。
* **数据库（Prod）**：**PostgreSQL/Redis 安装在宿主机**（仅监听 127.0.0.1），后期再升级到 Cloud SQL / Memorystore。
* **入口**：用 **Cloudflare Tunnel** 暴露 `api.xxx.com` / `content.xxx.com` → 本地 9000/1337（免 Nginx/免证书）。
* **CI/CD**：**GitHub Actions（托管 Runner）构建镜像 → 推 GHCR → SSH 登录 GCE 执行 docker compose 更新**。
* **开发（Dev）**：Ubuntu 宿主机跑 Node（Medusa/Strapi），**Postgres/Redis 用 Docker**（便于清理与快照）。

---

# 二、架构总览（一句话理解）

```
Vercel(前端)
    |
Cloudflare(域名/DNS)
    |
Cloudflare Tunnel (Anycast) ──> GCE Ubuntu
                                  ├─ Docker: medusa:9000, strapi:1337  ← 从 GHCR 拉镜像
                                  ├─ Host: PostgreSQL (127.0.0.1:5432)
                                  └─ Host: Redis      (127.0.0.1:6379)
```

---

# 三、生产环境（Prod）执行要点

## 1) 宿主数据库与缓存（最少改动、仅本机监听）

* 安装并加固：

  * Postgres：创建专用用户与库；`listen_addresses='127.0.0.1'`；`pg_hba.conf` 仅允许 `127.0.0.1/32 md5`。
  * Redis：`bind 127.0.0.1`、`protected-mode yes`（可选 `requirepass`）。
* **容器访问宿主**：在 compose 里用
  `extra_hosts: ["host.docker.internal:host-gateway"]`，并把连接串写成
  `postgres://user:pass@host.docker.internal:5432/db`、`redis://host.docker.internal:6379`
  （容器里 `127.0.0.1` 指向容器自身，**不是宿主**）。

## 2) Cloudflare Tunnel（免 80/443）

* `cloudflared tunnel create cs-tunnel`；`/etc/cloudflared/config.yml`：

  * `api.example.com -> http://localhost:9000`
  * `content.example.com -> http://localhost:1337`
* `cloudflared tunnel route dns` 绑定两条域名；`systemctl enable --now cloudflared`。

## 3) Docker Compose（后端容器）

* 目录：`/srv/cs/`

* `.env`：`MEDUSA_IMAGE`/`STRAPI_IMAGE`、`TAG=prod`（模板位于 `infra/gcp/.env.example`，由部署脚本自动更新 `TAG`）。
* `env/medusa.env`、`env/strapi.env`：端口/CORS/DB/Redis/JWT 等（使用 `infra/gcp/env/*.env.example` 生成并手动填入敏感值）。
* `docker-compose.yml`：两个服务端口仅绑定 `127.0.0.1`，加 `extra_hosts: host.docker.internal:host-gateway`。模板位于 `infra/gcp/docker-compose.yml`。
* `bin/collect-health.sh`：运行 `curl` 探针并将输出写入 `/srv/cs/logs/health-*.log`（模板位于 `infra/gcp/bin/collect-health.sh`）。

> **健康检查**：Medusa 用 `/store/health`；Strapi 用 `/health`（镜像内需 `strapi build`）。

---

# 四、CI/CD（一次推送，自动上线）

## 1) Build（托管 Runner）

* `docker/build-push-action` 构建 2 张镜像：

  * `ghcr.io/<owner>/<repo>/medusa:{sha}` 和 `:prod`
  * `ghcr.io/<owner>/<repo>/strapi:{sha}` 和 `:prod`
* `permissions: packages: write`，使用默认 `GITHUB_TOKEN` 登录 GHCR 推送镜像。

## 2) Deploy（SSH 到 GCE）

* 新的 GitHub Actions 流程：`.github/workflows/deploy-services.yml`
  1. 构建 `apps/medusa/Dockerfile`、`apps/strapi/Dockerfile` 并推送到 GHCR（`ghcr.io/<org>/cs-medusa:<sha>` 等）。
  2. 拷贝 `scripts/gce/deploy.sh` 与 `infra/gcp/bin/collect-health.sh` 到 GCE 主机。
  3. 通过 `deploy.sh --tag <sha>` 更新 `/srv/cs/.env`，执行 `docker compose pull`、`docker compose up -d --remove-orphans`。
  4. 自动运行健康检查脚本并将日志尾部写入 Actions Summary（复制到 `docs/runbooks/status-log.md`）。

> **关键理解**：SSH 部署 = Actions 帮你远程执行上述命令，**不是你手工敲**。

---

# 五、开发环境（Dev）快速约定

* Docker 跑数据库与缓存（`~/compose-dev.yml`），映射到宿主 `127.0.0.1:5432/6379`。
* 宿主机 Node 跑 Medusa/Strapi（或用 pm2/tmux 常驻），`.env` 指向 `localhost`。
* 使用 `infra/gcp/env/*.env.example` 和 `scripts/gce/deploy.sh` 中的变量命名，保持与生产一致。

---

# 六、参数/占位（上线前填好）

| 项目          | 示例                                                                   | 备注                                             |
| ----------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| 域名（API）     | `api.example.com`                                                    | Tunnel 回源 `127.0.0.1:9000`                     |
| 域名（CMS）     | `content.example.com`                                                | Tunnel 回源 `127.0.0.1:1337`                     |
| GHCR 前缀     | `ghcr.io/<owner>/<repo>`                                             | 建议全小写                                          |
| DB（Prod）    | `postgres://cs:********@host.docker.internal:5432/medusa_production` | Strapi 同理                                      |
| Redis（Prod） | `redis://host.docker.internal:6379`                                  | 如设密码：`redis://:pass@host.docker.internal:6379` |
| CORS        | `STORE_CORS`, `ADMIN_CORS`                                           | 加上 Vercel 生产域名与 `*.vercel.app`                 |
| GH Secrets  | `GCE_HOST/GCE_USER/GCE_SSH_KEY`                                      | 供 SSH 部署用                                      |

---

# 七、上线验收（Checklist）

1. **Tunnel**：`systemctl status cloudflared` 为 active；两个域名 200。
2. **容器**：`docker ps` 显示 medusa/strapi 运行中；`compose logs` 无异常。
3. **DB/Redis**：`ss -lntp | egrep '5432|6379'` 显示仅监听 `127.0.0.1`。
4. **CI/CD**：Push 到 `main` → Actions 构建与部署成功，`.env` 的 `TAG` 已写入本次 SHA。
5. **前端联通**：Vercel 前端能成功请求 API（CORS 正确）。

---

# 八、回滚与运维

* **快速回滚**：

  ```bash
  cd /srv/cs
  sed -i "s/^TAG=.*/TAG=<旧的SHA>/" .env
  docker compose up -d
  ```

  （也可在 workflow 里支持手动输入 `rollback_to` 参数）
* **安全基线**：SSH 最小暴露、DB/Redis 本机监听、Secrets 不入库、`--password-stdin` 登录 GHCR。
* **备份建议**：Postgres 开启定时备份（至少逻辑备份 pg_dump）；Redis 可按需持久化或借助系统快照。

---

# 九、后续平滑升级（不影响现有）

* **Redis → Memorystore**、**Postgres → Cloud SQL（DMS 迁移 + 短停切换）**。
* **Cloudflare Tunnel→ 私网/负载均衡**（看规模再演进）。
* **观测**：装 Google Ops Agent，接入 Cloud Monitoring/Logging 告警。
* **系统**：生产优先 **Ubuntu LTS**（24.04），减少维护频率。

---

## 一句话复盘

我们选了一条**组件最少、认知负担最低**的路径：**容器化后端 + 宿主机数据库 + Cloudflare Tunnel 出口 + Actions 打包部署**。你只要**push 代码**，其余都由流水线和隧道接手；等业务稳定，再把数据库/缓存迁到托管服务即可。

需要的话我能把 **compose/env/workflow/tunnel 配置**按你真实域名与仓库一次性替换好，直接拷贝可用。
