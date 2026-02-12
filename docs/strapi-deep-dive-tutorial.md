# Strapi v5 深度教程：从第一性原理到生产实战

> 基于真实电商项目的完整 Strapi 学习路径，融合马斯克语义树学习法与费曼学习法

---

## 本教程的学习方法论

**马斯克语义树学习法**的核心：先建立「树干」（核心原理），再长出「树枝」（具体技术），最后挂上「树叶」（细节配置）。如果没有树干和树枝，树叶无处挂靠。

**费曼学习法**的核心：如果你不能用简单的语言向一个新手解释清楚，说明你自己还没真正理解。

本教程的每一个概念，都会用这个结构：
1. **用大白话说清楚它是什么**（费曼）
2. **说清楚它在整个知识树里的位置**（语义树）
3. **给出本项目中的真实代码**（实战验证）

---

## 第一部分：树干——Headless CMS 的第一性原理

### 1.1 什么是 Headless CMS？为什么需要它？

**费曼式解释：**

想象一家餐厅。传统 CMS（如 WordPress）就像一个「前店后厨一体化」的餐厅——厨房做什么菜，前面就只能卖什么菜，装修风格也是固定的。

Headless CMS 则是把「厨房」独立出来。厨房（Strapi）只负责管理食材和做菜（内容管理），但不管前面怎么摆盘、怎么上菜。你可以同时开一个中餐厅（网站）、一个外卖店（App）、甚至一个自动贩卖机（IoT 设备）——它们都从同一个厨房取菜。

```
传统 CMS:     [内容管理 + 页面渲染] ← 紧耦合

Headless CMS:  [内容管理] → API → [网站]
                                 → [App]
                                 → [小程序]
                                 → [任何前端]
```

**在我们项目中**，这棵树长这样：

```
┌─────────────┐    REST API    ┌─────────────────────┐
│   Strapi    │ ──────────────→│  Next.js Storefront  │  (前端渲染)
│  (内容管理)  │               │  (dji-storefront)    │
└─────────────┘               └─────────────────────┘
       ↕                                ↕
   PostgreSQL                      Medusa (商品数据)
```

Strapi 管理**内容**（博客、产品详情页、首页布局），Medusa 管理**商务**（SKU、库存、订单）。前端把两者组装在一起。

### 1.2 Strapi 的核心设计哲学

Strapi 的核心可以用一句话概括：**「给你一个可视化的数据库管理界面 + 自动生成的 REST/GraphQL API」**。

| 你做的事情 | Strapi 帮你做的事情 |
|---|---|
| 在 Admin UI 定义内容结构 | 自动生成数据库表结构 |
| 在 Admin UI 填写内容 | 自动存入 PostgreSQL |
| 前端调用 API | 自动生成 CRUD 接口 |
| 上传图片/视频 | 自动处理文件存储 |
| 配置权限 | 自动拦截未授权请求 |

这意味着：**你不需要手写 API，不需要手建数据库表，不需要手写文件上传逻辑**。你只需要定义「内容长什么样」。

---

## 第二部分：树枝——Strapi 的六大核心概念

这六个概念是 Strapi 的骨架，理解它们就理解了 Strapi 的 80%：

```
                    Strapi 核心概念
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   Content Type      Component        Relation
   (内容类型)         (组件)           (关系)
        │                │                │
        ├── Collection   ├── Repeatable   ├── oneToOne
        └── Single       └── Single       ├── oneToMany
                                          └── manyToMany
        │                │                │
   Plugin System    Middleware       Lifecycle Hook
   (插件系统)       (中间件)          (生命周期)
```

### 2.1 Content Type（内容类型）—— 最重要的概念

**费曼式解释：**

Content Type 就是你在告诉 Strapi：「我要管理的东西长什么样」。就像你在 Excel 里建一张表，先定好列名（标题、内容、作者……），然后一行一行填数据。

Strapi 有两种 Content Type：

| 类型 | 类比 | 例子 |
|---|---|---|
| **Collection Type** | Excel 表格（多行） | 博客文章、产品 |
| **Single Type** | 便签纸（只有一张） | 首页配置、关于我们页 |

**本项目中的 Content Type：**

```
Collection Types (可以有多条记录):
├── Post              → 博客文章（可以有 N 篇）
├── Product Detail    → 产品详情（每个产品一条）
└── Featured Product  → 推荐产品（首页展示用）

Single Types (全局只有一条记录):
└── Homepage Layout   → 首页布局配置（只需要一份）
```

**为什么 Homepage Layout 是 Single Type？**

因为你的网站只有一个首页。你不需要「多个首页布局」，你只需要「这一个首页长什么样」。这就是 Single Type 的设计意图。

#### 真实代码：Post 的 schema 定义

文件位置：`apps/strapi/src/api/post/content-types/post/schema.json`

```json
{
  "kind": "collectionType",              // ← 这是个集合类型
  "collectionName": "posts",             // ← 数据库表名
  "info": {
    "singularName": "post",              // ← API 单数路径: /api/posts/:id
    "pluralName": "posts",               // ← API 复数路径: /api/posts
    "displayName": "Post"                // ← Admin UI 显示名
  },
  "options": {
    "draftAndPublish": true              // ← 启用草稿/发布工作流
  },
  "attributes": {
    "title": {
      "type": "string",                  // ← 短文本
      "required": true,                  // ← 必填
      "maxLength": 255
    },
    "slug": {
      "type": "uid",                     // ← 自动生成的唯一标识符
      "targetField": "title"             // ← 基于 title 自动生成
    },
    "content": {
      "type": "richtext"                 // ← 富文本 (Markdown/HTML)
    },
    "cover_image": {
      "type": "media",                   // ← 媒体文件
      "multiple": true,                  // ← 允许多张图
      "allowedTypes": ["images", "files", "videos", "audios"]
    },
    "category": {
      "type": "string"                   // ← 分类（简单字符串）
    },
    "publish_date": {
      "type": "datetime"                 // ← 发布日期
    },
    "seo": {
      "type": "component",              // ← 引用一个可重用组件
      "repeatable": false,               // ← 只嵌入一次
      "component": "shared.seo"          // ← 组件标识符
    }
  }
}
```

