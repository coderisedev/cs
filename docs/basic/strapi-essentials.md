# Strapi Essentials for DJI Storefront

## 1. Content Models
- Use Strapi Admin to create/modify collection types (e.g., `Post`). Typical fields: `title`, `slug` (UID), `excerpt`, `content`, `cover_image`, `published_at`, `author`, optional `seo` component.
- `published_at` controls visibility. Only published entries are returned to public APIs.

## 2. API Access & Permissions
- REST endpoints follow `/api/{collection}?populate=...` and return `{ data, meta }`. Each item has `{ id, attributes }`.
- Use `populate=cover_image,author` to fetch relations/media. Add `pagination[page]`/`pageSize` as needed.
- Grant Public role the `find`/`findOne` permissions or create an API token and send `Authorization: Bearer <token>`.
- Default dev URL: `http://localhost:1337`. Media URLs may be relative.

## 3. Media Handling
- Media fields live under `attributes.<field>.data.attributes.url`. Prepend `STRAPI_API_URL` when the path is relative.
- Allow Strapi domain in Next.js `next.config.js` remotePatterns for `<Image>`.

## 4. Environment & Helpers
- Add `STRAPI_API_URL` (and optional `STRAPI_API_TOKEN`) to `apps/dji-storefront/.env`. Share defaults in `.env.example`.
- Create a Strapi fetch helper (e.g., `getStrapiClient`) to inject base URL, headers, and handle errors uniformly.
- Provide utility `resolveStrapiMedia(url)` to normalize asset URLs.

## 5. Data Mapping & Rendering
- Parse Strapi responses by accessing `data[].attributes`. Map to internal `BlogPost` type (id, title, slug, excerpt, content, coverImageUrl, author, publishedAt, seo info).
- If `content` is Markdown, render with `remark`/`rehype`. If it’s Strapi rich text JSON, use a compatible renderer.
- Use Strapi `meta.pagination` for paging UI.
- In Next.js `generateMetadata`, prefer Strapi SEO fields (meta title/description/og image) with defaults.

## 6. Revalidation & Webhooks
- For ISR: set `export const revalidate = N` or use cache tags (`revalidateTag('blog')`).
- For real-time updates: configure Strapi Webhook (Settings → Webhooks) to call Next.js revalidation endpoint when content is published.

## 7. Local Dev Workflow
- Run Strapi locally: `cd apps/strapi && pnpm develop` (or `npm run develop`). Default DB is SQLite in `.tmp/data.db`.
- Seed posts via Strapi Admin before testing storefront.
- Update README/docs with steps: start Strapi, set `.env`, run `pnpm --filter dji-storefront dev`.

## 8. Debug Tips
- Use Strapi API Explorer/Postman to test `GET /api/posts?populate=*`.
- If requests fail with 401/403, check permissions or token configuration.
- For CORS, configure `config/middlewares.js` (`settings.cors.origin`) to allow the Next.js host.

Mastering these areas will let you plug Strapi’s live content into the storefront (e.g., blog) without relying on mock data.

## 9. Uploading Media to Cloudflare R2
- Create an R2 bucket and API token in Cloudflare; record `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.
- Install the S3-compatible provider in Strapi (`pnpm add strapi-provider-upload-s3`).
- Configure `upload` plugin (e.g., in `config/plugins.ts`):
  ```ts
  export default () => ({
    upload: {
      config: {
        provider: "aws-s3",
        providerOptions: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          params: { Bucket: process.env.R2_BUCKET },
          s3ForcePathStyle: true,
          signatureVersion: "v4",
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  })
  ```
- Add env vars (`R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) to `.env`.
- Restart Strapi; new uploads now land in R2. If using a custom CDN domain, adjust your media URL resolver to prepend the CDN base URL.
