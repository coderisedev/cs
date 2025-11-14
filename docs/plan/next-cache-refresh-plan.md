# Next.js Cache & Auto-Refresh Implementation Plan

## Goals
1. Keep `/us`, `/collections/[handle]`, `/products/[handle]`, and `/blog/*` pages fast using ISR and edge caching.
2. Automatically invalidate caches when Medusa products/collections or Strapi posts are published so new releases appear immediately.
3. Provide observability and fallback windows so stale data never persists silently.

## Workstreams

### 1. Audit & Stabilize Fetch Policies
- [ ] Document current `cache` / `next.revalidate` settings for each data helper under `apps/dji-storefront/src/lib/data/*`.
- [ ] Ensure any request requiring credentials (`/store/*`, Strapi token auth) uses `cache: "no-store"` or `revalidate: 0`.
- [ ] Retain `force-cache` only for static assets or mock fallbacks.
- [ ] Add unit comments to highlight which helpers rely on ISR vs. SSR.

### 2. Tag-Based ISR for Strapi
- [ ] Confirm blog routes already call `revalidateTag("blog")`; refactor if necessary.
- [ ] Create `/api/revalidate/strapi` route that validates `secret` and `tag` query params before calling `revalidateTag(tag)`.
- [ ] Configure Strapi webhook (Posts collection) to POST to `/api/revalidate/strapi?tag=blog&secret=...` on publish/unpublish.
- [ ] Smoke test by publishing a draft post and verifying `curl -I https://prd.aidenlux.com/us/blog` returns `x-vercel-cache: MISS` immediately.

### 3. Tag-Based ISR for Medusa Products/Collections
- [ ] Add cache tags in data loaders (`revalidateTag("products")`, `revalidateTag("collections")` as appropriate).
- [ ] Create `/api/revalidate/medusa` route that accepts payloads from Medusa webhooks (new product, update, collection change).
- [ ] Update Medusa admin or automation scripts to call the route whenever a product is published or featured.
- [ ] For Featured grid, call `revalidateTag("featured-products")` and ensure the home page uses that tag.
- [ ] Validate by toggling a product’s featured flag and checking `/us` flushes immediately.

### 4. Scheduled TTL Safety Nets
- [ ] For routes without webhooks (e.g., `/us` hero copy), set `export const revalidate = 300` to refresh every 5 minutes.
- [ ] Document TTL per route in `docs/basic/next-isr-matrix.md` (new file) so ops know expected freshness.

### 5. Observability & Alerts
- [ ] Add a lightweight cron (GitHub Actions or external monitor) that hits `/api/health/featured`—a new API endpoint returning the size of the featured collection.
- [ ] If the endpoint returns 0 or errors, alert #ops with context (HTTP status, timestamp).
- [ ] Add log lines in the revalidate API routes to confirm webhook calls (with request IDs).

### 6. Runbooks & Docs
- [ ] Update `docs/runbooks/rebuild-strapi-medusa-images.md` with the new revalidate routes and when to invoke them manually.
- [ ] Create `docs/runbooks/vercel-cache-bust.md` describing how to trigger `/api/revalidate/*` when urgent (e.g., manual cURL command).
- [ ] Extend `docs/basic/medusa-region-setup.md` with the required webhook configuration.

## Timeline
- **Day 1-2**: Finish audit, adjust fetch policies, land Strapi revalidation route.
- **Day 3-4**: Medusa webhook route + tagging, update docs.
- **Day 5**: Add monitoring endpoint and cron, run end-to-end test (publish new product, verify auto-refresh).

## Validation Checklist
- [ ] `pnpm --filter dji-storefront lint && pnpm --filter dji-storefront build` succeed after each change.
- [ ] Playwright smoke hits `/us` before/after webhook to confirm Featured cards update.
- [ ] Strapi publish event triggers `x-vercel-cache: MISS` on blog detail pages immediately.

## Risks & Mitigations
- **Webhook secrets leaking**: store `REVALIDATE_SECRET` and `MEDUSA_REVALIDATE_SECRET` in Vercel env; reject requests without correct secret.
- **Webhook failures**: TTL fallback ensures data refresh within 5 minutes even if revalidate route is down.
- **Over-invalidating cache**: Tag only the necessary routes (e.g., `featured-products`, `collections-{handle}`) to avoid global flushes.
