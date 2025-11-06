# DJI Storefront Medusa Integration Plan

## Goal
Replace the current mock data layer in `apps/dji-storefront` with the production-ready Medusa backend architecture used by `apps/web`, including auth/cart cookies, region awareness, and cache tagging.

## Background Context
- `apps/dji-storefront` still relies on the local `@cs/medusa-client` mock APIs. None of its product/cart/account flows talk to real Medusa endpoints.
- `apps/web` already implements the full integration via `@medusajs/js-sdk`, region middleware, cookie-backed cart/auth state, cache tagging, and graceful fallbacks. We will mirror that structure.
- Key pieces to copy:
  - **SDK client** (`apps/web/src/lib/config.ts`) providing a single Medusa client configured via `MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
  - **Cookie + cache helpers** (`apps/web/src/lib/data/cookies.ts`) for `_medusa_jwt`, `_medusa_cart_id`, `_medusa_cache_id`.
  - **Region middleware** (`apps/web/src/middleware.ts`) that rewrites URLs to `/[countryCode]/…` and ensures region IDs exist.
  - **Server-only data modules** (`apps/web/src/lib/data/*`) that fetch `/store/*` endpoints, attach auth/cache headers, and fall back to mock data when necessary.
  - **Cart/account helpers** (`retrieveCart`, `getOrSetCart`, `retrieveCustomer`, etc.) plus `revalidateTag` usage after mutations.
- Dependencies: a running Medusa backend (local/hosted) with regions, products, and publishable key configured; `.env.local` must expose the same variables as `apps/web`.

## Work Breakdown

### Phase 0 – Foundations
- **Task 0.1:** Add Medusa SDK deps (`@medusajs/js-sdk`, `@medusajs/types`) and update `package.json` + lockfile.
- **Task 0.2:** Create `src/lib/medusa.ts` mirroring `apps/web/src/lib/config.ts`; wire env vars to `next.config.js` if needed.
- **Task 0.3:** Introduce `src/lib/server/cookies.ts` (`"use server"`) with `getAuthHeaders`, `getCacheOptions`, cart ID helpers.
- **Task 0.4:** Document required env vars in `README.md`.

### Phase 1 – Region + Routing
- **Task 1.1:** Port middleware from `apps/web/src/middleware.ts`, adjust import paths.
- **Task 1.2:** Build `src/lib/data/regions.ts` (`getRegion`, `retrieveRegion`, mock fallbacks) using the new SDK client.
- **Task 1.3:** Update app routes/layouts to accept `countryCode`; add route-level validation + redirects if missing.
- **Task 1.4:** Seed mock region data equivalent to `apps/web/src/lib/data/mock-data.ts` for offline dev.

### Phase 2 – Data Fetchers
- **Task 2.1:** Recreate `products`, `collections`, `categories`, `landing` fetchers under `src/lib/data/*`, copying logic from `apps/web` but pointing to dji-storefront schema.
- **Task 2.2:** Ensure each helper calls `getAuthHeaders` + `getCacheOptions` and returns `HttpTypes.*` responses.
- **Task 2.3:** Replace component imports to use the new helpers (e.g., `app/page.tsx`, `/products`).
- **Task 2.4:** Maintain mock fallback data and add feature flag/env to toggle between live vs mock sources.

### Phase 3 – Cart & Account APIs
- **Task 3.1:** Port cart helpers (`retrieveCart`, `getOrSetCart`, `addToCart`, `updateLineItem`, etc.) and integrate cookie setters.
- **Task 3.2:** Port checkout/payment helpers (`listCartOptions`, `submitOrder` as applicable).
- **Task 3.3:** Wire account/order pages to the new data; handle empty states + skeletons for real data.
- **Task 3.4:** Validate error handling and fallback paths when Medusa is offline.

### Phase 4 – Client Components & Hooks
- **Task 4.1:** Update client-facing components (add-to-cart buttons, product detail actions) to call server actions via form/actions or dedicated API routes.
- **Task 4.2:** Ensure revalidation of cache tags after mutations (`revalidateTag('carts')`, `('fulfillment')`).
- **Task 4.3:** Update environment docs + Next runtime config to expose publishable key where needed.
- **Task 4.4:** Remove or gate the legacy mock Medusa client to avoid duplicate sources of truth.

### Phase 5 – Validation & Rollout
- **Task 5.1:** Manual regression across regionized routes (product list, PDP, cart, checkout, account) using live backend data.
- **Task 5.2:** Add smoke tests or scripted checks that hit the real Medusa backend (optional but recommended).
- **Task 5.3:** Capture before/after screenshots/logs, update docs (`apps-web-medusa-interaction.md`) with any deviations.
- **Task 5.4:** Once stable, delete mock fallback toggles or document how to switch between modes.

## Dependencies
- Running Medusa backend (local or hosted) with regions, products, and publishable key configured.
- Environment variables mirrored in `.env.local` for dji-storefront.

## Deliverables
- Medusa SDK client + shared cookie helpers in `apps/dji-storefront`.
- Middleware + region-aware routing identical to `apps/web`.
- All data/helpers using `/store/*` endpoints with cache tags + fallbacks.
- Documentation updates in `README.md` and `docs/basic/apps-web-medusa-interaction.md` referencing the new integration.
