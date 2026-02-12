# Next.js 15 深度教程：从第一性原理到 Medusa + Strapi 全栈实战

> 基于真实电商项目的完整 Next.js 学习路径，融合马斯克语义树学习法与费曼学习法

---

## 本教程的学习方法论

**马斯克语义树学习法**：先建「树干」（核心原理），再长「树枝」（核心概念），最后挂「树叶」（具体实现）。没有树干，树叶无处可挂。

**费曼学习法**：如果你不能用简单的语言向新手解释清楚，说明你自己还没真正理解。

每个概念都遵循：
1. **用大白话说清楚**（费曼）
2. **在知识树中定位**（语义树）
3. **本项目真实代码验证**（实战）

---

## 第一部分：树干——Next.js 的第一性原理

### 1.1 Next.js 到底解决了什么问题？

**费曼式解释：**

纯 React 就像一个「空白画布」——你可以画任何东西，但你得自己准备画架、颜料、打底稿。你需要自己配置路由、服务器、代码分割、SEO、数据获取方式......

Next.js 就是一个「预装好的画室」。它帮你把最佳实践都内置了：

```
纯 React 的你需要做的:                   Next.js 帮你做好的:
┌─────────────────────────┐            ┌─────────────────────────┐
│ 手动配 React Router      │            │ 文件系统路由 (放文件即路由) │
│ 手动配 Webpack/Vite      │            │ 内置 Turbopack 编译器     │
│ 手动写 Express 服务器     │            │ 内置服务器 + Edge Runtime │
│ 手动处理 SEO / SSR       │            │ Server Components + SSG  │
│ 手动配代码分割            │            │ 自动 code splitting      │
│ 手动处理图片优化          │            │ <Image> 组件自动优化      │
│ 手动配 API proxy         │            │ Server Actions 直接调后端 │
└─────────────────────────┘            └─────────────────────────┘
```

### 1.2 Next.js 的核心设计哲学

一句话：**「让服务器做它擅长的事，让浏览器做它擅长的事」。**

| 服务器擅长的 | 浏览器擅长的 |
|---|---|
| 数据库查询（直连，无 CORS） | 用户交互（点击、输入、拖拽） |
| API 密钥保密 | 实时 UI 更新 |
| SEO 预渲染 | 动画和过渡效果 |
| 大量计算（不占用户带宽） | 本地状态管理 |

这就是 Next.js 15 的 **React Server Components（RSC）** 的设计出发点——把数据获取和业务逻辑放在服务器上运行，只把交互逻辑和 HTML 发到浏览器。

### 1.3 本项目的全局架构

```
                            ┌─────────────────┐
                            │   用户的浏览器    │
                            └────────┬────────┘
                                     │ HTTPS
                            ┌────────▼────────┐
                            │   Next.js 15     │  ← 我们的教程主角
                            │  (dji-storefront)│
                            └──┬──────────┬───┘
                   ┌───────────┘          └───────────┐
                   │ REST API                          │ REST API
          ┌────────▼────────┐              ┌──────────▼──────────┐
          │   Medusa 2.x    │              │    Strapi v5        │
          │  (电商后端)      │              │   (内容管理)         │
          │  商品/购物车/订单 │              │  博客/产品详情/首页  │
          └────────┬────────┘              └──────────┬──────────┘
                   │                                   │
              PostgreSQL                          PostgreSQL
          (价格/库存/用户)                        (内容/媒体)
```

**关键设计决策：为什么是 Medusa + Strapi 而不是一个系统做所有事？**

```
Medusa 擅长:                    Strapi 擅长:
✓ 事务型数据 (金钱、库存)        ✓ 内容型数据 (文章、描述)
✓ 购物车、支付、订单流程          ✓ 可视化编辑、拖拽排版
✓ 多区域定价、税费计算            ✓ 草稿/发布工作流
✓ 库存实时追踪                   ✓ SEO 元数据管理
✓ 严格的数据一致性                ✓ i18n 多语言内容

它们通过 handle (产品标识) 在前端组合:
Medusa[handle: "t-shirt" → 价格 $19.50] + Strapi[handle: "t-shirt" → 详细描述/规格/图文]
```

---

## 第二部分：树枝——Next.js 的七大核心概念

```
                     Next.js 核心概念树
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                  │
    App Router         渲染模式           Server Actions
    (路由系统)      (如何生成页面)        (安全的后端调用)
         │                 │                  │
    ├── Layout        ├── SSR (动态)       ├── "use server"
    ├── Page          ├── SSG (静态)       └── 表单处理
    ├── Loading       ├── ISR (增量)
    ├── Error         └── CSR (客户端)
    └── Middleware
         │                 │                  │
    Data Fetching     Caching            组件模型
    (数据获取)        (缓存策略)       (Server vs Client)
         │                 │
    ├── fetch()       ├── 请求级缓存
    ├── SDK 调用      ├── 路由级缓存
    └── Server-only   └── 标签级失效
```

### 2.1 App Router（路由系统）—— 文件即路由

**费曼式解释：**

App Router 的核心思想：**你放一个文件在哪个目录下，用户就能通过对应的 URL 访问它。** 不需要任何路由配置。

```
文件路径:                              用户访问的 URL:
app/page.tsx                          → /
app/[countryCode]/page.tsx            → /us, /de, /cn ...
app/[countryCode]/products/page.tsx   → /us/products
app/[countryCode]/products/[handle]/page.tsx → /us/products/t-shirt
app/[countryCode]/blog/[slug]/page.tsx → /us/blog/hello-world
```

方括号 `[xxx]` 是**动态路由参数**。就像函数参数一样——URL 中的那个位置可以是任何值，并作为 `params` 传给你的组件。

**本项目完整的路由树：**

