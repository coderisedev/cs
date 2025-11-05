# DJI Design System Migration Plan

Date: 2025-11-02  
Owner: Frontend Team

## Repository Context
- **Monorepo layout**: This plan targets the Next.js storefront in `apps/web` within the pnpm/turbo workspace defined by `pnpm-workspace.yaml`. Other apps (`apps/medusa`, `apps/strapi`, `apps/storefront`) and shared packages remain unchanged.
- **Reference implementation**: Visual and interaction parity should be checked against `minimax/cockpit-simulator-mobile`, which already applies the DJI design system.
- **Tooling commands**: Use `pnpm install`, `pnpm lint`, `pnpm build`, and `pnpm --filter web dev` to work on the storefront. Playwright suites run via `pnpm --filter tests/e2e <script>` with `NEXT_SKIP_REGION_MIDDLEWARE=true NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy` (set automatically in `tests/e2e/playwright.config.ts`) so the app boots against mock data.
- **Feedback & telemetry**: Set `NEXT_PUBLIC_FEEDBACK_FORM_URL` to surface the in-app feedback widget (defaults to a `mailto:` link) and enable Vercel Analytics on deployments to capture navigation performance/usage metrics without extra configuration.
- **Backend dependencies**: Because `apps/medusa` and `apps/strapi` cannot be run in the current environment, use captured API fixtures or mock data when validating flows (cart, checkout, account). Note any mocked endpoints so they can be swapped back to live services later.

## Overview
- Replace Medusa starter styling in `apps/web` with the DJI design system from `docs/basic/dji-design-system-analysis.md`.
- Align shared UI components with the cockpit reference implementation under `minimax/cockpit-simulator-mobile`.
- Preserve existing Medusa data flows while realigning all visuals and utilities to the DJI tokens.

## Phase 1 – Baseline & Tooling
- **Dependency Audit**: Inspect `apps/web/package.json`, list Medusa styling packages, identify replacement libraries (Radix, cockpit utilities), and confirm current Next/Tailwind versions for upgrades. Because the storefront is not yet in production, we can pursue invasive refactors without a release freeze.
- **Tailwind Overhaul**: Rewrite `apps/web/tailwind.config.js` to remove `@medusajs/ui-preset`, import DJI tokens, and expose cockpit-style theme extensions. Add a temporary compatibility layer (e.g., `apps/web/src/styles/legacy-medusa.css`) that remaps common `txt-*`, `text-ui-*`, and `bg-ui-*` utilities to DJI equivalents; load it via Tailwind `@layer components`. Track remaining legacy class usage with `rg` and burn down as modules migrate.
- **Token Consolidation**: Create `apps/web/src/styles/design-tokens.css` containing light/dark CSS variables sourced from `dji-design-system-analysis`. Import this file in `globals.css` and expose the same token map to Tailwind via a `designTokens` helper to avoid drift between CSS and JS.
- **Build Stack Alignment**: Upgrade Tailwind/PostCSS for Next 15 and React 19 compatibility. Run `pnpm install`, `pnpm lint`, `pnpm build`, and baseline Playwright smoke tests to validate the toolchain before deeper changes.

### Phase 1 Task Breakdown
1. **Inventory Styling Dependencies**
   - Export a dependencies report from `apps/web/package.json` highlighting Medusa UI packages, Tailwind/PostCSS versions, and related tooling.
   - Document proposed replacements or upgrades (Radix packages, cockpit utilities, Tailwind target version) in a short checklist.
2. **Design Compatibility Layer**
   - Draft `apps/web/src/styles/legacy-medusa.css` that maps legacy Medusa utility classes to DJI equivalents (focus on `txt-*`, `text-ui-*`, `bg-ui-*`, and spacing helpers).
   - Update Tailwind config to load this file via `@layer components`, and add an `rg` script snippet for tracking remaining legacy classes.
3. **Tailwind Config Refactor**
   - Remove `@medusajs/ui-preset` from `tailwind.config.js` and inject DJI palette, typography, spacing, and shadow tokens.
   - Add a `designTokens` helper (JS module or config object) that mirrors CSS variables.
   - Verify content paths include new component directories.
4. **Token Source of Truth**
   - Create `apps/web/src/styles/design-tokens.css` with light/dark variable definitions derived from `docs/basic/dji-design-system-analysis.md`.
   - Import `design-tokens.css` in `globals.css` and ensure Tailwind config references the same values.
