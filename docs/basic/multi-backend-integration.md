# 前端同时调用 Medusa 与 Strapi 的实践

本项目的 Next.js 应用原生支持多数据源：Medusa 负责电商（商品、购物车、订单），Strapi 提供内容（博客、文案、SEO等）。在一个页面里并行调用两套 API 没有技术限制，只需注意下列要点。

## 数据层组织
- `src/lib/data/products.ts`、`cart.ts` 等封装 Medusa SDK，包含鉴权（cookies、cart id）。
- `src/lib/data/blog.ts` 使用 `getStrapiClient()` 调 Strapi REST，并在内部做 `revalidate`/`tags`。
- 页面组件可以 `await Promise.all([listProducts(), listPosts()])`，再将结果组合渲染。

## 配置与鉴权
- Medusa 需要 `MEDUSA_BACKEND_URL`、`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`，并依赖 `getAuthHeaders()` 读取用户 token/cookie。
- Strapi 请求通过 `STRAPI_API_URL` + `STRAPI_API_TOKEN` 在 server 端发送，token 不暴露到客户端。
- 两套 env / cookie 互不干扰，可在同一 page/route handler 内并行调用。

## 缓存策略
- Medusa 数据（cart、账户）一般设为实时：`cache: "no-store"` 或 `force-cache` + `getCacheOptions()`。
- Strapi 内容相对静态，可设置 `revalidate` 和 `revalidateTag("blog")`，或在 `fetch` 中指定 `next: { revalidate, tags }`。
- 混合页面中，各数据模块自行管理缓存即可，Next.js 会合并处理。

## 安全注意事项
- 保证 Strapi token 仅在 Server Components / Route Handlers 使用；不要在 Client Components 里直接 fetch Strapi 私有 API。
- Medusa SDK 通过 cookies 维护会话；不要在 Strapi 请求里复用这些凭证，保持权限边界清晰。

## 使用示例
- 产品详情页可以同时展示来自 Medusa 的商品规格、以及 Strapi 的教程/博客引用，只需在 page 的 server 函数里分别调用 `retrieveProduct()` 和 `getPost()`。
- 内容页（如 `/us/blog/[slug]`）也能顺带加载 Medusa 推荐商品，实现“组合内容 + 商品推荐”的体验。

结论：一个页面同时调用 Medusa 与 Strapi 完全可行，本项目已有的抽象层（`src/lib/data/*`）就是为这种多后端场景准备的，照常使用即可。
