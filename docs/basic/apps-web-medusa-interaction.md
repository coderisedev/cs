# apps/web ↔︎ Medusa Interaction Summary

## SDK & Configuration
- `apps/web/src/lib/config.ts` instantiates a single `@medusajs/js-sdk` client with `MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, and `debug` flags.
- All data helpers import this client, keeping base URL/publishable key usage consistent across server and client actions.

## Server-Only Data Layer
- Modules in `apps/web/src/lib/data/*` are annotated with "use server" and run inside Next.js server components/routes.
- Each helper (e.g., `listProducts`, `retrieveCart`, `retrieveCustomer`) calls the SDK (`sdk.client.fetch` or `sdk.store.*`) and returns typed `HttpTypes.*` entities.
- Authentication headers come from `getAuthHeaders()` which reads the `_medusa_jwt` cookie; cache tags come from `getCacheOptions()`.
- When the backend is unreachable, helpers fall back to deterministic mock data (`lib/data/mock-data.ts`) so pages continue to render.

## Cart & Customer State
- Cookies module manages `_medusa_cart_id`, `_medusa_jwt`, and `_medusa_cache_id`.
- Cart helpers (`getOrSetCart`, `addToCart`, `updateLineItem`) ensure a cart exists for the visitor’s region, persist the cart ID in cookies, and revalidate cache tags (`revalidateTag('carts')`).
- Layouts fetch cart/customer on the server to hydrate navigation, free-shipping nudges, etc.

## Region-Aware Routing
- Middleware fetches `/store/regions` (using the publishable key) to map country codes and rewrites URLs to `/[countryCode]/…`.
- Data loaders require either `countryCode` or `regionId`, ensuring product pricing, taxes, and cart region assignments match the user’s locale.

## Cache & Fallback Strategy
- Fetches include `next: { tags }` and `cache: 'force-cache'` so Medusa responses are cached per `_medusa_cache_id`.
- Mutations revalidate tags (carts, fulfillment, regions).
- Mock regions/products/orders guarantee graceful degradation during setup/offline scenarios.

## Takeaway for apps/dji-storefront
- Mirror the same pattern: single SDK client, server-only data helpers, cookie-backed auth/cart state, region middleware, and cache-tag awareness. This forms the blueprint for migrating dji-storefront from mock data to live Medusa APIs.
