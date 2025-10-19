# Technical Specification: Commerce Core & Catalog Experience

Date: 2025-10-19
Author: Aiden Lux
Epic ID: 2
Status: Draft

---

## Overview

This epic delivers the Commerce Core & Catalog Experience described in the PRD, enabling customers to browse a seeded hardware catalog, explore product detail pages enriched with Strapi content, and progress toward checkout with accurate availability messaging. It hardens Medusa’s store configuration for multi-region currency, ensures inventory synchronization, and wires the storefront’s discovery flows to the underlying commerce services so merchandising and marketing can launch confidently.

Work accelerates the solution architecture’s composable commerce vision by pairing Next.js App Router server components with the typed Medusa SDK and Strapi-driven recommendations. The resulting experience builds the shippable foundation for subsequent checkout and post-purchase epics while satisfying the performance, accessibility, and observability expectations captured across PRD, UX, and architecture deliverables.

## Objectives and Scope

**In Scope**
- Configure Medusa store metadata (currencies, regions, tax rules) and seed launch-ready hardware catalog entries with extended attributes (compatibility tags, media, guide references).
- Implement Next.js catalog listing, filtering, and PDP experiences with TanStack Query data access, server component hydration, and persistent currency selectors.
- Build cart service endpoints (create, update, persist) via `/api/catalog` and `/api/cart` BFF routes, ensuring availability and pricing indicators stay accurate across mini-cart and full cart experiences.
- Surface Strapi-powered recommendations, upsell slots, and contextual content across product and cart surfaces using the shared relations defined in the architecture.
- Instrument commerce interactions (search, filter, add-to-cart, recommendation clicks) through Segment analytics and OTEL spans while extending observability dashboards for conversion funnels.
- Document operations SOPs for catalog maintenance, media management, and Strapi↔Medusa linkage so non-technical teams can sustain the storefront.

**Out of Scope**
- Checkout orchestration, payment capture, and compliance scenarios handled in Epic 3.
- Account dashboard, order history, or downloads center functionality owned by later epics.
- Advanced promotions, loyalty programs, or dynamic bundling beyond curated upsell placements.
- Legacy data migration or brownfield remediation; project remains greenfield with placeholder notes only.

## System Architecture Alignment

Implementation follows the solution architecture blueprint by using the Next.js App Router `/shop` subtree with server components calling the shared Medusa SDK through `/api/catalog` BFF routes. TanStack Query caches catalog queries while revalidation hooks respond to Medusa and Strapi webhooks, preserving the edge caching regime defined for high-traffic pages. Catalog metadata persists inside Railway-hosted Medusa Postgres with Redis-backed inventory signals, and Strapi relations power recommendation slots to uphold the composable commerce model. Observability spans OTEL + Sentry instrumentation for product, cart, and search APIs, keeping telemetry consistent with the architecture’s defense-in-depth and analytics requirements.

## Detailed Design

### Services and Modules

| Module / Location                         | Responsibility                                                                                   | Inputs / Outputs                                                                                      | Owner     |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------- |
| `apps/medusa/src/config/store.ts`         | Define regions, currencies, tax settings, and inventory configuration to unlock multi-currency catalog operations. | Reads env-backed secrets; writes Medusa configuration records and seeded `region`/`currency` tables.      | Commerce  |
| `apps/medusa/src/services/catalog-extension-service.ts` | Extend product schema with compatibility metadata, media galleries, and recommendation hooks; emit stock level events. | Consumes Strapi relations + Redis cache; updates Postgres `product_metadata`, publishes Medusa domain events. | Commerce  |
| `apps/medusa/src/subscribers/strapi-link.ts` | Synchronize Strapi guide/download/showcase relations when catalog entries mutate.                 | Listens to Medusa product events; calls Strapi REST API using service token; logs telemetry to OTEL.     | Platform  |
| `apps/web/app/(shop)`                     | Implement catalog grids, PDPs, comparison tooling, and mini-cart UI using Next.js server components and TanStack Query. | Fetches via `/api/catalog` + `/api/content`; renders Shadcn UI primitives; emits analytics events.       | Frontend  |
| `apps/web/app/api/catalog/*`              | BFF endpoints that proxy Medusa catalog APIs with cache tagging, localization, and error normalization. | Accepts filter/search query params; returns normalized DTOs with cache tags for ISR/Streaming.           | Platform  |
| `apps/web/app/api/cart/*`                 | Server actions + REST handlers for cart create/update/remove flows with currency-aware totals and promo stubs. | Receives cart payloads; calls Medusa Admin API; returns `CartSnapshot` JSON and OTEL traces.            | Platform  |
| `packages/sdk/catalog`                    | Shared TypeScript client and zod schemas for catalog, product, facet, and cart DTOs.              | Imports Medusa/Strapi OpenAPI types; exports typed fetch helpers consumed by web, tests, and scripts.   | Platform  |
| `packages/ui/commerce`                    | Commerce component primitives (ProductCard, FilterDrawer, PriceBadge, StockBadge, RecommendationRail). | Receives typed props; renders accessibility-compliant UI; dispatches Segment instrumentation hooks.     | Frontend  |

