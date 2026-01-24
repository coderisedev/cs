# Lumora Shop: Serverless 混合云架构实施方案

> **架构定义：**
> 这是一个 **"Best-of-Breed" (集百家之长)** 的 Serverless 架构。
> 我们不被单一云厂商锁定，而是挑选每个领域的最强王者：谷歌的计算、Supabase 的数据库、Cloudflare 的存储、Vercel 的分发。

## 1. 架构拓扑图 (Architecture Topology)

```mermaid
graph TD
    subgraph Edge_Layer [🌍 全球边缘分发]
        User((全球用户))
        Vercel[Next.js Storefront<br/>(Vercel Edge Network)]
    end

    subgraph Compute_Layer [☁️ GCP Cloud Run (Serverless 容器)]
        LB[Google Cloud Load Balancer]
        Medusa[Medusa Backend<br/>(Docker)]
        Strapi[Strapi CMS<br/>(Docker)]
    end

    subgraph Data_Layer [💾 数据与状态]
        Supabase[(Supabase Postgres<br/>+ pgvector AI)]
        Upstash[(Upstash Redis<br/>Event Bus & Cache)]
    end

    subgraph Asset_Layer [📦 静态资产]
        R2[Cloudflare R2<br/>(Images/Videos)]
    end

    %% 流量路径
    User -->|访问页面| Vercel
    User -->|API 请求| LB
    
    %% 服务间调用
    Vercel -->|API| LB
    LB --> Medusa & Strapi
    
    %% 数据连接
    Medusa & Strapi -->|Connection Pool 6543| Supabase
    Medusa -->|Pub/Sub| Upstash
    
    %% 资源存储
    Medusa & Strapi -->|S3 Protocol| R2
    Vercel -.->|Fetch Images| R2
```

---

## 2. 选型深度解析 (Why this Stack?)

### A. 数据库：Supabase (Postgres)
*   **核心价值：** **AI Ready.**
    *   它不仅是 Postgres。启用 `pgvector` 插件后，它直接变身**向量数据库**。
    *   **场景：** 您的 "Super Agent" 需要搜索“适合送女朋友的礼物”。传统的 SQL 搜不出来，但向量搜索可以。Supabase 原生支持这种 AI 搜索。
*   **连接注意：** Cloud Run 是无服务器环境，连接数会暴涨。**必须**使用 Supabase 提供的 `Transaction Pooler` (端口 6543) 进行连接，否则会爆连接池。

### B. 计算：GCP Cloud Run
*   **核心价值：** **Scale to Zero (缩容至零).**
    *   半夜没人访问店铺时，不收一分钱。
    *   一旦流量洪峰（如黑五）到来，谷歌自动帮你扩容到 1000 个实例。
*   **部署优势：** 直接从 GitHub Actions 构建 Docker 镜像推送到 Google Artifact Registry (GAR)，然后一键发布。

### C. 存储：Cloudflare R2
*   **核心价值：** **No Egress Fees (无出口费).**
    *   AWS S3 最大的坑是“存钱容易取钱难”（流量费极贵）。
    *   做电商图片/视频流量巨大。R2 可以为您节省数千美元的流量费。
    *   **兼容性：** 它完全兼容 S3 API，Medusa 和 Strapi 都有现成的 S3 插件，把 Endpoint 换成 R2 的即可。

### D. 消息/缓存：Upstash Redis
*   **核心价值：** **真正的 Serverless Redis.**
    *   Medusa 严重依赖 Redis 处理事件（`order.placed` -> 发邮件）。
    *   GCP Memorystore 最低配也要 $30/月，而且不能缩容。
    *   Upstash 按请求计费。在初创期，成本几乎为 0。

---

## 3. 部署实施路线图 (Deployment Roadmap)

### 第一步：基础设施准备 (Infrastructure Setup)
1.  **Supabase:** 创建项目，获取 `DATABASE_URL` (使用 Pooler 连接串)。启用 `pgvector` 扩展。
2.  **Upstash:** 创建 Redis 数据库，获取 `REDIS_URL`。
3.  **Cloudflare:** 创建 R2 Bucket，生成 `Access Key` 和 `Secret Key`。
4.  **GCP:** 创建 Project，启用 Cloud Run API 和 Artifact Registry API。

### 第二步：应用配置适配 (Config Adaptation)
*   **Medusa (`medusa-config.js`):**
    *   配置 `medusa-file-s3` 插件连接 R2 (s3_url: `https://<accountid>.r2.cloudflarestorage.com`).
    *   配置 `redis_url` 指向 Upstash。
    *   配置 `database_url` 指向 Supabase。
*   **Strapi (`config/plugins.js`):**
    *   安装 `@strapi/provider-upload-aws-s3`（R2 兼容 S3）。
    *   配置 Endpoint 为 R2 地址。

### 第三步：CI/CD 流水线 (GitHub Actions)
我们需要修改 `.github/workflows`，增加 `deploy-backend.yml`：
1.  **Build:** `docker build` Medusa 和 Strapi 的镜像。
2.  **Push:** 推送到 Google Artifact Registry (`gcr.io/lumora/medusa`).
3.  **Deploy:** `gcloud run deploy`。
    *   注意设置 `--max-instances` 防止被刷爆。
    *   设置环境变量（从 GitHub Secrets 注入）。

### 第四步：域名与网络
1.  在 Cloudflare DNS 上配置：
    *   `api.lumora.com` -> 映射到 GCP Cloud Run 的 Load Balancer。
    *   `www.lumora.com` -> 映射到 Vercel。
    *   `assets.lumora.com` -> 映射到 R2 Public Bucket。

---

## 4. 成本估算 (Cost Estimation - Startup Phase)

| 服务 | 计费模式 | 预估月费 (初创期) |
| :--- | :--- | :--- |
| **GCP Cloud Run** | 按 CPU/内存秒数 | < $5 (有免费额度) |
| **Supabase** | Pro Plan | $25 (含 8GB 存储) |
| **Upstash** | 按请求数 | Free Tier (足够支撑 10k 日活) |
| **Cloudflare R2** | 按存储/操作 | < $5 (10GB 免费存储) |
| **Vercel** | Pro Plan | $20 |
| **总计** | | **约 $55 / 月** |

**结论：** 这是一套**企业级的架构，白菜价的成本**。完美的起步方案。