```
app/
├── layout.tsx                          # 根布局 (全局 Header/Footer)
├── error.tsx                           # 全局错误边界
├── not-found.tsx                       # 全局 404 页面
├── robots.ts                           # robots.txt (SEO)
├── sitemap.ts                          # sitemap.xml (SEO)
│
├── [countryCode]/                      # 动态国家代码 (/us, /de, /cn)
│   ├── layout.tsx                      # 国家级布局
│   ├── page.tsx                        # 首页
│   │
│   ├── products/
│   │   ├── page.tsx                    # 产品列表
│   │   └── [handle]/page.tsx           # 产品详情 ← Medusa + Strapi 整合
│   │
│   ├── collections/
│   │   ├── page.tsx                    # 合集列表
│   │   └── [handle]/page.tsx           # 合集详情
│   │
│   ├── blog/
│   │   ├── page.tsx                    # 博客列表 (ISR 300s) ← Strapi
│   │   └── [slug]/page.tsx             # 博文详情            ← Strapi
│   │
│   ├── cart/page.tsx                   # 购物车   ← Medusa
│   ├── checkout/page.tsx               # 结账     ← Medusa + PayPal
│   ├── order/[id]/confirmed/page.tsx   # 订单确认 ← Medusa
│   │
│   ├── login/page.tsx                  # 登录 (Email/OTP/OAuth)
│   ├── account/page.tsx                # 用户中心 (需认证)
│   ├── forgot-password/page.tsx        # 忘记密码
│   └── reset-password/page.tsx         # 重置密码
│
├── api/                                # API 路由 (BFF 层)
│   ├── revalidate/route.ts             # Webhook 缓存失效
│   ├── auth/session/route.ts           # JWT 会话设置
│   ├── auth/google-one-tap/route.ts    # Google 快速登录
│   └── discourse/sso/route.ts          # Discourse SSO 桥接
│
└── auth/                               # OAuth 流程路由
    ├── [provider]/page.tsx             # 发起 OAuth
    └── [provider]/callback/page.tsx    # OAuth 回调
```

#### 布局（Layout）—— 页面的「套娃」

**费曼式解释：**

Layout 就是「套娃」。外层套娃包裹内层套娃，每一层都增加自己的内容（导航栏、侧边栏等），而且**导航时外层不会重新渲染**。

```
根 Layout (Header + Footer + Cookie Banner)
  └── [countryCode] Layout (国家相关配置)
       ├── page.tsx (首页内容)
       ├── products/page.tsx (产品列表内容)
       └── blog/page.tsx (博客列表内容)

用户从 /us → /us/products:
  ✓ 根 Layout 保持不变 (Header 不闪烁)
  ✗ 只有内层 page.tsx 重新渲染
```

**本项目的根布局：**

```typescript
// apps/dji-storefront/src/app/layout.tsx

export default async function RootLayout({ children }) {
  // 并行获取三份数据（关键性能优化）
  const [cart, countryCode, { collections }] = await Promise.all([
    retrieveCart(),                // ← 从 Medusa 获取购物车
    getCountryCodeFromPath(),      // ← 从 URL 解析国家代码
    listCollections(),             // ← 从 Medusa 获取产品合集
  ])

  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <ConsentProvider countryCode={countryCode}>   {/* GDPR/CCPA */}
            <PostHogProvider>                           {/* 分析 */}
              <AnnouncementBar countryCode={countryCode} /> {/* Strapi 公告 */}
              <SiteHeader cartItemCount={cart?.items?.length ?? 0} />
              <main>{children}</main>                   {/* 页面内容插入点 */}
              <SiteFooter countryCode={countryCode} collections={collections} />
              <CookieBanner />                          {/* Cookie 弹窗 */}
            </PostHogProvider>
          </ConsentProvider>
        </Suspense>
      </body>
    </html>
  )
}
```

**关键模式——`Promise.all` 并行数据获取：**

```
串行获取 (慢):
  retrieveCart()     → 200ms
  getCountryCode()   → 50ms
  listCollections()  → 150ms
  总计: 400ms

并行获取 (快):
  Promise.all([
    retrieveCart(),      ─┐
    getCountryCode(),    ─┤ 同时发出
    listCollections(),   ─┘
  ])
  总计: 200ms (取最慢的那个)
```

这就是为什么要用 `Promise.all`——三个独立的请求没有依赖关系，可以同时进行。

### 2.2 渲染模式——最重要的选择

**费曼式解释：**

Next.js 提供四种「做菜方式」，选哪种取决于这道菜的特点：

| 模式 | 类比 | 何时用 | 代码标记 |
|---|---|---|---|
| **SSG** (Static) | 批量预制菜（开店前做好） | 内容几乎不变 | `generateStaticParams()` |
| **ISR** (Incremental) | 预制菜 + 定时翻新 | 内容偶尔变化 | `export const revalidate = 300` |
| **SSR** (Dynamic) | 现点现做 | 每个用户不同 | `export const dynamic = "force-dynamic"` |
| **CSR** (Client) | 自助餐（客户端自取） | 纯交互 UI | `"use client"` |

**本项目的渲染策略一览：**

```
页面                    渲染模式        原因
──────────────────────────────────────────────────
首页                    SSR (暂时)      调试中，生产应改为 ISR
博客列表                ISR 300s        内容更新不频繁
博文详情                SSR (暂时)      调试中，生产应改为 ISR
产品详情                SSR (暂时)      价格/库存需要最新数据
购物车/结账             SSR             用户特定数据
用户中心                SSR             需要认证
软件下载                CSR             纯交互式版本选择器
```

#### 真实代码——ISR 的博客列表

```typescript
// apps/dji-storefront/src/app/[countryCode]/blog/page.tsx

export const revalidate = 300  // ← 每 5 分钟重新生成一次

export default async function BlogPage({ params, searchParams }) {
  const { countryCode } = await params
  const query = await searchParams
  const page = parseInt(query.page || "1", 10)
  const category = query.category

  // 这个请求的结果会被缓存 300 秒
  const { posts, pagination } = await listPosts({
    page,
    pageSize: 6,
    category,
    excludeCategory: "News",
  })

  return <BlogListClient posts={posts} pagination={pagination} />
}
```

**ISR 工作流程图：**

```
第 1 个用户访问 (0s):
  → 服务器生成 HTML → 缓存 → 返回给用户

第 2 个用户访问 (100s):
  → 直接返回缓存 (毫秒级) ← 不走服务器

第 3 个用户访问 (350s, 超过 300s):
  → 先返回旧缓存 (毫秒级, 用户不等待)
  → 后台异步重新生成新版本
  → 下一个用户拿到新版本
```

#### 真实代码——SSR + 双数据源合并（核心模式）

```typescript
// apps/dji-storefront/src/app/[countryCode]/products/[handle]/page.tsx

export default async function ProductDetailPage({ params }) {
  const { handle, countryCode } = await params

  // 关键：从 Medusa 和 Strapi 并行获取数据
  const [product, strapiContent] = await Promise.all([
    getProductDetail(handle, countryCode),    // ← Medusa: 价格/库存/变体
    getProductDetailContent(handle),           // ← Strapi: 描述/规格/图文
  ])

  if (!product) notFound()  // ← 产品不存在，返回 404

  // 生成结构化数据（SEO）—— 优先用 Strapi 的 SEO 数据
  const productJsonLd = generateProductJsonLd(product, strapiContent, countryCode)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(product, countryCode)

  return (
    <>
      {/* JSON-LD 结构化数据注入 */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* 把两个数据源的数据都传给客户端组件渲染 */}
      <ProductDetailClient
        product={product}           // ← Medusa 数据
        strapiContent={strapiContent} // ← Strapi 数据
        reviews={reviews}
        countryCode={countryCode}
      />
    </>
  )
}
```