### Data Models and Contracts

- **Medusa Product Extension (`product_metadata` JSONB)**  
  - Fields: `compatibility_tags: string[]`, `media_gallery: MediaAsset[]`, `guide_ids: string[]`, `showcase_ids: string[]`, `seo_schema: Record<string, unknown>`.  
  - Exposed through `CatalogProduct` DTO with currency-aware `price: MoneyAmount[]` and derived `availability_state: 'in_stock' | 'low' | 'backorder'`.

- **Variant Inventory Snapshot (`inventory_item` + Redis)**  
  - Persists `stocked_quantity`, `reserved_quantity`, `backorder_limit`; Redis cache stores `inventoryStatus:{variantId}` for rapid PDP reads.  
  - Medusa subscriber recalculates `availability_state` on stock change and invalidates cache tags for `/api/catalog/products`.

- **CatalogFacetResponse DTO**  
  - Returned by `GET /api/catalog/facets`; structure `{ categories: FacetOption[], compatibility: FacetOption[], priceRange: { min: number; max: number }, availability: FacetOption[] }`.  
  - Facet values generated from Medusa product metadata and Strapi taxonomies, cached for 30 minutes.

- **CartSnapshot DTO**  
  - Shape: `{ id, region_id, currency_code, items: CartItem[], subtotal, tax_total, shipping_total, grand_total, promotions: PromotionSummary[] }`.  
  - `CartItem` contains `product_id`, `variant_id`, `title`, `unit_price`, `quantity`, `availability_state`, `image`, `strapiGuideIds`.

- **RecommendationMapping Join**  
  - Table `product_recommendations` (Medusa) stores `{ product_id, related_product_id?, strapi_content_id, relation_type }` enabling PDP and cart upsell rails.  
  - Updated by `strapi-link` subscriber and surfaced via `/api/catalog/products/[id]/recommendations`.

- **Analytics Payload Contracts**  
  - Segment events: `Catalog Viewed`, `Product Viewed`, `Add To Cart`, `Recommendation Clicked`, `Cart Viewed`.  
  - Shared schema: `{ productId, sku, currency, region, availabilityState, filtersApplied?, contentId?, cartValue }`; validated via zod before dispatch.

### APIs and Interfaces

