# DJI Storefront Implementation Plan

Target: build a global Medusa storefront whose layout and components mirror **every page** in `minimax/cockpit-simulator-mobile`, strictly follow `docs/basic/dji-design-system-analysis.md`, and reuse data-layer patterns from `apps/web` while running a single worldwide rule set (no country gating). Development on this machine uses mock data (no live Medusa backend), so Phase 1+ tasks must provide mock region/cart APIs that simulate the single default region.

## Phase 0 – Discovery & Guardrails
- Scope confirmation:
  - Build a page matrix linking every cockpit simulator screen to the future storefront route.
  - Define “done” criteria (visual parity checklist, accessibility targets, performance budgets).
- Asset audit:
  - Export cockpit Tailwind config, typography, token files, and reusable component list.
  - Mark each component as **ready / needs extension / missing** for ecommerce scenarios.
- Backend/data audit:
  - Map Medusa data flows in `apps/web` (cart, checkout, account) and list dependencies on region middleware.
  - Decide what to move into `packages/medusa-client` and note required refactors.
- Single-region decision:
  - Choose the default Medusa region, disable others in seeds/admin, and document env vars (`MEDUSA_DEFAULT_REGION_ID`).
  - Draft migration steps for existing data (price lists, shipping options) to reference the single region.

### Phase 0 — Current Outputs

**Cockpit → Storefront Page Matrix**

| Cockpit screen | Key sections/components | Target Next.js route |
| --- | --- | --- |
| HomePage (`src/pages/HomePage.tsx`) | Full-screen hero, feature cards, featured products grid, testimonials, newsletter, support stats | `/`
| ProductsPage | Product filters, sort controls, responsive grid, quick-add CTA | `/products`
| ProductDetailPage | Media gallery, specs accordion, compatibility list, reviews/testimonials, sticky purchase card | `/products/[handle]`
| CollectionsPage | Collection tiles, marketing copy blocks, CTA band | `/collections`
| CollectionPage | Collection hero, filtered product grid, related collections rail | `/collections/[handle]`
| CartPage | Line-item list, upsell modules, summary widget, support banner | `/cart`
| CheckoutPage | Multi-step form (customer, shipping, payment), order summary card, trust badges | `/checkout`
| AccountPage | Tabs for overview, orders, profile, device management, support shortcuts | `/account`
| BlogPage | Featured story hero, article cards, category pills | `/blog`
| BlogPostPage | Rich text body, metadata header, sticky share/TOC, related posts | `/blog/[slug]`
| SoftwarePage | Feature tabs, compatibility tables, accordion FAQs, version history timeline, CTA download cards | `/software`

**Definition of Done (cross-page)**

- Visual parity: 1:1 spacing, font, and color match to cockpit simulator and `docs/basic/dji-design-system-analysis.md`; variance < 2 px except responsive breakpoints.
- Token enforcement: All Tailwind classes resolve to DJI token variables; lint fails on non-approved colors/spacing.
- Accessibility: Lighthouse/axe score ≥ 95 per template; keyboard traps resolved; focus outlines align with spec.
- Performance: Largest Contentful Paint < 2.5s on 3G Fast emulation; CLS < 0.1; bundler budgets documented per route.
- Content parity: Every cockpit section/component appears in the storefront counterpart (hero, testimonials, etc.).

**Asset Audit Highlights**

- Tailwind theme (`minimax/cockpit-simulator-mobile/tailwind.config.js`) already codifies DJI tokens (custom breakpoints, spacing aliases, color palette, 7-level shadow, capsule radii). Need to port container padding, typography, shadows, and color objects verbatim.
- Global styles live in `src/index.css` and `src/App.css`, defining CSS variables for `--background-*`, `--foreground-*`, gradients, and animation keyframes; these must seed the Next.js global CSS.
- UI primitives reside in `src/components/ui/*.tsx` (buttons, inputs, checkbox, select, tabs, etc.) and layout scaffolding in `src/components/layout`. Most are production-ready; missing pieces for ecommerce include: toast/snackbar, modal/sheet, breadcrumbs, pagination, rating stars. Marked for extension.

**Medusa Integration & Single-Region Plan (Mock-first)**

- Current `apps/web` flows are tightly coupled to `countryCode` route segments and region lookups (`apps/web/src/lib/data/cart.ts:53`, `apps/web/src/lib/data/regions.ts:60`). New implementation will:
  1. Extract SDK helpers (`sdk.store.cart`, auth cookies, cache tags) into `packages/medusa-client` for reuse.
  2. Replace `getRegion(countryCode)` with a cached `getDefaultRegion()` that loads `process.env.MEDUSA_DEFAULT_REGION_ID` once and injects it into cart creation/update.
  3. Collapse Next.js routing to global paths (remove `apps/web/src/app/[countryCode]/**`), mirroring Shopify-style deployment.
