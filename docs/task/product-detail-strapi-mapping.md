# 商品图文详情（Medusa × Strapi）实施规划

## 现状摘要
- **Medusa**：`apps/dji-storefront/src/lib/data/products.ts` 等文件已通过 Medusa SDK 获取商品与库存；商品详情页位于 `src/app/[countryCode]/products/[handle]/page.tsx`。
- **Strapi**：`getStrapiClient()` + `docs/task/strapi-blog-integration.md` 中的模式已用于博客；Strapi API base 通过 `STRAPI_API_URL`/`STRAPI_API_TOKEN` 配置，Webhook 由 `/api/revalidate` 负责。
- **需求**：复制博客的成功模式，将“商品图文详情”从 Medusa Admin 中剥离出来，交给 Strapi 管理，并让 Next.js 页面一次性取得 Medusa（结构化）+ Strapi（富文本）。

目标：商品的结构化数据仍留在 Medusa（SKU、价格、库存），图文详情/SEO 等富内容在 Strapi 维护。前端在商品详情页同时取两端数据。

## Strapi 侧
1. **Content Type：`product-detail`**
   | 字段 | 类型 | 说明 |
   | --- | --- | --- |
   | `title` | Text | 后台显示用标题 |
   | `medusa_handle` | UID/Text (unique) | 对应 Medusa `product.handle`（建议设 Unique） |
   | `hero_media` | Media | 顶部大图/视频（可多） |
   | `rich_blocks` | Dynamic Zone / repeatable components | 富文本段落、图文模块、FAQ 等 |
   | `seo` | Component | 复用 Strapi SEO 模块 |
   | `related_posts` | Relation (many-to-many) | 可选，关联 Strapi 博客/指南 |
   > 若未来做多语言/多区域，可启用 i18n，并在 `product-detail` 中加入 `locale` 或 `region` 字段，Next 端根据 `[countryCode]` 进行过滤。

2. **API 权限**：Settings → Roles → Public（或 API Token）→ `product-detail` 勾选 `find`, `findOne`。
3. **Webhook（可选）**：创建 `Next Product Detail` webhook，URL 指向 `/api/revalidate?tag=product-detail&secret=...`，事件选 `Entry.publish/unpublish` for `product-detail`。

## Next.js 侧
1. **数据层文件 `src/lib/data/product-details.ts`**
   ```ts
   import { getStrapiClient } from "@/lib/strapi/client"

   export const getProductDetailContent = async (handle: string) => {
     "use server"
     const strapi = getStrapiClient()
     const res = await strapi.fetch("/api/product-details", {
       query: {
         "filters[medusa_handle][$eq]": handle,
         populate: "hero_media,rich_blocks,seo,related_posts",
       },
       tags: ["product-detail", `product-detail-${handle}`],
     revalidate: 300,
    })
    const entity = res.data[0]
    if (!entity) return null
    return mapProductDetail(entity)
   }
   ```
   `mapProductDetail` 可返回：
   ```ts
   type ProductDetail = {
     heroMedia: string[]
     blocks: Array<
       | { type: "rich-text"; content: string }
       | { type: "split"; image: string; body: string }
       | { type: "spec-table"; rows: { label: string; value: string }[] }
     >
     seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string }
     relatedPostSlugs?: string[]
   }
   ```

2. **商品详情页整合**
   ```ts
   const [product, detail] = await Promise.all([
     retrieveProduct(handle),
     getProductDetailContent(handle),
   ])
   ```
   - 若 `detail` 为 null，fallback 到默认文案。
   - 新增 `ProductContent` 组件渲染 `detail.richBlocks`。
   - 捕获 Strapi fetch 异常：返回 `null` 并在 UI 显示“内容加载失败”。

3. **Revalidate**
   - 页面层 `export const revalidate = 300`。
   - `/api/revalidate` handler 增加：
     ```ts
     if (tag === "product-detail") {
       const handle = url.searchParams.get("handle")
       if (handle) {
         revalidateTag(`product-detail-${handle}`)
       } else {
         revalidateTag("product-detail")
       }
     }
     ```
     Webhook URL 可传 `.../api/revalidate?tag=product-detail&handle=a320-pro`，避免全量刷新。

4. **UI 模块**
   - Hero 区渲染 `hero_media`（轮播/视频）。
   - Rich Blocks 根据 block type 切换相应组件。
   - Related posts/CTA 区展示 Strapi 关联内容。

## 验证 Checklist
1. Strapi 新建 `product-detail` 条目：`medusa_handle="a320-pro"`，填入富文本。
2. 前端访问 `/us/products/a320-pro`，确认富文本渲染。
3. 修改 Strapi 内容并触发 webhook，检查 Next API 日志中的 revalidate。
4. Strapi 不可用时：页面仅展示 Medusa 数据，并提示“内容加载失败”。
5. Webhook trigger 返回 200/`{ success: true }`，商品详情页在下一次访问时已刷新。

## 可选扩展
- 在 Medusa Admin 中添加“编辑内容”按钮，链接到 Strapi 对应条目。
  例如：`https://cms.example.com/admin/content-manager/collectionType/api::product-detail.product-detail/{id}`，或 `.../create?defaultValues.medusa_handle={handle}` 预填 handle。
- 为 `product-detail` 加 Category/Tag，支持内容筛选。
- 自定义 SEO：将 Strapi `seo` 数据直接写入 Next.js `generateMetadata`。