**这就是 Medusa + Strapi 整合的核心模式：**

```
Server Component (page.tsx):
  1. 并行获取 Medusa 产品数据 + Strapi 内容数据
  2. 用 Strapi SEO 数据覆盖默认 Metadata
  3. 生成 JSON-LD 结构化数据
  4. 把两份数据传给 Client Component 渲染

Client Component (ProductDetailClient):
  1. 渲染交互式 UI（加购物车、选变体、图片轮播）
  2. 使用 Server Action 执行购物车操作
```

### 2.3 Server Components vs Client Components

**费曼式解释：**

想象一个剧场。Server Component 是「后台工作人员」——布景、准备道具、安排灯光，这些观众看不到过程，只看到结果。Client Component 是「台上演员」——与观众直接互动，即时响应。

```
Server Component (默认):                Client Component ("use client"):
┌─────────────────────┐              ┌─────────────────────────┐
│ ✓ 直接访问数据库/API  │              │ ✓ useState, useEffect    │
│ ✓ 可以用 await/async  │              │ ✓ onClick, onChange 事件  │
│ ✓ 不发 JS 到浏览器    │              │ ✓ 浏览器 API (localStorage)│
│ ✓ 可以读 env/密钥    │              │ ✓ 动画和实时交互          │
│                     │              │                         │
│ ✗ 不能用 useState    │              │ ✗ 不能直接读密钥          │
│ ✗ 不能监听事件       │              │ ✗ 不能直接查数据库         │
│ ✗ 不能用浏览器 API   │              │ ✗ 代码会发到浏览器 (安全!) │
└─────────────────────┘              └─────────────────────────┘
```

**本项目的划分实践：**

```
Server Components (不需要 "use client"):
├── app/layout.tsx                    → 数据获取 + 布局
├── app/[countryCode]/page.tsx        → 首页数据获取
├── app/[countryCode]/products/[handle]/page.tsx → 产品数据获取
├── app/sitemap.ts                    → Sitemap 生成
└── app/robots.ts                     → Robots 规则

Client Components ("use client"):
├── components/layout/site-header.tsx → 导航交互（菜单展开/收起）
├── components/auth/login-client.tsx  → 表单输入 + 提交
├── components/cart/cart-client.tsx   → 数量调整 + 删除
├── components/checkout/checkout-client.tsx → 多步骤表单
├── components/products/product-detail-client.tsx → 变体选择 + 加购
└── components/providers/posthog-provider.tsx → 分析追踪
```

**核心原则：Server Component 是默认的，只有需要交互时才加 `"use client"`。**

这个原则极其重要——因为 Server Component 的 JS 不会发到浏览器，而 Client Component 的所有代码都会。多用 Server Component = 更小的包体积 = 更快的页面加载。

### 2.4 Server Actions——安全的「后端调用」

**费曼式解释：**

传统的做法：前端发 API 请求 → 后端 API 路由处理 → 返回结果。你需要定义路由、处理 CORS、序列化数据......

Server Actions 把这一切简化了：**在同一个文件里写函数，加上 `"use server"`，前端就能直接调用，但函数实际运行在服务器上。** 就像你在 Excel 里写了一个宏——你点个按钮就执行，但计算在「后台」发生。

```
传统方式:
  前端 → fetch("/api/cart/add") → API Route → 处理逻辑 → 返回 JSON → 前端更新

Server Actions:
  前端 → addToCartAction() → [这个函数在服务器执行] → 自动更新页面
```

**本项目的 Server Action 架构：**

```
lib/actions/
├── auth.ts      → loginAction, registerAction, signoutAction, OTP 系列
├── cart.ts      → updateLineItemAction, deleteLineItemAction, promoCode 系列
├── checkout.ts  → calculateShippingAction, placeOrderAction, PayPal 系列
├── account.ts   → updateCustomerProfile, addCustomerAddress
└── region.ts    → switchCountry
```

#### 真实代码——购物车 Server Action

```typescript
// apps/dji-storefront/src/lib/data/cart.ts

"use server"  // ← 这一行标记整个文件的函数为 Server Actions

import { sdk } from "@/lib/medusa"               // ← 直接使用 Medusa SDK
import { getAuthHeaders, getCartId } from "@/lib/server/cookies"  // ← 读取 httpOnly Cookie

export const addToCart = async ({
  variantId, quantity, countryCode
}: { variantId: string; quantity: number; countryCode: string }) => {
  // 1. 获取或创建购物车（绑定到用户的国家/区域）
  const cart = await getOrSetCart(countryCode)

  // 2. 读取认证头（JWT token 在 httpOnly cookie 中）
  const headers = await getAuthHeaders()

  // 3. 调用 Medusa SDK 添加商品
  await sdk.store.cart.createLineItem(
    cart.id,
    { variant_id: variantId, quantity },
    undefined,
    headers
  )

  // 4. 清除购物车缓存，让页面显示最新数据
  await revalidateCart()
}
```

**为什么 Server Action 比 API Route 更优？**

| 特性 | API Route | Server Action |
|---|---|---|
| 安全性 | 需要手动验证 token | 自动继承服务器上下文 |
| Cookie 访问 | 需要手动解析 | 直接用 `cookies()` |
| 类型安全 | 需要重复定义类型 | TypeScript 端到端类型推导 |
| 缓存失效 | 需要手动触发 | 直接调用 `revalidateTag()` |
| 代码量 | 需要额外的 route.ts | 不需要额外文件 |

### 2.5 Middleware——请求的「门卫」

**费曼式解释：**

Middleware 是站在「大门口」的保安——每个进来的请求都必须先经过它。它可以检查请求，决定放行、重定向还是修改。

**本项目的 Middleware 做了什么？—— 多区域路由**

```
用户访问 cockpit-simulator.com
  ↓
Middleware 检测:
  1. Cookie 有没有手动选的国家？  → 有 → 用它
  2. IP 地理位置是哪个国家？      → 德国 → /de
  3. Accept-Language 是什么？     → de-DE → /de
  4. 都没有？                    → 默认 /us
  ↓
重定向到 /de (307 临时重定向)
```