- Backend prerequisites (when real backend becomes available): update Medusa admin/seeds to keep a single region (e.g., `global-primary`) and attach all price lists/shipping profiles to it. Document migration steps so existing data references the new region ID before the DJI storefront goes live.
- Development constraint: since this environment cannot hit a live Medusa backend, provide deterministic mock responses for `getDefaultRegion`, cart retrieval, and checkout flows. Mock data must honor single-region assumptions so the real backend swap only requires switching the SDK base URL.

## Phase 1 – Project Scaffold (`apps/dji-storefront`)
- App bootstrap:
  - Generate new Next.js app; configure routing, base layout, ESLint/TS, Husky hooks.
  - Copy cockpit Tailwind config, typography, `design-tokens.css`, and global styles.
- Lint/guardrails:
  - Remove `legacy-medusa.css` from dependency graph.
  - Add ESLint rule/script that fails on `@medusajs/ui` imports or legacy class names.
- Shared Medusa client:
  - Create `packages/medusa-client` with REST/GQL config, server actions, auth helpers.
  - Add unit tests/mocks verifying cart/order/account operations.
- Single-region plumbing:
  - Load `MEDUSA_DEFAULT_REGION_ID` during server init; update cart creation to inject it automatically.
  - Remove `[countryCode]` route segments and simplify middleware to locale detection only (if needed).
  - Update seed scripts and docs describing the global backend setup.

### Phase 1 — Current Outputs

- `apps/dji-storefront` bootstrapped with Next.js 15, Tailwind, and cockpit design tokens wired through `globals.css`, `design-tokens.css`, and `dji-utilities.css`.
- Tailwind theme mirrors cockpit simulator sizing, typography, color, and shadow system; base layout now uses Open Sans / JetBrains Mono from Google Fonts.
- ESLint flat config added with a guardrail that forbids `@medusajs/ui`/`@medusajs/icons` imports and runs via `pnpm --filter dji-storefront lint`.
- Created `packages/@cs/medusa-client` with deterministic single-region mocks (region retrieval, cart CRUD, product summaries, collections, recent orders) plus Vitest coverage (`pnpm --filter @cs/medusa-client test:unit`).
- `apps/dji-storefront` consumes the mock client in `src/app/page.tsx`, rendering MVP cockpit route matrix + data snapshots so future pages can rely on the mocked Medusa layer.

## Phase 2 – DJI UI Kit Expansion
- Component porting:
  - Promote cockpit components into `apps/dji-storefront/components/ui`, aligning spacing/typography to the design doc.
  - Document props/variants; add Storybook stories per component state.
- Layout primitives:
  - Build grid, header, footer, hero, card shells to match cockpit structure and responsiveness.
  - Add Storybook pages demonstrating complete layouts for designer review.
- Automation/guardrails:
  - Configure Storybook + Chromatic/Loki for visual regression testing.
  - Extend Tailwind theme with DJI token aliases and helper classes.
  - Wire accessibility linting (axe / eslint-plugin-jsx-a11y) specific to the new components.

### Phase 2 — Current Outputs

- Imported the cockpit UI primitives (`button`, `card`, `checkbox`, `input`, `label`, `progress`, `radio-group`, `select`, `slider`, `tabs`) into `apps/dji-storefront/src/components/ui`, backed by the shared `cn` helper under `src/lib/utils.ts`.
- Storybook 10 (Next.js + Vite) is live for the app, previewing the DJI global styles and exposing a `UI/Button` story that maps to the new component library (`pnpm --filter dji-storefront storybook`).
- `apps/dji-storefront/src/app/page.tsx` now renders those UI primitives (Cards + Buttons) so designers can validate styles directly within the Next.js shell.

## Phase 3 – Feature Layer Migration
- Route group execution:
  1. **Global shell + landing**: navigation, mega menu, footer, hero banners.
     - Build data loaders for marketing content, integrate global search if needed.
  2. **Catalogue + PDP**: category pages, filters, product cards, detail page gallery/pricing.
     - Implement shared hooks for variant selection, stock status, recommendations.
  3. **Cart & checkout**: cart drawer/page, address forms, payment components, review step.
     - Integrate payment providers via `packages/medusa-client`; handle errors + validations.
  4. **Account**: profile, orders, transfers, addresses, saved payment methods.
     - Ensure secure server components and re-use forms built earlier.
  5. **Ancillary cockpit pages**: marketing, support, onboarding, any simulator-only views.
- Per route deliverables:
  - Medusa data hooks/server components completed and unit tested.
  - JSX uses only DJI UI kit components and tokens.
  - Accessibility + Lighthouse review recorded.
  - Playwright smoke test covering the flow (browse → add to cart → checkout/account action).
