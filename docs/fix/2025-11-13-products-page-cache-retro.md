# Fix Retrospective: Products Page Missing Featured Items

## Context
- Environment: `apps/dji-storefront` (Next.js App Router) pointing to the live Medusa backend.
- Symptom: `/us/products` rendered only 4 legacy products even though Medusa contained 5 active items (including the CS 320A MCDU). Homepage Featured section showed all 4 featured entries correctly, leading to inconsistent user experience.

## Timeline & Investigation
1. **Initial Observation**: Homepage (using `getProductsByCollectionHandle('featured')`) correctly displayed the new Medusa product. `/us/products` still showed stale data.
2. **Hypothesis**: Query limit was trimming results. Rejected after verifying Medusa catalog only had 5 products total.
3. **Cache Analysis**:
   - `getProducts` → `listProducts` used `getCacheOptions("products")` and set `cache: "force-cache"` whenever `_medusa_cache_id` cookie existed.
   - `/us/products` is statically rendered per cache tag, so the first user to visit after deploy pinned the `/store/products` response in Next data cache.
4. **Dev Server Reproduction**: Running `pnpm --filter dji-storefront dev` with Cloudflare Tunnel reproduced the issue, proving the cache lived client-side (cookie) rather than the hosted environment.
5. **Resolution Strategy**: Force product queries to always hit Medusa (no caching) and add an explicit revalidation hook for edge cases.

## Fixes Implemented
1. **Bypass caching for product listings** (`apps/dji-storefront/src/lib/data/products.ts`):
   - Replace the `force-cache` usage with `{ next: { revalidate: 0 }, cache: "no-store" }`.
   - Ensures `/store/products` is fetched fresh on every request regardless of `_medusa_cache_id`.
2. **Expose product cache revalidation API** (`apps/dji-storefront/src/app/api/revalidate/route.ts`):
   - Accept `tag=products-<cacheId>` and call `revalidateTag(tag)` after verifying the revalidation secret.
   - Allows ops to manually bust caches if we reintroduce caching later.
3. **Documentation Update** (`docs/task/dji-storefront-featured-products-medusa-sync.md`):
   - Added guidance to trigger `/api/revalidate` after deployments if needed.

## Validation
- Cleared `_medusa_cache_id` cookie (or used a new browser session) and confirmed `/us/products` instantly showed all 5 products.
- Homepage continued to show the same featured items (still powered by `getProductsByCollectionHandle`).
- `pnpm --filter dji-storefront lint` passed.

## Lessons Learned
- When Next.js data fetching depends on user cookies, cache tags can easily lead to stale data if we don’t implement explicit revalidation triggers.
- Product catalog endpoints should generally use `cache: "no-store"` unless we have a robust invalidation pipeline.
- Documenting “refresh” procedures (e.g., hitting `/api/revalidate`) helps ops teams recover quickly without digging through code.

## Follow-ups
- Consider adding pagination or infinite scrolling on `/us/products` so we can keep limiting responses without hiding items.
- Evaluate whether other data helpers (collections, regions) also need shorter cache windows or revalidation endpoints.
