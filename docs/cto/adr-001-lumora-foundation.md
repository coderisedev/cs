# ADR-001: Lumora Shop 基础架构决策

> **Status:** Proposed
> **Date:** 2026-01-24
> **Deciders:** CTO / Engineering Lead
> **Scope:** MVP Phase (Platform Admin + First Store)

---

## 概述

本文档锁定 Lumora Shop MVP 阶段的核心技术选型，解决现有规划文档中的矛盾与模糊地带。所有后续开发必须遵循此文档，任何偏离需要提出新的 ADR。

---

## Decision 1: 认证方案

### 决策：Supabase Auth

**拒绝方案：** Auth0, Clerk, NextAuth (standalone)

**理由：**
- Supabase Auth 与 Supabase Postgres 深度集成，`auth.uid()` 可直接在 RLS 策略中引用
- 零额外成本（包含在 Supabase Pro Plan 中）
- 支持 Email/Password + Google OAuth，满足 MVP 需求
- 自带 email confirmation、password reset 流程
- 客户端 SDK (`@supabase/ssr`) 对 Next.js App Router 有原生支持

**风险与缓解：**
- 风险：Supabase Auth 不支持 SAML/SSO（Enterprise 需求）
- 缓解：Enterprise 阶段再评估 Auth0 集成，Supabase Auth 可作为 identity 层与外部 IdP 桥接

**约束：**
- 所有 auth 状态通过 Supabase client 管理，不引入额外的 session store
- Token refresh 由 `@supabase/ssr` middleware 自动处理
- 前端不存储任何 auth token 到 localStorage（仅 httpOnly cookie）

---

## Decision 2: 多租户模型

### 决策：Row-Level Tenancy + RLS (共享表 + tenant_id)

**拒绝方案：** Schema-per-tenant, Database-per-tenant

**理由：**
- **Migration 一致性：** 一次 migration 覆盖所有租户
- **连接池效率：** PgBouncer transaction mode 正常工作，无需 schema switching
- **Supabase 原生支持：** RLS 是 Supabase 的核心设计理念
- **查询简单性：** 所有查询自动被 RLS 过滤，应用层无需手动拼 WHERE tenant_id = X
- **可观测性：** 单一 schema 的 pg_stat_statements 更容易分析

**数据模型：**

```sql
-- Platform 层（全局表，无 tenant_id）
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  custom_domain text,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings jsonb DEFAULT '{}',
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE tenant_members (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  PRIMARY KEY (user_id, tenant_id)
);

-- 商品层（租户隔离表，带 tenant_id）
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  handle text NOT NULL,  -- URL slug
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, handle)
);
```

**RLS 策略：**

```sql
-- tenants: 只能看到自己参与的租户
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tenants" ON tenants FOR SELECT
  USING (id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users create tenants" ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- tenant_members: 只能看到自己所在租户的成员
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see co-members" ON tenant_members FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

-- products: 只能操作自己租户的商品
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see own products" ON products FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Editors+ manage products" ON products FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
  ));
```

**升级路径：**
- Phase 1 (MVP): 共享表 + RLS
- Phase 2 (Enterprise): 为付费大客户提供 dedicated Supabase project（完全隔离的数据库实例）

---

## Decision 3: 计算架构

### 决策：单体 Next.js 全栈应用 (Vercel 部署)

**拒绝方案：** Medusa 独立后端, Cloud Run 容器, Serverless Functions 拆分

**理由：**
- **MVP 速度：** Next.js App Router + Server Actions 可以在单一项目中完成前后端，无需维护独立 API 服务
- **Supabase 直连：** 前端通过 Supabase JS SDK 直连数据库（RLS 保护），无需 BFF 中间层
- **零运维：** Vercel 自动处理部署、CDN、SSL、scaling
- **成本最低：** Vercel Pro ($20/月) 包含所有计算需求

**架构分层：**

```
app.lumora.shop (Next.js on Vercel)
├── app/
│   ├── (auth)/           # 登录/注册页面
│   │   ├── login/
│   │   └── register/
│   ├── (platform)/       # 需要认证的平台页面
│   │   ├── dashboard/    # 店铺列表
│   │   ├── onboarding/   # 开店向导
│   │   └── settings/     # 账号设置
│   ├── store/[slug]/     # 店铺管理页面
│   │   ├── products/
│   │   ├── orders/
│   │   └── settings/
│   └── api/              # Webhook 接收等无法用 Server Action 的场景
├── lib/
│   ├── supabase/         # Supabase client (server/client)
│   ├── ai/               # AI 服务封装
│   └── utils/
└── components/
```

