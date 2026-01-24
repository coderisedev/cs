# CTO 级评估：Lumora Shop 整体规划

> 评估范围：platform-admin-init.md, lumora-shop-architecture.md, lumora-infrastructure-stack.md, lumora-marketplace-vision.md, lumora-cross-border-strategy.md, lumora-financing-and-commercialization.md, lumora-control-panel-prd.md

---

## 一、战略愿景评估

**亮点：** 赛道选择精准——AI + 跨境电商 SaaS 确实是当下少有的"技术推力"与"市场拉力"同时存在的交叉点。"不卖铲子，卖全自动挖掘机"的 narrative 对投资人有吸引力。

**核心问题：文档陷入了"愿景膨胀陷阱"。**

6 份文档同时描绘了至少 5 个独立的宏大产品：
1. 多租户 SaaS 建站平台
2. AI 内容生成引擎
3. 跨店 Marketplace + Super Agent
4. 跨境合规中间件
5. 网红自动撮合系统

任何一个都是独角兽级的挑战。同时推进等于同时失败。

---

## 二、架构层面深度批评

### 2.1 Schema-Based Multi-Tenancy 的陷阱

文档选择"每个店铺一个 PostgreSQL schema"。这在理论上漂亮，实际操作中是著名的反模式：

- **Migration 地狱：** 1000 个店铺 = 1000 次 schema migration。一次字段变更需要跑 1000 次 DDL，任何一次失败都会导致数据不一致。
- **连接池爆炸：** Supabase 的 Transaction Pooler (PgBouncer) 对 schema switching 支持有限。每次 `SET search_path` 都会破坏连接复用。
- **备份/恢复粒度：** 无法单独备份一个租户的数据。
- **Supabase 自身限制：** Supabase 不推荐超过几十个 schema 的用例，且 RLS 才是其设计意图中的多租户方案。

**建议：** 初期采用 **Row-Level Tenancy + RLS**（PRD 已经在用 RLS，但架构文档却在说 schema isolation，两者矛盾）。到真正需要强隔离时（Enterprise 客户），再做 database-per-tenant。

### 2.2 "Serverless Container per Store" 不现实

每个店铺一个 Medusa + Strapi 容器实例（即使 scale-to-zero），成本模型完全不成立：

- **冷启动：** Medusa + Strapi 容器冷启动 > 10 秒（Node.js + DB 连接建立），用户体验不可接受。
- **成本：** 100 个活跃店铺 = 200 个容器实例常驻，Cloud Run 成本远不止 $5/月。
- **运维复杂度：** 每个容器需要独立的环境变量、健康检查、日志聚合。

**建议：** 共享 Medusa 实例 + tenant_id 路由。这正是 Medusa 2.x 的 multi-tenancy middleware 的设计意图。单实例可轻松支撑 1000+ 租户。

### 2.3 PRD 与架构文档的技术栈矛盾

| 维度 | platform-admin-init.md | architecture.md | infrastructure.md |
|------|----------------------|-----------------|-------------------|
| Auth | Supabase Auth | Auth0/Clerk | 未定义 |
| 多租户 | RLS (Row-Level) | Schema Isolation | 未说明 |
| 计算 | 单体 Next.js | Knative/Fargate | GCP Cloud Run |
| 搜索 | 无 | 未定义 | 未定义 (marketplace 说 MeiliSearch) |

**这些文档之间缺乏一致性，说明没有经过技术设计评审。**

---

## 三、PRD (platform-admin-init.md) 具体评估

### 3.1 做对了的部分

- 数据模型简洁清晰（profiles / tenants / tenant_members 三张表）
- RLS 策略方向正确
- 用户旅程描述清楚
- MVP 清单足够小

### 3.2 缺失的关键内容

1. **无 API 设计：** 缺少 endpoint 定义。onboarding 用 Server Action 还是 API Route？
2. **无错误处理：** slug 冲突怎么办？创建事务失败后的回滚？
3. **无性能约束：** 响应时间要求？并发目标？
4. **无安全细节：** CSRF 防护？Rate limiting？邮箱验证流程？
5. **无可观测性：** 日志策略？错误追踪？用户行为分析？
6. **无数据迁移策略：** 如果未来从 Supabase 迁出怎么办？
7. **roles 枚举不够：** 缺少 `viewer`（只读）和 `billing`（财务）角色。

### 3.3 数据模型优化建议

```sql
ALTER TABLE tenants ADD COLUMN
  status text DEFAULT 'active',   -- 'active', 'suspended', 'deleted'
  settings jsonb DEFAULT '{}',    -- 店铺级配置
  trial_ends_at timestamp,        -- 试用期结束
  deleted_at timestamp;            -- 软删除

ALTER TABLE tenant_members ADD COLUMN
  invited_at timestamp,            -- 邀请时间
  accepted_at timestamp;           -- 接受时间
```

---

## 四、执行风险评估 (Risk Matrix)

| 风险 | 严重度 | 概率 | 说明 |
|------|--------|------|------|
| 范围蔓延 | 极高 | 极高 | 6 份文档描绘了 3 年的产品，没有清晰的 Phase Gate |
| AI 成本失控 | 高 | 高 | GPT-4 API + Stable Diffusion 推理成本在 $99/月订阅模型下大概率亏本 |
| 冷启动问题 | 高 | 高 | "中心化 AI 大脑"需要大量数据，初期没有数据时无法体现价值 |
| 技术栈矛盾 | 中 | 已发生 | 文档间选型冲突，执行时必然需要重新决策 |
| 合规低估 | 高 | 高 | 跨境支付 + 多国数据合规（GDPR/CCPA）远比文档描述的复杂 |

---

## 五、优化建议（按优先级排序）

### P0：统一技术决策文档 (ADR)

在写任何代码之前，产出 Architecture Decision Records，锁定核心选型。

### P1：砍掉 Phase 2/3，只做 Phase 1 的 60%

**真正的 MVP：**
1. 用户注册/登录（Supabase Auth）
2. 创建店铺（写入 tenants + tenant_members）
3. 上传商品（Medusa Product API）
4. 生成一张 AI 场景图（OpenAI DALL-E / Replicate）
5. 公开访问店铺页面（`app.lumora.shop/store/[slug]`）

以上 5 项足够验证 PMF。其余全部推迟。

### P2：修正成本模型

$55/月的估算严重低估了实际运营成本：

| 实际成本项 | 估算 |
|-----------|------|
| Supabase Pro | $25 |
| Vercel Pro | $20 |
| Cloud Run (2 服务常驻) | $30-80 |
| AI API 调用 (OpenAI/Replicate) | $50-500 |
| 域名 + DNS | $15 |
| 监控 (Sentry/Datadog) | $30 |
| **实际月成本** | **$170 - $670** |

### P3：重写 PRD 为可执行格式

采用 Acceptance Criteria + API Contract 格式，而非叙事体。

### P4：删除 Marketplace / Super Agent 相关文档

保留为 appendix 愿景，但不应出现在执行规划中。

---

## 六、总结

**当前状态：** 一个有洞察力的商业构想，但缺乏工程纪律的约束。文档更像是一系列 brainstorm session 的输出，而非可执行的技术规划。

**最关键的一步：** 花一天时间写一份 ADR，锁定技术选型。然后用 2 周时间，只做上面 P1 列出的 5 项功能。发布后根据真实用户反馈决定下一步。

**一句话：** 少想三年后的事，多想三周内能上线什么。
