# DJI Design System Iterative Migration Plan

Date: 2025-11-04  
Owner: Frontend Team

## Repository Context
- **Monorepo layout**: Target app remains `apps/web` within the pnpm workspace; other apps (`apps/medusa`, `apps/strapi`, etc.) stay untouched unless explicitly noted.  
- **Design references**: Visual specs live in `docs/basic/dji-design-system-analysis.md`; cockpit reference screens are in `minimax/cockpit-simulator-mobile`.  
- **Backend availability**: Medusa and Strapi services cannot run in this environment; validation must rely on mock data and existing Medusa SDK fallbacks introduced in Phase 1.  
- **Tooling commands**: Use `pnpm --filter medusa-next lint|build` plus targeted smoke checks; Playwright remains optional until middleware/test harness issues are resolved.  
- **Security & configs**: Keep secrets inside env vars; favor `{project-root}` tokens for documentation and avoid hard-coded URLs (other than known mock endpoints).  

## Current State Summary
- Phase 1 delivered DJI tokens, Tailwind overhaul, mock data fallbacks, and migration plan documentation.  
- No Phase 2 UI primitives landed in main (we reverted experimental work); all modules still rely on `@medusajs/ui` components and legacy classes.  
- Priority is to migrate styling/functionality in **small increments** without regressing checkout/cart flows and while keeping lint/build green.  

## Migration Backlog Overview
| Area | Outstanding dependencies on `@medusajs/ui` / legacy styles |
| --- | --- |
| **Global/Layout** | Account layout, order transfer pages, 404 page, footer, side menu, cart dropdown/mismatch banner, country select, Medusa CTA |
| **Products & Marketing** | Product info/actions/price/tabs/gallery/onboarding CTA, product previews, homepage/blog modules, store pagination |
| **Cart & Checkout** | Cart templates (`items`, `preview`, `summary`) and item components, checkout stages (`addresses`, `shipping`, `payment`, `review`, `discount`, `submit-button`, etc.) |
| **Order & Account** | Order detail components (items, payment/shipping info, actions), order-completed template, account info/address forms, transfer request flow |
| **Common/Skeleton** | `line-item-price`, `line-item-unit-price`, `native-select`, `modal`, `interactive-link`, shipping price nudge, skeleton templates using Medusa tables/containers |

## Iteration Strategy
- **Slice by experience**: Each iteration targets one “experience slice” (e.g., marketing pages, product detail, cart).  
- **Introduce primitives once**: Ship DJI equivalents for Text/Heading, Button, Container, Table, RadioGroup, Toast, etc., before migrating dependent modules.  
- **Maintain UX parity**: Align with cockpit tokens while preserving existing behaviors (cart totals, promotions).  
- **Validation per iteration**: Lint + build + targeted manual checks; document skipped tests (e.g., Playwright) with rationale.  

## Iteration Plan
### Iteration 0 – Foundation Resync (1–2 days)
Purpose: Re-introduce reusable primitives safely.
- Tasks:  
  1. Recreate `@/components/ui` directory (Button, Text, Heading, Checkbox, Input, Select, Tabs, Accordion, Badge, Container, Table, RadioGroup, Toast, `cn` helper).  
  2. Wire typography utilities (`styles/typography.css`) and import order inside `globals.css`.  
  3. Update docs (migration plan + new iteration plan) with context.  
- Validation: `pnpm --filter medusa-next lint`, `pnpm --filter medusa-next build`.  
- Exit Criteria: Primitives exist but unused; no app behavior change.  

### Iteration 1 – Global Shell & Low-Risk Pages (2–3 days)
Scope: 404 page, transfer pages, footer, Medusa CTA, side menu, cart dropdown/mismatch banner, notional Toast provider.
- Tasks:  
  1. Swap `@medusajs/ui` imports for Text/Heading/Button/Container in listed files.  
  2. Replace `@medusajs/ui` `Toaster` with Sonner-based implementation and mount globally.  
  3. Introduce `useToggleState` helper (ported from lib) for side menu + other components.  
- Validation: Manual check of nav toggles, footer links, transfer pages; lint/build.  
- Risks: Minimal business logic; ensure SSR compatibility for new client components.  