**何时引入独立后端：**
- 当需要长时间运行的后台任务（>30s，超出 Vercel Function 限制）
- 当需要 WebSocket 长连接
- 当需要 Medusa 的完整电商引擎（购物车、支付、物流）

此时引入 Medusa on Cloud Run 作为 headless commerce backend。

---

## Decision 4: AI 服务集成

### 决策：按需调用第三方 API，不自建模型

**技术选型：**

| 能力 | 服务 | 用途 | 成本模型 |
|------|------|------|---------|
| 文本生成 | OpenAI GPT-4o-mini | 商品描述、SEO 文案 | ~$0.15/1M input tokens |
| 图片生成 | Replicate (SDXL/Flux) | 商品场景图 | ~$0.02/张 |
| 图片理解 | OpenAI GPT-4o | 产品识别、属性提取 | ~$2.50/1M input tokens |
| 向量搜索 | Supabase pgvector | 语义商品搜索 | 包含在 DB 成本中 |

**架构原则：**
- 所有 AI 调用通过统一的 `lib/ai/` 模块封装
- 实现 provider 抽象层，便于切换供应商
- 所有生成结果缓存到 Supabase Storage，避免重复生成
- 用户级别的 usage quota 记录在 `tenant_usage` 表中

**成本控制：**

```sql
CREATE TABLE tenant_usage (
  tenant_id uuid REFERENCES tenants(id),
  month text NOT NULL,               -- '2026-01'
  ai_image_count int DEFAULT 0,
  ai_text_tokens_used bigint DEFAULT 0,
  PRIMARY KEY (tenant_id, month)
);
```

- Free plan: 10 张图/月, 50k tokens/月
- Pro plan: 100 张图/月, 500k tokens/月
- 超出后按量计费或降级

---

## Decision 5: 存储方案

### 决策：Supabase Storage (S3 兼容)

**拒绝方案：** Cloudflare R2 (初期), AWS S3

**理由：**
- **统一平台：** 减少服务依赖数量，所有数据在 Supabase 生态内
- **RLS 集成：** Storage 策略可直接引用 auth.uid()，无需额外鉴权
- **CDN 内置：** Supabase 自带 CDN transform（图片缩放、格式转换）
- **成本：** Pro Plan 包含 100GB 存储 + 250GB 带宽

**Bucket 结构：**

```
storage/
├── avatars/              # 用户头像 (public)
├── products/             # 商品原图 (private, per tenant)
│   └── {tenant_id}/
│       └── {product_id}/
├── generated/            # AI 生成图 (private, per tenant)
│   └── {tenant_id}/
│       └── {product_id}/
└── storefronts/          # 店铺 logo/banner (public)
    └── {tenant_id}/
```

**升级路径：** 当带宽超出 Supabase 限额时，将 `generated/` 和 `products/` 迁移到 Cloudflare R2（S3 兼容，无出口费）。

---

## Decision 6: 店铺前端渲染与域名策略

### 决策：三阶段域名演进 + ISR 渲染

所有阶段共用同一个 Next.js 应用，通过 middleware 根据 hostname 路由到对应租户。

---

### Phase 1 (MVP): Path-Based Routing

**生效条件：** 项目启动即采用，零配置。

```
消费者访问店铺：  app.lumora.shop/store/[slug]
商品详情页：      app.lumora.shop/store/[slug]/p/[handle]
管理后台：        app.lumora.shop/store/[slug]/admin
```

**优势：** 无需额外 DNS 配置，Cookie 共享简单，部署即可用。
**局限：** URL 中带平台标识，不适合品牌独立性要求高的商家。

---

### Phase 2: Subdomain Routing

**生效条件：** 当有 > 10 个活跃店铺，商家开始关注品牌独立性。

```
消费者访问店铺：  [slug].lumora.shop
商品详情页：      [slug].lumora.shop/p/[handle]
管理后台入口：    app.lumora.shop/store/[slug]/admin（不变）
```

**实现方式：**
1. Vercel 项目添加 Wildcard Domain：`*.lumora.shop`
2. DNS 配置：`*.lumora.shop` CNAME → `cname.vercel-dns.com`
3. Middleware 解析子域名，rewrite 到 path-based 路由

**Vercel 配置：**
```json
// vercel.json (无需修改代码，仅添加域名)
{
  "rewrites": [
    { "source": "/:path*", "destination": "/store/:slug/:path*" }
  ]
}
```

实际路由在 middleware 中处理，vercel.json 仅做 fallback。

---

### Phase 3: Custom Domain

**生效条件：** Pro/Enterprise 付费用户绑定自有域名。