**关键知识点——`kind` 决定一切：**

- `"kind": "collectionType"` → 多条记录 → API: `/api/posts` (列表), `/api/posts/:id` (单条)
- `"kind": "singleType"` → 只有一条 → API: `/api/homepage-layout` (直接获取)

**关键知识点——`draftAndPublish`：**

设为 `true` 后，每条内容有两个状态：
- **Draft（草稿）**：编辑中，API 默认不返回
- **Published（已发布）**：正式上线，API 默认返回

这让内容编辑可以安全地修改内容，不会意外暴露未完成的内容。

#### 真实代码：Product Detail 的 schema

文件位置：`apps/strapi/src/api/product-detail/content-types/product-detail/schema.json`

```json
{
  "kind": "collectionType",
  "info": {
    "singularName": "product-detail",
    "pluralName": "product-details",
    "displayName": "Product Detail",
    "description": "Rich merchandising content linked to a Medusa product handle"
  },
  "attributes": {
    "title": { "type": "string", "required": true },
    "handle": {
      "type": "uid",
      "targetField": "title",            // ← 基于 title 自动生成 URL 友好的标识
      "required": true
    },
    "tagline": { "type": "string", "maxLength": 200 },
    "overview": { "type": "richtext" },
    "feature_bullets": {
      "type": "component",
      "repeatable": true,                 // ← 可重复多个（列表）
      "component": "product.feature-bullet",
      "max": 20                           // ← 最多 20 个
    },
    "content_sections": {
      "type": "component",
      "repeatable": true,
      "component": "product.content-section",
      "max": 20
    },
    "spec_groups": {
      "type": "component",
      "repeatable": true,
      "component": "product.spec-group",
      "max": 10
    },
    "youtube_review_url": {
      "type": "string",
      "regex": "^(https?:\\/\\/)?(www\\.)?(youtube\\.com|youtu\\.be)\\/.+$"
      // ← 正则验证：只允许 YouTube 链接
    }
  }
}
```

**关键设计模式—— handle 字段是 Strapi 与 Medusa 的桥梁：**

```
Medusa (商品系统)           Strapi (内容系统)
┌─────────────┐           ┌─────────────────┐
│ product     │           │ product_detail  │
│ handle: "t-shirt" ←──── │ handle: "t-shirt"│  ← 通过 handle 关联
│ price: $19.50    │      │ overview: "..."  │
│ variants: [...]  │      │ spec_groups: [...] │
└─────────────┘           └─────────────────┘
```

前端通过 `handle` 把两个系统的数据拼在一起——Medusa 提供价格和库存，Strapi 提供营销内容。

### 2.2 Component（组件）—— 可重用的内容积木

**费曼式解释：**

如果 Content Type 是「一栋房子」，那 Component 就是「一块预制板」。你不需要每次盖房子都从零开始砌每面墙——你可以提前做好标准化的模块（SEO 信息、CTA 按钮、规格参数），然后在任何房子里复用它们。

**本项目的组件树：**

```
components/
├── shared/
│   └── seo.json              → 被 Post、ProductDetail、FeaturedProduct 共用
├── homepage/
│   ├── cta-button.json       → CTA 按钮（买！了解更多！）
│   └── product-highlight.json → 产品亮点卡片
└── product/
    ├── feature-bullet.json   → 功能要点（✓ 防水、✓ 轻量）
    ├── content-section.json  → 图文混排区块
    ├── spec-group.json       → 规格分组（外观、性能、电池）
    ├── spec-item.json        → 单条规格（重量: 249g）
    └── package-item.json     → 包装清单（主机 x1、遥控器 x1）
```

组件有两种使用方式：

| 方式 | 含义 | 例子 |
|---|---|---|
| `"repeatable": false` | 嵌入一次 | SEO 信息（一个页面只有一份 SEO） |
| `"repeatable": true` | 嵌入多次 | 功能要点（一个产品有多条卖点） |

**思考题（费曼测试）：** 为什么 `seo` 组件放在 `shared/` 目录而不是 `product/` 目录？

答案：因为 SEO 不只是产品需要，博客文章、首页、推荐产品都需要 SEO。`shared` 表达了「跨内容类型复用」的设计意图。

### 2.3 Relation（关系）—— 内容之间的连线

**费曼式解释：**

关系就是「内容之间的连线」。你的首页需要展示某些产品——这就是首页和产品之间的「关系」。

**本项目中的关系：**

```json
// Homepage Layout (单一类型) 的 schema
{
  "primaryHero": {
    "type": "relation",
    "relation": "oneToOne",              // ← 一对一：首页只有一个主 Hero
    "target": "api::featured-product.featured-product"
  },
  "secondaryHero": {
    "type": "relation",
    "relation": "oneToOne",              // ← 一对一：首页只有一个副 Hero
    "target": "api::featured-product.featured-product"
  },
  "productGrid": {
    "type": "relation",
    "relation": "oneToMany",             // ← 一对多：首页展示多个产品卡片
    "target": "api::featured-product.featured-product"
  }
}
```

**三种关系类型的费曼解释：**

```
oneToOne  (一对一):  一个人 ↔ 一张身份证     → primaryHero 只关联一个 FeaturedProduct
oneToMany (一对多):  一个班级 → 多个学生      → productGrid 关联多个 FeaturedProduct
manyToMany(多对多):  多个学生 ↔ 多门课程      → 本项目未使用
```