```typescript
// apps/dji-storefront/src/middleware.ts

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过静态资源和 API 路由
  if (pathname.includes(".")) return NextResponse.next()
  if (pathname.startsWith("/auth/")) return NextResponse.next()

  // 已有国家代码 → 验证是否支持
  const match = pathname.match(/^\/([a-z]{2})(\/|$)/i)
  if (match) {
    const country = match[1].toLowerCase()
    if (SUPPORTED_COUNTRIES.includes(country)) {
      // 有效国家码：放行，注入 x-pathname 头供服务器组件读取
      const response = NextResponse.next({
        request: { headers: { ...request.headers, 'x-pathname': pathname } }
      })
      // 设置缓存 ID cookie（用于标签化缓存）
      if (!request.cookies.get("_medusa_cache_id")) {
        response.cookies.set("_medusa_cache_id", crypto.randomUUID(), {
          maxAge: 86400, path: "/"
        })
      }
      return response
    }
  }

  // 无国家代码或不支持 → 检测并重定向
  const detected = getCountryFromRequest(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${detected}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url, 307)  // ← 307 确保每次都重新检测
}
```

**为什么用 307 而不是 301？**

```
301 (永久重定向):
  浏览器记住结果，下次直接跳转
  → 用户换了 VPN/出差到其他国家 → 还是跳到旧国家 ← 错误!

307 (临时重定向):
  浏览器每次都重新请求
  → 用户换了位置 → IP 变了 → 正确检测到新国家 ← 正确!
```

**国家检测的 4 层降级策略：**

```typescript
function getCountryFromRequest(request: NextRequest): string {
  // 1. 会话 Cookie（用户手动切换的国家，浏览器关闭即失效）
  const sessionCountry = request.cookies.get('_medusa_session_country')?.value
  if (sessionCountry && SUPPORTED_COUNTRIES.includes(sessionCountry)) return sessionCountry

  // 2. IP 地理定位（Vercel/Cloudflare 自动注入）
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.toLowerCase()
  if (vercelCountry && SUPPORTED_COUNTRIES.includes(vercelCountry)) return vercelCountry

  const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase()
  if (cfCountry && SUPPORTED_COUNTRIES.includes(cfCountry)) return cfCountry

  // 3. Accept-Language（本地开发没有 IP 头时的降级方案）
  const langCountry = getCountryFromAcceptLanguage(request.headers.get('accept-language'))
  if (langCountry) return langCountry

  // 4. 默认美国
  return 'us'
}
```

### 2.6 数据获取层——与 Medusa 的整合

**费曼式解释：**

数据获取层就像翻译官——Medusa 说「商务语言」（variant、calculated_price、line_item），前端说「用户语言」（产品、价格、购物车项目）。数据获取层在中间翻译。

**Medusa SDK 初始化：**

```typescript
// apps/dji-storefront/src/lib/medusa.ts

import Medusa from "@medusajs/js-sdk"

export const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey,  // ← 公开密钥，标识哪个销售渠道
})
```

**为什么需要 Publishable Key？**

Medusa 支持多个销售渠道（网站、App、POS）。Publishable Key 告诉 Medusa「这个请求来自网站渠道」，它会返回该渠道可见的产品和价格。

**数据获取函数一览：**

```
lib/data/
├── products.ts     → getProductDetail(handle, country)    # 产品详情 + 定价
│                   → listProducts({limit, offset, ...})    # 产品列表（分页）
│                   → getProductCategories()                 # 产品分类
│
├── collections.ts  → listCollections()                      # 合集列表
│                   → getCollectionByHandle(handle)           # 单个合集
│
├── cart.ts         → retrieveCart(cartId?)                   # 获取购物车
│                   → getOrSetCart(countryCode)               # 获取或创建购物车
│                   → addToCart({variantId, quantity, ...})   # 添加商品
│                   → updateLineItem({lineId, quantity})      # 更新数量
│                   → deleteLineItem(lineId)                  # 删除商品
│                   → completeCart()                           # 完成订单
│
├── orders.ts       → retrieveOrder(id)                       # 订单详情
│                   → listOrders(limit, offset)               # 订单列表
│
├── account.ts      → getCustomer()                           # 当前用户
│                   → getAddresses()                           # 地址列表
│
├── regions.ts      → getRegion(countryCode)                  # 区域信息
│
├── blog.ts         → listPosts(options)        ← Strapi      # 博客列表
│                   → getPost(slug)             ← Strapi      # 博文详情
│
└── reviews.ts      → getReviewsByProduct(id)                  # 产品评价
```

#### 购物车的生命周期（完整流程）

```
1. 用户首次访问 /us/products/t-shirt
   → middleware 设置 _medusa_cache_id cookie

2. 用户点「加入购物车」
   → addToCartAction() 被调用
   → getOrSetCart("us") 检查：
     a. 有 _medusa_cart_id cookie?
        → 有 → retrieveCart() 获取购物车
          → 购物车已完成? → 创建新购物车
          → 购物车区域不匹配? → 更新区域
        → 没有 → 创建新购物车，绑定到 Americas 区域
     b. setCartId() 把购物车 ID 存入 httpOnly cookie
   → sdk.store.cart.createLineItem() 添加商品
   → revalidateTag("carts") 刷新页面购物车数据

3. 用户登录
   → loginAction() → setAuthToken()
   → transferCart() 把匿名购物车关联到用户账号

4. 用户切换国家 (us → de)
   → switchCountry("de") → updateCartRegion("de")
   → 购物车区域从 Americas (USD) 切换到 International (EUR)
   → 价格自动换算

5. 用户结账
   → calculateShippingAction() 计算运费
   → placeOrderAction() → completeCart()
   → removeCartId() 清除购物车 cookie
   → redirect() 跳转到订单确认页
```

### 2.7 缓存系统——性能的核心

**费曼式解释：**

缓存就像你手机里的「最近使用」列表。你不需要每次都从 App 商店重新下载微信——它已经在你手机上了。网页缓存同理：把服务器返回的数据暂存起来，下次直接用。

Next.js 的缓存是**多层嵌套**的：

```
浏览器缓存 → CDN 缓存 → Next.js 路由缓存 → Next.js 数据缓存 → 后端 API
   ↑            ↑              ↑                  ↑
  最快         较快           较快               稍慢
  (0ms)       (~10ms)       (~50ms)           (~200ms)
```

**本项目的缓存标签设计：**

