# Solution Architecture Document

**Project:** cs
**Date:** 2025-10-19
**Author:** Aiden Lux

## Executive Summary

The Cockpit Simulator DTC platform combines Medusa (commerce), Strapi v5 (content), and a Next.js 15 frontend into a composable monorepo that can scale from launch to enterprise throughput. This architecture delivers rich product education, multi-currency commerce, and post-purchase enablement while keeping performance, accessibility (WCAG 2.1 AA), and operational observability as first-class concerns. Frontend experiences are rendered through the Next.js App Router with server components, edge caching, and a shared design system powered by Tailwind CSS + Shadcn UI. Medusa and Strapi run as independent services on managed PostgreSQL, orchestrated through event-driven webhooks and a thin BFF layer exposed to the frontend. CI/CD, infrastructure-as-code, and environment isolation (local, preview, staging, production) are handled via GitHub Actions, Vercel, and Railway, giving the team reproducible deployments and fast feedback loops.

### Prerequisites & Scale Assessment

Status file `docs/bmm-workflow-status.md` confirms the project is at **Phase 2 → Step: solution-architecture** with PRD and UX specification already completed. The initiative is a **Level 4, greenfield web platform** with complex UI surfaces spanning storefront, content hubs, downloads center, and community modules. Required inputs are available:

- PRD (`docs/PRD.md`) — approved on 2025-10-19  
- UX Specification (`docs/ux-specification.md`) — finalized on 2025-10-19  
- Workflow context — project type `web`, user-facing UI **present**, UI complexity **complex**

Prerequisite validation outcome: ✅ proceed with full solution architecture workflow for a scale-adaptive, enterprise-level implementation.

## 1. Technology Stack and Decisions

### 1.1 Technology and Library Decision Table

| Category         | Technology                | Version                | Justification |
| ---------------- | ------------------------- | ---------------------- | ------------- |
| Framework        | Next.js (App Router)      | 15.x                   | Hybrid SSR/SSG, React Server Components, edge-ready; integrates cleanly with Vercel and supports per-route rendering strategies. |
| Language         | TypeScript                | 5.x                    | Strong typing across monorepo; improves DX and reduces runtime defects for shared packages. |
| Database         | PostgreSQL (Managed)      | 15.x                   | First-class support in both Medusa and Strapi; ACID guarantees for transactional and CMS data. |
| Authentication   | NextAuth + Medusa Auth    | NextAuth 5.x, Medusa 2.x | Blends Medusa’s email/password flow with OAuth providers (Google) and centralizes session control. |
| Hosting          | Vercel (frontend), Railway (Medusa/Strapi) | Latest | Vercel optimizes Next.js delivery; Railway provides managed Postgres, Node runtime, and environmental parity. |
| State Management | TanStack Query + Zustand  | Query 5.x, Zustand 4.x  | Query handles server cache & revalidation; Zustand stores lightweight client state (cart UI, toggles). |
| Styling          | Tailwind CSS + Shadcn UI + Radix Primitives | Tailwind 3.4, Shadcn latest | Implements design tokens from UX spec; accessible components with minimal custom CSS. |
| Testing          | Vitest, Playwright, Testing Library | Vitest 1.x, Playwright 1.46 | Supports unit, integration, and E2E coverage with CI-friendly reporters. |
| Messaging        | Redis (Medusa cache & queues) | 7.x | Optional but recommended for job queues (emails, inventory sync) and API caching. |
| Observability    | OpenTelemetry + Sentry + Logtail | OTEL 1.x | Unified tracing, error tracking, and structured logs across services. |
| Deployment IaC   | Pulumi (TypeScript)       | Latest                  | Declarative infra management for Railway services, secrets, and networking. |

## 2. Application Architecture

### 2.1 Architecture Pattern

Apply a composable, service-oriented web architecture with three primary services: Next.js frontend (presentation + BFF), Medusa commerce service (catalog, cart, checkout), and Strapi content service (guides, blog, downloads metadata). Services communicate via REST/GraphQL APIs and webhook-driven events to keep content and commerce synchronized. The monorepo houses shared packages (design system, API SDKs, types) to enforce consistency. Edge caching protects read-heavy endpoints while write operations route directly to Medusa/Strapi with optimistic UI updates.