**关键原则：** 选择哪种关系，取决于业务逻辑，不是技术偏好。首页只有一个主 Hero 位，所以用 oneToOne；产品网格可以放多个产品，所以用 oneToMany。

### 2.4 Plugin System（插件系统）

**费曼式解释：**

插件就是「给 Strapi 装的 App」。就像手机出厂自带基本功能，但你可以通过 App Store 安装新功能。

**本项目使用的插件：**

```javascript
// apps/strapi/config/plugins.ts
export default ({ env }) => ({
  upload: {
    config: {
      provider: "@strapi/provider-upload-aws-s3",   // ← 文件上传到 S3/R2
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env("AWS_ACCESS_KEY_ID"),
            secretAccessKey: env("AWS_ACCESS_SECRET"),
          },
          endpoint: env("AWS_ENDPOINT"),             // ← 支持 Cloudflare R2
          region: env("AWS_REGION", "auto"),
          forcePathStyle: true,                      // ← R2 需要路径风格
        },
        params: { Bucket: env("AWS_BUCKET_NAME") },
      },
      sizeLimit: 50 * 1024 * 1024,                  // ← 50MB 上限
    },
  },
})
```

**为什么用 S3 而不是本地存储？**

本地存储在 Docker 容器重启后可能丢失。S3/R2 是持久化的对象存储，还可以通过 CDN 加速全球访问。这是生产环境的必选项。

**关键设计决策——Cloudflare R2 vs AWS S3：**

```
Cloudflare R2:
  ✓ 零出站流量费（CDN 免费）
  ✓ S3 兼容 API（无缝迁移）
  ✓ 自动全球分发
  ✗ 功能比 S3 少（无事件触发器等）

AWS S3:
  ✓ 功能最完整
  ✓ 生态最丰富
  ✗ 出站流量收费
  ✗ 需要额外配 CloudFront CDN
```

本项目选择 R2，因为 CMS 媒体主要是「上传 + 读取」场景，不需要 S3 的高级功能，但需要低成本的全球分发。

### 2.5 Middleware（中间件）—— 请求的流水线

**费曼式解释：**

中间件就像机场的安检流程。每个请求（旅客）必须依次通过多道检查（安检门），每道检查做不同的事：有的检查身份（认证），有的扫描行李（安全），有的记录信息（日志）。

```
请求进入 → [日志] → [Sentry错误捕获] → [错误处理] → [安全策略] → [CORS] → [请求体解析] → 到达 API
```

**本项目的中间件链：**

```typescript
// apps/strapi/config/middlewares.ts
export default ({ env }) => {
  // 动态构建 CDN 域名白名单
  const assetHosts = [
    env('STRAPI_UPLOAD_CDN_HOST'),
    env('AWS_PUBLIC_URL'),
  ].filter(Boolean)

  return [
    'strapi::logger',                    // 1. 记录每个请求的日志
    {
      name: 'global::sentry-error-handler',  // 2. 捕获错误发送到 Sentry
      config: {},
    },
    'strapi::errors',                    // 3. 统一错误响应格式
    {
      name: 'strapi::security',          // 4. CSP 安全策略
      config: {
        contentSecurityPolicy: {
          directives: {
            'img-src': ["'self'", 'data:', 'blob:', ...assetHosts],
            // ↑ 允许从 CDN 加载图片
          },
        },
      },
    },
    {
      name: 'strapi::cors',             // 5. 跨域配置
      config: {
        origin: env('CORS_ORIGINS', 'http://localhost:3000')
          .split(',').map(s => s.trim()),
        // ↑ 逗号分隔的域名列表，比硬编码灵活
      },
    },
    'strapi::poweredBy',                 // 6. X-Powered-By 响应头
    'strapi::query',                     // 7. 解析 URL 查询参数
    'strapi::body',                      // 8. 解析请求体 (JSON)
    'strapi::session',                   // 9. 会话管理
    'strapi::favicon',                   // 10. favicon 服务
    'strapi::public',                    // 11. 静态文件服务
  ]
}
```

**为什么 Sentry 要排在 strapi::errors 前面？**

因为 `strapi::errors` 会把错误「消化」掉（转化为标准 HTTP 响应），如果 Sentry 排在后面，它就看不到原始错误了。这就像安检如果排在登机口后面，就失去了意义。

**关键知识点——CORS 的设计：**

```
CORS_ORIGINS="http://localhost:3000,https://www.aidenlux.com,https://admin.aidenlux.com"
```

用环境变量 + 逗号分隔，而不是硬编码在代码里，遵循了 **12-Factor App** 的配置原则——同一份代码可以部署到开发/测试/生产环境，只需要改环境变量。

### 2.6 Lifecycle Hooks（生命周期钩子）—— 数据的事件监听器

**费曼式解释：**

生命周期钩子就像快递的「状态通知」。快递从下单到签收，每个阶段都可以触发一个动作（发短信、更新状态、通知仓库）。Strapi 的内容也一样——创建、更新、删除、发布，每个动作都可以挂钩子。

```
beforeCreate → [验证/修改数据] → 写入数据库
afterCreate  → [发通知/触发其他操作]

beforeUpdate → [验证/修改数据] → 更新数据库
afterUpdate  → [清缓存/同步外部系统]

beforeDelete → [检查依赖] → 删除数据
afterDelete  → [清理关联资源]
```

**本项目中的 Bootstrap 钩子：**

