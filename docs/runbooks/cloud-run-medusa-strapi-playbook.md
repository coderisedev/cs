---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/runbooks/secret-manager-psc-guide.md
  - docs/runbooks/medusa-prod-db-manual-ops.md
  - docs/runbooks/medusa-dev-db-manual-ops.md
  - docs/runbooks/dev-stack-bringup-with-manual-db.md
---

# Cloud Run 部署 Playbook（Medusa + Strapi）

## 目标
- 将 Medusa / Strapi 从 GCE 自管容器迁移到 Cloud Run，前置全局 HTTPS LB。
- 保持“数据库手工维护、禁止自动 migrate/seed”策略；DB/Redis 走 Cloud SQL / Memorystore + PSC 私网。
- 使用 Secret Manager 管理 `.env.*`，Artifact Registry 保存镜像，Cloud Armor 可选加固。

## 前置条件
- 启用 API：`Cloud Run API`、`Artifact Registry API`、`Compute Engine API`、`Cloud SQL Admin API`、`Service Networking API`、`Secret Manager API`、`Cloud Memorystore for Redis API`。
- 角色：  
  - 部署者：`roles/run.admin`, `roles/artifactregistry.admin`, `roles/secretmanager.secretAccessor`, `roles/compute.networkAdmin`, `roles/cloudsql.client`, `roles/redis.viewer`（或更细粒度）。  
  - 运行时 service account（建议单独为 medusa/strapi 各一个）：`roles/run.invoker`, `roles/secretmanager.secretAccessor`, `roles/cloudsql.client`, `roles/compute.networkUser`（用于 Serverless VPC Access）。
- VPC：prod/dev 各一条（例：`cs-prod-vpc` 172.30.0.0/16，`cs-dev-vpc` 172.31.0.0/16）。开启私有 DNS 区域（如 `prod.internal`）供 PSC 解析。

## 步骤总览
1) 准备镜像仓库与构建镜像  
2) 准备 DB/Redis（Cloud SQL + Memorystore）与 PSC 端点  
3) 准备 Secret Manager `.env`  
4) 创建 Serverless VPC Access Connector  
5) 部署 Cloud Run 服务（Medusa / Strapi）  
6) 创建全局 HTTPS 负载均衡（serverless NEG 路由）  
7) 验证与运维

## 1) Artifact Registry & 镜像构建
```bash
PROJECT_ID=<your-project>
REGION=us-central1
gcloud config set project $PROJECT_ID

# 创建仓库（若已存在跳过）
gcloud artifacts repositories create cs-backend --repository-format=docker --location=$REGION

# 构建并推送镜像（使用现有 Dockerfile）
gcloud builds submit apps/medusa --tag $REGION-docker.pkg.dev/$PROJECT_ID/cs-backend/medusa:latest
gcloud builds submit apps/strapi --tag $REGION-docker.pkg.dev/$PROJECT_ID/cs-backend/strapi:latest
```

## 2) 数据库与 Redis（PSC 私网）
- 参考 `docs/runbooks/secret-manager-psc-guide.md` 完成：
  - 创建 Cloud SQL Postgres（私网，仅 Private IP/PSC）。
  - 创建 Memorystore Redis（选 PSC）。
  - 为两者创建 PSC 端点 + 私有 DNS 记录（例：`sql.prod.internal`、`redis.prod.internal`）。  
- 记下 DB/Redis 的私网地址或私有域名，供 `.env` 使用。

## 3) Secret Manager 准备 `.env`
- 为每个环境/服务创建 Secret：`medusa-prod-env`, `strapi-prod-env`（dev 同理）。
- 内容为 dotenv 文本，示例：
```
DATABASE_URL=postgresql://medusa:***@sql.prod.internal:5432/medusa_production
REDIS_URL=redis://redis.prod.internal:6379
JWT_SECRET=...
STRIPE_API_KEY=...
# 不要放 demo seed / auto migrate 开关；仍保持手工 DB 策略
```
- 控制台：Secret Manager → 创建密钥 → 粘贴 .env 内容 → 自动复制 → 权限授予运行时 service account `Secret Accessor`。  
- CLI：`gcloud secrets create ...` + `gcloud secrets versions add ...`。

