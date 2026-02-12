# 基础设施成本分析：Supabase + GCP 部署可行性

> 分析当前项目（Medusa 2.x + Strapi v5 + Next.js）部署到 Supabase（数据库）+ GCP（服务器）的可行性
> 日访问量：~1000

---

## 当前项目资源需求

| 组件 | 最低内存 | 说明 |
|------|---------|------|
| Linux OS | ~200 MB | 系统基础开销 |
| Medusa 2.x | ~500-800 MB | MikroORM + 事件系统 + Admin UI |
| Strapi v5 | ~400-600 MB | Knex + 内容管理 |
| Redis | ~50-100 MB | OTP 验证、缓存（**必须**） |
| PM2 | ~30-50 MB | 进程管理 |
| **合计** | **~1.2-1.8 GB** | |

数据库需求：

- **2 个 PostgreSQL 数据库**：`medusa_production` + `strapi_production`
- **连接池**：Medusa 默认 2-10，Strapi 配置 2-10，合计最大 ~20 连接
- **Redis 必需**：OTP 验证、事件总线、Workflow 引擎、分布式锁都依赖它

---

## GCP 免费层 e2-micro 能跑吗？

**不行。**

| 指标 | e2-micro | 项目需求 | 结论 |
|------|---------|---------|------|
| RAM | 1 GB | 1.2-1.8 GB | 不够，会 OOM Kill |
| CPU | 2 vCPU 共享（持续 25%） | 中等计算负载 | 日常 1000 PV 勉强，但突发会卡死 |
| 网络出口 | 1 GB/月 | API 响应 + Admin UI | 1000 日访问约需 5-10 GB/月，**远超** |
| 磁盘 | 30 GB | Node.js + pnpm + 构建产物 | 刚好够 |

> e2-micro 连单独跑 Medusa 都吃力，两个服务同时跑必定 OOM。

---

## Supabase 免费层能用吗？

**能用但有重大风险：**

| 指标 | 免费层 | 项目需求 | 风险 |
|------|--------|---------|------|
| 数据库大小 | 500 MB | 初期 < 100 MB | 够，但数据增长后会超 |
| 连接数 | 60（直连）/ 200（Pooler） | 最大 ~20 | 够 |
| 出口带宽 | 2 GB/月 | 取决于查询量 | 1000 日访问可能够 |
| **7 天不活跃自动暂停** | 有 | **生产环境不可接受** | **致命问题** |
| Redis | **不提供** | 必须有 | 需要额外方案 |

> 免费层的 **7 天暂停策略** 对生产环境是致命的——一旦暂停，网站直接挂。

---

## Supabase Pro 层参考

| 指标 | Pro 计划 ($25/月) |
|------|-------------------|
| 数据库大小 | 8 GB |
| Auth MAUs | 100,000 |
| 文件存储 | 100 GB |
| 不自动暂停 | 是 |
| 连接池 (PgBouncer) | 包含 |
| 区域 | 17+ 个区域 (AWS) |

---

## GCP 计算实例对比

| 实例 | vCPU | RAM | 月费用 (us-central1) |
|------|------|-----|---------------------|
| e2-micro | 2（共享 25%） | 1 GB | 免费（仅 US 区域） |
| e2-small | 2（共享 50%） | 2 GB | ~$12/月 |
| e2-medium | 2（共享 100%） | 4 GB | ~$24/月 |
| e2-standard-2 | 2（专用） | 8 GB | ~$49/月 |

> GCP 免费层 e2-micro 仅限 us-west1、us-central1、us-east1 三个区域。

---

## Redis 方案对比

| 方案 | 免费层 | 付费 | 备注 |
|------|--------|------|------|
| GCP Memorystore | **无** | ~$16/月 (1GB Basic) | 无免费层 |
| Upstash Redis | 256 MB, 50万次/月 | $0.2/10万次 | 支持原生 Redis 协议 |
| Railway Redis | 无（试用 $5 额度） | $5/月起 | 一键部署 |
| 自建 (VM 上) | 含在 VM 费用中 | $0 | 需自行运维，占 50-100 MB 内存 |

---

