# DJI Storefront 与 Strapi 后端通信底层逻辑解析

**最后更新**: 2026-01-13
**适用版本**: Next.js 14+ / Strapi v4/v5
**项目路径**: `apps/dji-storefront`

本文档深入解析 DJI Storefront (Next.js App Router) 如何与 Strapi Headless CMS 进行通信。本项目采用 **CMS 增强电商 (CMS-Augmented Commerce)** 模式，利用 Strapi 丰富的内容管理能力来补充 Medusa 电商数据的不足。

---

## 1. 架构概览

通信层由一个轻量级的 Fetch 封装器驱动，主要负责**内容读取**。

```mermaid
graph TD
    subgraph Frontend [DJI Storefront (Next.js)]
        Config[.env]
        Client[Strapi Client (src/lib/strapi/client.ts)]
        
        subgraph Data_Layer [Data Modules]
            Blog[Blog Module (src/lib/data/blog.ts)]
            PDetail[Product Detail (src/lib/strapi/product-detail.ts)]
            Home[Homepage (src/lib/strapi/homepage.ts)]
        end
        
        subgraph Page_Layer [Server Components]
            ProductPage[Product Page]
            BlogPage[Blog Listing]
        end
        
        ProductPage -->|Parallel Fetch| PDetail
        BlogPage -->|ISR Fetch| Blog
        Data_Layer -->|Call| Client
        Client -->|Read| Config
    end

    subgraph Backend [Strapi CMS]
        API[Content API (/api/*)]
        Media[Media Library (/uploads/*)]
        DB[(Postgres)]
    end

    Client -- HTTP/JSON (Bearer Token) --> API
    API -- Read --> DB
    Frontend -- Load Images --> Media
    
    Note over Frontend, Backend: 核心协议: REST API
    Note over Frontend: 身份凭证: API Token (Read-Only)
```

---

## 2. 客户端封装与配置

Strapi 的通信核心位于 `src/lib/strapi/client.ts`。

### 2.1 环境变量
*   **`STRAPI_API_URL`**: CMS 地址（如 `https://content.aidenlux.com`）。
*   **`STRAPI_API_TOKEN`**: 在 Strapi 后台生成的**只读** API Token。
    *   *安全性*: 该 Token 仅在服务端使用，**严禁暴露**给客户端浏览器（`NEXT_PUBLIC_` 前缀）。

### 2.2 Client Factory 模式
我们实现了一个工厂函数 `getStrapiClient()`，它返回一个包含 `fetch` 和 `resolveMedia` 的对象。

```typescript
// src/lib/strapi/client.ts 核心逻辑
const fetchFromStrapi = async <T>(path: string, options = {}) => {
  const url = new URL(path, baseUrl)
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    ...options, // 支持传入 cache tags
  })
  
  if (!res.ok) throw new Error(`Strapi request failed`)
  return res.json()
}
```

### 2.3 媒体资源解析
Strapi 返回的图片 URL 通常是相对路径（如 `/uploads/hero.jpg`）。客户端必须将其转换为绝对路径：

```typescript
export const resolveStrapiMedia = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith("http")) return url // 已经是绝对路径（如 S3/R2）
  return `${DEFAULT_STRAPI_URL}${url}`   // 拼接本地路径
}
```

---

## 3. 核心应用场景

本项目将 Strapi 定位为 **“Medusa 的内容挂件”**。

### 3.1 商品详情增强 (Product Enrichment)
Medusa 擅长管理价格、库存、SKU，但不擅长管理复杂的富文本、图文混排、规格参数表。我们通过 **Handle (商品句柄)** 将两者关联。

**文件**: `src/app/[countryCode]/products/[handle]/page.tsx`

```typescript
// 并行请求模式：同时向两个后端要数据
const [product, strapiContent] = await Promise.all([
  medusa.products.retrieve(handle),      // 拿价格、库存
  getStrapiProductContent(handle)        // 拿富文本介绍、SEO TDK
])

// 渲染逻辑：优先使用 Strapi 的 SEO 数据
const title = strapiContent?.seo?.metaTitle ?? product.title
```

**数据结构映射 (`src/lib/strapi/product-detail.ts`)**:
Strapi 中的 `Product` Collection Type 包含以下组件：
*   `feature_bullets` (功能亮点)
*   `spec_groups` (规格参数表)
*   `package_contents` (包装清单)
*   `overview` (富文本概览)

### 3.2 博客系统 (Blog)
完全由 Strapi 驱动。

**文件**: `src/lib/data/blog.ts`
*   **类型安全**: 定义了 `StrapiPostAttributes` 等 TypeScript 接口，确保 API 响应的类型安全。
*   **分页处理**: 封装了 `pagination` 逻辑，适配 Strapi v4/v5 的响应结构。

### 3.3 动态首页
首页的轮播图、精选商品栏目不再写死在代码里，而是从 Strapi 读取配置。

---

## 4. 缓存与按需更新 (ISR)

为了兼顾性能（静态页面的速度）与实时性（内容修改即时生效），我们使用了 Next.js 的 **ISR (Incremental Static Regeneration)** 机制。

### 4.1 缓存标签
在 Fetch 请求中通过 `next.tags` 标记数据源：

```typescript
// src/lib/data/blog.ts
strapi.fetch("/api/posts", { next: { tags: ["blog"] } })
```

### 4.2 Webhook 触发
我们在 Strapi 中配置 Webhook，当内容发布/修改时，向 Next.js 发送请求。

**路由**: `src/app/api/revalidate/route.ts`
**逻辑**:
1.  验证 `secret` 参数（防止恶意刷新）。
2.  调用 `revalidateTag("blog")`。
3.  Next.js 收到指令，将该标签下的所有缓存标记为过期。
4.  下一次用户访问时，后台自动重新生成页面。

---

## 5. Medusa vs Strapi：职责边界

| 功能 | Medusa (Commerce) | Strapi (CMS) |
| :--- | :--- | :--- |
| **核心数据** | 价格, 库存, 订单, 客户, 支付 | 博客文章, 营销着陆页, 帮助中心 |
| **商品数据** | SKU, 基础名称, 图片, 变体 | **富文本描述**, **参数表**, **SEO TDK** |
| **图片存储** | S3 / R2 (电商图) | S3 / R2 (内容图) |
| **写入权限** | 允许前端写入 (创建订单/客户) | **只读** (前端仅读取展示) |

这种 **Best-of-Breed (组合式)** 架构让我们既拥有了专业的电商处理能力，又拥有了顶级的营销内容管理体验。
