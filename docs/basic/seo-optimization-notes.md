# SEO 优化指的是什么？在 Strapi 中如何实现？

## 我们关心的 SEO 包含哪些内容？
SEO（搜索引擎优化）不仅仅是“网站能被 Google 抓到”，而是围绕几类要素：
1. **页面内容与结构**：标题、正文、图文结构、内部链接是否清晰，是否有重复内容。
2. **Meta 信息**：`<title>`、`<meta description>`、Open Graph、Twitter Card、JSON-LD 等，让搜索引擎/社交平台了解页面语义。
3. **性能与可访问性**：加载速度、移动端体验、Core Web Vitals、可访问性标签。
4. **站点地图与可抓取性**：sitemap、robot.txt、结构化数据（schema.org）、canonical 链接。
5. **内容更新频率 / 内链策略**：持续输出内容、交叉链接相关页面，提高权重。

## Strapi 如何帮助 SEO？
Strapi 本身提供了“结构化内容 + CMS 工作流”。我们可以为每个 content type 设计一个 `seo` 组件，统一维护 SEO 字段，并让前端读取这些字段生成对应 meta/结构化数据。

### 1. SEO Component 模式
例如 `seo` 组件可以包含：
- `meta_title`
- `meta_description`
- `og_title`, `og_description`, `og_image`
- `canonical_url`
- `schema_json`（可选，存储 JSON-LD）

然后在 `Post`、`Product Detail`、`Homepage` 等内容类型中引用这套组件；Strapi 会把这些字段一起返回给前端。

### 2. 前端如何使用
在 Next.js 的 `generateMetadata` 或 page component 中：
```ts
const detail = await getProductDetailContent(handle)

export async function generateMetadata({ params }) {
  const detail = await getProductDetailContent(params.handle)
  return {
    title: detail?.seo?.metaTitle ?? detail?.title ?? DEFAULT_TITLE,
    description: detail?.seo?.metaDescription ?? DEFAULT_DESCRIPTION,
    openGraph: {
      title: detail?.seo?.ogTitle ?? detail?.title,
      description: detail?.seo?.ogDescription ?? detail?.excerpt,
      images: detail?.seo?.ogImage ? [detail.seo.ogImage] : undefined,
    },
    alternates: detail?.seo?.canonicalUrl ? { canonical: detail.seo.canonicalUrl } : undefined,
  }
}
```
即：Strapi 负责维护字段 → Next.js 负责把字段转成 HTML meta/OG tag。

### 3. 内容更新 & ISR
- Blog/Product Detail 发布后触发 `/api/revalidate?tag=blog` 或 `product-detail`，确保新 meta 能被搜索引擎爬到。
- Strapi 可以集成 Editor/校审流程，确保 meta 字段必填、遵守字数限制。

### 4. 其它 SEO 配置
- **Sitemap**：在 Next.js 里根据 Medusa/Strapi 数据动态生成 sitemap（例如 `/sitemap.xml` 组合 `/blog`, `/products`）。
- **结构化数据**：把 Strapi `schema_json` 写入 `<script type="application/ld+json">`。
- **国际化**：如果将来有多语言，可在 Strapi 中管理 `locale`，前端设置 `hreflang`。
- **性能**：Strapi 控制内容瘦身 + Next.js 使用优化（Image, lazy load），共同影响 Core Web Vitals。

## 小结
- 我们关心的 SEO 涵盖内容质量、Meta 信息、结构化数据、性能、sitemap 等。
- Strapi 的作用是：通过自定义 `seo` 组件，把这些字段结构化；内容团队在 Admin 中维护，保持一致性。
- 前端的职责是：读取 `seo` 字段并渲染到 `<head>` / JSON-LD / sitemap，结合 ISR/Webhook 保证搜索引擎及时看到最新内容。
- 因此，SEO 优化既是内容工作，也是技术工作，Strapi 则是连接二者的“内容底座”。