```
消费者访问店铺：  mystore.com
商品详情页：      mystore.com/p/[handle]
管理后台入口：    app.lumora.shop/store/[slug]/admin（不变）
```

**用户操作流程：**
1. 在 `/store/[slug]/admin/settings/domain` 输入 `mystore.com`
2. 系统显示 DNS 配置指引：
   - `mystore.com` → CNAME → `cname.vercel-dns.com`
   - 或 A 记录 → `76.76.21.21`（Vercel IP）
3. 用户完成 DNS 配置后，点击"验证"
4. 系统调用 Vercel Domains API 注册域名
5. Vercel 自动签发 Let's Encrypt SSL 证书
6. 验证通过后写入 `tenants.custom_domain`

**Vercel Domains API 调用：**
```typescript
// lib/domains.ts
async function addCustomDomain(domain: string) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/domains`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
      body: JSON.stringify({ name: domain }),
    }
  )
  return res.json()
}

async function verifyDomain(domain: string) {
  const res = await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/domains/${domain}/verify`,
    { method: 'POST', headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  )
  return res.json()  // { verified: boolean }
}

async function removeDomain(domain: string) {
  await fetch(
    `https://api.vercel.com/v10/projects/${PROJECT_ID}/domains/${domain}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } }
  )
}
```

---

### Middleware 统一路由逻辑

```typescript
// middleware.ts
import { createServerClient } from '@/lib/supabase/middleware'
import { NextRequest, NextResponse } from 'next/server'

const PLATFORM_HOSTS = ['app.lumora.shop', 'localhost:3000']

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl

  // ─── 1. 平台自身域名：正常路由（auth/dashboard/onboarding）───
  if (PLATFORM_HOSTS.some(h => hostname.includes(h))) {
    return handlePlatformRoutes(request)
  }

  // ─── 2. 子域名模式：[slug].lumora.shop ───
  if (hostname.endsWith('.lumora.shop')) {
    const slug = hostname.replace('.lumora.shop', '')
    const url = request.nextUrl.clone()
    url.pathname = `/store/${slug}${pathname}`
    return NextResponse.rewrite(url)
  }

  // ─── 3. 自定义域名模式：mystore.com ───
  const { supabase } = createServerClient(request)
  const { data: tenant } = await supabase
    .from('tenants')
    .select('slug')
    .eq('custom_domain', hostname)
    .eq('status', 'active')
    .single()

  if (tenant) {
    const url = request.nextUrl.clone()
    url.pathname = `/store/${tenant.slug}${pathname}`
    return NextResponse.rewrite(url)
  }

  // ─── 4. 未识别域名 ───
  return NextResponse.json({ error: 'not_found' }, { status: 404 })
}
```

**性能优化（自定义域名查询）：**
- 域名 → slug 映射缓存在 Vercel Edge Config（KV store，全球边缘读取 < 1ms）
- 写入/更新时同步刷新 Edge Config
- 兜底查询 Supabase（cache miss 时）

```typescript
// lib/tenant-resolver.ts
import { get } from '@vercel/edge-config'

export async function resolveHostToSlug(hostname: string): Promise<string | null> {
  // 1. Edge Config 缓存查询 (< 1ms)
  const slug = await get<string>(`domain:${hostname}`)
  if (slug) return slug

  // 2. 数据库兜底 (< 50ms)
  const { data } = await supabase
    .from('tenants')
    .select('slug')
    .eq('custom_domain', hostname)
    .single()

  if (data?.slug) {
    // 异步回填缓存
    await updateEdgeConfig(`domain:${hostname}`, data.slug)
  }

  return data?.slug ?? null
}
```

---

### 数据模型扩展

```sql
-- tenants 表已有字段（无需修改）
-- custom_domain text

-- 新增：域名验证状态追踪
ALTER TABLE tenants ADD COLUMN
  domain_verified boolean NOT NULL DEFAULT false,
  domain_verified_at timestamptz;

-- 约束：custom_domain 全局唯一
CREATE UNIQUE INDEX idx_tenants_custom_domain
  ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;