### 2.2 Server-Side Rendering Strategy

Use a mixed rendering strategy tuned per route: 
- Marketing and evergreen content (Home, Guides, Blog) leverage SSG with ISR (revalidate every 15 min) to ensure SEO performance. 
- Product detail, cart, account, and downloads pages render via SSR with React Server Components to surface personalized data securely. 
- API routes in the Next.js app handle BFF duties and webhook ingestion; server actions manage mutations without exposing direct credentials to the client.

### 2.3 Page Routing and Navigation

Adopt the Next.js App Router with nested layouts. `/` (marketing shell) houses Home, Guides, Blog, Community; `/shop` manages catalog, comparison, PDP; `/account` is an authenticated subtree with dashboard and settings; `/downloads` gated behind auth; `/support` provides resources/forms. Shared layout injects primary navigation, utility bar (currency selector, search, cart), and context providers. Middleware enforces locale/currency defaults and redirects unauthenticated users attempting to access protected routes.

### 2.4 Data Fetching Approach

Implement data loaders in server components calling:
- Medusa REST endpoints (product list/detail, cart, orders) via a shared SDK with caching headers.
- Strapi REST/GraphQL endpoints for content modules. 
- Internal BFF routes for composite data (e.g., PDP combining Medusa product + Strapi guide listing). 
Use incremental cache revalidation (`revalidateTag`) and event-triggered revalidation (webhooks) to keep cached pages fresh. Client-side hydration uses TanStack Query for follow-up mutations and polling where necessary (order status).

## 3. Data Architecture

### 3.1 Database Schema

Two primary Postgres databases:
1. **Medusa DB** — core tables (`product`, `product_variant`, `price`, `currency`, `inventory_item`, `cart`, `order`, `customer`, `discount`, `region`). Extend with custom tables for compatibility tags and Discord showcase mapping.
2. **Strapi DB** — content types (`guide`, `blog_post`, `faq`, `download`, `release_note`, `showcase`, `campaign`). Relations map downloads to products and firmware versions.

Redis instance supports Medusa job queues (emails, reports) and cache invalidation tokens.

### 3.2 Data Models and Relationships

Key relationships:
- `product` ↔ `product_variant` (1:N) with `variant` referencing compatibility metadata. 
- `download` (Strapi) ↔ `product_variant` (Medusa) via join table for firmware targeting. 
- `guide` ↔ `product` (N:M) for contextual recommendations. 
- `order` ↔ `customer` (Medusa) and `order_history` records for audit trails. 
- `showcase` includes `product_ids` array to connect community builds with catalog entries.

### 3.3 Data Migrations Strategy

Use Medusa’s migration CLI for commerce schema updates; Strapi handles content type migrations through version-controlled schema JSON. Pulumi executes migrations as part of deployment: 
1. Run Medusa migrations (`medusa migrations run`). 
2. Apply Strapi schema diffs in staging before production. 
3. Seed baseline catalog/content via managed scripts (Turso or Supabase bucket for assets).

## 4. API Design

### 4.1 API Structure

Expose a lightweight BFF within Next.js `/app/api` to consolidate interactions:
- `/api/catalog/*` proxies Medusa with caching headers. 
- `/api/content/*` proxies Strapi with error normalization. 
- `/api/downloads/*` enforces auth checks before issuing signed URLs. 
- `/api/webhooks/*` ingests Medusa/Strapi events, triggers revalidation, logs to telemetry.

### 4.2 API Routes

Representative routes:
- `GET /api/catalog/products`, `GET /api/catalog/products/[id]`, `POST /api/cart` (create cart), `POST /api/cart/line-items`, `POST /api/checkout/paypal/session`.
- `GET /api/content/guides`, `GET /api/content/downloads`, `POST /api/support/ticket`.
- Webhooks: `POST /api/webhooks/medusa/order`, `POST /api/webhooks/strapi/publish`, `POST /api/webhooks/paypal/payment`.

