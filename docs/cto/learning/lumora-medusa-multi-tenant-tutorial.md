# Lumora Medusa 多租户商务后端教程

## 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [核心概念](#核心概念)
4. [从零搭建指南](#从零搭建指南)
5. [自定义模块开发](#自定义模块开发)
6. [Auth Provider 开发](#auth-provider-开发)
7. [Links 跨模块关联](#links-跨模块关联)
8. [API 路由与中间件](#api-路由与中间件)
9. [Workflow 工作流](#workflow-工作流)
10. [本地开发与测试](#本地开发与测试)
11. [常见问题与排错](#常见问题与排错)
12. [参考资源](#参考资源)

---

## 概述

`apps/lumora-medusa/` 是一个基于 **Medusa 2.10.3** 的多租户商务后端，每个租户（商店）通过独立的 SalesChannel 实现数据隔离。系统使用 Supabase 作为认证源，通过自定义 Auth Provider 桥接 Supabase JWT 到 Medusa 的 Auth Identity 体系。

### 技术栈

| 组件 | 技术 | 版本 |
|------|------|------|
| 商务引擎 | Medusa | 2.10.3 |
| ORM | MikroORM | 6.4.3 |
| 数据库 | PostgreSQL | 16 |
| 缓存 | Redis | 7 |
| 认证 | Supabase JWT + jose | - |
| 运行时 | Node.js | >=20 |

### 端口分配

| 服务 | 端口 | 用途 |
|------|------|------|
| lumora-medusa | 9002 | Commerce API |
| lumora-postgres | 5433 | Medusa 专用数据库 |
| lumora-redis | 6380 | Medusa 缓存/队列 |

---

## 架构设计

### 多租户隔离模型

```
┌─────────────────────────────────────────────────────────┐
│                    Medusa 2.x 实例                        │
│                                                          │
│  ┌──────────┐    Links    ┌───────────────────────┐     │
│  │  Tenant  │◄──────────►│  SalesChannel (1:1)    │     │
│  │  Module  │◄──────────►│  Product     (1:many)  │     │
│  │          │◄──────────►│  Order       (1:many)  │     │
│  │          │◄──────────►│  Customer    (1:many)  │     │
│  └──────────┘            └───────────────────────┘     │
│                                                          │
│  ┌──────────────┐        ┌──────────────────────┐      │
│  │ Auth-Supabase│        │   API Routes          │      │
│  │   Provider   │        │   /admin/tenants      │      │
│  │              │        │   /admin/products     │      │
│  │ JWT verify   │        │   /shop/:slug/products│      │
│  └──────────────┘        └──────────────────────┘      │
└─────────────────────────────────────────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐        ┌─────────────────┐
│    Supabase     │        │   lumora-platform│
│  (Auth source)  │        │   (Next.js 前端) │
└─────────────────┘        └─────────────────┘
```

### 为什么选择 Links 而非修改 Core Schema

Medusa 2.x 的核心设计原则是**模块隔离**——不允许修改 core module 的数据模型。Links 是官方推荐的跨模块关联方式：

- 不侵入核心代码，升级无风险
- 通过 Query Graph 实现跨模块查询
- 自动生成中间表和迁移
- 支持事务性的创建/删除

### 租户解析策略

| 场景 | 解析方式 | 说明 |
|------|---------|------|
| Admin API | `X-Tenant-Id` header | 前端从 Supabase 获取当前 tenant_id |
| Shop API | URL path `/shop/:slug/` | 消费者按 slug 路由，无需认证 |

---

## 核心概念

### Medusa 2.x 模块系统

Medusa 2.x 采用模块化架构，每个模块是一个独立的功能单元：

```
Module = Model (DML) + Service (MedusaService) + Module Definition
```

**关键类/函数：**

| 概念 | 导入来源 | 用途 |
|------|---------|------|
| `model.define()` | `@medusajs/framework/utils` | 定义数据模型 (DML) |
| `MedusaService()` | `@medusajs/framework/utils` | 创建服务基类 (CRUD) |
| `Module()` | `@medusajs/framework/utils` | 导出模块定义 |
| `defineLink()` | `@medusajs/framework/utils` | 定义跨模块关联 |
| `defineMiddlewares()` | `@medusajs/framework/http` | 定义 API 中间件 |
| `createWorkflow()` | `@medusajs/framework/workflows-sdk` | 定义工作流 |

### DML (Data Modeling Language)

Medusa 2.x 使用自己的 DML 而非直接操作 MikroORM decorators：

```typescript
import { model } from "@medusajs/framework/utils"

const MyEntity = model.define("my_entity", {
  id: model.id().primaryKey(),           // 自动生成 ID
  name: model.text(),                     // VARCHAR
  slug: model.text().unique(),            // UNIQUE 约束
  status: model.enum(["a", "b"]),         // ENUM 类型
  count: model.number().default(0),       // INTEGER + 默认值
  settings: model.json().default({}),     // JSONB
  is_active: model.boolean().default(true),
  created_at: model.dateTime(),           // TIMESTAMP
})
```

### MedusaService 自动生成的方法

继承 `MedusaService({ Entity })` 后，你的 service 自动获得：

| 方法 | 功能 |
|------|------|
| `listEntities(filters?, config?)` | 查询列表 |
| `listAndCountEntities(filters?, config?)` | 查询列表 + 计数 |
| `retrieveEntity(id, config?)` | 按 ID 查询 |
| `createEntities(data)` | 创建 (单个或批量) |
| `updateEntities(data)` | 更新 |
| `deleteEntities(ids)` | 删除 |

> 注意：方法名自动按 Entity 名称变化。模型名为 `tenant`，则方法为 `listTenants`, `createTenants` 等。

---

## 从零搭建指南

### 1. 创建项目目录

```bash
mkdir -p apps/lumora-medusa/src/{modules,links,api,workflows,subscribers,scripts}
```

### 2. package.json

最小依赖集：

```json
{
  "name": "lumora-medusa",
  "version": "0.0.1",
  "scripts": {
    "build": "medusa build",
    "dev": "medusa develop",
    "start": "medusa start",
    "seed": "medusa exec ./src/scripts/seed.ts",
    "db:generate": "medusa db:generate",
    "db:migrate": "medusa db:migrate"
  },
  "dependencies": {
    "@medusajs/admin-bundler": "2.10.3",
    "@medusajs/admin-sdk": "2.10.3",
    "@medusajs/auth": "2.10.3",
    "@medusajs/cli": "2.10.3",
    "@medusajs/framework": "2.10.3",
    "@medusajs/medusa": "2.10.3",
    "@medusajs/types": "2.10.3",
    "@medusajs/utils": "2.10.3",
    "@mikro-orm/core": "6.4.3",
    "@mikro-orm/knex": "6.4.3",
    "@mikro-orm/migrations": "6.4.3",
    "@mikro-orm/postgresql": "6.4.3",
    "awilix": "^8.0.1",
    "jose": "^5.9.6",
    "pg": "^8.13.0",
    "ioredis": "^5.8.2"
  },
  "devDependencies": {
    "@swc/core": "1.5.7",
    "@types/node": "^20.0.0",
    "typescript": "^5.6.2"
  },
  "engines": { "node": ">=20" }
}
```

> `@medusajs/admin-bundler` 和 `@medusajs/admin-sdk` 即使禁用 Admin UI 也需要，因为 Medusa build 系统依赖它们。

### 3. medusa-config.ts

```typescript
import { Modules, defineConfig, loadEnv } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      port: Number(process.env.PORT) || 9002,
      storeCors: process.env.STORE_CORS ?? "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS ?? "http://localhost:3000",
      authCors: process.env.AUTH_CORS ?? "http://localhost:3000",
      jwtSecret: process.env.JWT_SECRET ?? "dev-secret",
      cookieSecret: process.env.COOKIE_SECRET ?? "dev-cookie-secret",
    },
  },
  admin: { disable: true },  // 无 Admin UI
  modules: {
    // 自定义模块：直接用 key 注册
    tenant: {
      resolve: "./src/modules/tenant",
    },
    // 核心模块：用 Modules 常量
    [Modules.AUTH]: {
      resolve: "@medusajs/auth",
      options: {
        providers: [{
          resolve: "./src/modules/auth-supabase",
          id: "supabase",
          options: { jwtSecret: process.env.SUPABASE_JWT_SECRET },
        }],
      },
    },
  },
})
```

**关键配置说明：**

- `admin: { disable: true }` — 不构建 Admin UI，节省资源
- 自定义模块用字符串 key 注册（如 `tenant`），解析自 `./src/modules/tenant`
- 核心模块用 `Modules.*` 常量作为 key
- Auth Provider 通过 `providers` 数组注册，每个 provider 需要 `resolve` 路径和唯一 `id`

### 4. Docker Compose (本地基础设施)

```yaml
services:
  lumora-postgres:
    image: postgres:16-alpine
    container_name: lumora-postgres
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: lumora
      POSTGRES_PASSWORD: lumora
      POSTGRES_DB: lumora_medusa
    volumes:
      - lumora_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lumora -d lumora_medusa"]
      interval: 5s
      timeout: 3s
      retries: 5

  lumora-redis:
    image: redis:7-alpine
    container_name: lumora-redis
    ports:
      - "6380:6379"
    volumes:
      - lumora_redis_data:/data

volumes:
  lumora_pg_data:
  lumora_redis_data:
```

### 5. 启动流程

```bash
# 1. 安装依赖
pnpm install

# 2. 启动基础设施
cd apps/lumora-medusa && docker compose up -d

# 3. 生成自定义模块迁移
pnpm --filter lumora-medusa db:generate tenant

# 4. 执行所有迁移 (核心模块 + 自定义模块 + Links)
pnpm --filter lumora-medusa db:migrate

# 5. 启动开发服务器
pnpm --filter lumora-medusa dev
```

---

## 自定义模块开发

### Tenant Module 完整实现

#### 1. 数据模型 (`src/modules/tenant/models/tenant.ts`)

```typescript
import { model } from "@medusajs/framework/utils"

const Tenant = model.define("tenant", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  supabase_tenant_id: model.text().unique(),
  status: model.enum(["active", "suspended", "deleted"]).default("active"),
  plan: model.enum(["free", "pro", "enterprise"]).default("free"),
  settings: model.json().default({}),
})

export default Tenant
```

**要点：**
- `model.define("tenant", ...)` 中的 `"tenant"` 是模型名称，决定了数据库表名（`tenant`）
- `.unique()` 自动创建唯一索引
- `.default()` 设置数据库默认值
- DML 不支持所有 SQL 特性（如 CHECK 约束），复杂校验在 service 层处理

#### 2. 服务 (`src/modules/tenant/service.ts`)

```typescript
import { MedusaService } from "@medusajs/framework/utils"
import Tenant from "./models/tenant"

class TenantModuleService extends MedusaService({
  Tenant,
}) {
  // 扩展自定义方法
  async findBySlug(slug: string) {
    const [tenant] = await this.listTenants({ slug })
    return tenant ?? null
  }

  async findBySupabaseId(supabaseTenantId: string) {
    const [tenant] = await this.listTenants({
      supabase_tenant_id: supabaseTenantId,
    })
    return tenant ?? null
  }
}

export default TenantModuleService
```

**要点：**
- `MedusaService({ Tenant })` 传入模型对象，自动生成 CRUD 方法
- 模型名 `Tenant` (PascalCase) → 方法名用 `Tenants` (如 `listTenants`, `createTenants`)
- 自定义方法可以调用自动生成的基础方法

#### 3. 模块导出 (`src/modules/tenant/index.ts`)

```typescript
import { Module } from "@medusajs/framework/utils"
import TenantModuleService from "./service"

export const TENANT_MODULE = "tenant"

export default Module(TENANT_MODULE, {
  service: TenantModuleService,
})
```

**`Module()` 返回值结构：**
```typescript
{
  service: TenantModuleService,
  loaders: undefined,
  linkable: {
    tenant: {
      id: {
        serviceName: "tenant",
        field: "tenant",
        linkable: "tenant_id",
        primaryKey: "id",
      },
      toJSON() { /* ... */ }
    }
  }
}
```

`linkable` 属性会被 `defineLink()` 使用来建立跨模块关联。

#### 4. 数据库迁移

```bash
# 生成迁移文件（指定模块名称）
pnpm --filter lumora-medusa db:generate tenant

# 执行迁移
pnpm --filter lumora-medusa db:migrate
```

生成的迁移文件位于 `src/modules/tenant/migrations/` 目录下。

---

## Auth Provider 开发

### Supabase JWT Provider

Auth Provider 继承 `AbstractAuthModuleProvider`，实现 JWT 验证并映射到 Medusa 的 Auth Identity。

#### 核心流程

```
Supabase JWT (Bearer token)
         │
         ▼
┌─────────────────────┐
│  extractToken()     │ ← 从 Authorization header 提取
│  verifyToken()      │ ← 用 jose 库验证 HS256 签名
│  resolveAuthIdentity│ ← 查找/创建 Medusa auth identity
└─────────────────────┘
         │
         ▼
AuthenticationResponse { success: true, authIdentity }
```

#### 实现 (`src/modules/auth-supabase/service.ts`)

```typescript
import type {
  AuthenticationInput,
  AuthenticationResponse,
  AuthIdentityProviderService,
  Logger,
} from "@medusajs/framework/types"
import {
  AbstractAuthModuleProvider,
  MedusaError,
} from "@medusajs/framework/utils"
import * as jose from "jose"

type SupabaseAuthOptions = {
  jwtSecret: string
}

export class SupabaseAuthService extends AbstractAuthModuleProvider {
  static identifier = "supabase"          // Provider ID
  static DISPLAY_NAME = "Supabase JWT"

  protected options_: SupabaseAuthOptions
  protected secretKey_: Uint8Array

  // 选项验证（启动时调用）
  static validateOptions(options: SupabaseAuthOptions) {
    if (!options?.jwtSecret) {
      throw new Error("Supabase JWT secret is required")
    }
  }

  constructor({ logger }: { logger: Logger }, options: SupabaseAuthOptions) {
    super(...arguments)
    this.options_ = options
    this.secretKey_ = new TextEncoder().encode(options.jwtSecret)
  }

  // 禁用注册（注册通过 Supabase 处理）
  async register(): Promise<AuthenticationResponse> {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Registration is handled by Supabase."
    )
  }

  // 核心认证方法
  async authenticate(
    data: AuthenticationInput,
    authIdentityService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const token = this.extractToken(data)
    if (!token) return { success: false, error: "Missing token" }

    const payload = await this.verifyToken(token)
    const entityId = `supabase:${payload.sub}`

    const authIdentity = await this.resolveAuthIdentity(
      entityId, payload, authIdentityService
    )
    return { success: true, authIdentity }
  }

  // 从请求中提取 token
  protected extractToken(data: AuthenticationInput): string | undefined {
    const bearer = data.headers?.authorization
    if (bearer?.startsWith("Bearer ")) return bearer.slice(7)
    return data.body?.token ?? data.body?.access_token
  }

  // 验证 JWT 签名
  protected async verifyToken(token: string): Promise<jose.JWTPayload> {
    const { payload } = await jose.jwtVerify(token, this.secretKey_, {
      algorithms: ["HS256"],
    })
    return payload
  }

  // 查找或创建 Auth Identity
  protected async resolveAuthIdentity(
    entityId: string,
    payload: jose.JWTPayload,
    authIdentityService: AuthIdentityProviderService
  ) {
    try {
      return await authIdentityService.retrieve({ entity_id: entityId })
    } catch (error: any) {
      if (error?.type !== MedusaError.Types.NOT_FOUND) throw error
    }
    // 首次登录：创建新的 auth identity
    return authIdentityService.create({
      entity_id: entityId,
      user_metadata: {
        supabase_user_id: payload.sub,
        email: payload.email as string | undefined,
      },
    })
  }
}
```

#### 模块注册 (`src/modules/auth-supabase/index.ts`)

```typescript
import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { SupabaseAuthService } from "./service"

// 注意：Auth Provider 用 ModuleProvider，不是 Module
export default ModuleProvider(Modules.AUTH, {
  services: [SupabaseAuthService],
})
```

**Module vs ModuleProvider 的区别：**

| | Module | ModuleProvider |
|---|--------|---------------|
| 用途 | 独立功能模块 | 为核心模块提供 Provider |
| 示例 | Tenant Module | Auth Supabase Provider |
| 注册方式 | `modules: { key: { resolve } }` | `modules: { [Modules.X]: { providers: [...] } }` |
| 数据模型 | 有自己的 Model | 无独立 Model |

#### `AuthenticationInput` 数据结构

```typescript
interface AuthenticationInput {
  url: string              // 请求 URL
  headers: Record<string, string>  // 请求头
  query: Record<string, string>    // 查询参数
  body: Record<string, any>        // 请求体
  protocol: string         // http 或 https
}
```

---

## Links 跨模块关联

### defineLink 核心概念

Links 在 Medusa 2.x 中解决"模块间如何关联数据"的问题。每个 Link 会自动：

1. 创建中间表（如 `tenant_tenant_product_product`）
2. 注册到 Query Graph 中
3. 支持通过 `remoteLink` 服务操作

### 正确的 defineLink 语法

`defineLink()` 接受两个参数，每个参数必须是以下格式之一：

**格式 A — Linkable 对象（来自自定义模块）：**
```typescript
TenantModule.linkable.tenant  // Module() 返回值的 .linkable.entity
```

**格式 B — 带选项的 Linkable 配置：**
```typescript
{
  linkable: {
    serviceName: "product",       // 模块注册名
    field: "product",             // 实体字段名
    linkable: "product_id",       // 关联键名
    primaryKey: "id",             // 主键字段
  },
  isList: true,                   // 是否一对多
}
```

### 实际示例

#### 一对多关联（Tenant → Products）

```typescript
// src/links/tenant-product.ts
import { defineLink, Modules } from "@medusajs/framework/utils"
import TenantModule from "../modules/tenant"

export default defineLink(
  TenantModule.linkable.tenant,       // 左侧：自定义模块用 .linkable
  {
    linkable: {
      serviceName: Modules.PRODUCT,   // "product"
      field: "product",
      linkable: "product_id",
      primaryKey: "id",
    },
    isList: true,                     // 一个 tenant 关联多个 product
  }
)
```

#### 一对一关联（Tenant → SalesChannel）

```typescript
// src/links/tenant-sales-channel.ts
import { defineLink, Modules } from "@medusajs/framework/utils"
import TenantModule from "../modules/tenant"

export default defineLink(
  TenantModule.linkable.tenant,
  {
    linkable: {
      serviceName: Modules.SALES_CHANNEL,  // "sales_channel"
      field: "sales_channel",
      linkable: "sales_channel_id",
      primaryKey: "id",
    },
    // 不设 isList → 默认 false (1:1)
  }
)
```

### 常见错误

**错误：直接传 Modules 常量字符串**
```typescript
// ❌ 错误！Modules.PRODUCT 是字符串 "product"，不满足 isInputSource 检查
defineLink(TenantModule.linkable.tenant, Modules.PRODUCT)

// ✅ 正确：包装为带 serviceName 的对象
defineLink(TenantModule.linkable.tenant, {
  linkable: { serviceName: Modules.PRODUCT, field: "product", linkable: "product_id", primaryKey: "id" }
})
```

**错误原因：** `defineLink` 内部的 `isInputSource()` 检查要求参数必须是带 `serviceName` 属性的对象或带 `toJSON()` 方法的对象。纯字符串不满足任何一个条件。

### 通过 Query Graph 查询 Links

```typescript
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// 在 API route 中
const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

const { data: links } = await query.graph({
  entity: "tenant_product",       // Link 实体名（自动生成）
  fields: ["product_id"],
  filters: {
    tenant_id: tenantId,
  },
})
```

### 通过 remoteLink 操作 Links

```typescript
const linkService = container.resolve("remoteLink")

// 创建关联
await linkService.create({
  [TENANT_MODULE]: { tenant_id: tenantId },
  [Modules.PRODUCT]: { product_id: productId },
})

// 删除关联
await linkService.dismiss({
  [TENANT_MODULE]: { tenant_id: tenantId },
  [Modules.PRODUCT]: { product_id: productId },
})
```

---

## API 路由与中间件

### 路由文件约定

Medusa 使用文件系统路由（类似 Next.js）：

```
src/api/
├── middlewares.ts              # 全局中间件配置
├── admin/
│   ├── tenants/route.ts        # /admin/tenants
│   └── products/route.ts       # /admin/products
└── shop/
    └── [tenant_slug]/          # 动态路由参数
        ├── products/route.ts   # /shop/:tenant_slug/products
        ├── cart/route.ts       # /shop/:tenant_slug/cart
        └── checkout/route.ts   # /shop/:tenant_slug/checkout
```

**路由文件导出命名方法即可：**
```typescript
export async function GET(req, res) { /* ... */ }
export async function POST(req, res) { /* ... */ }
export async function PUT(req, res) { /* ... */ }
export async function DELETE(req, res) { /* ... */ }
```

### 中间件系统

```typescript
// src/api/middlewares.ts
import {
  defineMiddlewares,
  authenticate,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/tenants",
      middlewares: [
        authenticate("user", ["bearer"]),  // 内置 auth 中间件
      ],
    },
    {
      matcher: "/admin/products*",
      middlewares: [
        authenticate("user", ["bearer"]),
        resolveTenantFromHeader,           // 自定义中间件
      ],
    },
    {
      matcher: "/shop/:tenant_slug/*",
      middlewares: [
        resolveTenantFromSlug,             // 自定义中间件
      ],
    },
  ],
})
```

### 扩展 Request 类型

```typescript
// 声明合并，在 Request 上添加自定义字段
declare module "@medusajs/framework/http" {
  interface MedusaRequest {
    tenant_id?: string
    tenant_slug?: string
  }
}
```

### 自定义中间件示例

```typescript
async function resolveTenantFromSlug(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const slug = req.params.tenant_slug
  if (!slug) {
    res.status(400).json({ message: "Missing tenant slug" })
    return  // 注意：不调用 next()
  }

  const tenantService = req.scope.resolve(TENANT_MODULE)
  const tenant = await tenantService.findBySlug(slug)

  if (!tenant || tenant.status !== "active") {
    res.status(404).json({ message: "Store not found" })
    return
  }

  req.tenant_id = tenant.id
  req.tenant_slug = tenant.slug
  next()  // 继续执行
}
```

### 避免 /store/* 路由冲突

Medusa 内置对所有 `/store/**` 路由强制要求 `x-publishable-api-key` header。如果你的自定义店铺路由不想使用 publishable key 机制，应使用不同前缀：

```
❌ /store/:tenant_slug/products  → 会触发 Medusa 内置的 publishable key 校验
✅ /shop/:tenant_slug/products   → 自定义前缀，不受限制
```

### 依赖注入 (Awilix Container)

在路由中通过 `req.scope.resolve()` 获取服务：

```typescript
// 自定义模块 service
const tenantService = req.scope.resolve(TENANT_MODULE)

// 核心模块 service
const productService = req.scope.resolve(Modules.PRODUCT)

// Query Graph
const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

// Remote Link service
const linkService = req.scope.resolve("remoteLink")
```

---

## Workflow 工作流

### Workflow 概念

Workflow 是 Medusa 2.x 中处理多步骤操作的推荐方式。每个 step 可以定义补偿逻辑（rollback），实现类似 Saga 模式的事务一致性。

### create-tenant Workflow

```typescript
import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

// Step 1: 创建租户记录
const createTenantRecordStep = createStep(
  "create-tenant-record",       // Step ID（唯一标识）
  async (input, { container }) => {
    // 正向逻辑
    const tenantService = container.resolve(TENANT_MODULE)
    const tenant = await tenantService.createTenants(input)
    return new StepResponse(tenant, tenant.id)  // (result, compensateInput)
  },
  async (tenantId, { container }) => {
    // 补偿逻辑（回滚）
    const tenantService = container.resolve(TENANT_MODULE)
    await tenantService.deleteTenants(tenantId)
  }
)

// Step 2: 创建 Sales Channel
const createSalesChannelStep = createStep(
  "create-sales-channel",
  async (input, { container }) => {
    const scService = container.resolve(Modules.SALES_CHANNEL)
    const sc = await scService.createSalesChannels({
      name: input.name,
      is_disabled: false,
    })
    return new StepResponse(sc, sc.id)
  },
  async (scId, { container }) => {
    const scService = container.resolve(Modules.SALES_CHANNEL)
    await scService.deleteSalesChannels(scId)
  }
)

// Step 3: 建立 Link
const linkTenantSalesChannelStep = createStep(
  "link-tenant-sales-channel",
  async (input, { container }) => {
    const linkService = container.resolve("remoteLink")
    await linkService.create({
      [TENANT_MODULE]: { tenant_id: input.tenant_id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: input.sales_channel_id },
    })
    return new StepResponse(input)
  },
  async (input, { container }) => {
    const linkService = container.resolve("remoteLink")
    await linkService.dismiss({
      [TENANT_MODULE]: { tenant_id: input.tenant_id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: input.sales_channel_id },
    })
  }
)

// 组合 Workflow
export const createTenantWorkflow = createWorkflow(
  "create-tenant",
  (input: CreateTenantInput) => {
    const tenant = createTenantRecordStep(input)
    const salesChannel = createSalesChannelStep({ name: input.name })
    linkTenantSalesChannelStep({
      tenant_id: tenant.id,
      sales_channel_id: salesChannel.id,
    })
    return new WorkflowResponse({ tenant, salesChannel })
  }
)
```

### Workflow 执行

```typescript
// 在 API route 中调用
const { result } = await createTenantWorkflow(req.scope)
  .run({
    input: {
      name: "My Store",
      slug: "my-store",
      supabase_tenant_id: "uuid-from-supabase",
    },
  })
```

### StepResponse 参数说明

```typescript
new StepResponse(
  result,           // 传递给下一个 step 或 workflow 返回值
  compensateInput   // 传递给补偿函数的参数（回滚时使用）
)
```

---

## 本地开发与测试

### 快速启动

```bash
# 一键启动
cd apps/lumora-medusa
docker compose up -d          # 基础设施
pnpm --filter lumora-medusa dev  # 开发服务器 (port 9002)
```

### 验证端点

```bash
# 健康检查
curl http://localhost:9002/health
# → OK

# Admin API (需要认证)
curl http://localhost:9002/admin/tenants
# → {"message":"Unauthorized"}

# Shop API (需要有效 slug)
curl http://localhost:9002/shop/my-store/products
# → {"message":"Store not found"} 或 {"products":[],"count":0}
```

### 使用 Seed 脚本

```bash
pnpm --filter lumora-medusa seed
```

这会创建两个演示租户（demo-alpha, demo-beta），每个带有独立的 SalesChannel。

### 模拟认证测试

生成测试 JWT（使用 `.env` 中的 `SUPABASE_JWT_SECRET`）：

```bash
# Node.js 脚本生成测试 token
node -e "
const jose = require('jose');
(async () => {
  const secret = new TextEncoder().encode('super-secret-jwt-token-with-at-least-32-characters-long');
  const jwt = await new jose.SignJWT({ sub: 'test-user-001', email: 'test@example.com', role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
  console.log(jwt);
})()
"
```

然后使用生成的 token 调用 Admin API：

```bash
TOKEN="eyJ..."
curl -X POST http://localhost:9002/admin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Store","slug":"my-store","supabase_tenant_id":"test-uuid"}'
```

### 数据库操作

```bash
# 连接到 lumora 数据库
psql postgres://lumora:lumora@127.0.0.1:5433/lumora_medusa

# 查看租户表
SELECT * FROM tenant;

# 查看 Link 表
SELECT * FROM tenant_tenant_product_product;
SELECT * FROM tenant_tenant_sales_channel_sales_channel;

# 查看所有自定义表
\dt tenant*
```

---

## 常见问题与排错

### Q: `Invalid linkable passed for the argument "xxx"`

**原因：** `defineLink()` 的参数格式不正确。不能直接传 `Modules.PRODUCT` 这样的字符串常量。

**解决：** 使用完整的 linkable 对象格式：
```typescript
{
  linkable: {
    serviceName: Modules.PRODUCT,
    field: "product",
    linkable: "product_id",
    primaryKey: "id",
  }
}
```

### Q: `relation "public.tenant" does not exist`

**原因：** 自定义模块的迁移未生成或未执行。

**解决：**
```bash
pnpm --filter lumora-medusa db:generate tenant
pnpm --filter lumora-medusa db:migrate
```

### Q: `EADDRINUSE: address already in use :::9002`

**原因：** 上一个 Medusa 进程未正确关闭。

**解决：**
```bash
kill -9 $(lsof -ti:9002)
```

### Q: `/store/` 路由返回 "Publishable API key required"

**原因：** Medusa 对所有 `/store/**` 路由强制要求 publishable API key。

**解决：** 自定义店铺路由使用 `/shop/` 前缀，避开 Medusa 内置中间件。

### Q: `Local Event Bus installed. This is not recommended for production.`

**说明：** 开发环境使用内存事件总线，不影响功能。生产环境应配置 Redis 事件总线：
```typescript
// medusa-config.ts
modules: {
  [Modules.EVENT_BUS]: {
    resolve: "@medusajs/event-bus-redis",
    options: { redisUrl: process.env.REDIS_URL },
  },
}
```

### Q: 如何调试 Medusa 启动流程

```bash
# 详细日志
NODE_DEBUG=medusa pnpm --filter lumora-medusa dev

# 只看错误
pnpm --filter lumora-medusa dev 2>&1 | grep -E "error|Error"
```

### Q: MedusaService 生成的方法名规则

模型名自动转换为方法名后缀：

| 模型名 | 方法名 |
|--------|--------|
| `tenant` | `listTenants`, `createTenants`, `deleteTenants` |
| `sales_channel` | `listSales_channels` |
| `product_review` | `listProduct_reviews` |

> DML 模型名建议用 snake_case 单数形式。

---

## 参考资源

### 项目文件

| 文件 | 说明 |
|------|------|
| `apps/lumora-medusa/medusa-config.ts` | 项目配置入口 |
| `apps/lumora-medusa/src/modules/tenant/` | Tenant 模块完整实现 |
| `apps/lumora-medusa/src/modules/auth-supabase/` | Auth Provider |
| `apps/lumora-medusa/src/links/` | 4 个跨模块 Link 定义 |
| `apps/lumora-medusa/src/api/middlewares.ts` | 路由中间件 |
| `apps/lumora-medusa/src/workflows/create-tenant/` | 开店工作流 |
| `apps/medusa/src/modules/auth-google-one-tap/service.ts` | Auth Provider 参考实现 |
| `apps/medusa/medusa-config.ts` | 完整 config 参考 |

### 架构文档

| 文档 | 路径 |
|------|------|
| ADR-003 多租户架构 | `docs/cto/adr-003-lumora-medusa-multi-tenant.md` |
| Sprint 1 任务 | `docs/cto/sprint-1-auth-foundation.md` |
| Supabase Schema | `apps/lumora-platform/supabase/migrations/20260124000001_initial_schema.sql` |

### Medusa 官方文档

- [Modules 开发指南](https://docs.medusajs.com/learn/fundamentals/modules)
- [Custom Links](https://docs.medusajs.com/learn/fundamentals/module-links)
- [API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)
- [Workflows](https://docs.medusajs.com/learn/fundamentals/workflows)
- [Auth Module Providers](https://docs.medusajs.com/resources/auth-module-providers)

---

## 下一步

完成 Sprint 1 Foundation 后，Sprint 2 将实现：

1. **前端集成** — lumora-platform 调用 Medusa Admin/Shop API
2. **商品管理** — 完整的 CRUD + 图片上传
3. **购物车/结账** — Shop API 的 cart + checkout 流程
4. **Stripe 支付** — Payment Module 集成
5. **订单管理** — 创建订单 + 订单列表（租户隔离）
