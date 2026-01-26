# Plan: 引入 apps/lumora-medusa 单实例多租户 Medusa 2.x 后端

## 概述

创建 `apps/lumora-medusa/` — 独立的 Medusa 2.10.3 多租户商务后端，通过 Links + SalesChannel 实现租户隔离，Supabase JWT 桥接认证。

## 架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 多租户模式 | Custom Tenant Module + Links | Medusa 2.x 不允许修改 core module schema，Links 是官方推荐的跨模块关联方式 |
| 商务隔离 | 每租户一个 SalesChannel | SalesChannel 是 Medusa 原生的多店铺边界（产品发布、购物车、订单归属） |
| 认证 | Custom auth-supabase Provider | 验证 Supabase JWT → 映射到 Medusa auth identity |
| 租户解析(Admin) | X-Tenant-Id header | 前端从 Supabase 获取 tenant_id 传入 |
| 租户解析(Store) | URL path `/store/:slug/` | 消费者访问无需认证，按 slug 路由 |
| 数据库 | 独立 PostgreSQL (port 5433) | 与 Supabase 和 DJI Medusa 完全隔离 |
| Admin UI | 禁用 | lumora-platform 就是管理界面 |
| 支付 | Stripe | 平台级 Stripe Connect 未来可扩展到分账 |

## 端口分配

| 服务 | 端口 | 用途 |
|------|------|------|
| lumora-platform (Next.js) | 3000 | 前端 |
| lumora-medusa (Medusa) | 9002 | Commerce API |
| lumora-postgres | 5433 | Medusa 数据库 |
| lumora-redis | 6380 | Medusa 缓存 |

## 项目结构

```
apps/lumora-medusa/
├── package.json
├── medusa-config.ts
├── tsconfig.json
├── docker-compose.yml          # 本地 Postgres:5433 + Redis:6380
├── .env.template
├── src/
│   ├── modules/
│   │   ├── tenant/             # 租户模块
│   │   │   ├── models/tenant.ts
│   │   │   ├── service.ts
│   │   │   └── index.ts
│   │   └── auth-supabase/      # Supabase JWT 认证提供者
│   │       ├── service.ts
│   │       └── index.ts
│   ├── links/
│   │   ├── tenant-product.ts
│   │   ├── tenant-order.ts
│   │   ├── tenant-customer.ts
│   │   └── tenant-sales-channel.ts
│   ├── api/
│   │   ├── middlewares.ts      # 全局 auth + tenant 解析
│   │   ├── admin/
│   │   │   ├── tenants/route.ts
│   │   │   └── products/route.ts
│   │   └── store/
│   │       └── [tenant_slug]/
│   │           ├── products/route.ts
│   │           ├── cart/route.ts
│   │           └── checkout/route.ts
│   ├── workflows/
│   │   └── create-tenant/      # 开店工作流（Tenant + SalesChannel + Link）
│   ├── subscribers/
│   └── scripts/seed.ts
└── integration-tests/
```

## 核心模块设计

### 1. Tenant Module (`src/modules/tenant/`)

**Model** — MikroORM DML:
```typescript
const Tenant = model.define("tenant", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  supabase_tenant_id: model.text().unique(),  // 映射 Supabase tenants.id
  status: model.enum(["active", "suspended", "deleted"]).default("active"),
  plan: model.enum(["free", "pro", "enterprise"]).default("free"),
  settings: model.json().default({}),
})
```

**Service** — extends MedusaService，增加 `findBySlug()` 和 `findBySupabaseId()`

### 2. Auth-Supabase Provider (`src/modules/auth-supabase/`)

- 继承 `AbstractAuthModuleProvider`（参考 `apps/medusa/src/modules/auth-google-one-tap/service.ts`）
- 使用 `jose` 库验证 Supabase JWT（用 Supabase JWT secret）
- 从 JWT payload 提取 `sub` (user_id)
- 创建/检索 Medusa auth identity（entity_id = `supabase:{user_id}`）

### 3. Links（跨模块关联）

每个 Link 使用 `defineLink` 连接 Tenant 到 Medusa core entity：
- `tenant-product`: Tenant ↔ Product (isList)
- `tenant-order`: Tenant ↔ Order (isList)
- `tenant-customer`: Tenant ↔ Customer (isList)
- `tenant-sales-channel`: Tenant ↔ SalesChannel (1:1)