### 4.3 Form Actions and Mutations

Use Next.js Server Actions for mutations requiring secrets:
- `createOrUpdateCart` calls Medusa admin via secure token.
- `submitSupportTicket` posts to support backend and Notion/Helpdesk via integration.
- `requestLegacyAccess` writes to Strapi verification queue and notifies operations via Slack webhook.

## 5. Authentication and Authorization

### 5.1 Auth Strategy

Authenticate via NextAuth’s Medusa adapter:
- Credential provider (email/password) delegates to Medusa’s auth endpoints.
- Google OAuth provider for social login; on success, user record synced to Medusa `customer`.
- Sessions stored in encrypted cookies, short-lived (12h) with refresh tokens.

### 5.2 Session Management

NextAuth session cookie (`Secure`, `HttpOnly`) with JWT strategy for stateless scaling. Session refresh ensures updated roles/permissions on each request. `next-auth` middleware enforces auth on `/account`, `/downloads`, `/community/dashboard`.

### 5.3 Protected Routes

Protected segments: `/account/**`, `/downloads/**`, `/community/manage`, `/admin` (future). Middleware checks session; unauthorized users redirected to `/login` with original path preserved. Backend endpoints verify JWT and role claims before serving data.

### 5.4 Role-Based Access Control

Roles: `customer`, `customer-premium`, `operations`, `support`, `marketing`, `admin`. RBAC enforced through Medusa’s customer groups and Strapi roles. Operations dashboard routes require `operations` role; downloads center shows additional diagnostic data for `support`.

## 6. State Management

### 6.1 Server State

TanStack Query with React Server Components for initial fetch:
- Query keys (`['catalog','filters']`, `['product', id]`, `['orders']`). 
- Server actions prefetch queries; hydration ensures optimistic updates for cart/order flows.

### 6.2 Client State

Zustand stores UI state: navigation drawer, currency preference, theme, in-progress form data, multi-step checkout progression. Persist select slices (`currency`) in `localStorage`.

### 6.3 Form State

React Hook Form for complex forms (checkout, account settings, legacy access). Integrates with Zod schemas for validation and triggers server actions on submit.

### 6.4 Caching Strategy

Layered caching:
- HTTP caching via Vercel edge for SSG/ISR pages.
- Redis for Medusa API responses and background jobs.
- TanStack Query caches client requests with stale-while-revalidate pattern.
- CDN caching for static assets and Strapi media through Cloudflare R2 CDN.

## 7. UI/UX Architecture

### 7.1 Component Structure

Component architecture mirrors UX spec:
- `/components/ui` for design system primitives (Shadcn-based).
- `/components/modules` for domain assemblies (ProductHero, GuidePage, DownloadsDashboard).
- `/components/layouts` for `MarketingLayout`, `AccountLayout`, `SupportLayout`.
- Storybook documented for developers; composition encourages reuse and variant control.

### 7.2 Styling Approach

Tailwind CSS with design tokens exported as CSS variables. Shadcn components customized to align with cockpit aesthetic. Use `clsx` and `cva` for variant management. Theme provider toggles dark/light and high-contrast classes.

### 7.3 Responsive Design

Breakpoints follow UX spec (xs, sm, md, lg, xl). Layout utilities ensure two-column structures collapse gracefully. Persistent actions (cart, CTA) surface via bottom sheets on mobile. `useMediaQuery` hook controls conditional rendering for heavy modules (charts) on narrow viewports.

### 7.4 Accessibility

WCAG 2.1 AA compliance: semantic markup, Radix primitives for accessible dialogs, keyboard navigable menus, form error announcements via ARIA live regions, downloadable assets accompanied by descriptive metadata, motion respects `prefers-reduced-motion`.

## 8. Performance Optimization

### 8.1 Frontend Performance

Leverage React Server Components, code splitting by route, image optimization via Next Image, script prioritization, and prefetch hints for likely navigation. Lazy-load non-critical modules (analytics, community widgets). Monitor Core Web Vitals via Vercel Analytics + Sentry.

### 8.2 Backend Performance