| Endpoint / Interface                              | Method / Signature                               | Request Parameters / Payload                                                                               | Response / Notes                                                                                                  |
| ------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `GET /api/catalog/products`                       | HTTP GET                                          | Query: `page`, `limit`, `sort`, `category`, `compatibility[]`, `availability`, `currency`, `q` (search term) | Returns `{ items: CatalogProduct[], pageInfo }`; attaches `Cache-Control` + `x-cache-tags: catalog,product-list`.  |
| `GET /api/catalog/products/[id]`                  | HTTP GET                                          | Path: `id` (Medusa product handle or UUID); Query: `currency`                                              | Returns `{ product, relatedContent, relatedProducts }`; hydrates Strapi-linked guides/showcases.                   |
| `GET /api/catalog/facets`                         | HTTP GET                                          | Optional `category`, `q`                                                                                   | Returns `CatalogFacetResponse`; cached for 30 minutes with ISR revalidation via `revalidateTag('catalog-facets')`. |
| `POST /api/cart`                                  | HTTP POST                                         | Body `{ regionId, currencyCode, customerId? }`                                                             | Creates Medusa cart; responds with `CartSnapshot`; sets `cartId` cookie (HttpOnly, 30-day TTL).                    |
| `POST /api/cart/line-items`                       | HTTP POST                                         | Body `{ cartId, variantId, quantity }`; server action secures Medusa token                                 | Returns updated `CartSnapshot`; emits Segment `Add To Cart` and OTEL span `cart.add_item`.                         |
| `PATCH /api/cart/line-items/[lineItemId]`         | HTTP PATCH                                        | Body `{ quantity }`                                                                                        | Updates quantity; recalculates totals; on zero quantity delegates to delete handler.                               |
| `DELETE /api/cart/line-items/[lineItemId]`        | HTTP DELETE                                       | Path parameter `lineItemId`; optional `cartId`                                                             | Removes item; returns new `CartSnapshot`; invalidates `revalidateTag('cart')`.                                     |
| `POST /api/cart/currency`                         | HTTP POST                                         | Body `{ cartId, currencyCode }`                                                                            | Calls Medusa `setRegion` then re-prices items; returns `CartSnapshot` with new totals.                             |
| `POST /api/webhooks/strapi/publish`               | HTTP POST (Webhook)                               | Strapi payload with content IDs                                                                            | Triggers recommendation sync, invalidates `catalog` tags, logs to Logtail.                                        |
| `useCatalogProducts(params)`                      | React hook (`packages/sdk/catalog`)               | Params mirror `/api/catalog/products` query                                                                | Returns `{ data, isLoading, refetch }`; memoizes by query key `['catalog', params]`.                               |
| `useCart()`                                       | React hook (`packages/sdk/catalog`)               | Internal stateful hook combining TanStack Query + Zustand slice                                            | Exposes `{ cart, addItem, updateItem, removeItem, switchCurrency }`; wraps server actions with error handling.     |
| `CatalogProduct` Type                             | TypeScript interface (`packages/sdk/catalog`)     | Fields described in Data Models section                                                                    | Consumed by UI components, ensuring consistent formatting of price, availability, content relations.               |

### Workflows and Sequencing

1. **Extend Commerce Schema** – add Medusa migrations for `product_metadata` fields, `product_recommendations` join table, and ensure region/currency records exist; run migrations in staging then production through Pulumi pipeline.  
2. **Seed Launch Catalog** – import baseline SKUs, media references, and compatibility tags via Medusa seed script; validate through Admin UI and `GET /store/products` smoke call.  
3. **Link Strapi Content** – configure Strapi relations for guides, downloads, showcases; run sync script to populate `product_recommendations`; verify via Strapi admin and BFF responses.  
4. **Implement BFF Endpoints** – build `/api/catalog/*` and `/api/cart/*` handlers with typed DTOs, cache tagging, and OTEL instrumentation; cover with integration tests using mocked Medusa responses.  
5. **Build Next.js `(shop)` Routes** – create listing, PDP, comparison, and mini-cart components leveraging server components + TanStack Query hydration; ensure accessibility (WCAG 2.1 AA) compliance per UX spec.  
6. **Wire Analytics & Observability** – add Segment events, OTEL spans, and Sentry breadcrumbs to key interactions; confirm telemetry flows in staging dashboards.  
7. **Author Operational Playbooks** – document catalog management, media upload guidelines, and troubleshooting steps in `docs/catalog-operations.md`; share with merchandising/support teams.  
8. **Gate via QA & UAT** – execute automated + manual acceptance tests (filters, PDP content, cart flows); secure stakeholder sign-off before enabling production flag for `/shop`.

## Non-Functional Requirements

### Performance