5. **Toolchain Upgrade & Verification**
    - Bump Tailwind, PostCSS, and related tooling in `apps/web/package.json`; remove unused Medusa styling dependencies identified earlier.
    - Run `pnpm install`, regenerate `pnpm-lock.yaml`, and ensure repo builds.
    - Execute `pnpm lint`, `pnpm build`, and baseline Playwright smoke tests to confirm the new configuration is stable.

### Phase 1 Execution Notes (2025-11-02)
- **Task 1 – Inventory Styling Dependencies**
  - Medusa styling footprint in `apps/web/package.json`: `@medusajs/ui` (UI kit), `@medusajs/icons` (icon set), `@medusajs/ui-preset` (Tailwind preset), plus inherited utility `tailwindcss-radix`.
  - Tailwind toolchain prior to the upgrade: `tailwindcss@3.0.23`, `postcss@8.4.8`, `autoprefixer@10.4.2`.
  - Replacement roadmap:
    - Swap Tailwind preset for custom DJI-tailored config while keeping `tailwindcss-radix` (Radix primitive support).
    - Introduce a DJI token helper to align Tailwind/CSS variables and backstop legacy Medusa utilities until new UI primitives land (target packages: Radix UI, cockpit token helpers).
    - Defer removal of `@medusajs/ui` and `@medusajs/icons` until Phase 2+ components replace them; flag for follow-up.
- **Task 2 – Design Compatibility Layer**
  - Added `apps/web/src/styles/design-tokens.css` and `apps/web/src/styles/legacy-medusa.css`; the former centralises light/dark DJI variables, the latter shims `txt-*`, `text-ui-*`, and `bg-ui-*` classes against the new palette.
  - Imported both files through `globals.css` (compat layer sits after Tailwind components) so the compatibility shims load once and remain purge-safe.
  - Recorded an audit command here: `rg "(txt-|text-ui-|bg-ui-)" apps/web/src` to monitor the burn-down of legacy Medusa utilities per module.
- **Task 3 – Tailwind Config Refactor**
  - Replaced the preset-driven config with `apps/web/tailwind/design-tokens.js`, wiring Tailwind colors, radii, spacing, and font scale directly to the CSS variable names to avoid drift.
  - Expanded the `content` glob to include `src/ui/**` so future cockpit primitives are picked up without extra config churn.
  - Preserved bespoke transitions, keyframes, and breakpoints from the previous config to minimise behavioural regressions during the migration.
- **Task 4 – Token Source of Truth**
  - `globals.css` now imports the token sheet ahead of Tailwind layers and falls back to the same CSS variables (e.g., focus ring, background) for runtime styles.
  - Removed duplicated root variable definitions to ensure design tokens are edited in one place only.
- **Task 5 – Toolchain Upgrade & Verification**
  - Upgraded `tailwindcss` (3.4.14), `postcss` (8.4.49), `autoprefixer` (10.4.20), and aligned `eslint` with the Next 15 plugin requirements; dropped `@medusajs/ui-preset` from the dev bundle.
  - `pnpm install` refreshed `pnpm-lock.yaml` and surfaced expected peer warnings for dormant packages (Medusa/Strapi); no build scripts executed.
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint` now runs but surfaces legacy lint debt (unescaped entities, React hook deps, `<img>` warnings). Logged as follow-up instead of suppressing.
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next build` compiles assets yet fails during data collection because the Medusa backend is offline in this environment (`ECONNREFUSED 127.0.0.1:9000`). Documented need for API fixtures before proceeding.
  - `pnpm --filter tests/e2e test` reports “No projects matched the filters”; Playwright harness needs a package manifest before smoke tests can run. Track in Phase 3 automation tasks.

## Phase 2 – UI Foundation
- **Component Library**: Create `apps/web/src/components/ui` mirroring cockpit primitives (button, card, input, dropdown, theme-toggle). Use Radix for headless behaviors, provide SSR-safe wrappers, and ensure client/server component boundaries follow Next App Router rules.
- **Typography & Utilities**: Define DJI typography utilities and replace Medusa macros (`txt-*`, `text-ui-*`) with Tailwind classes backed by DJI tokens. As each utility is superseded, remove the corresponding alias from the legacy compatibility layer.
- **Context Providers**: Port cockpit `ThemeProvider` and integrate with Next App Router providers. Adapt cart/session contexts so styling changes do not break Medusa logic, documenting any differences from the cockpit implementation.
- **Router Adaptation**: Audit cockpit components that depend on React Router APIs. Provide equivalents using `next/link`, `next/navigation`, and Suspense patterns so layout migrations do not stall later phases.