### Iteration 2 – Product Detail Experience (3–4 days)
Scope: Product info/actions, mobile actions, option select, price/previews/thumbnails, product tabs/galleries, product onboarding CTA.
- Tasks:  
  1. Apply DJI Button/Text styles to add-to-cart flows and ensure loading states use new Button props.  
  2. Replace `clx` with `cn`, drop legacy `txt-*` classes in these modules.  
  3. Align option selectors, tabs, image galleries with DJI tokens (spacing, radii).  
- Validation: Manual checkout from PDP (mock data), ensure variant selection still works; lint/build.  

### Iteration 3 – Cart Templates & Components (3 days)
Scope: Cart page templates and `modules/cart/components/*`.
- Tasks:  
  1. Swap in DJI Table/Container components, update type styles.  
  2. Refine quantity selectors (CartItemSelect) to match tokens.  
  3. Ensure Delete/LineItem components use new Text utilities; remove `@medusajs/ui` dependency.  
- Validation: Manual cart operations (add/remove/update) using mocks; lint/build.  

### Iteration 4 – Checkout Flows (4–5 days)
Scope: Addresses, shipping, payment, review, checkout summary, discount/submit components.
- Tasks:  
  1. Incrementally migrate each step (address → shipping → payment → review).  
  2. Update Stripe `CardElement` styles, Payment container UI, Submit buttons.  
  3. Document manual regression steps (address edit, shipping method selection, payment button).  
- Validation: Drive mock checkout to payment screen; lint/build.  
- Risks: Higher; guard with backups and review.  

### Iteration 5 – Order & Account Modules (3 days)
Scope: Order detail components, account info/address forms, transfer request form, profile password.
- Tasks:  
  1. Replace headings/text/tables within order modules.  
  2. Update account forms to use DJI inputs/buttons.  
  3. Migrate toast usage to new provider (transfer request).  
- Validation: Load order/account pages via mocks, lint/build.  

### Iteration 6 – Marketing & Blog Enhancements (2–3 days)
Scope: Homepage hero modules, featured products, blog cards, store pagination, shipping promo.
- Tasks:  
  1. Apply typography utilities and DJI components to marketing sections.  
  2. Ensure pagination/search UI matches tokens.  
- Validation: Smoke check `/[countryCode]`, `/blog`, `/store`.  

### Iteration 7 – Skeletons & Common Utilities (1–2 days)
Scope: Skeleton templates, common helpers (`line-item-price`, `native-select`, `modal`, etc.).
- Tasks:  
  1. Replace `@medusajs/ui` containers/tables, drop `clx` in shared utilities.  
  2. Final sweep for lingering `txt-*` classes.  
- Validation: Build + grep for `@medusajs/ui` usage equals zero (unless consciously retained).  

## Iteration Execution Notes
### Iteration 0 – Foundation Resync (Completed 2025-11-04)
- **Deliverables**: Rebuilt DJI primitive kit inside `apps/web/src/components/ui` (Button/Text/Heading/Checkbox/Input/Select/Tabs/Accordion/Badge/Container/Table/RadioGroup/Toast and the `cn` helper). Added `styles/typography.css` and updated `globals.css` import order so typography utilities are registered ahead of Tailwind layers.
- **Dependencies**: Added `@radix-ui/react-checkbox`, `@radix-ui/react-radio-group`, `@radix-ui/react-select`, `@radix-ui/react-slot`, `@radix-ui/react-tabs`, and `@radix-ui/react-toast`; regenerated `pnpm-lock.yaml` via `pnpm install`.
- **Validation**: `pnpm --filter medusa-next lint` and `pnpm --filter medusa-next build` pass using the mock Medusa data fallback. Playwright remains deferred per middleware limitation noted in the migration plan.
- **Follow-ups**: Iteration 1 can now begin swapping low-risk shell components to the new primitives and wiring the Toast provider globally. Document any incremental usages back in this file before moving to Iteration 2.

### Iteration 1 – Shell Refresh (Completed 2025-11-05)
- **Deliverables**: Added `AppToastProvider` + `useToast` hook, converted 404 + order-transfer pages and `TransferActions` to DJI `Heading`/`Text`/`Button`, and refreshed the footer, Medusa CTA, and side menu to rely on the new primitives + `cn`. Cart dropdown CTAs and the cart mismatch banner now use the DJI button variants (`lg`, `link`, controlled loading states) with proper `asChild` links.
- **Validation**: `pnpm --filter medusa-next lint` and `pnpm --filter medusa-next build` succeed (mock data). Playwright still deferred pending middleware fix.
- **Follow-ups**: Iteration 2 can proceed with the PDP experience (actions, tabs, galleries). When that starts, update any lingering `clx`/`text-ui-*` utilities inside the product modules and begin removing `@medusajs/ui` imports from those files.

