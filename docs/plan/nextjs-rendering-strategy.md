# Next.js Rendering Strategy Plan

## Principles
1. **Dynamic/Personalized = SSR**
   - Use `cache: "no-store"` (or `export const dynamic = "force-dynamic"`) for carts, account data, live inventory/prices.
   - Rationale: Data depends on cookies or fast-changing stock; stale copies create security/accuracy risks.

2. **Content-Heavy Modules = ISR + Revalidation Plan**
   - For CMS/marketing sections (hero copy, featured collection summaries) set `next: { revalidate: N, tags: ["featured-products"] }`.
   - Pair with webhook/API (`/api/revalidate?tag=featured-products`) so editors can push updates immediately.

3. **Mix & Match**
   - Pages can mix strategies: keep the overall layout ISR, but inject SSR components for live widgets—or flip it (dynamic page with ISR sub-sections via client fetch).

4. **Clear Cache Tagging**
   - Define tags per data domain (`products-<cacheId>`, `blog`, `collections`). Use `revalidateTag(tag)` in admin hooks or after data mutations.
   - Ensures targeted invalidation instead of full redeploys.

5. **Developer Ergonomics**
   - In dev mode, disable cache middleware (`NEXT_SKIP_REGION_MIDDLEWARE=true`) or force `cache: "no-store"` to avoid cookie-driven stale data.
   - Document refresh procedures and add runbooks so ops knows when/how to call `/api/revalidate`.

## Action Items
- Audit every data helper in `apps/dji-storefront/src/lib/data` and classify as SSR or ISR.
- Add/confirm webhook triggers from Strapi & Medusa admin events to `/api/revalidate` endpoints for relevant tags.
- Update onboarding docs (AGENTS.md / runbooks) with the rendering strategy to keep new contributors aligned.