- Governance:
  - Maintain a migration matrix linking each legacy `apps/web` module to its replacement.
  - Hold weekly demos to track visual parity progress against cockpit references.

### Phase 3 — Current Outputs (Mock data readiness)

- Extended `packages/@cs/medusa-client` to expose richer mocks: full product objects, collection summaries (with sample products), recent orders, order retrieval, and address lists. All APIs are typed and covered by Vitest (`pnpm --filter @cs/medusa-client test:unit`).
- Updated `apps/dji-storefront/src/app/page.tsx` to consume the new collection/order mocks so designers can validate catalog/commerce flows ahead of feature migration.
- The mock surface now mirrors the upcoming Medusa endpoints needed for catalogue, cart, checkout, and account pages, unblocking server components that depend on product, order, or address data.
- Shared server helpers (`src/lib/data/*`) now provide typed loaders for landing, products, and collections, and new server-rendered pages (`/products`, `/collections/[handle]`) use those helpers plus the DJI UI kit. Initial Storybook coverage for `ProductCard` supports design reviews before wiring the rest of the catalog.

## Phase 4 – Integration & Hardening
- Environment wiring:
  - Point staging/prod builds to Medusa environments; validate cart/order/account flows end to end under single-region config.
  - Run cross-device manual QA (desktop/tablet/mobile) to ensure layout fidelity.
- CI/CD:
  - Add scripts `pnpm lint:dji-storefront`, `pnpm test:dji-storefront`, `pnpm test:e2e-dji`.
  - Configure pipelines to publish Storybook previews and visual regression artifacts each PR.
- Design sign-off:
  - Capture annotated screenshots for every page; compare against cockpit and design doc tokens.
  - Log deviation tickets and get sign-off/waivers from design/product leadership.

### Phase 4 — Current Outputs

- **Environment wiring (mock staging):** `apps/dji-storefront/README.md` now documents how to run the mock-backed dev server, Storybook, and validation steps. The shared helpers under `src/lib/data/*` make swapping to a real Medusa backend a single touchpoint once credentials are available.
- **CI-friendly scripts:** Root-level `package.json` exposes `lint:dji-storefront`, `build:dji-storefront`, `storybook:dji-storefront`, and `test:mock-medusa` so CI (or humans) can run the storefront checks independently of the monorepo turbo pipeline.
- **Design/QA guidance:** README includes a manual validation checklist (landing, products, collections) plus instructions to capture Storybook + browser screenshots for sign-off. Phase 4 deviations should be logged directly in this plan as screenshots/notes are produced.

## Phase 5 – Rollout Strategy
- Deployment:
  - Deploy globally under the primary domain/path; migrate cookies/cart storage if host changes.
  - Validate CDN/cache rules and SEO settings (sitemaps, canonical URLs).
- Safety nets:
  - Maintain feature flags for checkout/cart and capability to revert to legacy app quickly.
  - Dry-run rollback procedure to ensure reversibility.
- Comms & monitoring:
  - Configure Sentry/analytics dashboards and alert thresholds.
  - Draft release notes, internal playbook, and support FAQ describing the new DJI experience.

## Phase 6 – Post-launch & Legacy Cleanup
- Monitoring & iteration:
  - Track conversion, bounce, performance, and error rates; prioritize fixes.
  - Hold feedback sessions with support/sales to capture UX issues.
- Cleanup:
  - Delete `legacy-medusa.css`, unused modules, and stale feature flags.
  - Update documentation and lint rules to block reintroduction.
- Governance:
  - Establish a change-control checklist requiring new UI work to land in the cockpit simulator + design doc before adoption.
  - Schedule periodic audits to ensure ongoing compliance with the DJI system.

### Phase 6 — Current Outputs

- **Post-launch playbook:** `apps/dji-storefront/docs/post-launch.md` now documents the monitoring dashboards (conversion, performance, errors, support signals), alerting channels, and the first three post-launch sprints, along with eligibility criteria for removing legacy Medusa assets.
- **Cleanup/governance:** The README + playbook define a change-control checklist (design references, lint/test runs, plan updates) and quarterly audit cadence. Legacy removal gating and lint enforcement are spelled out to prevent regressions into the Medusa CSS.
- **Next actions:** Once the new storefront is live, populate the dashboards/alert hooks referenced in the playbook, archive `legacy-medusa.css` once account/checkout migrations land, and log audit findings per quarter in `apps/dji-storefront/docs/audits/`.

## Immediate Next Steps
1. Approve global MVP scope (all cockpit simulator pages) and timeline.
2. Update Medusa backend config to operate with a single default region and record its ID/env wiring.
3. Scaffold `apps/dji-storefront` with cockpit simulator Tailwind/tokens and start extracting Medusa client utilities + lint/test tasks.