Medusa & Strapi scaled horizontally with Railway auto-scaling. Enable connection pooling (pgBouncer). Use Redis job queues for email/order processing. Background workers handle heavy tasks (inventory sync, sitemap generation).

### 8.3 Caching Layers

Cache tiers: Vercel edge cache (content), Redis (API responses), browser cache (static assets). Revalidation triggered by webhooks; manual purge via admin console if necessary.

### 8.4 Observability

OpenTelemetry instrumentation for Next.js, Medusa, Strapi to trace requests end-to-end. Sentry captures errors; Logtail collects structured logs (json). Grafana dashboards display key metrics (orders/hour, downloads, response times).

## 9. SEO and Content Delivery

### 9.1 Meta Tags and Head Management

Use Next.js Metadata API per route to define titles, descriptions, canonical URLs, OG/Twitter cards. Product pages include price and availability meta; content pages include authorship and reading time.

### 9.2 Sitemap

Generate dynamic sitemap via `/api/sitemap.xml` combining Medusa (products) and Strapi (guides/blog). Regenerate nightly and upon publish webhooks.

### 9.3 Structured Data

Inject schema.org JSON-LD for Product, Article, FAQ, HowTo, BreadcrumbList. Provide Organization schema on Home and Reviews aggregated on PDP when available.

## 10. Deployment Architecture

### 10.1 Hosting Platform

Frontend on Vercel with globally distributed edge network. Medusa and Strapi on Railway (auto-scaling containers) behind custom domains (`api.cs.com`, `content.cs.com`). Use Cloudflare DNS & R2 for asset storage (downloads).

### 10.2 CDN Strategy

Leverage Vercel CDN for frontend assets; Cloudflare CDN for Strapi media/downloads. Signed URLs ensure secure distribution. Cache-control and ETag headers manage invalidation.

### 10.3 Edge Functions

Edge middleware handles geo-aware currency selection, authentication gating, and A/B experiments. Edge functions also log request metadata for analytics sampling.

### 10.4 Environment Configuration

Environments: local (docker-compose), preview (per PR via Vercel + ephemeral Railway DB), staging, production. Environment variables managed through Pulumi secrets + Vercel/ Railway dashboards. Feature flags via LaunchDarkly (or internal simple flag service).

## 11. Component and Integration Overview

### 11.1 Major Modules

Modules: `commerce` (catalog, checkout), `content` (guides, blog), `downloads`, `community`, `support`, `operations`. Each module owns UI components, API hooks, and domain logic.

### 11.2 Page Structure

Page templates aligned with UX flows: marketing pages (Home, Guides, Blog), transactional pages (Shop, Cart, Checkout), post-purchase (Downloads, Account), admin/operations (dashboards). Layout wrappers ensure consistent hero, breadcrumbs, and CTA placement.

### 11.3 Shared Components

Shared primitives: Button, Card, Modal, Tabs, Table, ChartTile. Utility components: CurrencySwitcher, LocaleNotice, ConsentBanner, TelemetryTracker. Icons via Phosphor icon set. 

### 11.4 Third-Party Integrations

PayPal smart buttons, SendGrid email delivery, Discord webhooks, Segment analytics, Cloudflare Turnstile for forms, Slack alerts for operations events, Notion API for support runbook linking.

## 12. Architecture Decision Records

See ADR document (`docs/architecture-decisions.md`) for detailed records. Key highlights:
- ADR-001 Adopt Next.js App Router with Server Components.
- ADR-002 Host Medusa/Strapi on Railway with managed Postgres.
- ADR-003 Use Strapi for content-led growth and downloads metadata.
- ADR-004 Implement Redis-backed job queues for Medusa workflow.
- ADR-005 Integrate Discord via webhooks instead of SSO at launch.

**Key decisions:**

- Why this framework? {{framework_decision}}
- SSR vs SSG? {{ssr_vs_ssg_decision}}
- Database choice? {{database_decision}}
- Hosting platform? {{hosting_decision}}

## 13. Implementation Guidance

### 13.1 Development Workflow