```typescript
// apps/strapi/src/index.ts

export default {
  // register: 在 Strapi 初始化前运行（适合注册全局配置）
  register({ strapi }) {
    // 初始化 Sentry 错误监控
    const sentryDsn = process.env.STRAPI_SENTRY_DSN || process.env.SENTRY_DSN
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        // ↑ 生产环境采样 10%，开发环境 100%（避免生产开销过大）

        beforeSend(event) {
          // 过滤敏感数据，绝不上报 token 和 cookie
          delete event.request?.headers?.['authorization']
          delete event.request?.headers?.['cookie']
          return event
        },
      })
    }
  },

  // bootstrap: 在 Strapi 启动后运行（适合初始化数据）
  async bootstrap({ strapi }) {
    try {
      await seedProductDetails(strapi)  // ← 自动填充初始产品数据
    } catch (error) {
      strapi.log.error('Failed to seed product detail content', error)
      Sentry.captureException(error, {
        tags: { source: 'bootstrap', phase: 'seeding' },
      })
    }
  },
}
```

**register vs bootstrap 的区别：**

| 阶段 | 时机 | 适合做什么 |
|---|---|---|
| `register` | Strapi 初始化之前 | 注册插件、修改配置、初始化外部 SDK |
| `bootstrap` | Strapi 完全启动之后 | 数据播种、定时任务、外部同步 |

**智能数据播种的设计模式：**

```typescript
// apps/strapi/src/bootstrap/product-detail-seeder.ts

export const seedProductDetails = async (strapi) => {
  // 1. 先查询已有数据
  const existing = await strapi.entityService.findMany(
    'api::product-detail.product-detail',
    { filters: { handle: { $in: productHandles } } }
  )

  const existingHandles = new Set(existing.map(d => d.handle))

  // 2. 只创建不存在的数据（幂等操作）
  for (const seed of PRODUCT_DETAIL_SEEDS) {
    if (existingHandles.has(seed.handle)) continue  // ← 已存在就跳过

    await strapi.entityService.create(
      'api::product-detail.product-detail',
      { data: { ...seed, publishedAt: new Date().toISOString() } }
    )
  }
}
```

**为什么要做幂等检查？** 因为 `bootstrap` 每次启动都会执行。如果不检查，重启一次就会多创建一份数据。幂等性是数据播种的铁律。

---

## 第三部分：树叶——配置、集成与生产部署

### 3.1 数据库配置的分层设计

**费曼式解释：**

Strapi 的数据库配置就像一个「万能适配器」——你插上不同的环境变量，它就连接不同的数据库。

```typescript
// apps/strapi/config/database.ts

export default ({ env }) => {
  // 智能推断数据库类型：
  // 有连接字符串 → 用 PostgreSQL
  // 没有连接字符串 → 用 SQLite（本地开发零配置）
  const hasConnectionString = Boolean(env('DATABASE_URL'))
  const client = env('DATABASE_CLIENT', hasConnectionString ? 'postgres' : 'sqlite')

  const connections = {
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),     // ← 优先使用连接字符串
        host: env('DATABASE_HOST', 'localhost'),   // ← 降级为单独配置
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'strapi'),
        ssl: env.bool('DATABASE_SSL', hasConnectionString) && {
          rejectUnauthorized: env.bool(
            'DATABASE_SSL_REJECT_UNAUTHORIZED',
            !hasConnectionString  // ← 用连接字符串时默认不验证证书（兼容云服务）
          ),
        },
      },
      pool: {
        min: env.int('DATABASE_POOL_MIN', 2),  // ← 连接池最小值
        max: env.int('DATABASE_POOL_MAX', 10), // ← 连接池最大值
      },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', '.tmp/data.db'),
      },
      useNullAsDefault: true,
    },
  }

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  }
}
```

**三层降级策略（核心设计模式）：**

```
1. DATABASE_URL (完整连接字符串)     ← 生产环境（Railway, Supabase 等）
   ↓ 如果没有
2. DATABASE_HOST + PORT + USER + PASS ← GCE Docker 部署
   ↓ 如果没有
3. SQLite (.tmp/data.db)             ← 本地开发（零配置即可运行）
```

这种设计让同一份代码适配三种场景。本地开发者 `pnpm dev` 就能跑起来（自动用 SQLite），不需要装 PostgreSQL。

**连接池为什么重要？**

```
无连接池: 每次查询 → 建连接 → 查询 → 断开连接  (慢, 每次 ~50ms 开销)
有连接池: 启动时建好连接 → 查询直接复用         (快, 接近 0ms 开销)

pool.min = 2:  即使空闲也保持 2 个连接 (应对突发请求)
pool.max = 10: 最多 10 个并发连接 (防止数据库过载)
```

### 3.2 前端集成——Strapi Client 的架构设计

这是连接 Strapi 和 Next.js 的核心桥梁。

```typescript
// apps/dji-storefront/src/lib/strapi/client.ts

export const getStrapiClient = (): StrapiClient => {
  const baseUrl = normalizeBaseUrl(DEFAULT_STRAPI_URL)
  const apiToken = process.env.STRAPI_API_TOKEN

  const fetchFromStrapi = async <T>(path: string, options = {}): Promise<T> => {
    const targetUrl = buildUrl(baseUrl, path, options.query)
    const headers = buildHeaders(apiToken, options.init?.headers)

    // Next.js 缓存策略集成
    const response = await fetch(targetUrl, {
      headers,
      cache: options.cache ?? (hasRevalidate ? "force-cache" : "no-store"),
      next: {
        revalidate: hasRevalidate ? revalidate : undefined,
        tags: options.tags,  // ← 缓存标签，用于按需失效
      },
    })

    if (!response.ok) {
      const errorPayload = await safeReadBody(response)
      throw new Error(`Strapi request failed (${response.status}): ${errorPayload}`)
    }

    return (await response.json()) as T
  }

  return { fetch: fetchFromStrapi, resolveMedia, baseUrl, apiToken }
}
```