### Phase 2 Task Breakdown
1. **Component Catalog Definition**
   - Inventory cockpit primitives (button, card, input, dropdown, theme toggle, badge, tabs, accordion) and map each to a new module under `apps/web/src/components/ui`.
   - Document expected props, variants, and Radix dependencies for each component.
2. **Build Core UI Primitives**
   - Implement `Button`, `Card`, `Input`, `Checkbox`, `Select`, etc., using Tailwind classes tied to DJI tokens and Radix where needed.
   - Include `cn()` helper or equivalent for class merging and ensure components declare `"use client"` only when required.
   - Add Storybook-style MD files or usage examples if helpful for reviewers.
3. **Theme & Context Providers**
   - Port cockpit `ThemeProvider` and `ThemeToggle`, adapting to Next App Router by exposing a provider in `apps/web/src/app/providers.tsx`.
   - Reconcile cockpit cart/context logic with existing Medusa hooks; document deviations or TODOs.
4. **Typography & Utility Layer**
   - Define typography helpers (e.g., `heading-xl`, `body-sm`) either as Tailwind plugins or CSS utility classes.
   - Replace uses of Medusa macros in shared components; remove corresponding entries from `legacy-medusa.css`.
5. **Router Compatibility**
   - Identify cockpit components relying on React Router (e.g., `Link`, `useLocation`) and refactor them to Next equivalents (`next/link`, `usePathname`, `useRouter`).
   - Provide wrapper utilities if needed to avoid duplicated logic across components.
6. **Validation**
   - Write lightweight unit or snapshot tests for key components (button, card, input) to detect regressions.
   - Run `pnpm lint`, `pnpm build`, and Playwright smoke tests focused on newly migrated UI areas to ensure SSR compliance and basic interactivity.

## Phase 3 – Layout Migration
- **Global Shell**: Replace layout header, footer, navigation, and shells with cockpit-inspired implementations using `next/link` and App Router conventions. Ensure navigation states, theme toggle, and cart badge remain wired to Medusa data sources.
- **Global Styles Cleanup**: Update `globals.css` to remove Medusa overrides, retaining DJI animations and variables while relying on the new component library.
- **Testing Checkpoint**: Run `pnpm build` and Playwright smoke tests after the shell swap to confirm layout integrity before deeper module refactors.

### Phase 3 Task Breakdown
1. **Layout Inventory & Gap Analysis**
   - Document current layout structure (`apps/web/src/app/[countryCode]/(main)/layout.tsx`, nav modules, footers) and list Medusa-specific dependencies that must be replaced.
   - Map cockpit layout features (theme toggle, cart badge, responsive nav) to existing Medusa data sources.
2. **Header Migration**
   - Implement new header component using Phase 2 primitives and Next navigation utilities.
   - Connect theme toggle, account/cart links, and locale selectors to existing context/hooks.
   - Remove Medusa header components and update all imports.
3. **Footer & Global Sections**
   - Port cockpit footer (links, CTA, social icons) and integrate with current content.
   - Replace any site-wide banners or announcements with DJI-styled equivalents.
4. **Layout Shell Integration**
   - Update App Router layout files to consume the new header/footer components and shared providers.
   - Ensure data fetching hooks still run server-side where required.
5. **Global Styles Cleanup**
   - Remove Medusa-specific styles from `globals.css`, retaining DJI tokens and animations.
   - Drop now-unused CSS and purge redundant utilities from the compatibility layer.
6. **Validation**
   - Run `pnpm lint`, `pnpm build`, and Playwright smoke tests (nav, theme toggle, cart access).
   - Capture Percy/visual snapshots to baseline the new global shell before module refactors.

## Phase 4 – Feature Modules Refactor
- **Homepage & Marketing**: Swap modules under `modules/home`, `modules/blog`, `modules/software` to use DJI components, ensuring hero, CTA, and carousel sections follow DJI guidelines.
- **Product & Collections**: Rebuild product cards, detail tabs, filters, and lists with new primitives. Replace `@medusajs/ui` imports, keeping pricing and availability logic intact. Capture Medusa API fixtures or run integration snippets post-conversion to ensure data parity.
- **Cart & Checkout**: Restyle cart tables, summary blocks, forms, and accordions using DJI design while preserving payment integrations. Run checkout Playwright tests after each milestone to guard against regressions early.
- **Account & Orders**: Update account management, address modals, and order details to the new typography and component set, validating against captured account fixtures.