## 推荐方案对比

### 方案 A：最便宜可行（~$37/月）

| 组件 | 服务 | 费用 |
|------|------|------|
| PostgreSQL (2 库) | Supabase Pro | $25/月 |
| 计算 (Medusa + Strapi) | GCP **e2-small** (2 GB RAM) | ~$12/月 |
| Redis | Upstash 免费层 (256 MB, 50万次/月) | $0 |
| 前端 | Vercel Hobby | $0 |
| **合计** | | **~$37/月** |

风险：

- e2-small 2 GB RAM 非常紧张，需要严格限制内存（PM2 已配 800M 限制）
- Medusa + Strapi 同时跑会接近极限，构建必须在本地完成
- Upstash 免费层 50 万次/月，1000 日访问约需 3-10 万次，够用
- **跨云延迟**：Supabase (AWS) ↔ GCP 每次查询额外 1-5ms，每次页面加载累积 20-150ms

### 方案 B：推荐稳定方案（~$50/月）

| 组件 | 服务 | 费用 |
|------|------|------|
| PostgreSQL (2 库) | Supabase Pro | $25/月 |
| 计算 (Medusa + Strapi) | GCP **e2-medium** (4 GB RAM) | ~$24/月 |
| Redis | Upstash 免费层 | $0 |
| 前端 | Vercel Hobby | $0 |
| **合计** | | **~$50/月** |

优势：4 GB 内存充裕，两个服务可稳定运行，有余量应对突发。

### 方案 C：全部自托管最省（~$24/月）

| 组件 | 服务 | 费用 |
|------|------|------|
| PostgreSQL + Redis | **自装在 GCP VM 上** | $0（含在 VM 费中） |
| 计算 (全部) | GCP **e2-medium** (4 GB RAM) | ~$24/月 |
| 前端 | Vercel Hobby | $0 |
| **合计** | | **~$24/月** |

优势：

- 数据库在本机，延迟 < 0.5ms（vs 跨云 1-5ms）
- 不依赖第三方数据库服务
- 这就是**当前的方案**，已经验证可行

劣势：数据库备份需自己管理。

---

## 跨云延迟说明

如果 PostgreSQL 在 Supabase (AWS)、应用服务器在 GCP：

| 场景 | 延迟 |
|------|------|
| 同区域跨云（Supabase us-east-1 + GCP us-east1） | 1-5 ms/查询 |
| 跨区域（Supabase eu-west-1 + GCP us-central1） | 50-150 ms/查询 |
| 同机（PostgreSQL 在 VM 本地） | < 0.5 ms/查询 |

Medusa 和 Strapi 每次页面请求触发 10-30 次查询，跨云累积延迟 20-150ms 明显可感知。

> **最优搭配**：Supabase **us-east-1** (N. Virginia) + GCP **us-east1** (South Carolina)，地理距离最近。

---

## 关键建议

1. **GCP 免费层 e2-micro 不可行**，最低需要 **e2-small**（$12/月），推荐 **e2-medium**（$24/月）

2. **Supabase 免费层不适合生产**，7 天暂停策略是致命的。如果用 Supabase，必须上 Pro（$25/月）

3. **跨云延迟是隐性成本**：Supabase (AWS) + GCP 每个 API 请求会多 20-150ms 延迟。当前 PostgreSQL 在本机，延迟 < 0.5ms

4. **如果预算有限，方案 C（当前方案）性价比最高**：GCP e2-medium $24/月全搞定，PostgreSQL + Redis 装在同一台机器上，零延迟，最简单

5. **1000 日访问量**对任何方案都不是问题，瓶颈在内存不在流量

6. **Upstash Redis 免费层**可以替代自建 Redis，但需要验证 Medusa 的 ioredis 客户端是否兼容 Upstash 的连接方式（Upstash 支持原生 Redis 协议，需确认端口连接）

---

## 总结

以当前 1000 日访问量，最务实的选择是 **GCP e2-medium ($24/月) + 自建 PostgreSQL/Redis**，就是现在的架构。Supabase 主要优势是托管备份和免运维，但增加了 $25/月成本和跨云延迟。
