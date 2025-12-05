---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/medusa-prod-db-manual-ops.md
  - docs/runbooks/medusa-dev-db-manual-ops.md
  - docs/runbooks/dev-stack-bringup-with-manual-db.md
  - docs/done/docker-env-best-practices.md
---

# GCP Secret Manager 与 VPC Private Service Connect 指南（Medusa/Strapi）

## 目标与适用场景
- 为 Medusa 与 Strapi 的 prod/dev 环境集中管理敏感配置（DB/Redis、API Key、SMTP 等），避免 .env 泄露。
- 使用 VPC Private Service Connect（PSC）为云上数据库/缓存提供私网访问，兼容当前“手工维护数据库、禁用自动 migrate/seed”的策略。
- 适用于：GCE 自管容器（`make prod-up` / `make dev-up`）、未来迁移至 Cloud SQL + Memorystore。

## Secret Manager 使用规范
### 命名与内容格式
- 建议每个环境、每个应用一条 Secret，内容直接存放 dotenv 文本：
  - `medusa-prod-env`, `medusa-dev-env`
  - `strapi-prod-env`, `strapi-dev-env`
- Secret 文本示例（直接保存为版本内容）：
```
DATABASE_URL=postgresql://medusa:***@10.0.0.5:5432/medusa_production
REDIS_URL=redis://10.0.0.6:6379
JWT_SECRET=...
STRIPE_API_KEY=...
```
- 不要把 demo seed 相关 key 写入 prod Secret；如需 rotate，新增版本即可，旧版本可保留短期回滚。

### 创建与更新
> 控制台与 CLI 二选一；控制台路径写在下方。

**先决条件**
- 已在 GCP 项目中启用 Secret Manager API（缺省启用；若未启用：Console 左上角导航 → APIs & Services → Enable APIs → 搜索 Secret Manager → 启用）。
- 有权限的账号：`Secret Manager Admin`（创建）或 `Secret Manager Secret Version Adder`（追加版本）。
  
**CLI**
```bash
PROJECT_ID=<your-project>
gcloud config set project "$PROJECT_ID"

# 创建（初次）
gcloud secrets create medusa-prod-env --replication-policy="automatic"

# 写入/更新一个版本
gcloud secrets versions add medusa-prod-env --data-file=deploy/gce/.env.prod
```
- 赋权：给运行容器的 service account 只授予 `roles/secretmanager.secretAccessor`。如需要 CI 拉取，单独的 CI service account 也用最小权限。

**Console**
- Console 右上角选择目标项目 → 左侧导航栏搜索“Secret Manager” → 打开。
- 点击 “创建密钥”：
  - 名称：`medusa-prod-env`（或 dev/strapi 对应名称）。
  - 复制 `.env` 文件内容到“密钥值”文本框（保持原始换行）。
  - 复制方式：直接粘贴 dotenv 文本；无需分行字段。
  - 复制策略：Replication 选 Automatic。
  - 点击创建。
- 权限：在密钥详情页 → “权限” → “授予访问权限” → 添加运行容器的 service account，角色选 `Secret Manager Secret Accessor`。
- 更新版本：在密钥详情页点击 “添加新版本”，粘贴最新 `.env` 内容即可。

### 拉取到运行目录（写入 .env）
```bash
# 以生产为例，落盘到 compose 使用的 env 文件（保持 600 权限）
gcloud secrets versions access latest --secret=medusa-prod-env > deploy/gce/.env.prod
chmod 600 deploy/gce/.env.prod

# Strapi / dev 同理
gcloud secrets versions access latest --secret=strapi-prod-env > deploy/gce/.env.strapi.prod
chmod 600 deploy/gce/.env.strapi.prod
```
- 拉取后用 `make prod-up`/`make prod-down` 管理容器，保持与当前手工 DB 流程一致。
- 若需要审计，启用 Secret Manager 日志并订阅到 Log Explorer / Alert。

### 轮换与回滚
- 新建版本后更新 `latest`，再滚动容器；若失败，指向上一版本即可回滚。
- 涉及 DB/Redis 密码时，先在目标实例改密，再旋转 Secret，同步到容器。

## VPC Private Service Connect（PSC）指南
### 何时用 PSC
- 生产/开发工作负载需要通过私网访问托管数据库或缓存（Cloud SQL Postgres、Memorystore Redis），避免公网/代理。
- 跨项目或需要消费者-提供者隔离时，PSC 比 VPC Peering 更易做最小暴露和配额隔离。

### 前置规划
- VPC：为 prod/dev 各一条（如 `cs-prod-vpc`，`cs-dev-vpc`），子网覆盖容器网段（示例：172.30.0.0/16 prod，172.31.0.0/16 dev）。
- DNS：准备私有 DNS 记录（如 `sql.prod.internal`，`redis.prod.internal`）指向 PSC 端点 IP，方便 `.env` 使用主机名。
- 账号：创建供容器节点使用的 service account，授予 Cloud SQL / Memorystore Client 权限 + 读取对应 Secret。
- API：确保启用 `Compute Engine API`、`Cloud SQL Admin API`、`Service Networking API`、`Cloud Memorystore for Redis API`。
- 权限：网络管理员（`roles/compute.networkAdmin`）创建 VPC/端点；数据库管理员创建 Cloud SQL/Memorystore；运行时账号仅需 client + secret accessor。