**费曼式解释——缓存策略：**

```
你点了一杯咖啡：

"force-cache" + revalidate: 60
  → 第一杯是新鲜做的
  → 之后 60 秒内有人点同款，直接给存好的那杯（快！）
  → 60 秒后有人点，先给存好的那杯，后台同时做一杯新的（下次给新的）

"no-store"
  → 每次都现做（慢但保证最新）

tags: ["blog"]
  → 咖啡师喊一声 "blog 作废！" → 所有带 blog 标签的缓存立即失效
```

这就是 Next.js ISR（Incremental Static Regeneration）+ 按需重验证的工作方式。

#### 博客数据获取层

```typescript
// apps/dji-storefront/src/lib/data/blog.ts

export const listPosts = async (options = {}): Promise<BlogListResult> => {
  const response = await strapi.fetch<StrapiPostResponse>("/api/posts", {
    query: {
      populate: "*",                                // ← 填充所有关联数据
      "sort[0]": "publish_date:desc",               // ← 按发布日期倒序
      "sort[1]": "publishedAt:desc",                // ← 降级排序字段
      "pagination[page]": page,                     // ← 分页：第几页
      "pagination[pageSize]": pageSize,             // ← 分页：每页多少条
      ...(options.category
        ? { "filters[category][$eq]": options.category } : {}),
        // ↑ 条件过滤：只要特定分类
      ...(options.excludeCategory
        ? { "filters[category][$ne]": options.excludeCategory } : {}),
        // ↑ 条件排除：不要某个分类
    },
    tags: ["blog"],                                 // ← 缓存标签
    revalidate: 60,                                 // ← 60 秒后重新验证
  })

  return {
    posts: response.data.map(mapStrapiPost),        // ← 转换为前端数据模型
    pagination: response.meta.pagination,
  }
}
```

**Strapi REST API 查询语法速查：**

```
基本语法: query[key]=value

过滤:
  filters[field][$eq]=value          等于
  filters[field][$ne]=value          不等于
  filters[field][$in][0]=a           在列表中
  filters[field][$contains]=text     包含文本
  filters[field][$gt]=5              大于

排序:
  sort[0]=field:asc                  升序
  sort[0]=field:desc                 降序

分页:
  pagination[page]=1                 页码
  pagination[pageSize]=10            每页条数

填充关联:
  populate=*                         填充所有
  populate[0]=cover_image            填充特定字段

字段选择:
  fields[0]=title                    只返回 title
  fields[1]=slug                     和 slug
```

#### 数据映射层——处理 Strapi 响应的「脏活」

```typescript
const mapStrapiPost = (entity): BlogPost => {
  // 1. 兼容多种媒体格式（Strapi v4 vs v5 差异）
  const coverMedia = entity.cover_image ?? entity.coverImage
  const coverImageUrl = extractMediaUrl(coverMedia)

  // 2. 智能日期选择（兼容不同字段名）
  const publishedAt = entity.publish_date
    ?? entity.publishedAt
    ?? entity.published_at
    ?? null

  // 3. 自动生成摘要和阅读时间
  const excerpt = entity.excerpt?.trim() || buildExcerpt(entity.content)
  const estimatedReadingMinutes = estimateReadingTime(entity.content)

  return {
    id: String(entity.id),
    title: entity.title,
    slug: entity.slug,
    excerpt,
    content: entity.content ?? "",
    coverImageUrl,
    publishedAt,
    estimatedReadingMinutes,
    // ...
  }
}
```

**为什么需要这个映射层？**

1. **解耦前后端数据结构**：Strapi 的 API 响应格式可能因版本而变化，映射层隔离了这种变化
2. **兼容性处理**：同一个字段可能叫 `cover_image`（snake_case）或 `coverImage`（camelCase）
3. **业务逻辑封装**：阅读时间估算、摘要生成等属于前端业务逻辑，不应散落在页面组件中
4. **类型安全**：从松散的 API 响应映射到严格的 TypeScript 类型

### 3.3 缓存失效——Webhook 驱动的按需重验证

**费曼式解释：**

想象你有一份报纸的缓存。有两种更新策略：
- **定时更新**：每 60 秒检查一次报社有没有新版（ISR revalidate）
- **实时推送**：报社一出新版就给你打电话（Webhook + revalidateTag）

本项目两种都用了：

```
Strapi [文章发布]
  → Webhook → POST /api/revalidate?tag=blog&secret=xxx
  → Next.js [立即清除 "blog" 标签的所有缓存]
  → 下一个用户访问 → 获取最新内容

同时:
  ISR revalidate: 60
  → 即使 Webhook 失败，最多 60 秒后也会更新
  → 双保险
```

```typescript
// 前端的 revalidation 函数
export const revalidateStrapiBlog = async () => {
  revalidateTag("blog")             // ← 清除所有带 "blog" 标签的缓存
  revalidateTag("blog-categories")  // ← 同时清除分类缓存
}
```

**缓存标签设计一览：**

```
blog                      → 所有博客列表页
blog-categories           → 分类列表
blog-post-{slug}          → 特定博文
featured-product          → 推荐产品
homepage-layout           → 首页配置
product-detail-{handle}   → 特定产品详情
```

标签粒度越细，缓存失效越精准。修改一篇博文不会导致所有产品页缓存失效。

### 3.4 媒体资源解析

```typescript
// 媒体 URL 解析逻辑
export const resolveStrapiMedia = (url?: string | null, baseUrl = DEFAULT_STRAPI_URL) => {
  if (!url) return null

  // 已经是完整 URL（CDN 上传）→ 直接返回
  if (url.startsWith("http://") || url.startsWith("https://")) return url

  // 相对路径（本地上传）→ 拼接 Strapi 地址
  const normalizedBase = normalizeBaseUrl(baseUrl)
  const normalizedPath = url.startsWith("/") ? url : `/${url}`
  return `${normalizedBase}${normalizedPath}`
}
```