- Meet PRD performance target (LCP < 1.5 s, CLS < 0.05) for catalog and PDP routes on 80th percentile devices by leveraging ISR, edge caching, and streaming server components.
- Ensure `/api/catalog/*` endpoints respond within 250 ms p95 under 5k concurrent users; cache filter responses for 30 minutes and reuse TanStack Query hydration to avoid duplicate fetches.
- Guarantee search/filter interactions render updated product grids within 400 ms client-side by precomputing facets and lazy-loading media.
- Cap bundle payload payloads (products + related content) at ≤150 KB gzipped via selective field projection and deferred recommendations.

### Security

- All cart mutations run through Next.js server actions with Medusa admin tokens stored in server-side secrets; no credentials exposed client-side.
- Enforce rate limiting (5 req/sec per IP) on `/api/catalog/search` and `/api/cart/line-items` using edge middleware; log anomalies to Security channel.
- Validate and sanitize filter/search parameters with zod schemas; reject unsupported sort keys and escape text prior to Medusa queries.
- Maintain PCI-DSS alignment for pre-checkout flows by isolating payment session creation to Epic 3; ensure cart payloads exclude sensitive PII.

### Reliability/Availability

- Maintain 99.5% uptime for catalog and cart endpoints through Vercel + Railway redundancy; configure automatic restarts for Medusa container on failure.
- Implement Redis-backed stock watchers that recalculate availability within 60 s of inventory changes; fall back to “Check availability” messaging if cache stale >5 min.
- Provide graceful degradation for Strapi outages by serving cached recommendations and suppressing dependent UI modules with telemetry alerting.
- Document recovery runbooks (cache flush, seed rerun, Strapi sync) and rehearse quarterly.

### Observability

- Instrument `/api/catalog` and `/api/cart` routes with OTEL traces, Sentry breadcrumbs, and Logtail structured logs including `requestId`, `cartId`, and `availabilityState`.
- Publish RED metrics (Rate, Errors, Duration) for catalog endpoints via Prometheus exporter; set SLO alerts at 99% success and 300 ms latency thresholds.
- Capture Segment analytics for catalog interactions with unique `trackingId` to correlate business KPIs with technical telemetry.
- Provide Grafana dashboard panels for inventory freshness, recommendation coverage, and cart conversion funnel; review weekly during operations sync.

## Dependencies and Integrations

- **Core Frameworks:** Next.js 15.x, TypeScript 5.x, pnpm 9.x, TurboRepo caching. (No `package.json` committed yet; versions tracked in architecture baseline.)
- **Commerce Platform:** Medusa 2.x (REST + Admin APIs), Medusa Redis cache, Medusa event bus for inventory + recommendation sync.
- **Content Platform:** Strapi v5 REST API, Cloudflare R2 media storage, Strapi webhook deliveries to `/api/webhooks/strapi/publish`.
- **State & Validation:** TanStack Query 5.x, Zustand 4.x, zod 3.x, React Hook Form for cart forms, LaunchDarkly (feature flag for `/shop` rollout).
- **Payments & Operations Integrations:** PayPal REST session creation (prepared for Epic 3), Segment analytics SDK, Slack webhooks for operations alerts, SendGrid for transactional messaging placeholders.
- **Infrastructure & Observability:** Vercel deployment runtime, Railway (Postgres 15 + Redis 7), Pulumi IaC, OpenTelemetry SDK, Sentry, Logtail, Prometheus/Grafana stack.

## Acceptance Criteria (Authoritative)

1. Catalog listing (`/shop`) renders seeded products and applies category, compatibility, availability, and search filters with correct result counts.  
2. Product detail page aggregates Medusa data with Strapi guides/showcases and displays pricing in the selected currency.  
3. Availability badges reflect Medusa stock levels within 60 s of inventory changes and fall back to “Check availability” when data is stale.  
4. Cart workflows create carts, add/update/remove line items, and persist state across sessions via secure cookies.  
5. Currency switcher re-prices cart and PDP totals without losing items or causing duplicate carts.  
6. Recommendation rails surface at least one relevant Strapi guide/showcase per eligible product and degrade gracefully when none exist.  
7. Segment analytics events (`Catalog Viewed`, `Product Viewed`, `Add To Cart`, `Recommendation Clicked`) emit with required properties and pass schema validation.  
8. OTEL/Sentry instrumentation captures traces for `/api/catalog` and `/api/cart` endpoints with RED metrics visible in Grafana dashboards.