### Cloud SQL（Postgres）通过 PSC
**Console 步骤**
1) 创建 VPC 和子网（若已存在可跳过）  
   - Console → VPC network → VPC networks → Create VPC  
   - 选择自定义子网，添加子网 `cs-prod-subnet`，CIDR 如 172.30.0.0/16。  
   - 防火墙：添加允许 VPC 内部到 5432、6379 的 ingress（源 172.30.0.0/16）。
2) 创建 Cloud SQL 实例（私网）  
   - Console → SQL → Create Instance → Postgres  
   - Connectivity 选择 Private IP（Private Service Connect），Network 选 `cs-prod-vpc`，Region 按需。  
   - 创建完成后，在 Connections → Private Service Connect 获取 `Service attachment`。
3) 在消费者 VPC 创建 PSC 端点  
   - Console → VPC network → Private Service Connect → Connected endpoints → Create endpoint。  
   - Target：选择 “A service attachment in another project or network”，粘贴 Cloud SQL `Service attachment`。  
   - 网络：选 `cs-prod-vpc`；子网：`cs-prod-subnet`；分配一个静态 IP。  
   - 创建后记录 Endpoint IP，用于 DNS/连接。
4) 创建私有 DNS 记录  
   - Console → Cloud DNS → Private zone（如 `prod.internal`，VPC 选 `cs-prod-vpc`）。  
   - 添加 A 记录 `sql.prod.internal` → 指向上一步的 Endpoint IP。
5) 应用连接  
   - `.env.prod` 中 `DATABASE_URL` 使用 `sql.prod.internal:5432`；容器通过 VPC/PSC 私网访问。

**CLI（与上面等效，适合自动化）**
```bash
gcloud sql instances create cs-medusa-prod \
  --database-version=POSTGRES_15 \
  --region=us-central1 \
  --network=cs-prod-vpc \
  --availability-type=zonal \
  --no-assign-ip \
  --storage-auto-resize
```
2) **启用实例的 PSC 服务端点**  
- 在 Cloud SQL 设置中获取 `pscServiceAttachmentLink`（`gcloud sql instances describe cs-medusa-prod` 输出）。
3) **为消费者 VPC 创建 PSC 端点**  
```bash
REGION=us-central1
gcloud compute addresses create sql-prod-psc-ip \
  --region=$REGION \
  --subnet=cs-prod-subnet \
  --purpose=PRIVATE_SERVICE_CONNECT

gcloud compute forwarding-rules create sql-prod-psc-endpoint \
  --region=$REGION \
  --network=cs-prod-vpc \
  --address=sql-prod-psc-ip \
  --target-service-attachment=<pscServiceAttachmentLink> \
  --psc-connection-id=sql-prod-psc-conn
```
4) **更新应用连接**  
- `.env.prod` 中把 `DB_HOST` / `DATABASE_URL` 指向 PSC 地址或私有 DNS（例：`sql.prod.internal`）。端口使用 5432。
- 防火墙：允许 VPC 内到 PSC 端点的 5432/TCP。

### Memorystore Redis 通过 PSC
**Console 步骤**
1) Console → Memorystore → Redis → Create instance  
   - Connectivity 选择 Private Service Connect；Network 选 `cs-prod-vpc`，Region 与应用一致。  
   - 创建后在 Overview 记录 `Service attachment`。  
2) Console → VPC network → Private Service Connect → Connected endpoints → Create endpoint  
   - Target 填写上一步的 Redis `Service attachment`；子网选择 `cs-prod-subnet`；端口 6379；分配静态 IP。  
3) Console → Cloud DNS（同上）添加 A 记录 `redis.prod.internal` → Endpoint IP。  
4) 防火墙：允许 VPC 内到 Endpoint IP 的 6379/TCP。  
5) `.env` 内将 `REDIS_URL` 指向 `redis.prod.internal:6379`。

**CLI（示例）**
```bash
REGION=us-central1
gcloud compute addresses create redis-prod-psc-ip \
  --region=$REGION \
  --subnet=cs-prod-subnet \
  --purpose=PRIVATE_SERVICE_CONNECT

gcloud compute forwarding-rules create redis-prod-psc-endpoint \
  --region=$REGION \
  --network=cs-prod-vpc \
  --address=redis-prod-psc-ip \
  --target-service-attachment=<memorystoreServiceAttachment> \
  --psc-connection-id=redis-prod-psc-conn \
  --ports=6379
```

### 验证与运维
- 验证连接：在容器宿主机 `psql "postgres://...@sql.prod.internal:5432/medusa_production"`，或 `redis-cli -h redis.prod.internal`.
- 监控：开启 VPC Flow Logs 观察 PSC 端点流量；为 Cloud SQL/Memorystore 打开查询/CPU/连接告警。
- 费用：PSC 对象按流量 + 端点计费（区域内 GB 级收费，端点有小时费用）；Cloud SQL/Memorystore 按实例规格计费。

## 安全与变更控制
- 继续遵循“生产数据库手工维护，禁用自动 migrate/seed”，所有 schema 变更先在维护窗口备份。
- Secret 仅在内网落盘到 `.env.*`；确保文件权限 600，禁用持久公开存储。
- 任何 VPC/PSC 变更需更新本 Runbook 与 `docs/index.md`，并在变更前备份现有网络配置。