```typescript
// apps/dji-storefront/src/lib/server/cookies.ts

// 缓存标签 = 逻辑标签 + 用户标识
export const getCacheTag = async (tag: string): Promise<string> => {
  const cookies = await nextCookies()
  const cacheId = cookies.get("_medusa_cache_id")?.value
  return cacheId ? `${tag}-${cacheId}` : ""
}

// 使用示例:
// getCacheTag("carts") → "carts-abc123"   (用户 A 的购物车缓存)
// getCacheTag("carts") → "carts-def456"   (用户 B 的购物车缓存)
```

**为什么要加 cacheId？** 因为不同用户的购物车数据不同。如果所有用户共用一个 "carts" 缓存标签，清除一个人的缓存会影响所有人。加上 cacheId 实现了**用户级别的缓存隔离**。

**缓存失效策略：**

```
场景 1: 用户加了商品到购物车
  → revalidateTag("carts-abc123")
  → 只清除这个用户的购物车缓存
  → 其他用户不受影响

场景 2: Strapi 编辑发布了新博文
  → Webhook 调用 /api/revalidate?tag=blog
  → revalidateTag("blog") + revalidateTag("blog-categories")
  → 所有用户的博客缓存都失效（因为内容对所有人一样）

场景 3: 用户登录
  → revalidateTag("customers-abc123")
  → 刷新该用户的个人信息缓存
```

---

## 第三部分：完整业务流程追踪

### 3.1 认证流程——从匿名到登录

本项目支持 **5 种认证方式**：

```
┌─────────────────────────────────────────────────┐
│                  认证入口                         │
│                                                  │
│  1. Email + Password    ← 传统方式                │
│  2. OTP (邮件验证码)    ← 无密码登录               │
│  3. Google OAuth        ← 弹窗方式                │
│  4. Google One Tap      ← 一键登录                │
│  5. Discord OAuth       ← 社区集成                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────┐
│ setAuthToken(jwt) → httpOnly cookie  │
│ transferCart() → 匿名购物车 → 用户    │
│ revalidateTag("customers")           │
│ redirect("/account")                 │
└──────────────────────────────────────┘
```

#### Email/Password 登录流程

```typescript
// apps/dji-storefront/src/lib/actions/auth.ts

export async function loginAction(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // 1. 调用 Medusa Auth API
  const token = await sdk.auth.login("customer", "emailpass", { email, password })
  // ↑ "customer" = 认证方式类别, "emailpass" = 提供者名称

  // 2. 将 JWT 存入 httpOnly Cookie（浏览器 JS 不可读 → 防 XSS）
  await setAuthToken(token as string)

  // 3. 把匿名购物车转移到已登录用户
  await transferCart()

  // 4. 清除用户信息缓存（强制重新获取最新数据）
  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  // 5. 重定向（支持 returnTo 参数）
  redirect(requestedRedirect)
}
```

#### OTP 无密码登录流程（更现代的方式）

```
步骤 1: 用户输入邮箱
  → initiateOTPLoginAction(email)
  → POST /store/auth/otp/initiate
  → Medusa 发送 6 位验证码到邮箱

步骤 2: 用户输入验证码
  → verifyOTPLoginAction(email, otp)
  → POST /store/auth/otp/verify
  → 已有账号? → 返回 JWT → 自动登录
  → 新用户?   → 返回 requiresProfile: true → 进入步骤 3

步骤 3: 新用户补全资料
  → completeOTPProfileAction(email, firstName, lastName)
  → POST /store/auth/otp/complete
  → 创建账号 → 返回 JWT → 自动登录
```

**安全要点：**

```typescript
// Cookie 安全配置
cookies.set("_medusa_jwt", token, {
  maxAge: 60 * 60 * 24 * 7,   // 7 天过期
  httpOnly: true,               // ← JS 不可读（防 XSS）
  sameSite: "lax",              // ← 防 CSRF
  secure: process.env.NODE_ENV === "production",  // ← 仅 HTTPS
  path: "/",
})
```

```typescript
// 认证头构建（从 Cookie 中提取 JWT + Actor ID）
export const getAuthHeaders = async () => {
  const token = cookies.get("_medusa_jwt")?.value
  const headers: Record<string, string> = {}

  if (token) {
    headers["authorization"] = `Bearer ${token}`

    // 从 JWT 中解码 actor_id（不需要密钥，payload 是 Base64 编码）
    const claims = decodeJwtPayload(token)
    const actorId = claims?.["actor_id"] || claims?.["sub"]
    if (actorId) {
      headers["x-medusa-actor-id"] = actorId as string  // ← Medusa 用来确定「是谁」
    }
  }
  return headers
}
```

### 3.2 购物车 → 结账 → 订单确认（完整电商流程）

```
┌─────────────┐     ┌────────────────┐     ┌────────────────┐     ┌──────────────┐
│  浏览产品    │ ──→ │   购物车       │ ──→ │    结账        │ ──→ │  订单确认     │
│  /products   │     │  /cart         │     │  /checkout     │     │  /order/xx    │
│             │     │               │     │               │     │  /confirmed   │
│ addToCart() │     │ updateLine()  │     │ setAddress()  │     │ retrieveOrder()│
│             │     │ deleteLine()  │     │ setShipping() │     │              │
│             │     │ applyPromo()  │     │ initPayment() │     │              │
│             │     │               │     │ completeCart() │     │              │
└─────────────┘     └────────────────┘     └────────────────┘     └──────────────┘
     Medusa              Medusa              Medusa + PayPal           Medusa
```

#### 结账流程详解

```typescript
// apps/dji-storefront/src/lib/actions/checkout.ts (简化版)

export async function placeOrderAction(formData: FormData) {
  // 1. 解析表单数据
  const firstName = formData.get("firstName") as string
  const address = { first_name: firstName, last_name, address_1, city, postal_code, country_code }

  // 2. 验证国家是否在当前区域内
  if (!isCountryInRegion(region, address.country_code)) {
    return { error: "Selected country is not available in your region" }
  }

  // 3. 更新购物车地址
  await updateCart({ shipping_address: address, billing_address: address, email })

  // 4. 获取可用的运输方式
  const { shipping_options } = await listCartOptions()

  // 5. 设置运输方式
  await setShippingMethod({ cartId, shippingMethodId: shipping_options[0].id })

  // 6. 初始化支付会话
  await initiatePaymentSession(cart, { provider_id: "pp_system_default" })

  // 7. 完成订单
  const result = await completeCart()

  // 8. 清除购物车，跳转到订单确认页
  redirect(`/${countryCode}/order/${result.order.id}/confirmed`)
}
```

### 3.3 区域和货币切换流程

