# Next.js SSR vs ISR

## Server-Side Rendering (SSR)
- **What it is**: Every request hits the Next.js server, which fetches data and renders HTML on the fly.
- **How to enable**: Default behavior when you omit `revalidate` and use `fetch(..., { cache: "no-store" })` or set `export const dynamic = "force-dynamic"`.
- **When to use**: Per-user or fast-changing data (carts, dashboards, anything tied to auth/session/cookies) where stale content is unacceptable.
- **Trade-offs**: Higher latency and server cost; no built-in caching unless you add your own layer.

## Incremental Static Regeneration (ISR)
- **What it is**: Pages are statically generated once, then re-rendered in the background after a timeout or when you call `revalidateTag`/`revalidatePath`.
- **How to enable**: Set `export const revalidate = N` on the page/route or pass `fetch(..., { next: { revalidate: N, tags: ["tag"] } })`. You can also trigger on-demand revalidation via an API route (e.g., `/api/revalidate?tag=blog`).
- **When to use**: Mostly-static content (blogs, marketing pages, product marketing sections) where a brief delay before updates appear is acceptable.
- **Trade-offs**: Risk of serving slightly stale data until the TTL expires or a manual revalidation runs.

## Choosing the Right Strategy
| Use Case | Recommended Rendering |
| --- | --- |
| Personalized dashboards, carts, inventory levels | **SSR / `cache: "no-store"`** |
| CMS-driven marketing copy, hero banners | **ISR with `revalidate = 300`** |
| Hybrid pages (static sections + live widgets) | Mix ISR for static pieces and SSR/AJAX for live data |

## Common Patterns
1. **Static + ISR**
   ```ts
   export const revalidate = 3600
   const data = await fetch(url, { next: { revalidate: 3600, tags: ["blog"] } })
   ```
   CMS webhook: `POST /api/revalidate?tag=blog` to push updates immediately.

2. **Mixed Rendering**
   - Page uses ISR for layout; individual components fetch with `cache: "no-store"` to stay real-time.

3. **On-demand ISR**
   - Generate static params for known slugs, then call `revalidatePath('/products/[handle]')` whenever a product changes.

## Key Takeaways
- SSR guarantees freshest data but costs runtime performance.
- ISR bridges static performance with eventual consistency—great for content that changes occasionally.
- Always pair ISR with a revalidation plan (scheduled TTL + webhook) so editors can push updates without redeploys.
