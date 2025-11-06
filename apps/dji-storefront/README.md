# DJI Storefront (Next.js)

Design-first storefront that mirrors every Cockpit Simulator mobile screen using the DJI design system. Until a real Medusa backend is reachable, the app uses the deterministic mock client in `packages/medusa-client` for regions, products, collections, orders, and addresses.

## Local commands

```bash
# start the mock-backed dev server
pnpm --filter dji-storefront dev

# run lint with the repo guardrails (no medusa/ui imports, etc.)
pnpm lint:dji-storefront

# production build & start
yarn --filter dji-storefront build && pnpm --filter dji-storefront start

# Storybook (visual review of the DJI UI kit)
pnpm --filter dji-storefront storybook    # dev
pnpm storybook:dji-storefront             # static build

# Validate the mock data layer
pnpm test:mock-medusa
```

> The repo-level scripts `lint:dji-storefront`, `build:dji-storefront`, `storybook:dji-storefront`, and `test:mock-medusa` are wired for CI and local QA. They intentionally use pnpm filters so they continue working when new apps/packages are added.

## Manual validation checklist

Because this environment cannot hit the real Medusa backend, validate flows with the mock client in Chrome/Edge DevTools (toggle iPhone/Pixel breakpoints) and desktop:

1. `/` (landing)
   - Hero CTA buttons navigate to `/products` and `/collections/a320-series`.
   - KPI cards show mock cart subtotal/region info and update after editing `packages/medusa-client` data.
2. `/products`
   - Grid renders at least four cards; prices match `packages/medusa-client` dataset.
   - “Popular collections” cards list sample products pulled from `listCollections(includeProducts: true)`.
3. `/collections/[handle]`
   - Static params exist for featured, airbus, boeing collections; 404 for unknown handles.
   - Product grid filters to only the collection’s product handles.

You can capture screenshots for design sign-off with `pnpm --filter dji-storefront storybook` (component view) and the running dev server (page view). Note any deviations from `docs/basic/dji-design-system-analysis.md` in the implementation plan.

## Mock environment & limitations

- All data flows go through `packages/medusa-client`; swapping to a real Medusa backend later only requires changing the data helpers under `src/lib/data/*`.
- Checkout/payment flows are intentionally stubbed—use the mock cart totals to verify UI only.
- For cross-device checks, use responsive mode in DevTools or an external service (e.g., BrowserStack) and link the screenshots in the implementation plan (Phase 4 sign-off section).
