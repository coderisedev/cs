# Next.js 语义树（以 apps/dji-storefront 为例）

## 树干：全栈 React 框架
- `apps/dji-storefront` 同时承担体验层和轻量 API：页面在 App Router 渲染，`app/api/*` 处理 ISR/Webhook，体现 Next.js “一棵树”理念。

## 枝 1：结构与路由
- 采用 App Router：`src/app/[countryCode]/blog/page.tsx`、`src/app/api/revalidate/route.ts` 等。
- 动态 segment `[countryCode]` 支持多区域站点；`layout.tsx` 负责注入全局 UI。
- 练习：浏览不同 segment 的嵌套，理解文件系统路由映射。

## 枝 2：渲染模式与数据获取
- Server Components 默认 `fetch`；例如 `src/lib/data/blog.ts` 使用 `next: { tags }` + `cache: "force-cache"` 实现 ISR。
- 客户端组件需 `use client`（如 blog 页面中的交互组件）。
- `/api/revalidate?tag=blog` 调用 `revalidateStrapiBlog`，由 Strapi webhook 触发，刷新缓存。

## 枝 3：数据接口与中间件
- API Routes/Route Handlers：`app/api/revalidate/route.ts` 验证 secret 后调用 `revalidateTag`。
- 可以新增 `app/api/medusa/*` 代理 Medusa webhook；`middleware.ts` 可做地域重定向或安全检查。

## 枝 4：资源优化与 SEO
- `generateMetadata` 从 Strapi SEO 组件读 meta/OG 信息；所有页面共享 SEO 逻辑。
- 图片通过 `next/image`，允许 `img.aidenlux.com`（R2 域名）在 `next.config.js`。
- ISR + webhook 保证性能和内容新鲜度，`BLOG_REVALIDATE_SECONDS` 等常量集中在 lib 文件。

## 枝 5：配置与部署
- `.env.local` 保存 `STRAPI_API_TOKEN`、`MEDUSA_BACKEND_URL` 等变量。
- `pnpm --filter dji-storefront dev` 启动 Turbopack；CI 要求 lint/cart/auth/checkout 无报错。
- 部署：Next.js 输出 SSR server，连向 Medusa/Strapi API 域名即可。

## 叶子：实践路线
1. 阅读 `src/lib/strapi/client.ts`，掌握统一 fetch 封装与缓存标签使用方式。
2. 新建页面：仿 `blog` 实现 `stories/[slug]`，练习 `generateStaticParams` 与 `generateMetadata`。
3. 扩展 API Route：参考 `/api/revalidate`，实现 `/api/medusa/inventory-webhook`。
4. 记录配置：在 docs 里说明缓存标签、公网图片域名、ISR 策略，加深各枝条理解。

通过这种“树干→枝→叶”的结构，对照仓库中的真实文件和流程，就能快速建立 Next.js 在本项目中的语义图谱。每次遇到新需求（多语言、缓存、Webhook），都能在对应枝条找到思路并扩展。 