### 4. API Middleware

```
Admin 路由 (/admin/**):
  1. authenticate("user", ["bearer"]) → 验证 Supabase JWT
  2. resolveTenantFromAuth → 从 X-Tenant-Id header 获取 tenant
  3. validateMembership → 通过 Supabase service-role 查询 tenant_members 验证权限

Store 路由 (/store/:tenant_slug/**):
  1. resolveTenantFromSlug → 从 URL slug 解析 tenant
  2. 浏览无需认证，购物车/结账需要 customer auth
```

### 5. Create-Tenant Workflow

```
Input: { name, slug, supabaseTenantId, plan }
Step 1: createTenantRecord → Tenant Module
Step 2: createSalesChannel → SalesChannel Module
Step 3: linkTenantSalesChannel → Link Service
Output: { tenant, salesChannel }
```

## medusa-config.ts 要点

```typescript
export default defineConfig({
  projectConfig: {
    databaseUrl: "postgres://lumora:lumora@127.0.0.1:5433/lumora_medusa",
    redisUrl: "redis://127.0.0.1:6380",
    http: { port: 9002, storeCors, adminCors, authCors, jwtSecret, cookieSecret },
  },
  admin: { disable: true },  // 无 Admin UI
  modules: {
    tenant: { resolve: "./src/modules/tenant" },
    [Modules.AUTH]: {
      providers: [{ resolve: "./src/modules/auth-supabase", id: "supabase" }],
    },
    [Modules.PAYMENT]: {
      providers: [{ resolve: "@medusajs/medusa/payment-stripe", id: "stripe" }],
    },
    [Modules.FULFILLMENT]: {
      providers: [{ resolve: "@medusajs/medusa/fulfillment-manual", id: "manual" }],
    },
  },
})
```

## 前端集成 (lumora-platform)

新增 `src/lib/medusa/client.ts`：

```typescript
// Admin API: 带 Supabase token + X-Tenant-Id header
export async function medusaAdmin(path, { token, tenantId, method, body })

// Store API: 按 slug 路由，可选 token（购物车需要）
export async function medusaStore(slug, path, { token? })
```

新增 `.env.local` 变量：
```
NEXT_PUBLIC_MEDUSA_URL=http://localhost:9002
```

## 实施步骤（本次执行范围：Sprint 1 Foundation）

1. 创建 `apps/lumora-medusa/` 目录结构
2. 编写 `package.json`（Medusa 2.10.3 依赖）
3. 编写 `tsconfig.json`
4. 编写 `docker-compose.yml`（Postgres:5433 + Redis:6380）
5. 编写 `.env.template` 和 `.env`
6. 编写 `medusa-config.ts`
7. 实现 Tenant Module（model + service + index）
8. 实现 auth-supabase Provider
9. 定义 Links（tenant-product, tenant-sales-channel）
10. 编写 `src/api/middlewares.ts`
11. 实现 create-tenant workflow
12. 创建基础 admin/store API routes
13. `pnpm install && docker compose up -d && pnpm --filter lumora-medusa db:migrate`
14. 验证启动成功，seed 测试数据

## 验证方式

1. `docker compose up -d` → PostgreSQL + Redis 启动正常
2. `pnpm --filter lumora-medusa dev` → Medusa 启动在 9002 端口
3. `curl http://localhost:9002/health` → 200
4. 用 Supabase JWT 调用 `POST /admin/tenants` → 创建租户成功
5. 调用 `GET /store/{slug}/products` → 返回空列表（隔离正确）
6. 创建商品后验证租户隔离：tenant A 的商品对 tenant B 不可见

## 关键参考文件

- `/home/coderisedev/cs/apps/medusa/medusa-config.ts` — config 结构参考
- `/home/coderisedev/cs/apps/medusa/src/modules/auth-google-one-tap/service.ts` — auth provider 模式
- `/home/coderisedev/cs/apps/medusa/src/modules/README.md` — module 创建指南
- `/home/coderisedev/cs/apps/medusa/package.json` — 依赖版本参考
- `/home/coderisedev/cs/apps/lumora-platform/supabase/migrations/20260124000001_initial_schema.sql` — tenant schema
- `/home/coderisedev/cs/apps/lumora-platform/src/middleware.ts` — 前端 tenant 解析逻辑