```
用户在美国 (/us) → 购物车显示 $19.50 USD
  ↓
点击国家选择器 → 选择德国 (de)
  ↓
switchCountry("de"):
  1. 设置会话 Cookie: _medusa_session_country = "de"
  2. updateCartRegion("de"):
     → 查找 de 对应的区域: International (EUR)
     → sdk.store.cart.update(cartId, { region_id: "reg_eu..." })
     → Medusa 自动重新计算价格 → $19.50 → €17.95
  3. revalidatePath("/") → 所有页面刷新
  ↓
用户跳转到 /de → 购物车显示 €17.95 EUR
```

**区域配置的数据结构：**

```typescript
// apps/dji-storefront/src/lib/config/regions.ts

const REGION_MAP = {
  us: {
    id: 'reg_01K9KE3SV4Q4J745N8T19YTCMH',
    name: 'Americas',
    currency: 'USD',
    countries: ['us', 'ca', 'mx', 'ar', 'cl', 'co', ...],  // 美洲
  },
  eu: {
    id: 'reg_01K8J5TBMV1EKV404ZG3SZGXEQ',
    name: 'International',
    currency: 'EUR',
    countries: ['de', 'fr', 'gb', 'jp', 'kr', 'au', ...],   // 欧洲+亚太
  },
}
```

---

## 第四部分：Strapi 内容整合模式

### 4.1 Strapi Client 架构

```typescript
// apps/dji-storefront/src/lib/strapi/client.ts

export const getStrapiClient = (): StrapiClient => {
  const baseUrl = process.env.STRAPI_API_URL ?? "http://localhost:1337"
  const apiToken = process.env.STRAPI_API_TOKEN

  const fetchFromStrapi = async <T>(path: string, options = {}): Promise<T> => {
    const response = await fetch(targetUrl, {
      headers: { Authorization: `Bearer ${apiToken}` },

      // Next.js 特有的缓存配置
      cache: hasRevalidate ? "force-cache" : "no-store",
      next: {
        revalidate: 60,           // ← 60 秒后重新验证
        tags: options.tags,       // ← 缓存标签（支持精准失效）
      },
    })

    return (await response.json()) as T
  }

  return { fetch: fetchFromStrapi, resolveMedia, baseUrl }
}
```

### 4.2 内容获取与合并模式

**模式 1：纯 Strapi 数据（博客）**

```typescript
// 博客页面只需要 Strapi 数据
const { posts, pagination } = await listPosts({ page, category })
```

**模式 2：Medusa + Strapi 合并（产品详情，最关键的模式）**

```typescript
// 产品页面需要合并两个数据源
const [product, strapiContent] = await Promise.all([
  getProductDetail(handle, countryCode),     // Medusa → 价格、库存、变体
  getProductDetailContent(handle),           // Strapi → 描述、规格、图文区块
])

// Metadata 优先使用 Strapi SEO 数据
const title = strapiContent?.seo?.metaTitle ?? product.title
```

**模式 3：Strapi 布局 + Medusa 产品引用（首页）**

```typescript
// 首页：Strapi 定义布局和展示内容
const layout = await getHomepageLayout()
// layout.primaryHero → Strapi Featured Product (含图片/文案/CTA按钮)
// layout.productGrid → Strapi Featured Product 列表
// 注意：这里不直接从 Medusa 取价格，因为首页更重视视觉展示
```

### 4.3 Webhook 驱动的实时更新

```typescript
// apps/dji-storefront/src/app/api/revalidate/route.ts

export async function POST(request: Request) {
  const url = new URL(request.url)
  const tag = url.searchParams.get("tag")
  const secret = url.searchParams.get("secret")

  // 验证 Webhook 密钥
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  // 按标签清除缓存
  if (tag === "blog") {
    await revalidateStrapiBlog()  // ← 清除所有博客缓存
  } else if (tag?.startsWith("products-")) {
    await revalidateTag(tag)
  } else if (tag === "collections") {
    revalidatePath("/[countryCode]/collections", "page")
  }

  return NextResponse.json({ success: true, tag })
}
```

**Strapi 端配置 Webhook:**
```
URL: https://your-storefront.com/api/revalidate?tag=blog&secret=YOUR_SECRET
Trigger: Entry publish / unpublish
Content Type: Post
```

---

## 第五部分：安全架构

### 5.1 Cookie 安全策略

```
Cookie 名称                   作用              安全属性
──────────────────────────────────────────────────────────────
_medusa_jwt                  认证 JWT           httpOnly, secure, sameSite: lax
_medusa_cart_id              购物车 ID          httpOnly, secure, sameSite: lax
_medusa_cache_id             缓存隔离标识       非 httpOnly (前端可读)
_medusa_session_country      手动选择的国家     会话级 (浏览器关闭失效)
_medusa_country_code         记住的国家码       非 httpOnly
```

**为什么 JWT 用 httpOnly?**

```
无 httpOnly:
  → XSS 攻击: document.cookie → 窃取 JWT → 冒充用户 ← 危险!

有 httpOnly:
  → XSS 攻击: document.cookie → 读不到 _medusa_jwt ← 安全!
  → 只有服务器端代码能读 (Server Actions, API Routes)
```

### 5.2 密码重置的安全设计

```typescript
export async function requestPasswordResetAction(_, formData: FormData) {
  const email = formData.get("email") as string

  try {
    await sdk.auth.resetPassword("customer", "emailpass", { identifier: email })
  } catch {
    // 故意忽略错误
  }

  // 无论邮箱是否存在，都返回相同消息
  return {
    success: true,
    message: "If an account exists with this email, you will receive a password reset link."
  }
  // ↑ 防止「邮箱枚举攻击」—— 攻击者无法判断邮箱是否注册
}
```

### 5.3 重定向安全

```typescript
// apps/dji-storefront/src/lib/util/redirect.ts

export function sanitizeRedirectPath(
  raw: FormDataEntryValue | null,
  fallback: string
): string {
  if (!raw || typeof raw !== "string") return fallback

  // 只允许相对路径，阻止 open redirect 攻击
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw

  return fallback
}

// 攻击者尝试: returnTo=https://evil.com/steal-token
// sanitizeRedirectPath → 不是 "/" 开头 → 返回 fallback → 安全
```

---

## 第六部分：SEO 与性能优化

### 6.1 Metadata 生成