**为什么需要这个函数？**

| 场景 | Strapi 返回的 URL | 实际需要 |
|---|---|---|
| 本地开发 | `/uploads/hero.jpg` | `http://localhost:1337/uploads/hero.jpg` |
| R2 上传 | `https://cdn.example.com/uploads/hero.jpg` | 直接使用 |

不同的上传提供者（本地/S3/R2）返回不同格式的 URL，这个函数统一了处理逻辑。

### 3.5 国际化（i18n）

本项目的 FeaturedProduct 和 Homepage Layout 启用了 i18n：

```json
// Featured Product schema 中的 i18n 配置
{
  "pluginOptions": {
    "i18n": { "localized": true }     // ← 整个内容类型支持多语言
  },
  "attributes": {
    "title": {
      "type": "string",
      "pluginOptions": {
        "i18n": { "localized": true } // ← 这个字段需要翻译
      }
    },
    "theme": {
      "type": "enumeration",
      "enum": ["light", "dark"]
      // ← 没有 i18n 配置：所有语言共享同一个值
    }
  }
}
```

**i18n 的关键决策：**

```
需要翻译的字段:  title, subtitle, description, productName
                 (文字内容因语言而异)

不需要翻译的字段: theme, backgroundColor, priority, isActive
                 (配置参数和设计属性跨语言通用)

需要翻译的媒体:  heroImage, mobileImage
                 (不同地区可能用不同的宣传图)
```

这种粒度控制很重要——不是简单地「全翻译」或「全不翻译」，而是字段级别的精确控制。

### 3.6 安全配置

```typescript
// apps/strapi/config/admin.ts
export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),       // ← 管理员 JWT 密钥
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),           // ← API Token 加盐
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),    // ← 数据迁移 Token 加盐
    },
  },
})
```

**安全核心原则——每个环境必须有独立的密钥：**

```bash
# 生成安全密钥的标准方式
openssl rand -base64 32

# .env 文件中需要的密钥（缺一不可）：
APP_KEYS=key1,key2,key3,key4,key5,key6    # ← Strapi 应用密钥
ADMIN_JWT_SECRET=xxxxx                      # ← 管理员认证密钥
API_TOKEN_SALT=xxxxx                        # ← API Token 加盐值
TRANSFER_TOKEN_SALT=xxxxx                   # ← 数据迁移加盐值
ENCRYPTION_KEY=xxxxx                        # ← 敏感数据加密密钥
```

**绝对不能做的事：**
- 不同环境共用同一套密钥
- 把密钥提交到 Git
- 在日志中打印密钥

### 3.7 生产部署——Docker 多阶段构建

```dockerfile
# apps/strapi/Dockerfile (简化版)

# ===== 阶段 1: 构建 =====
FROM node:20-bookworm-slim AS builder
# 安装 pnpm, 复制整个 monorepo
COPY . .
RUN pnpm --filter strapi build           # ← 只构建 Strapi 的 admin UI

# ===== 阶段 2: 运行 =====
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/strapi .    # ← 只复制构建产物
EXPOSE 1337
CMD ["pnpm", "--filter", "strapi", "start"]
```

**为什么要多阶段构建？**

```
单阶段: 最终镜像 = 源码 + 依赖 + 构建工具 + 产物  ≈ 2GB
多阶段: 最终镜像 = 依赖 + 产物                     ≈ 500MB

省掉了:
  - 构建工具 (tsc, vite 等)
  - 开发依赖 (devDependencies)
  - 源代码 (只需要编译后的产物)
```

**端口分配策略：**

```
环境    | Medusa | Strapi
--------|--------|--------
Dev     | 9001   | 1338
Prod    | 9000   | 1337

原则：Dev 端口 = Prod 端口 + 1
好处：可以在同一台机器上同时跑 Dev 和 Prod
```

---

## 第四部分：完整数据流——从内容创建到页面渲染

理解了各个部件后，让我们追踪一个完整的数据流，看它们如何协作。

### 场景：编辑在 Strapi 发布一篇新博客文章

```
步骤 1: 编辑在 Strapi Admin UI 创建文章
        ↓
        [POST /api/posts] → PostgreSQL (status: draft)

步骤 2: 编辑点击「发布」按钮
        ↓
        [PUT /api/posts/:id] → PostgreSQL (publishedAt = now())

步骤 3: Strapi 触发 Webhook
        ↓
        [POST https://storefront/api/revalidate?tag=blog&secret=xxx]

步骤 4: Next.js 收到 Webhook，清除缓存
        ↓
        revalidateTag("blog")
        revalidateTag("blog-categories")

步骤 5: 用户访问博客列表页
        ↓
        [GET /api/posts?populate=*&sort=publish_date:desc&pagination[page]=1]
        ↓
        Strapi 返回 JSON → mapStrapiPost() 转换 → React 渲染

步骤 6: 渲染的页面缓存 60 秒
        ↓
        下一个用户在 60 秒内访问 → 直接返回缓存（毫秒级响应）
```

### 场景：首页展示产品

```
Strapi 数据关系:

Homepage Layout (单一类型)
  ├── primaryHero   ──→ Featured Product: "DJI Mavic 4 Pro"
  ├── secondaryHero ──→ Featured Product: "DJI Neo 2"
  └── productGrid   ──→ [Featured Product: "DJI Mini 4 Pro",
                         Featured Product: "DJI Air 3S",
                         Featured Product: "DJI Avata 2"]

前端获取:

const layout = await strapi.fetch("/api/homepage-layout", {
  query: {
    "populate[primaryHero][populate]": "*",
    "populate[secondaryHero][populate]": "*",
    "populate[productGrid][populate]": "*",
  }
})

// layout.primaryHero → 渲染为全屏 Hero 区域
// layout.secondaryHero → 渲染为次级展示区
// layout.productGrid → 渲染为产品网格卡片
```