### Iteration 2 – Product Detail Experience (Completed 2025-11-06)
- **Deliverables**: Converted the entire PDP surface to DJI primitives—action stack (desktop/mobile), option selectors, product price/info, tabs/accordion, previews, thumbnail, onboarding CTA, and gallery now consume `@/components/ui` exports and the shared `cn` helper. The bespoke accordion component was removed in favor of the common Radix-based UI kit.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` and `… build` both pass (Next still warns about legacy `themeColor` metadata on `_not-found`, categories, collections, and products). Playwright remains on hold until middleware adjustments land.
- **Follow-ups**: Iteration 3 moves to cart templates/components; keep an eye on lingering `txt-*` classes there and plan to clean up once cart + checkout adopt the new primitives. Consider scheduling the metadata warning fix alongside future route work.

### Iteration 3 – Cart Templates & Components (Completed 2025-11-07)
- **Deliverables**: Cart templates (`templates/items`, `preview`, `summary`) now rely on the DJI Heading/Table/Button primitives, with cart CTAs using `Button asChild` for correct link semantics. Cart components (`components/item`, `cart-item-select`, `sign-in-prompt`, `empty-cart-message`) and their shared helpers (`line-item-price`, `line-item-unit-price`, `line-item-options`, `delete-button`, `divider`, `interactive-link`, `native-select`) were reworked to use `@/components/ui` and `cn`, removing dependencies on `@medusajs/ui` and `clx`.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` + `… build` succeed; the known Next metadata warnings persist. Playwright execution is still deferred pending the middleware bypass noted earlier.
- **Follow-ups**: Iteration 4 should focus on checkout templates/components (address, shipping, payment) plus the middleware change that will finally unblock Playwright smoke tests. Document any lingering `@medusajs/ui` imports before moving on to keep tracking easy.

### Iteration 4 – Checkout Flows (Completed 2025-11-08)
- **Deliverables**: Checkout summary, addresses, shipping, payment, review, discount code, payment container, Stripe card entry, payment button/test helpers, and shipping address/selectors now consume the shared DJI primitives with tokenized spacing and the `cn` helper—removing the last `@medusajs/ui` usages in checkout. Stripe CardElement styling was updated to match the new surface tokens.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` and `… build` both pass; Next.js still warns about legacy `themeColor` metadata. Playwright remains blocked until the middleware tweak from Phase 1 lands.
- **Follow-ups**: Iteration 5 should tackle order/account modules and start triaging the metadata warnings + middleware changes so Playwright smoke tests can rejoin the workflow.

### Iteration 5 – Order & Account Modules (Completed 2025-11-09)
- **Deliverables**: Finished migrating the remaining account surfaces to the DJI kit—address cards now share a typed `AddressFormFields` helper that wraps the new `Input` + `Text` primitives, Add/Edit modals, AccountNav, OrderOverview, and TransferRequestForm all rely on DJI `Button/Heading/Text` components, and the success banner uses the shared toast styling. This removes the final `@medusajs/ui` dependency inside `modules/order` + `modules/account` while aligning form typography with `typography.css`.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` and `… build` (same warnings about `themeColor` metadata). Playwright execution is still deferred; document skips in PRs until middleware adjustments restore it.
- **Follow-ups**: Queue Iteration 6 (marketing/blog) and Iteration 7 (common utilities/skeletons). Also plan a sweep to move remaining shared form controls (`@modules/common/components/input`, `native-select`, etc.) to DJI primitives once marketing/components are stable.