## 4) Serverless VPC Access Connector
> 让 Cloud Run 访问 VPC 内的 PSC 端点（DB/Redis）。每区域一条即可。
```bash
REGION=us-central1
gcloud compute networks vpc-access connectors create cs-prod-conn \
  --region=$REGION \
  --network=cs-prod-vpc \
  --subnet=cs-prod-subnet \
  --min-instances=2 --max-instances=4 \
  --machine-type=e2-standard-4
```
- 防火墙：允许 VPC 内源段到 PSC 端点的 5432/6379。

## 5) 部署 Cloud Run（Medusa / Strapi）
> 保持无自动 migrate/seed；仅使用已存在的数据库。
```bash
SA=medusa-run-sa@${PROJECT_ID}.iam.gserviceaccount.com
REGION=us-central1
IMAGE=$REGION-docker.pkg.dev/$PROJECT_ID/cs-backend/medusa:latest

gcloud run deploy medusa \
  --image $IMAGE \
  --region $REGION \
  --platform managed \
  --service-account $SA \
  --allow-unauthenticated \
  --set-secrets DATABASE_URL=medusa-prod-env:latest,REDIS_URL=medusa-prod-env:latest,JWT_SECRET=medusa-prod-env:latest \
  --vpc-connector cs-prod-conn \
  --vpc-egress all-traffic \
  --cpu 1 --memory 1Gi \
  --max-instances 10 --min-instances 0 \
  --port 9000
```
- Strapi 同理，端口 1337，镜像换为 `strapi:latest`，使用对应 Secret。  
- 若需要私有访问再由 LB 暴露，可加 `--ingress internal-and-cloud-load-balancing` 并关闭 `--allow-unauthenticated`，改用 IAP/后端鉴权。  
- 如需自定义变量，用 `--set-env-vars` 配合 Secret；避免把敏感值直接放 env。  
- 连接池：如数据库连接数敏感，控制并发 `--concurrency`（默认 80），或在应用 env 中限制池大小。

## 6) 全局 HTTPS 负载均衡（Serverless NEG）
> 一套 LB 前挂托管证书，自定义域路由到两个 Cloud Run 服务。
1) 为每个 Cloud Run 创建 serverless NEG（Console：Network services → Load balancing → Advanced menu → Backend → Serverless network endpoint group）。  
2) 创建 HTTPS LB（Application Load Balancer）：  
   - Frontend：托管证书 + 443。  
   - URL Map：按主机或路径路由（例：`strapi.example.com` → Strapi NEG，`store.example.com` → Medusa NEG；或 `/admin` → Strapi，其他 → Medusa）。  
   - Backend：将对应 NEG 关联到后端服务，启用 Cloud Armor/WAF（可选）。  
3) DNS：将域名 CNAME/ A 记录指向 LB 的 IP/域名。  
4) 若仅内网访问：改用 Internal HTTPS LB + 私有 DNS。

## 7) 验证与运维
- 健康检查：访问 LB 域名的 `/health`（Medusa）或 `/`（Strapi admin 登录页），确认 200。  
- 私网连通：在 Cloud Run 日志确认 DB/Redis 连接成功（私网地址）。  
- 监控：开启 LB/Cloud Run/Cloud SQL/Memorystore 指标告警（5xx、延迟、连接数、CPU）。  
- 变更流程：镜像更新 → 部署新修订 → 验证 → 如需回滚，切换到上一修订。  
- DB 变更：依然遵循手工迁移/备份策略（不要在 Cloud Run 启动时跑 migrate/seed）。

## 常见问题
- 连接失败：检查 VPC Connector 状态、PSC 端点是否 `Accepted`、防火墙是否允许到 5432/6379。  
- 冷启动慢：提高 `--min-instances`，或优化依赖初始化。  
- 连接数过多：下调 `--concurrency` 或在应用配置限制池大小，必要时添加 pgbouncer。
