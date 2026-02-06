# CS Storefront (Next.js)

Design-first storefront that mirrors every Cockpit Simulator mobile screen using the CS design system. Until a real Medusa backend is reachable, the app uses the deterministic mock client in `packages/medusa-client` for regions, products, collections, orders, and addresses. As we migrate to the real backend, the app now ships with the Medusa SDK + cookie helpers so you can point it at a live server when ready.

## Environment variables

Create `apps/dji-storefront/.env.local` (or rely on repo-level env injection) with:

| Name | Example | Description |
| ---- | ------- | ----------- |
| `MEDUSA_BACKEND_URL` | `http://localhost:9000` | Base URL for the Medusa server. Defaults to `http://localhost:9000` if unset. |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_test_xxx` | Publishable API key generated in Medusa Admin (exposed to the browser). |
| `MEDUSA_PUBLISHABLE_KEY` | `pk_test_xxx` | Optional server-only fallback for the same publishable key (useful when the `NEXT_PUBLIC` variant is not defined in a given environment). |
| `NEXT_PUBLIC_DEFAULT_REGION` | `us` | Fallback country code if middleware cannot geolocate the visitor. |
| `STRAPI_API_URL` | `http://localhost:1337` | Base URL for the Strapi CMS powering the blog. |
| `STRAPI_API_TOKEN` | `strapi_xxx` | Server-side token used to authorize blog API calls (kept private). |
| `REVALIDATE_SECRET` | `changeme` | Optional shared secret required by `/api/revalidate` before triggering cache busts. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `...apps.googleusercontent.com` | Required to enable Google One Tap / OAuth popups. |
| `NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP` | `true` | Toggle to render the One Tap button (requires the client ID). |
| `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_POPUP` | `true` | Toggle for the Google popup-based OAuth button. |
| `NEXT_PUBLIC_ENABLE_DISCORD_OAUTH` | `false` | Enable the Discord popup button once Medusa’s Discord provider is configured. |
| `NEXT_PUBLIC_ENABLE_FACEBOOK_OAUTH` | `false` | Enable the Facebook popup button. |
| `NEXT_PUBLIC_ENABLE_DISCORD_OAUTH` | `false` | Enable the Discord login button once Medusa’s Discord provider is configured. |
| `NEXT_PUBLIC_ENABLE_FACEBOOK_OAUTH` | `false` | Enable the Facebook login button once Medusa’s Facebook provider is configured. |

> When these env vars are **not** defined the storefront continues to run purely on mock data; once defined, subsequent phases of the migration will start calling the live `/store/*` endpoints.

### Social OAuth entry-points

- `/auth/[provider]` and `/auth/[provider]/callback` handle the OAuth flow for `google`, `discord`, and `facebook`. The routes proxy through Next.js, call Medusa’s `/auth/customer/<provider>` endpoints, and redirect the browser back to the storefront once a session is issued (no postMessage/popup bridge required).
- Set the corresponding `NEXT_PUBLIC_ENABLE_*` env variable to `true` (and configure the Medusa provider) before surfacing each button in the login form. Buttons perform a full-page navigation so users complete the flow in a regular tab instead of a constrained popup window.

### Strapi content service

1. `pnpm --filter strapi develop` to boot the CMS at `http://localhost:1337`.
2. Create a `Post` collection type with the fields from `docs/task/strapi-blog-integration.md`, publish a few entries, and create an API token with `find`/`findOne` scopes.
3. Copy `apps/dji-storefront/.env.example` → `.env.local`, fill in `STRAPI_API_URL` and `STRAPI_API_TOKEN`, then restart the Next.js dev server.
4. Blog routes (`/us/blog` and `/us/blog/[slug]`) use ISR (`revalidate = 300`) plus the `blog` cache tag—point a Strapi webhook at `/api/revalidate?tag=blog&secret=$REVALIDATE_SECRET` so published/unpublished posts call `revalidateStrapiBlog()` instantly.
5. Manual QA: verify the blog list paginates correctly, individual posts render markdown + SEO tags, and shutting down Strapi shows the graceful fallback banner on the listing page.

## Local commands

```bash
# start the mock-backed dev server
pnpm --filter dji-storefront dev

# run lint with the repo guardrails (no medusa/ui imports, etc.)
pnpm lint:dji-storefront

# production build & start
yarn --filter dji-storefront build && pnpm --filter dji-storefront start

# Storybook (visual review of the CS UI kit)
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