### Iteration 6 – Marketing & Blog Enhancements (Completed 2025-11-10)
- **Deliverables**: Brought every blog/marketing surface onto the DJI primitives—`BlogCard`, `RelatedPosts`, `BlogDetailTemplate`, and `LatestBlogPosts` now lean on `Heading/Text/Button/cn` with shared chips, meta styling, and link buttons. Reworked `ProductRail`, store `Pagination`, and the free-shipping nudge (inline + popup variants) to drop `@medusajs/ui` helpers, swapping colors for the DJI token set and ensuring CTA buttons use the shared component kit.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` and `… build` (Next.js still warns about legacy `themeColor` metadata). Playwright remains skipped until the middleware fix exists; continue noting that in PRs.
- **Follow-ups**: Iteration 7 should sweep the remaining shared inputs/radio groups, modal shell, marketing skeletons, and metadata warnings. Also plan Percy/visual baselines once middleware work unblocks Playwright.

### Iteration 7 – Skeletons & Common Utilities (Completed 2025-11-11)
- **Deliverables**: Replaced the lingering `@medusajs/ui` dependencies in shared primitives—`FilterRadioGroup`, `Checkbox`, `Input`, and `Modal` now lean on the DJI kit (Button/Text/RadioGroup/Checkbox/Heading) with updated typography tokens and accessible labeling. All skeleton templates (`cart-page`, `cart-item`, `line-item`, `product-preview`) were refreshed to use the shared `Table`/`Container` components plus the new neutral surfaces, eliminating `txt-*` utilities in the process.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` and `… build` (Next.js metadata warnings persist). Playwright remains deferred pending the middleware shortcut.
- **Follow-ups**: Tackle the metadata `themeColor` warnings and middleware fix next so Playwright/Percy smoke tests can rejoin CI. After that, plan a repo-wide grep to ensure no `txt-*` helpers remain outside of legacy CSS files.

### 2025-11-11 – Metadata Cleanup & E2E Enablement
- **Deliverables**: Moved the global `themeColor` configuration from `metadata` into the new `viewport` export so Next.js no longer warns during builds. Added the `NEXT_SKIP_REGION_MIDDLEWARE` safeguard (and enabled it in Playwright’s `webServer` command) so we can bypass region redirects when no backend runs locally; the middleware still executes in production environments. Updated the Playwright smoke tests to target `/us` (or `E2E_HOME_PATH`) and filter benign 404 image warnings, which allowed `pnpm --filter tests-e2e test` to pass end-to-end using the mock Medusa data.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint`, `… build`, and `pnpm --filter tests-e2e test` (with the auto-started dev server + mocks) all pass. The upstream image proxy logs 404s for placeholder Unsplash URLs, but those are now ignored by the console-error guard.
- **Follow-ups**: Document the new `NEXT_SKIP_REGION_MIDDLEWARE` flag (done in this plan) and monitor if future tests need a real backend; otherwise, turn attention to the accessibility/monitoring tasks outlined for Phase 7.

### 2025-11-12 – Phase 7 Operational Readiness
- **Deliverables**: Captured monitoring/feedback/a11y processes in `docs/task/dji-phase7-operational-readiness.md`, wired Vercel Analytics + the in-app feedback widget, and added `tests/e2e/accessibility.spec.ts` to run axe scans on `/us`, `/us/store`, `/us/checkout`.
- **Validation**: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint|build`, `pnpm --filter tests-e2e test`, and `pnpm --filter tests-e2e exec -- playwright test accessibility.spec.ts` all green. Accessibility suite currently reports no serious/critical violations on the mocked data set.
- **Follow-ups**: Track the remaining backlog (Storybook docs, Percy snapshots, manual a11y audit) via the backlog table in the new readiness doc; schedule enablement session before GA.

## Governance & Tracking
- Reference this plan in PR descriptions and update `docs/task/dji-design-system-migration-plan.md` after each iteration.  
- Keep PRs scoped to one iteration slice; include manual validation notes + lint/build results.  
- Maintain a running checklist (e.g., issue tracker) linking to each iteration branch/PR.  

## Risks & Mitigations
- **UI regressions**: mitigate with Storybook-style screenshots or Percy once Playwright is back; short-term rely on manual QA per slice.  
- **Scope creep**: enforce strict per-iteration boundaries; defer new refactors to follow-up iterations.  
- **Dependency drift**: run `pnpm install` only when adding UI libraries; keep lockfile stable per iteration.  

## Next Steps
1. Kick off Iteration 0 (primitive reintroduction) on a feature branch.  
2. Update migration plan progress after completion.  
3. Reassess backlog before moving to Iteration 1 to ensure no new blockers emerged.  