---

## 第五部分：Strapi 项目目录结构全解析

```
apps/strapi/
├── config/                          # ← 所有配置集中在这里
│   ├── admin.ts                     #    管理后台安全配置
│   ├── api.ts                       #    REST API 默认分页设置
│   ├── database.ts                  #    数据库连接配置
│   ├── middlewares.ts               #    中间件链配置
│   ├── plugins.ts                   #    插件配置 (S3 上传等)
│   └── server.ts                    #    服务器配置 (端口、代理)
│
├── src/
│   ├── index.ts                     # ← 应用入口 (register + bootstrap)
│   │
│   ├── admin/
│   │   └── vite.config.ts           #    Admin UI 的 Vite 配置
│   │
│   ├── api/                         # ← 所有 Content Type 定义
│   │   ├── post/
│   │   │   ├── content-types/post/
│   │   │   │   └── schema.json      #    Post 数据模型定义
│   │   │   ├── controllers/         #    自定义控制器 (可选)
│   │   │   ├── routes/              #    自定义路由 (可选)
│   │   │   └── services/            #    自定义服务 (可选)
│   │   │
│   │   ├── product-detail/          #    同上结构
│   │   ├── featured-product/        #    同上结构
│   │   └── homepage-layout/         #    同上结构
│   │
│   ├── components/                  # ← 可重用组件定义
│   │   ├── shared/
│   │   │   └── seo.json
│   │   ├── homepage/
│   │   │   ├── cta-button.json
│   │   │   └── product-highlight.json
│   │   └── product/
│   │       ├── feature-bullet.json
│   │       ├── content-section.json
│   │       ├── spec-group.json
│   │       ├── spec-item.json
│   │       └── package-item.json
│   │
│   ├── middlewares/                  # ← 自定义中间件
│   │   └── sentry-error-handler.ts
│   │
│   └── bootstrap/                   # ← 启动时数据播种
│       └── product-detail-seeder.ts
│
├── scripts/                         # ← 运维和数据导入脚本
│   ├── import-post-seeds.js         #    从 JSON 导入博文
│   ├── import-homepage-seeds.js     #    导入首页数据
│   ├── import-md-posts-api.js       #    从 Markdown 导入博文
│   └── sample-data.js               #    示例数据
│
├── seeds/                           # ← 种子数据
│   └── posts.json
│
├── types/generated/                 # ← 自动生成的 TypeScript 类型
│   ├── contentTypes.d.ts
│   └── components.d.ts
│
├── Dockerfile                       # ← Docker 多阶段构建
├── package.json
└── tsconfig.json
```

**目录命名的规律：**

| 路径模式 | 含义 |
|---|---|
| `src/api/{name}/` | 一个 Content Type 的全部代码 |
| `src/api/{name}/content-types/{name}/schema.json` | 数据模型定义 |
| `src/api/{name}/controllers/` | 自定义 API 逻辑（覆盖默认 CRUD） |
| `src/api/{name}/routes/` | 自定义路由（覆盖默认 REST 路由） |
| `src/api/{name}/services/` | 业务逻辑层（被 controller 调用） |
| `src/components/{category}/{name}.json` | 可重用组件定义 |

---

## 第六部分：常见陷阱和最佳实践

### 陷阱 1: Populate 陷阱

```
// 错误：不 populate 就拿不到关联数据
GET /api/posts
// 返回: { title: "...", cover_image: null }  ← 关联字段是空的！

// 正确：必须显式 populate
GET /api/posts?populate=*
// 返回: { title: "...", cover_image: [{ url: "/uploads/..." }] }
```

**原则：** Strapi v5 默认不返回关联字段的数据（性能考虑）。你必须用 `populate` 显式请求。`populate=*` 填充一层，深层嵌套需要精确指定。

### 陷阱 2: Draft 和 Published 的区别

```
// 这个 API 只返回已发布的内容
GET /api/posts

// 要看到草稿，必须用 Admin API + 特殊参数
GET /api/posts?publicationState=preview
```

**原则：** 公开 API 永远只返回 published 内容。这是安全特性，不是 bug。

### 陷阱 3: 媒体 URL 的相对路径

```
// Strapi 返回的媒体 URL 可能是相对路径
{ "url": "/uploads/hero_abc123.jpg" }

// 前端直接用这个路径会 404
<img src="/uploads/hero_abc123.jpg" />  ← 指向 localhost:3000，不是 Strapi

// 必须通过 resolveMedia 处理
<img src={resolveMedia("/uploads/hero_abc123.jpg")} />
// → "http://localhost:1337/uploads/hero_abc123.jpg"
```

### 陷阱 4: Docker 中的网络访问

```
// 容器内不能用 localhost 访问宿主机服务
DATABASE_HOST=localhost           ← 错误！指向容器自己

// 必须用 Docker 网络别名
DATABASE_HOST=host.docker.internal  ← 正确，指向宿主机
```

### 最佳实践清单

| 实践 | 原因 |
|---|---|
| 环境变量管理密钥 | 代码可以公开，密钥不行 |
| 每个环境独立密钥 | 开发环境泄漏不影响生产 |
| 连接池配置 | 避免数据库连接耗尽 |
| 幂等数据播种 | 重复启动不会产生重复数据 |
| 缓存标签粒度化 | 精准失效，避免全站缓存雪崩 |
| 数据映射层解耦 | Strapi API 变化不传染到组件层 |
| 多阶段 Docker 构建 | 镜像更小，攻击面更小 |
| Sentry 过滤敏感数据 | 错误监控不能变成数据泄漏通道 |

