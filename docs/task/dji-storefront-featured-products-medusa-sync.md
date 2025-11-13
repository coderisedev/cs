# Task: Homepage Featured Products from Medusa

## Goal
Ensure the "Featured Products" section on `apps/dji-storefront` home page displays the live Medusa catalog items that belong to the `featured` collection, limited to four entries, instead of filtering a full product list client-side.

## Background
- Current implementation (`apps/dji-storefront/src/app/[countryCode]/page.tsx`) calls `getProducts({ countryCode })` then filters by `product.collection === "featured"` and slices top 8.
- `getProducts` pulls the entire paginated list from `/store/products`, which is unnecessary for the homepage and may miss future backend logic (e.g., when more than 12 products exist, pagination would hide some featured items).
- Medusa already exposes collection filters; we should use them directly and keep the response size small.

## Implementation Plan
1. **Audit data helpers**
   - Reconfirm how `getProducts` and `listProducts` resolve regions, caching, and API params in `apps/dji-storefront/src/lib/data/products.ts`.
   - Reuse `mapStoreProduct` so the homepage still receives `StorefrontProduct` objects.

2. **Add collection-specific helper**
   - Introduce `getProductsByCollectionHandle(handle: string, options)` (or similar) within `lib/data/products.ts`:
     - Resolve the collection ID by calling `getCollectionByHandle(handle)` from `lib/data/collections.ts`.
     - Call `sdk.client.fetch('/store/products', { query: { collection_id, limit, region_id, ... } })` with `limit = 4`, `fields` including `variants.inventory_quantity` + `calculated_price`.
     - Reuse existing caching (`getCacheOptions('products-featured')` or similar tag) and region resolution logic to ensure currency correctness.
     - Return `StorefrontProduct[]` via `mapStoreProduct`.
     - Handle missing collection gracefully (return empty list, log warning).

3. **Update HomePage data fetching**
   - In `apps/dji-storefront/src/app/[countryCode]/page.tsx`:
     - Replace the `getProducts({ countryCode })` call with the new helper: `getProductsByCollectionHandle('featured', { limit: 4, countryCode })`.
     - Keep `getCollections` for other sections but drop the manual `.filter(...).slice(...)` logic.
     - Ensure the section handles cases where fewer than four products are returned (no change to UI needed—map over whatever array is returned).

4. **Validation**
   - Run `pnpm lint apps/dji-storefront` (or repo-wide lint) to catch typing/import errors.
   - Optionally run a local or preview build to confirm a single Medusa request returns the expected featured products and the UI reflects real availability/pricing.
   - After deployment, hit `/api/revalidate?tag=products-<cacheId>&secret=<secret>` for any affected `_medusa_cache_id` to bust stale caches, even though `getProducts` now uses `cache: "no-store"`.

## Deliverables
- New helper and tests (if applicable) under `apps/dji-storefront/src/lib/data/products.ts`.
- Updated homepage using the helper.
- Documentation snippet in commit message or PR summary referencing this task.