```typescript
// 静态 Metadata (简单页面)
export const metadata: Metadata = {
  title: "Blog · Cockpit Simulator",
  description: "Latest news, guides, and tutorials.",
}

// 动态 Metadata (需要数据的页面)
export async function generateMetadata({ params }): Promise<Metadata> {
  const { handle, countryCode } = await params

  // 并行获取 Medusa 产品 + Strapi SEO 数据
  const [product, strapiContent] = await Promise.all([
    getProductDetail(handle, countryCode),
    getProductDetailContent(handle),
  ])

  return {
    // Strapi 的 SEO 数据优先（编辑可以自定义）
    title: strapiContent?.seo?.metaTitle ?? `${product.title} · Cockpit Simulator`,
    description: strapiContent?.seo?.metaDescription ?? product.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}
```

### 6.2 JSON-LD 结构化数据

```typescript
function generateProductJsonLd(product, strapiContent, countryCode) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: strapiContent?.seo?.metaDescription ?? product.description,
    image: strapiContent?.seo?.ogImageUrl ?? product.images[0],
    sku: product.id,
    brand: { "@type": "Brand", name: "Cockpit Simulator" },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),  // ← Medusa 以「分」为单位
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }
}
```

**注意：** Medusa 的价格以「分」为单位存储（$19.50 存为 1950），前端需要 `/ 100` 转换。

### 6.3 Sitemap 动态生成

```typescript
// apps/dji-storefront/src/app/sitemap.ts

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. 静态页面（手动维护）
  const staticPages = [
    { url: `${BASE_URL}/us`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/us/store`, changeFrequency: "daily", priority: 0.9 },
  ]

  // 2. 博客文章（从 Strapi 动态获取，分页遍历所有文章）
  const blogEntries = []
  let page = 1, hasMore = true
  while (hasMore) {
    const result = await listPosts({ page, pageSize: 100 })
    blogEntries.push(...result.posts.map(post => ({
      url: `${BASE_URL}/us/blog/${post.slug}`,
      lastModified: post.publishedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })))
    hasMore = page < result.pagination.pageCount
    page++
  }

  // 3. 产品（从 Medusa 动态获取）
  const productEntries = [...] // 类似的分页逻辑

  return [...staticPages, ...blogEntries, ...productEntries]
}
```

### 6.4 robots.txt

```typescript
// apps/dji-storefront/src/app/robots.ts

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/cart", "/checkout"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
// ↑ 禁止搜索引擎抓取购物车、结账、账户页面（这些页面对 SEO 无价值且包含敏感数据）
```

### 6.5 图片优化

```typescript
// next.config.ts

images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },          // 素材图
    { protocol: "https", hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com" }, // Medusa 产品图
    { protocol: "https", hostname: "img.aidenlux.com" },             // CDN
    ...(strapiRemotePattern ? [strapiRemotePattern] : []),           // Strapi 动态图
  ],
  qualities: [50, 75, 80, 85, 90, 95, 100],
}
```

**Next.js `<Image>` 的工作原理：**

```
原始图片: 4000x3000px, 2.5MB JPEG
  ↓
Next.js Image 优化管线:
  1. 根据容器大小裁剪 (如 800px 宽度)
  2. 转换为 WebP/AVIF 格式 (体积减少 ~50%)
  3. 根据 DPR 生成 1x/2x 版本
  4. 设置 Cache-Control 头
  ↓
用户收到: 800x600px, 120KB WebP ← 比原始小 20 倍
```

---

## 第七部分：错误处理三层防线

### 第一层：页面级错误边界

```typescript
// apps/dji-storefront/src/app/error.tsx
"use client"

export default function Error({ error, reset }) {
  useEffect(() => {
    // 自动上报到 Sentry
    Sentry.captureException(error, {
      tags: { source: "error-boundary", digest: error.digest },
    })
  }, [error])

  return (
    <div>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>  {/* ← 尝试重新渲染 */}
      <a href="/">Go to homepage</a>

      {/* 开发模式显示详细错误 */}
      {process.env.NODE_ENV === "development" && (
        <pre>{error.message}\n{error.stack}</pre>
      )}
    </div>
  )
}
```

### 第二层：全局错误（连 Layout 都崩了）

```typescript
// apps/dji-storefront/src/app/global-error.tsx
"use client"

export default function GlobalError({ error }) {
  useEffect(() => { Sentry.captureException(error) }, [error])

  return (
    <html><body>
      <h1>A critical error occurred</h1>
      {/* 注意：全局错误不能用 Layout，因为 Layout 可能就是崩溃的原因 */}
    </body></html>
  )
}
```

### 第三层：404 和数据缺失

```typescript
// 产品详情页
const product = await getProductDetail(handle, countryCode)
if (!product) notFound()  // ← Next.js 内置函数，触发 not-found.tsx

// 结账页
const customer = await getCustomer()
if (!customer) {
  redirect(`/${countryCode}/login?returnTo=${encodeURIComponent(`/${countryCode}/checkout`)}`)
  // ↑ 未登录用户重定向到登录页，登录后回到结账页
}
```

---

## 第八部分：监控与可观测性

### Sentry 集成

```typescript
// next.config.ts
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  sourcemaps: { deleteSourcemapsAfterUpload: true },  // ← 上传后删除（安全）
  reactComponentAnnotation: { enabled: true },         // ← 自动标注组件名
  tunnelRoute: "/monitoring",                          // ← 绕过广告拦截器
})
```

**为什么用 tunnel route?** 因为很多广告拦截器会屏蔽直接发往 `sentry.io` 的请求。通过 `/monitoring` 中转，看起来像普通 API 请求，不会被拦截。

### PostHog 分析（尊重用户隐私）

```typescript
// 分析追踪只在用户同意后启用
const { hasAnalyticsConsent } = useConsent()