---

## 第七部分：快速上手指南

### 7.1 本地启动（5 分钟）

```bash
# 1. 安装依赖
pnpm install

# 2. 复制环境变量模板
cp apps/strapi/.env.example apps/strapi/.env

# 3. 启动 Strapi（自动使用 SQLite，零配置）
pnpm --filter strapi develop

# 4. 访问 Admin UI
open http://localhost:1337/admin
# 首次访问会要求创建管理员账号
```

### 7.2 创建新的 Content Type（实战步骤）

以添加一个「下载资源」Content Type 为例：

**步骤 1：** 在 Admin UI 中创建 → Content-Type Builder → Create new Collection Type

**步骤 2：** 或者直接创建 schema 文件：

```bash
mkdir -p apps/strapi/src/api/download/content-types/download
```

```json
// apps/strapi/src/api/download/content-types/download/schema.json
{
  "kind": "collectionType",
  "collectionName": "downloads",
  "info": {
    "singularName": "download",
    "pluralName": "downloads",
    "displayName": "Download"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "version": {
      "type": "string"
    },
    "file": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["files"]
    },
    "platform": {
      "type": "enumeration",
      "enum": ["windows", "macos", "linux", "android", "ios"]
    }
  }
}
```

**步骤 3：** 创建路由、控制器、服务（使用 Strapi 工厂函数）：

```typescript
// apps/strapi/src/api/download/routes/download.ts
import { factories } from '@strapi/strapi'
export default factories.createCoreRouter('api::download.download')

// apps/strapi/src/api/download/controllers/download.ts
import { factories } from '@strapi/strapi'
export default factories.createCoreController('api::download.download')

// apps/strapi/src/api/download/services/download.ts
import { factories } from '@strapi/strapi'
export default factories.createCoreService('api::download.download')
```

**步骤 4：** 重启 Strapi，自动生成数据库表和 API 端点。

**步骤 5：** 在 Admin UI → Settings → Roles → Public → 勾选 download 的 find/findOne 权限。

现在你可以：
```
GET /api/downloads              → 列出所有下载
GET /api/downloads/:id          → 获取单个下载
POST /api/downloads             → 创建（需认证）
PUT /api/downloads/:id          → 更新（需认证）
DELETE /api/downloads/:id       → 删除（需认证）
```

### 7.3 连接前端（实战步骤）

```typescript
// apps/dji-storefront/src/lib/data/downloads.ts

import { getStrapiClient } from "@/lib/strapi/client"

const strapi = getStrapiClient()

type Download = {
  id: string
  title: string
  version: string | null
  platform: string | null
  fileUrl: string | null
}

export const listDownloads = async (platform?: string): Promise<Download[]> => {
  const response = await strapi.fetch<{ data: any[] }>("/api/downloads", {
    query: {
      populate: "*",
      ...(platform ? { "filters[platform][$eq]": platform } : {}),
    },
    tags: ["downloads"],
    revalidate: 300,
  })

  return response.data.map(item => ({
    id: String(item.id),
    title: item.title,
    version: item.version ?? null,
    platform: item.platform ?? null,
    fileUrl: item.file ? strapi.resolveMedia(item.file.url) : null,
  }))
}
```

---

## 第八部分：知识树总结

回到马斯克的语义树——现在你的树长成了：

```
树干 (第一性原理):
  Headless CMS = 内容管理与展示分离
  Strapi = 可视化数据库管理 + 自动 API 生成

树枝 (核心概念):
  ├── Content Type: 定义「内容长什么样」
  │   ├── Collection Type (多条) vs Single Type (一条)
  │   └── draftAndPublish (草稿/发布工作流)
  │
  ├── Component: 可重用的内容积木
  │   ├── Repeatable (列表) vs Single (嵌入一次)
  │   └── 跨 Content Type 共享 (shared.seo)
  │
  ├── Relation: 内容之间的连线
  │   └── oneToOne / oneToMany / manyToMany
  │
  ├── Plugin: 功能扩展
  │   └── Upload Provider (本地/S3/R2)
  │
  ├── Middleware: 请求流水线
  │   └── 日志 → 错误捕获 → 安全 → CORS → 解析
  │
  └── Lifecycle: 数据事件监听
      ├── register (初始化前) vs bootstrap (启动后)
      └── 幂等数据播种

树叶 (具体实现):
  ├── 数据库: 三层降级 (DATABASE_URL → 单独配置 → SQLite)
  ├── 缓存: ISR + Tag-based revalidation + Webhook
  ├── 媒体: resolveMedia 统一处理相对/绝对 URL
  ├── 安全: 环境隔离密钥 + Sentry 过滤敏感数据
  ├── i18n: 字段级粒度控制
  └── 部署: Docker 多阶段构建 + 端口分离
```

**费曼测试——你现在应该能回答这些问题：**

1. 为什么首页布局用 Single Type 而不是 Collection Type？
2. 为什么 SEO 组件放在 `shared/` 目录？
3. 为什么 Sentry 中间件排在 `strapi::errors` 前面？
4. 为什么数据播种要做幂等检查？
5. 为什么 Product Detail 用 `handle` 而不是 `id` 关联 Medusa 产品？
6. `populate=*` 不写会怎样？
7. 缓存标签和 ISR revalidate 各自的角色是什么？

如果你能用自己的话向一个新手解释这些问题的答案——恭喜，你已经真正理解了 Strapi。

---

> **写作日期**: 2026-02-11
> **基于项目**: cs monorepo (Strapi v5.28.0 + Next.js 15 + Medusa 2.x)
> **教程方法**: 马斯克语义树学习法 + 费曼学习法