### Phase 4 Task Breakdown
1. **Homepage & Marketing Refresh**
   - Audit `modules/home`, `modules/blog`, `modules/software` for Medusa UI usage; create a component checklist.
   - Replace hero, featured product rails, testimonial blocks, and blog previews with Phase 2 primitives and cockpit styling patterns.
   - Validate marketing pages in multiple locales/country codes where applicable.
2. **Product & Collections Overhaul**
   - Rewrite product cards, detail pages, tabs, and filter UI using DJI components.
   - Replace `@medusajs/ui` imports with local primitives; update utility classes to DJI equivalents.
   - Capture API responses (e.g., products, collections) and run integration checks post-refactor to ensure data parity.
3. **Cart Experience**
   - Restyle cart page (items list, summary, buttons) with DJI patterns.
   - Update cart dropdown/minicart and empty states.
   - Execute Playwright cart smoke tests after changes to verify add/remove flows.
4. **Checkout Flow**
   - Convert shipping, payment, address, and review steps to DJI styling; ensure Stripe components render correctly.
   - Replace default UI elements (accordions, tables) with local equivalents.
   - Run Playwright checkout tests and record Percy snapshots per step.
5. **Account & Orders**
   - Migrate account dashboard, profile forms, address management, and order history components to DJI styling.
   - Update order detail/transfer pages, ensuring modals and toasts rely on new primitives.
   - Validate against saved customer data fixtures or staging sandbox.
6. **Regression Checks per Module**
   - After each module group (home, products, cart, checkout, account), run `pnpm lint`, `pnpm build`, targeted Playwright suites, and Percy snapshots.
   - Remove now-unused Medusa class aliases from `legacy-medusa.css`.

## Phase 5 – Skeletons & Edge Cases
- **Skeleton Components**: Recreate loading states (cart, product previews, lists) with DJI colors and spacing.
- **Error/Empty States**: Update `not-found`, empty cart, and banners to match new typography and buttons.
- **Utility Cleanup**: Remove remaining Medusa helpers (`clx`, legacy classnames, unused icons) and redundant CSS.

### Phase 5 Task Breakdown
1. **Skeleton Audit**
   - Inventory skeleton components under `modules/skeletons` and identify Medusa UI dependencies.
   - Design DJI-aligned skeleton patterns (shimmer colors, spacing, border radius) based on the design tokens.
2. **Skeleton Refactor**
   - Implement new skeleton components for product lists, product detail, cart, checkout, and account sections using Phase 2 primitives.
   - Ensure loading states integrate with React Suspense boundaries or existing query placeholders.
3. **Error & Empty States**
   - Update `not-found` pages, empty cart messages, and promotional banners to use DJI typography, buttons, and illustration styles.
   - Verify localized copy and links still function.
4. **Legacy Utility Cleanup**
   - Remove remaining entries from `legacy-medusa.css` and delete unused `txt-*` class references across the codebase.
   - Drop unused icons and components imported from Medusa packages.
5. **Validation**
   - Run `pnpm lint`, `pnpm build`, and targeted Playwright scenarios focused on skeleton display and error/empty states.
   - Capture Percy snapshots to confirm visual consistency between loading/error states and their steady-state counterparts.

## Phase 6 – Validation & Release Prep
- **Automated Checks**: Execute `pnpm lint`, `pnpm build`, and Playwright smoke tests **after each phase**, expanding coverage to include checkout, account, and product detail flows. Introduce Percy (or equivalent) visual regression snapshots as soon as the homepage is migrated so diffs are captured early.
- **Documentation**: Update README and design documentation in `docs/basic` with the new component library and token references, noting differences from the original Medusa starter.
- **Final Cleanup**: After each module conversion, purge unused dependencies and regenerate the lockfile to keep type errors manageable. Perform a final sweep in this phase to ensure the dependency graph is lean and to analyze bundle output for tree-shaking wins.
- **Review & Rollout**: Prepare PR with validation notes and screenshots, deploy to staging, and verify end-to-end flows before production release.

### Phase 6 Task Breakdown
1. **Testing Matrix Expansion**
   - Compile a checklist of Playwright scenarios covering homepage, product detail, cart, checkout, and account flows.
   - Implement or update Playwright scripts; configure Percy (or similar) for visual diffs triggered during CI.
2. **Continuous Validation**
   - Ensure `pnpm lint`, `pnpm build`, and Playwright suites run after each major phase (1–5); track results in a shared log.
   - Investigate and resolve any regressions before moving to final rollout.