Git branching: trunk-based with short-lived feature branches. PRs trigger lint/test/build previews. Required checks: typecheck, lint, Vitest, Playwright smoke. Use Turbo caching for faster pipelines. Weekly architecture review ensures cohesion.

### 13.2 File Organization

Monorepo structure:
- `apps/web` (Next.js)
- `apps/medusa` (Node service)
- `apps/strapi` (Headless CMS)
- `packages/ui` (design system)
- `packages/config` (eslint, tsconfig)
- `packages/sdk` (Medusa/Strapi client SDKs)
- `infra` (Pulumi scripts)

### 13.3 Naming Conventions

Use kebab-case for routes, PascalCase for components, camelCase for hooks/utilities. Database columns snake_case. Environment variables prefixed (`CS_`). ADR IDs incremental (ADR-001).

### 13.4 Best Practices

Document with Storybook and ADRs. Enforce code owners for critical modules. Run accessibility linting (`axe`) in CI. Security reviews before release. Regular backlog grooming ensures UX + architecture alignment.

## 14. Proposed Source Tree

```
apps/
  storefront/
    app/
      (marketing)/
      (shop)/
      (account)/
      (downloads)/
      api/
    components/
    lib/
    middleware.ts
  medusa/
    src/
      subscribers/
      services/
      repositories/
  strapi/
    src/
      api/
      extensions/
packages/
  ui/
  sdk/
  config/
infra/
  pulumi/
scripts/
tests/
  e2e/
```

**Critical folders:**

- `apps/web/app` : Route segments, server components, and server actions.
- `packages/ui` : Central design system primitives and tokens consumed across services.
- `apps/medusa/src/subscribers` : Event handlers for order lifecycle, sync jobs, and webhook emissions.

## 15. Testing Strategy

### 15.1 Unit Tests

Vitest + Testing Library for UI components and utility functions. Snapshot tests for design system variants. Ensure coverage of data mappers (Medusa ↔ Strapi).

### 15.2 Integration Tests

Integration tests via Vitest running in Node with supertest against Medusa/Strapi endpoints (mock DB). Validate BFF endpoints and webhook processing.

### 15.3 E2E Tests

Playwright suite: flows for browse-to-buy, post-purchase downloads, newsletter signup, community join, operations dashboard checks. Run nightly and on release branches.

### 15.4 Coverage Goals

Coverage targets: 80% statements/branches overall, 90% for critical modules (checkout, downloads). E2E baseline 12 scenarios with <10 min runtime.

Testing specialist deliverables: maintain Playwright fixtures (seed data), integrate visual regression for key pages, and provide synthetic monitoring scripts (Checkly) post-launch.

## 16. DevOps and CI/CD

GitHub Actions workflows: `ci.yml` (lint/test/build), `deploy-web.yml` (Vercel promotion on main), `deploy-services.yml` (Pulumi apply + Railway deploy). Secrets managed via GitHub OIDC to Pulumi/Vercel. Preview environments auto-destroyed post-merge.

DevOps specialist tasks: implement disaster recovery plan (daily Postgres backups, retention policy), set up alerting (PagerDuty) for uptime/downtime, maintain Pulumi stacks, and coordinate infrastructure cost monitoring.

## 17. Security

Security posture: enforce HTTPS/TLS everywhere, Content Security Policy with strict origins, rate limiting on sensitive routes, JWT signing rotation, secret scanning, dependency auditing (Renovate). Downloads require signed URLs with expiry. 

Security specialist actions: run quarterly penetration tests, manage bug bounty triage, maintain IAM least privilege, oversee vulnerability remediation SLAs (critical <24h, high <72h).

---

## Specialist Sections

**Testing:** Build Playwright suite, maintain fixtures, integrate visual regression.  
**DevOps:** Own Pulumi infrastructure, backup strategy, alerting, cost governance.  
**Security:** Enforce CSP, conduct pen tests, manage IAM & vulnerability response.  
**Performance:** Tune Core Web Vitals, monitor CDN metrics, optimize Redis cache hit ratio.  
**Analytics:** Implement Segment schema, validate telemetry events, produce KPI dashboards for operations.

---

_Generated using BMad Method Solution Architecture workflow_
