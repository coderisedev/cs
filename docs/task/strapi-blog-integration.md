# Strapi Blog Integration Plan

## 1. Strapi setup
- **Content model**: Confirm/create `Post` collection type with fields:
  - `title` (text), `slug` (UID), `excerpt` (text), `content` (rich text/markdown), `cover_image` (media), `published_at`, `author` (component or relation).
  - Optional `seo` component for meta title/description + OG image.
- **API access**:
  - Use REST endpoints (`/api/posts`) with `populate=cover_image,author`.
  - Create API token or enable public permissions (`find`, `findOne`). Document token in `.env`.
  - Note Strapi base URL (e.g., `http://localhost:1337`) and media base.

## 2. Environment & utilities
- Add `STRAPI_API_URL` (and `STRAPI_API_TOKEN` if needed) to `apps/dji-storefront/.env.example`.
- Create helper `getStrapiClient()` under `src/lib/strapi/client.ts` to wrap fetch with base URL, headers, error handling.
- Utility to normalize Strapi media URLs: e.g., `resolveStrapiMedia(url: string)` that prepends base when relative.
- Update `next.config.js` (or `apps/dji-storefront/next.config.ts`) to allow Strapi domain for Next `<Image>` remotePatterns.

## 3. Data layer (`apps/dji-storefront`)
- New file `src/lib/data/blog.ts` with:
  - `listPosts({ page, pageSize, locale })`: GET `/api/posts?populate=cover_image,author&pagination[page]=...`.
  - `getPost(slug: string)`: GET `/api/posts?filters[slug][$eq]=...&populate=cover_image,author`.
  - Types `StrapiPostResponse` and internal `BlogPost` (id, title, slug, excerpt, content, coverImageUrl, publishedAt, authorName).
  - Map Strapi attributes to internal type; handle missing media gracefully.
  - Provide `getFeaturedPosts()` if blog hero needs curated entries (use Strapi filters or tags).
- Add caching tags (`blog`) or `revalidate: 60`. Optionally create `revalidateStrapiBlog()` helper.

## 4. Blog listing page
- Update `apps/dji-storefront/src/app/[countryCode]/blog/page.tsx`:
  - Fetch paginated posts via `listPosts`.
  - Pass data + pagination meta to Blog components.
  - Handle empty state (“No articles yet”).
  - Configure `generateMetadata` to use Strapi SEO defaults (fallback to static strings).
- Implement pagination controls (if Strapi returns `pagination.pageCount > 1`).

## 5. Blog detail page
- Update `apps/dji-storefront/src/app/[countryCode]/blog/[slug]/page.tsx`:
  - Use `getPost(slug)` to fetch single article.
  - `generateStaticParams` can prefetch slugs (or leave dynamic with `revalidate`).
  - Render content:
    - If Strapi returns Markdown → use `remark/rehype`.
    - If Strapi rich text JSON → use compatible renderer component.
  - Display cover image, author info, published date.
  - Update metadata with article SEO/OG details.

## 6. Components updates
- Adjust `BlogCard`, `BlogHero`, `BlogDetail` (wherever blog UI lives) to consume `BlogPost` shape.
- Ensure components handle missing images or author gracefully.
- Add skeleton/loading states if using Suspense on blog listing.

## 7. Revalidation workflow
- Option A: Use incremental static regeneration (`export const revalidate = 300`) for blog routes.
- Option B: Add Strapi webhook to hit `/api/revalidate?tag=blog` when content changes.
- Document webhook configuration in Strapi (Settings → Webhooks).

## 8. Testing & DX
- Manual test scenarios:
  - Blog list loads real Strapi posts, pagination works.
  - Detail page renders content, SEO tags populated.
  - Strapi offline → graceful fallback message.
- Update README/docs:
  - Steps to run Strapi locally (`cd apps/strapi && pnpm develop`).
  - Required `.env` variables for storefront.
  - Sample Strapi seed data or instructions to create posts.
- Lint & type-check.

## 9. Future enhancements (optional)
- Add “related posts” by category/tag from Strapi.
- Implement search/filter bar hitting Strapi query params.
- If Strapi multi-language is enabled, wire locale via `locale` query parameter tied to `[countryCode]`.

## Appendix: Strapi Admin Checklist
1. **启动 Strapi**
   - `cd apps/strapi && pnpm develop`（默认 http://localhost:1337）。
2. **创建内容类型**
   - Admin → *Content Type Builder* → 新建 `Post` Collection Type，添加字段：
     - `title` (Text)、`slug` (UID, target `title`)、`excerpt` (Text)、`content` (Rich Text/Markdown)、`cover_image` (Media)、`published_at` (DateTime default now)、`author` (Component或 Relation) 以及可选 `seo` component。
   - 保存并允许 Strapi 重启以应用 schema。
3. **添加示例文章**
   - Admin → *Content Manager* → `Post` → Create。
   - 填写标题/简介/正文，上传封面图（若已配置 R2 则直接上传到 R2）。
   - 设置 `slug`，确认 `Published` 状态。
4. **配置 API 权限**
   - Admin → *Settings* → *Roles* → `Public` → Permissions。
   - 在 `Post` 下勾选 `find`、`findOne`，保存。
   - 若使用 API Token：Settings → *API Tokens* → Create token（Full access 或自定义 `find`/`findOne`）。
5. **确认 API 可用**
   - 访问 `http://localhost:1337/api/posts?populate=cover_image,author`。
   - 确认返回的 `data` / `attributes` 包含文章内容与图片 URL。
6. **记录配置**
   - 将 `STRAPI_API_URL`、`STRAPI_API_TOKEN`（如有）填入 `apps/dji-storefront/.env`。
   - 若使用 CDN/R2，自定义媒体域名并更新前端 `resolveStrapiMedia`。
7. **配置 Webhook → 触发 Next ISR**
   - Admin → *Settings* → *Webhooks* → *Create new webhook*。
   - Name: `Next Blog Revalidate`（随意）。
   - URL: `https://<next-host>/api/revalidate?tag=blog&secret=<REVALIDATE_SECRET>`（本地可用 `http://localhost:3000`）。
   - Headers: 可选地添加 `Content-Type: application/json`，其余留空。
   - Events: 仅勾选 `Entry.publish`、`Entry.unpublish`（collection: `Post`）。
   - 保存后点击 *Trigger* 测试：Strapi 应返回 `{"success":true,"tag":"blog"}`。

执行完以上步骤后，Next.js 端即可按计划中的数据层实现对 Strapi 实例的访问。