useEffect(() => {
  if (hasAnalyticsConsent) {
    posthog.opt_in_capturing()   // ← 用户同意 → 开始追踪
  } else {
    posthog.opt_out_capturing()  // ← 用户拒绝 → 停止追踪
  }
}, [hasAnalyticsConsent])
```

---

## 第九部分：项目目录结构全解析

```
apps/dji-storefront/
├── next.config.ts              # Next.js 配置 + Sentry 包装
├── tailwind.config.ts          # 设计系统 (Apple 风格)
├── tsconfig.json               # TypeScript 严格模式
├── package.json                # Next.js 15 + React 19
│
├── src/
│   ├── middleware.ts            # 多区域路由中间件
│   │
│   ├── app/                     # App Router 路由
│   │   ├── layout.tsx           # 根布局 (并行数据获取)
│   │   ├── error.tsx            # 错误边界 + Sentry
│   │   ├── global-error.tsx     # 全局错误兜底
│   │   ├── not-found.tsx        # 404 页面
│   │   ├── robots.ts            # SEO: robots.txt
│   │   ├── sitemap.ts           # SEO: sitemap.xml
│   │   │
│   │   ├── [countryCode]/       # 动态国家路由
│   │   │   ├── page.tsx         # 首页 (Strapi 布局)
│   │   │   ├── products/        # Medusa 产品
│   │   │   ├── collections/     # Medusa 合集
│   │   │   ├── blog/            # Strapi 博客
│   │   │   ├── cart/            # Medusa 购物车
│   │   │   ├── checkout/        # Medusa 结账
│   │   │   └── account/         # Medusa 用户中心
│   │   │
│   │   ├── api/                 # BFF API 路由
│   │   │   ├── revalidate/      # Webhook 缓存失效
│   │   │   ├── auth/            # 认证端点
│   │   │   └── discourse/       # SSO 桥接
│   │   │
│   │   └── auth/                # OAuth 流程
│   │
│   ├── lib/                     # 核心库代码
│   │   ├── medusa.ts            # Medusa SDK 初始化
│   │   ├── data/                # 数据获取层
│   │   │   ├── products.ts      # ← Medusa 产品
│   │   │   ├── cart.ts          # ← Medusa 购物车
│   │   │   ├── orders.ts        # ← Medusa 订单
│   │   │   ├── collections.ts   # ← Medusa 合集
│   │   │   ├── account.ts       # ← Medusa 用户
│   │   │   ├── regions.ts       # ← Medusa 区域
│   │   │   ├── blog.ts          # ← Strapi 博客
│   │   │   └── reviews.ts       # ← 产品评价
│   │   │
│   │   ├── actions/             # Server Actions (变更操作)
│   │   │   ├── auth.ts          # 登录/注册/OTP/OAuth
│   │   │   ├── cart.ts          # 购物车增删改
│   │   │   ├── checkout.ts      # 结账/支付
│   │   │   ├── account.ts       # 资料/地址管理
│   │   │   └── region.ts        # 国家/区域切换
│   │   │
│   │   ├── strapi/              # Strapi 集成
│   │   │   ├── client.ts        # Strapi REST 客户端
│   │   │   ├── homepage.ts      # 首页布局数据
│   │   │   └── product-detail.ts # 产品内容数据
│   │   │
│   │   ├── server/              # 服务端工具
│   │   │   └── cookies.ts       # Cookie 管理 (JWT/Cart/Cache)
│   │   │
│   │   ├── config/              # 配置
│   │   │   ├── regions.ts       # 50+ 国家的区域映射
│   │   │   └── env.ts           # 环境变量验证
│   │   │
│   │   ├── context/             # React Context
│   │   │   ├── wishlist-context.tsx  # 愿望单 (localStorage)
│   │   │   └── consent-context.tsx   # GDPR/CCPA 同意管理
│   │   │
│   │   └── util/                # 工具函数
│   │       ├── redirect.ts      # 安全重定向
│   │       ├── medusa-error.ts  # Medusa 错误解析
│   │       └── discourse-sso.ts # Discourse SSO
│   │
│   └── components/              # UI 组件
│       ├── layout/              # 全局布局 (Header/Footer)
│       ├── auth/                # 认证组件
│       ├── cart/                # 购物车组件
│       ├── checkout/            # 结账组件
│       ├── products/            # 产品组件
│       ├── product-detail/      # 产品详情组件 (Strapi 内容)
│       ├── homepage/            # 首页组件 (Strapi 布局)
│       ├── region/              # 区域选择器
│       ├── consent/             # GDPR 弹窗
│       ├── providers/           # 全局 Provider
│       └── ui/                  # 基础 UI 组件 (Radix UI)
```

---

## 第十部分：知识树总结

```
树干 (第一性原理):
  Next.js = 让服务器做擅长的事，浏览器做擅长的事
  Medusa + Strapi = 事务型数据与内容型数据分离

树枝 (七大核心概念):
  ├── App Router: 文件即路由，Layout 套娃，动态参数
  │
  ├── 渲染模式: SSG/ISR/SSR/CSR 的选择依据
  │   └── 本项目: 博客用 ISR，产品用 SSR，软件用 CSR
  │
  ├── Server vs Client Components
  │   └── 默认 Server，需要交互才用 Client
  │
  ├── Server Actions: "use server" 安全调后端
  │   └── 比 API Route 更简洁、更安全、更类型安全
  │
  ├── Middleware: 请求门卫
  │   └── 本项目: 4 层降级的国家检测 + 307 临时重定向
  │
  ├── 数据获取: Promise.all 并行 + SDK 直调
  │   └── Medusa SDK + Strapi Client 双数据源
  │
  └── 缓存: 多层缓存 + 标签化失效 + Webhook 驱动
      └── 用户级 cacheId 隔离 + Strapi Webhook 实时更新

树叶 (具体实现):
  ├── 认证: 5 种方式 (Email/OTP/Google/One Tap/Discord)
  ├── 购物车: Cookie 管理 + 区域绑定 + 匿名转登录
  ├── 结账: 多步骤 + PayPal 集成 + 运费计算
  ├── 安全: httpOnly JWT + 防 XSS + 防邮箱枚举 + 安全重定向
  ├── SEO: generateMetadata + JSON-LD + Sitemap + robots
  ├── 监控: Sentry (tunnel route 绕过广告拦截) + PostHog (尊重隐私)
  └── 部署: Vercel + Docker + 环境变量管理
```

**费曼测试——你现在应该能回答这些问题：**

1. 产品详情页为什么要同时从 Medusa 和 Strapi 获取数据？各取什么？
2. 为什么根布局用 `Promise.all` 而不是依次 `await`？
3. `"use server"` 标记的函数为什么比 API Route 更安全？
4. Middleware 为什么用 307 而不是 301 做国家重定向？
5. 缓存标签为什么要拼接 `cacheId`？如果不拼会怎样？
6. httpOnly Cookie 防的是什么攻击？sameSite: "lax" 防的是什么？
7. 用户从匿名状态登录后，购物车是怎么「跟过来」的？
8. Strapi Webhook 和 ISR revalidate 各自的角色是什么？为什么两个都要？
9. 密码重置为什么无论邮箱存不存在都返回相同消息？
10. `generateStaticParams` 和 `force-dynamic` 同时存在时，谁优先？

如果你能用自己的话向一个新手解释这些问题的答案——恭喜，你已经真正理解了 Next.js + Medusa + Strapi 的全栈电商架构。

---

> **写作日期**: 2026-02-11
> **基于项目**: cs monorepo (Next.js 15.5.7 + Medusa 2.x + Strapi v5.28.0)
> **教程方法**: 马斯克语义树学习法 + 费曼学习法