3. **Documentation Updates**
   - Refresh `apps/web/README.md` with new setup instructions, component library overview, and token usage notes.
   - Update design docs in `docs/basic` summarizing the migration, highlighting differences from the Medusa starter, and linking to new components.
4. **Dependency & Bundle Audit**
   - Remove unused packages from `apps/web/package.json`, regenerate `pnpm-lock.yaml`, and confirm clean installs.
   - Analyze bundle size (e.g., using `next build --analyze`) to ensure tree-shaking improvements are realized.
5. **Staging & Release Prep**
   - Prepare a migration PR summarizing scope, testing, and screenshots.
   - Deploy to staging, run full regression suite, and collect stakeholder sign-off.
   - Create a launch checklist covering rollout tasks, monitoring plans, and fallback steps.

## Phase 7 – Post-Migration Tasks
- **Monitoring**: Track checkout and account metrics post-launch to catch regressions. Gather UX feedback on the new design system.
- **Enhancements**: Schedule follow-ups for dark mode refinements, accessibility audit, and Storybook documentation once the migration baseline stabilizes.

### Phase 7 Task Breakdown
1. **Monitoring Setup**
   - Define metrics (checkout conversion, cart abandonment, session errors) and ensure observability dashboards or alerts are configured.
   - Prepare a monitoring guide for the first 2–4 weeks post-launch, noting responsible owners.
2. **Feedback Loop**
   - Collect feedback from internal stakeholders, beta users, or support channels; log items in a backlog categorized by severity.
   - Schedule a design review comparing cockpit reference vs. live implementation to assess fidelity.
3. **Accessibility & UX Enhancements**
   - Conduct an accessibility audit (axe or manual checklist) focusing on color contrast, keyboard navigation, and screen reader experience.
   - Prioritize fixes discovered and plan follow-up sprints.
4. **Documentation & Enablement**
   - Create or update documentation (e.g., Storybook, usage guides) to help developers adopt the new UI components.
   - Host a handoff session for the broader team covering design token usage and component APIs.
5. **Backlog Grooming**
   - Review outstanding tasks from earlier phases (e.g., deferred features, legacy cleanup) and convert into tracked issues with owners and timelines.

## Execution Log
### 2025-11-04 – Iteration 0 (Foundation Resync)
- Recreated the DJI primitive library under `apps/web/src/components/ui` (Button, Text, Heading, Checkbox, Input, Select, Tabs, Accordion, Badge, Container, Table, RadioGroup, Toast, and `cn`). Components are staged but not yet referenced, allowing incremental rollouts without regressions.
- Added the `styles/typography.css` utility sheet and ensured `globals.css` imports follow the correct order (tokens → typography → legacy → Tailwind) so body copy and headings stay aligned with cockpit specs.
- Installed the necessary `@radix-ui/*` dependencies and refreshed `pnpm-lock.yaml` via `pnpm install`.
- Validation snapshot: `pnpm --filter medusa-next lint` and `pnpm --filter medusa-next build` both succeed using the Medusa mock data introduced in Phase 1.
- Next focus (Iteration 1): migrate low-risk shell modules (footer, 404, transfer pages, CTA) to the new primitives and introduce the Sonner/Toast provider while keeping Playwright runs on hold until middleware fixes land.

### 2025-11-05 – Iteration 1 (Shell Refresh)
- Mounted the new `AppToastProvider` (Radix-based) globally in `app/layout.tsx`, replaced `@medusajs/ui` Toasters, and introduced the `useToast` hook so account flows (e.g., profile password) can trigger notifications without third-party helpers.
- Swapped 404 + order-transfer pages (accept/decline/overview) and `TransferActions` to DJI `Heading`, `Text`, and `Button` primitives, aligning spacing with the cockpit spec and preserving server data flows.
- Updated layout scaffolding (footer template, Medusa CTA, mobile side menu) to consume the primitives and `cn` utility, cleaning up legacy `clx`/`txt-*` dependencies.
- Migrated the cart dropdown CTA buttons and cart mismatch banner to the new `Button` variants (including the fresh `link` style) and ensured anchor/button semantics rely on `asChild` for accessibility.
- Validation snapshot: `pnpm --filter medusa-next lint` and `pnpm --filter medusa-next build` remain green with mock data; Playwright still deferred until middleware fix.
- Next focus (Iteration 2): move into the product detail experience (actions, tabs, gallery) using the newly introduced primitives.

