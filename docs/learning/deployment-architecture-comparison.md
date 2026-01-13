# 部署架构评估：GCE vs. Render + Supabase

**最后更新**: 2026-01-13
**背景**: 现有架构为 Next.js (Vercel) + Medusa/Strapi (GCE)，拟评估迁移至全托管 PaaS 方案。

---

## 1. 方案核心对比

| 特性 | 当前方案 (GCE IaaS) | 提议方案 (Render PaaS + Supabase BaaS) |
| :--- | :--- | :--- |
| **运维模式** | **重运维**。需管理 OS、防火墙、Nginx、SSL、日志轮转。 | **免运维**。Git Push 即部署，平台托管底层。 |
| **数据库** | 自建 Postgres (高风险点：备份/HA需手动配置)。 | **Supabase** (托管 PG，自带 GUI、自动备份、API)。 |
| **文件存储** | 可使用本地磁盘 (不推荐但可行)。 | **必须**使用对象存储 (S3/R2)，因文件系统短暂。 |
| **成本结构** | **固定且低** (e2-medium 约 $25/月)。 | **按量且高** (服务费 + 数据库费 + 流量费，起步约 $40+)。 |
| **扩展性** | 垂直扩容需重启，水平扩容需配置 LB。 | 拖动滑块即可扩容，自动负载均衡。 |

---

## 2. 组件兼容性深度评估

### A. 数据库 (Postgres -> Supabase)
**评价：完美适配 ✅**
*   Supabase 本质是标准 Postgres，Medusa/Strapi 无缝兼容。
*   **优势**：自带 Web UI 管理数据，无需 SSH 隧道；支持 pgvector 扩展。
*   **注意**：Medusa 建议连接 Supabase 的 **Session Pooler (Port 5432)** 而非 Transaction Pooler (6543) 以保证稳定性。

### B. Medusa 后端 (GCE -> Render)
**评价：强烈推荐 ✅**
*   Medusa 是无状态 (Stateless) 应用，完美契合 Render 的容器化模型。
*   需配合托管 Redis (如 Render Redis 或 Upstash)。

### C. Strapi CMS (GCE -> Render)
**评价：需谨慎配置 ⚠️**
*   **文件系统问题**：Render 的磁盘是 Ephemeral (临时的)。重启后，本地上传的图片和修改的 `schema.json` 会丢失。
*   **强制要求**：
    1.  **媒体库**：必须配置 Cloudflare R2 或 AWS S3 插件。
    2.  **Schema 管理**：禁止在生产环境 Admin 面板修改 Content Type。必须在本地开发修改 -> 提交 Git -> 触发部署。

---

## 3. 推荐架构组合 (现代出海 DTC 首选)

鉴于“出海 DTC”对稳定性与迭代速度的高要求，推荐 **混合云架构**：

1.  **前端**: **Vercel**
    *   利用其全球边缘网络 (Edge Network) 加速首屏加载，提升转化率。
2.  **后端**: **Render**
    *   托管 Medusa 和 Strapi 容器。自动化 CI/CD 流程。
3.  **数据层**: **Supabase**
    *   托管核心数据库。省去 DBA 运维成本。
4.  **存储层**: **Cloudflare R2**
    *   统一存储 Medusa 商品图和 Strapi 内容图。免出口流量费，降低跨境带宽成本。

---

## 4. 迁移路线图

1.  **存储剥离**: 确保 Medusa/Strapi 已完全配置 R2 插件，不再依赖本地 `/uploads` 目录。
2.  **数据迁移**: 使用 `pg_dump` 导出 GCE 数据 -> `psql` 导入 Supabase。
3.  **环境配置**:
    *   Render 新建 Web Service，注入 `DATABASE_URL` (Supabase) 和 `REDIS_URL`。
    *   修改 Next.js 环境变量指向 Render 提供的 `onrender.com` 域名。
4.  **DNS 切割**: 将 API 域名 (`api.aidenlux.com`) CNAME 解析至 Render。

---

## 5. 决策建议

*   **选择 Render + Supabase**：如果您**没有专职运维**，希望睡个安稳觉，且愿意为“省心”支付每月多 $20-$50 的溢价。
*   **保留 GCE**：如果您**极其在意成本**，且具备熟练的 Linux/Docker 排查能力。

**最终建议**：对于处于增长期的 DTC 品牌，**时间 > 成本**。建议尽快迁移至 Render + Supabase，将精力集中在物流打通与业务增长上。