```

---

### 渲染策略

| 页面类型 | 渲染方式 | revalidate | 说明 |
|---------|---------|-----------|------|
| 店铺首页 | ISR | 60s | 商品列表、Banner |
| 商品详情 | ISR | 60s | 描述、图片、价格 |
| 购物车/结账 | SSR | - | 实时库存校验 |
| 管理后台 | SSR | - | 需要实时数据 |
| 静态页 (About/FAQ) | SSG | 手动 revalidate | 内容变更时 webhook 触发 |

---

### 容量限制与升级路径

| 阶段 | 方案 | 域名上限 | 适用规模 |
|------|------|---------|---------|
| Phase 1 | Path-based | 无限 | 0-50 租户 |
| Phase 2 | Wildcard subdomain | 无限 | 50-500 租户 |
| Phase 3a | Vercel Custom Domains | 50 个/项目 | 500-550 租户 |
| Phase 3b | Cloudflare for SaaS | 10万+ | 550+ 租户 |

**Phase 3b 切换条件：** 当自定义域名超过 50 个时，将前端部署迁移至 Cloudflare Pages + Cloudflare for SaaS（支持十万级自定义域名，自动 SSL）。此迁移不影响应用代码，仅变更部署平台和 DNS 策略。

**Cloudflare for SaaS 架构：**
```
mystore.com (商家域名)
  → CNAME → lumora-saas.lumora.shop (Cloudflare Fallback Origin)
  → Cloudflare for SaaS 自动签发 SSL
  → 反代到 Next.js 应用（Cloudflare Pages 或 Origin Server）
  → middleware 按 hostname 路由
```

---

## Decision 7: 可观测性

### 决策：最小化监控栈

| 层面 | 工具 | 理由 |
|------|------|------|
| 错误追踪 | Sentry (Free tier) | 自动捕获前后端异常 |
| 分析 | Vercel Analytics | 内置，零配置 |
| 日志 | Vercel Logs + Supabase Logs | 平台自带，无额外成本 |
| Uptime | Better Uptime (Free) | 主要 endpoint 监控 |

**初期不引入：** Datadog, New Relic, 自建 ELK（过度工程）。

---

## Decision 8: 开发工作流

### 决策：Trunk-based + Preview Deployments

**分支策略：**
- `main` = production（Vercel 自动部署）
- Feature branches = preview URL（每个 PR 一个预览环境）
- 不使用 develop/staging 分支（增加维护成本，初期无必要）

**CI/CD：**
- GitHub Actions: lint + type-check + unit test
- Vercel: 自动 preview deploy on PR
- Supabase: Migration 通过 `supabase db push`（开发期），`supabase db migrate`（生产期）

**本地开发：**

```bash
# 启动本地 Supabase（含 Auth + DB + Storage）
npx supabase start

# 启动 Next.js dev server
pnpm dev
```

---

## 成本总结 (MVP Phase)

| 服务 | Plan | 月费 |
|------|------|------|
| Supabase | Pro | $25 |
| Vercel | Pro (含 Edge Config) | $20 |
| OpenAI API | Pay-as-you-go | $10-50 |
| Replicate | Pay-as-you-go | $5-20 |
| Sentry | Free | $0 |
| Domain (lumora.shop) | - | ~$2 |
| Cloudflare for SaaS | 仅 Phase 3b | $0 (初期不需要) |
| **Total** | | **$62 - $117/月** |

---

## 技术栈锁定总结

```
┌─────────────────────────────────────────────────────────┐
│                      Lumora MVP Stack                     │
├─────────────────────────────────────────────────────────┤
│  Frontend + Backend:  Next.js 15 (App Router)            │
│  Deployment:          Vercel Pro                         │
│  Domain Routing:      Middleware + Vercel Edge Config    │
│  Domain Scaling:      Cloudflare for SaaS (Phase 3b)    │
│  Database:            Supabase Postgres + RLS            │
│  Auth:                Supabase Auth                      │
│  Storage:             Supabase Storage                   │
│  AI (Text):           OpenAI GPT-4o-mini                 │
│  AI (Image):          Replicate SDXL/Flux                │
│  AI (Vector):         Supabase pgvector                  │
│  Monitoring:          Sentry + Vercel Analytics          │
│  CI/CD:               GitHub Actions + Vercel            │
└─────────────────────────────────────────────────────────┘
```

---

## 本 ADR 不覆盖的内容（后续 ADR）

- ADR-002: 支付集成方案（Stripe vs LemonSqueezy）
- ADR-003: Medusa 引入时机与集成方式
- ADR-004: Marketplace 聚合层架构
- ADR-005: 国际化与多语言策略
- ADR-006: 店铺主题与品牌定制系统

---

## 变更记录

| 日期 | 变更 | 原因 |
|------|------|------|
| 2026-01-24 | 初始版本 | 解决现有规划文档的技术矛盾，锁定 MVP 选型 |
| 2026-01-24 | Decision 6 扩展为三阶段域名策略 | 明确自定义域名实现路径，补充 Edge Config 缓存与 Cloudflare for SaaS 扩展方案 |