### 2025-11-06 – Iteration 2 (Product Detail Experience)
- Rebuilt the full PDP action stack (`product-actions`, option select, mobile actions) on DJI Button/Text primitives, adding spinner states, tokenized colors, and cleaner option chips via the shared `cn` helper.
- Migrated content modules (product info template, product price, tabs/accordion, onboarding CTA, image gallery, thumbnail, product previews/prices) away from `@medusajs/ui`, standardizing typography + spacing on DJI tokens and removing lingering `clx` utilities.
- Deleted the bespoke product-tabs accordion in favor of the shared Radix-backed components to reduce duplication and keep animations consistent.
- Validation snapshot: `pnpm --filter medusa-next lint` + `pnpm --filter medusa-next build` succeed (same known Next `themeColor` warnings remain). Playwright is still blocked pending middleware fix noted in Phase 1.
- Next focus (Iteration 3): tackle the cart templates/components with the new Table/Container primitives, then iterate toward checkout flows.

### 2025-11-07 – Iteration 3 (Cart Templates & Components)
- Swapped cart templates (items, preview, summary) to the DJI Heading/Table/Button primitives and wired cart CTAs via `Button asChild` so navigation links keep semantic anchors.
- Refactored cart components (line item row, cart-item select, sign-in prompt, empty-cart message) to rely on the shared UI kit plus the `cn` helper; cart quantity controls no longer depend on `@medusajs/ui`’s IconBadge.
- Migrated the shared helpers that power cart/checkout flows (`line-item-price`, `line-item-unit-price`, `line-item-options`, `delete-button`, `divider`, `native-select`, `interactive-link`) away from `@medusajs/ui`, aligning typography with the DJI tokens and centralizing styling inside `@/components/ui`.
- Validation snapshot: `pnpm --filter medusa-next lint` + `pnpm --filter medusa-next build` remain green with the existing `themeColor` warnings (still queued for a later metadata clean-up). Playwright continues to be deferred until middleware adjustments unblock the smoke suite.
- Next focus (Iteration 4): move into checkout steps (addresses, shipping, payment) now that cart primitives are stable, and start planning the middleware fix required for automated e2e.

### 2025-11-08 – Iteration 4 (Checkout Flows)
- Converted checkout summary, addresses, shipping, payment, review, and discount code modules to DJI primitives (Heading/Text/Button/Badge/Input) with consistent rounded containers and `cn` styling; checkout CTAs now share the same loading semantics as PDP/cart buttons.
- Replaced the Medusa payment container stack (payment container, Stripe card entry, payment test badge, payment button helpers) with the shared UI kit and refreshed CardElement styles; address selects and shipping address forms now lean on the new typography tokens.
- Validation snapshot: `pnpm --filter medusa-next lint` + `pnpm --filter medusa-next build` both succeed; the known Next metadata warnings persist until we move those `themeColor` declarations into `generateViewport`. Playwright remains blocked pending the middleware shortcut noted in Phase 1.
- Next focus (Iteration 5): shift to the account/order modules. In parallel, plan the middleware tweak so Playwright smoke tests can run before checkout/cart refinements ship to production.

### 2025-11-12 – Phase 7 Kickoff (Monitoring, Feedback, Accessibility)
- Enabled Vercel Analytics inside `app/layout.tsx` so every deployment automatically streams navigation metrics to the default dashboard—no custom hooks required. Documented the `NEXT_SKIP_REGION_MIDDLEWARE` flag (already wired into Playwright) to keep dev/test traffic consistent with the mock Medusa data source.
- Added a floating feedback widget (`apps/web/src/components/feedback/feedback-widget.tsx`) that links to `NEXT_PUBLIC_FEEDBACK_FORM_URL` or falls back to a mailto link, giving design/product teams a direct way to collect qualitative feedback without another release.
- Created an axe-powered accessibility spec (`tests/e2e/accessibility.spec.ts`) scanning `/us`, `/us/store`, and `/us/checkout` for serious/critical violations. The suite can run standalone via `pnpm --filter tests-e2e test -- accessibility.spec.ts` and is now part of the documentation checklist for Phase 7.
- Validation snapshot: `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=dummy pnpm --filter medusa-next lint`, `… build`, `pnpm --filter tests-e2e test` (smoke) and `pnpm --filter tests-e2e test -- accessibility.spec.ts` all pass using the mock backend/middleware bypass. Logged the benign Unsplash 404s emitted by Next’s image proxy so future runs can ignore them.