## Traceability Mapping

| AC | Spec Sections                                        | Components / APIs                                                     | Test Idea                                                                                   |
|----|-------------------------------------------------------|-----------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 1  | Services & Modules; Workflows & Sequencing            | `apps/web/app/(shop)`, `/api/catalog/products`, `packages/sdk/catalog` | Automated Playwright suite applies filters/search and asserts product counts + facets.      |
| 2  | Data Models & Contracts; APIs & Interfaces            | `GET /api/catalog/products/[id]`, `strapi-link` subscriber            | Integration test mocks Strapi payloads, verifies combined DTO fields render on PDP.         |
| 3  | Data Models (Inventory Snapshot); NFR - Reliability   | Medusa inventory watcher, Redis cache, StockBadge component           | Simulate stock update, confirm UI badge + event log; verify fallback when Redis entry stale.|
| 4  | Services & Modules; APIs & Interfaces                 | `/api/cart` handlers, `useCart` hook, cart cookie middleware          | Perform add/update/remove flows via automated tests; inspect cookie + totals persistence.   |
| 5  | APIs & Interfaces; NFR - Performance                  | `POST /api/cart/currency`, CurrencySwitcher component                 | Change currency in UI; validate totals and analytics event; ensure no duplicate carts.      |
| 6  | Services & Modules; Data Models (RecommendationMapping)| `/api/catalog/products/[id]/recommendations`, RecommendationRail UI   | Seed Strapi relations, assert recommendation slots display or proper empty state.           |
| 7  | Data Models (Analytics Payloads); NFR - Observability | Segment SDK integration, analytics zod schemas                        | Run telemetry smoke test capturing dispatched events and validating payload schema.         |
| 8  | NFR - Observability; Workflows Step 6                 | OTEL instrumentation, Prometheus exporter, Grafana dashboard          | Generate synthetic load, inspect traces/metrics for RED thresholds and SLO alerts.          |

## Risks, Assumptions, Open Questions

- **Risk:** Strapi or Medusa webhook delivery failure could desync recommendations or inventory state. *Mitigation:* queue failed payloads in Redis, add daily reconciliation job, alert on retry exhaustion.*
- **Risk:** Search/filter queries may overload Medusa under peak traffic. *Mitigation:* enforce query rate limits, precompute facets, add read replicas if latency exceeds 250 ms p95.*
- **Assumption:** Only USD and EUR regions are required at launch; additional currencies trigger separate refinement. *Action:* confirm with finance before cutting release branch.*
- **Assumption:** Product media assets are hosted on Cloudflare R2 with signed URLs available at seed time. *Action:* coordinate with content ops to populate before UAT.*
- **Question:** Do we expose comparison view in MVP or behind feature flag? *Next Step:* align with PM/UX during design review to decide toggle default.*
- **Question:** Should recommendation rails blend Strapi content and Medusa accessories or remain content-only? *Next Step:* validate with marketing team while finalizing upsell rules.*

## Test Strategy Summary

- **Unit Tests:** Cover Medusa migrations, catalog extension service helpers, zod schemas, and UI formatting utilities (price, availability badges).  
- **Integration Tests:** Use mocked Medusa/Strapi services to verify `/api/catalog` and `/api/cart` endpoints, including currency switching and recommendation aggregation.  
- **E2E Tests:** Playwright flows for browse → filter → PDP → add to cart → mini-cart review; include accessibility assertions (axe) on key pages.  
- **Performance Tests:** k6 or Artillery scenarios hitting `/api/catalog/products` and `/api/cart` to validate latency targets under 5k virtual users.  
- **Monitoring Tests:** Synthetic traces generated post-deploy to ensure OTEL + Sentry instrumentation, plus automated check that Segment events reach data warehouse.  
- **Manual QA:** Stakeholder UAT verifying merchandising ops (catalog updates propagate), localization toggles, and graceful degradation when Strapi is temporarily offline.
