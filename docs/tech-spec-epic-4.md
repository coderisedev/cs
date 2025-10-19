# Technical Specification: Content Platform & SEO Engine

Date: 2025-10-19
Author: Aiden Lux
Epic ID: 4
Status: Draft

---

## Overview

This epic activates the Strapi-driven content platform and SEO foundation promised in the PRD by implementing editorial workflows, high-fidelity content presentation, and search-optimized integrations that power the content-to-commerce flywheel. It ensures guides, blog posts, showcases, and newsletters are authored, reviewed, and published through governed workflows while feeding contextual experiences across the storefront and PDPs.

The specification extends the architecture’s composable approach by deepening the Next.js ↔ Strapi integration, reinforcing dynamic sitemap and structured data strategies, and introducing recommendation heuristics and syndication endpoints that keep engagement high and organic reach growing.

## Objectives and Scope

**In Scope**
- Define and migrate Strapi v5 content models (guide, blog, FAQ, showcase, campaign) with localization readiness, relationships to Medusa products, and validation rules.
- Implement Next.js content listing/detail routes, SEO metadata generation, and PDP content modules backed by the Strapi API and shared SDK.
- Establish editorial workflow states (draft → review → published), scheduling, version history, and notifications for content teams.
- Deliver technical SEO capabilities: dynamic sitemaps, robots.txt, canonical tags, structured headings, and schema.org JSON-LD for products, articles, and guides.
- Build recommendation heuristics that surface related content on both product and content pages, instrumented with analytics to refine strategy.
- Integrate newsletter opt-ins with the marketing platform (double opt-in), expose RSS feeds, and capture consent/privacy messaging in line with compliance requirements.

**Out of Scope**
- Full localization rollout beyond English (structural prep only).
- AI-generated content authoring or automated translations.
- Advanced personalization powered by ML models (heuristics only).
- Full DAM (digital asset management) replacement; use existing Cloudflare R2 storage strategy.
- Multichannel syndication to external CMS platforms (RSS feeds only at launch).

## System Architecture Alignment

Execution aligns with the solution architecture by leveraging Strapi as the content nexus running on Railway with PostgreSQL, accessed via `/api/content/*` BFF routes that normalize responses and trigger cache revalidation. Next.js `(content)` route groups render server components using TanStack Query hydration and LaunchDarkly flags to stage features. Medusa ↔ Strapi relations defined in the architecture guide contextual modules on PDPs, while dynamic sitemap generation and schema markup follow the outlined SEO plan. Observability remains consistent through OTEL spans, Sentry, and Logtail logging, with Segment instrumentation capturing engagement events.

## Detailed Design

### Services and Modules

| Module / Location | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `apps/strapi/src/api/*` | Strapi content types (guide, blog_post, faq, showcase, campaign) with lifecycle hooks and localization fields. | Reads/writes PostgreSQL; emits publish webhooks. | Content |
| `apps/web/app/(content)` | Next.js route group for guides, blog, showcases, FAQs; renders listing/detail views with SEO metadata. | Fetches via `packages/sdk/content` and TanStack Query; emits Segment events. | Frontend |
| `apps/web/app/api/content/*` | BFF endpoints wrapping Strapi REST/GraphQL with caching, auth, and error normalization. | Accepts filter/pagination params; returns typed DTOs; sets cache tags. | Platform |
| `apps/web/app/api/webhooks/strapi` | Processes Strapi publish/unpublish events for cache invalidation, sitemap refresh, and recommendation recalculation. | Validates Strapi signature, enqueues jobs, logs telemetry. | Platform |
| `apps/web/app/api/sitemap.xml` | Generates combined sitemap (products + content) with incremental revalidation. | Reads Medusa + Strapi data; emits XML response with cache-control. | Platform |
| `packages/sdk/content` | Shared TypeScript SDK, zod schemas, and React hooks (`useGuides`, `useGuide`, `useRecommendations`). | Normalizes Strapi payloads, handles locales, exposes typed DTOs. | Platform |
| `packages/ui/content` | Component library for content teasers, hero blocks, article scaffolding, CTA cards, SEO meta utilities. | Receives typed data, renders WCAG-compliant UI with structured headings. | Frontend |
| `apps/web/app/(product)/[slug]/components/RelatedContent.tsx` | PDP module surfacing guides, blog posts, showcases based on Strapi relations. | Input: product metadata; Output: content cards + analytics hooks. | Frontend |
| `apps/strapi/plugins/workflow-notify` | Custom Strapi plugin sending review/publish notifications (Slack/email) and logging audit trail entries. | Consumes Strapi lifecycle events; posts to Slack + Logtail. | Content |
| `apps/web/app/api/newsletter/subscribe` | Handles newsletter opt-in, double opt-in handoff, and consent logging. | Integrates with marketing API (e.g., SendGrid Marketing Campaigns); stores consent snapshot. | Growth |

### Data Models and Contracts

- **Strapi Content Types**
  - `guide`: slug, title, summary, body (rich text), difficulty, simulator tags, associated Medusa product IDs, hero media, SEO fields, locale fields.
  - `blog_post`: author, categories, reading time, cover media, excerpt, body blocks, CTA references, meta title/description, locale fields.
  - `faq`: question, answer (rich text), categories, related products, locale fields.
  - `showcase`: title, description, media gallery, featured flag, related products/guides, community attribution, locale fields.
  - `campaign`: hero messaging, CTA links, start/end dates, placement zones, locale fields.

- **Content DTOs**
  - `ContentListResponse<T>`: `{ items: T[], pageInfo: { page, pageSize, total, hasNextPage } }` used across listing endpoints.
  - `GuideDTO`: normalized guide with `sections[]` extracted for navigation, `seo`, `relatedProducts`, `ctaBlocks`.
  - `BlogPostDTO`: includes `author`, `tags`, `readingTime`, `ogMeta`, `relatedGuides`, `rssLink`.
  - `ShowcaseDTO`: includes `media`, `productRefs`, `communityLinks`, `featured`.
  - `FaqDTO`: includes `question`, `answerHtml`, `categories`, `relatedProducts`.

- **Editorial Workflow State**
  - Enum: `draft`, `in_review`, `scheduled`, `published`, `archived`.
  - Metadata: reviewer assignments, scheduled publish time, version id, audit trail references.

- **RecommendationRecord**
  - Fields: `contentId`, `type (guide|blog|showcase)`, `relatedIds[]`, `score`, `source ('manual' | 'heuristic')`, `updatedAt`.
  - Stored in PostgreSQL table or Redis cache for quick lookup; refreshed on publish events.

- **NewsletterSubscription**
  - `{ email, status ('pending'|'active'|'unsubscribed'), source, locale, consentTimestamp, privacyVersion }`.
  - Stored in marketing platform and mirrored in Strapi for reporting.

- **LocalizationConfig**
  - Document stored in Git (`docs/localization.md`) describing locale codes, fallback strategy, translation workflow.

### APIs and Interfaces

| Endpoint / Interface | Method / Signature | Request | Response / Notes |
| --- | --- | --- | --- |
| `GET /api/content/guides` | GET | Query: `page`, `pageSize`, `tag[]`, `simulator`, `search`, `locale` | Returns `ContentListResponse<GuideDTO>` with cache tags `content,guides`. |
| `GET /api/content/guides/[slug]` | GET | Path: `slug`; Query: `locale` | Returns full `GuideDTO` with sections, related content arrays. |
| `GET /api/content/blog` | GET | Query: `page`, `category`, `search`, `locale` | Returns `ContentListResponse<BlogPostDTO>`. |
| `GET /api/content/blog/[slug]` | GET | Path: `slug`; Query: `locale` | Returns `BlogPostDTO` and `relatedPosts`. |
| `GET /api/content/showcases` | GET | Query: `featured`, `productId`, `locale` | Returns `ContentListResponse<ShowcaseDTO>`. |
| `GET /api/content/faqs` | GET | Query: `category`, `productId`, `locale` | Returns `ContentListResponse<FaqDTO>`. |
| `GET /api/content/recommendations` | GET | Query: `context=product|guide|blog`, `id`, `locale` | Returns ordered list of `RecommendationRecord`. |
| `POST /api/newsletter/subscribe` | POST | `{ email, source, locale, consentVersion }` | Enqueues double opt-in, stores consent log; returns 202 with tracking id. |
| `GET /api/rss/guides.xml` | GET | Query: `locale` | Returns RSS feed for guides; caches for 15 minutes. |
| `GET /api/rss/blog.xml` | GET | Query: `locale` | Returns blog RSS feed with episode metadata. |
| `POST /api/webhooks/strapi` | POST | Strapi webhook payload | Validates signature; triggers cache invalidation, sitemap regeneration, recommendation refresh. |
| `useGuides(params)` | React hook | `{ page, pageSize, tag, simulator, locale }` | Wraps TanStack Query, returns list + loading/error state. |
| `useGuide(slug, locale)` | React hook | — | Fetches single guide with memoized sections and SEO metadata. |
| `useContentRecommendations(context)` | React hook | `{ contextType, id, locale }` | Returns recommended content and analytics dispatch helpers. |

### Workflows and Sequencing

1. **Model & Migrate Content Types** — Define Strapi schemas with localization fields, relationships, validations; run migrations via Strapi export/import; seed sample entries.
2. **Implement Editorial Workflow & Permissions** — Configure roles (Author, Editor, Admin), integrate custom workflow plugin, set notifications/slack hooks, document SOPs.
3. **Build Content APIs & SDK** — Implement `/api/content/*` BFF endpoints with caching, error handling, and zod validation; extend `packages/sdk/content`.
4. **Develop Content Listing & Detail Pages** — Create Next.js `(content)` route components with server rendering, SEO metadata functions, CTA modules, and accessibility compliance.
5. **Integrate Content into PDPs & Navigation** — Add `RelatedContent` module to PDP, update navigation mega-menu, implement empty/fallback states.
6. **Deliver Technical SEO Stack** — Build dynamic sitemap, robots.txt, canonical tag utilities, structured heading components, and JSON-LD emitters.
7. **Launch Recommendation Engine** — Implement heuristic engine (category/tag overlap + popularity), cache results, surface UI modules, instrument analytics.
8. **Enable Growth Integrations** — Ship newsletter subscribe endpoint with double opt-in, create RSS feeds, and ensure consent logging + privacy notices.
9. **Prepare Localization & Documentation** — Document translation workflow, add locale toggles (behind flag), ensure components respect locale context.
10. **QA, Performance, and Monitoring** — Run automated tests, Lighthouse/axe audits, SEO validation (Open Graph, structured data), and monitor publish pipeline.

## Non-Functional Requirements

### Performance
- Content listing endpoints respond within 300 ms p95 with caching; detail pages SSR with TTFB <1.2 s using streaming and cached fragments.
- Recommendation endpoint returns within 200 ms p95 leveraging Redis caching; refresh jobs complete under 2 s.
- Sitemap and RSS generation tasks finish in <30 s, triggered nightly and on publish events without blocking main thread.

### Security
- Strapi roles enforce least privilege; API tokens scoped per environment with rotation every 90 days.
- Newsletter subscriptions enforce double opt-in and store hashed emails for compliance; unsubscribe links required in all communications.
- Webhook handlers verify signature and replay tokens; rate limiting applied to `/api/newsletter/subscribe` and content endpoints.
- Ensure GDPR/CCPA consent tracking for marketing opt-ins with audit-ready logs.

### Reliability/Availability
- Content APIs maintain 99.5% uptime; Strapi publish failures trigger retries and alerting.
- Cache invalidation ensures PDP related content never references unpublished items; fallback gracefully to default messaging.
- Newsletter integration queues requests to handle marketing API downtime, with DLQ processing.
- RSS/Sitemap endpoints degrade to last successful snapshot on generation failure.

### Observability
- OTEL spans for `/api/content/*`, recommendations, newsletter subscription, and Strapi webhooks; attach correlation IDs to publish events.
- Segment events track content impressions, guide detail reads, recommendation clicks, newsletter opt-ins.
- Logtail structured logs capture editorial workflow transitions, publish errors, and localization toggles.
- Grafana dashboards monitor content performance (pageviews, engagement), webhook success rates, and subscription conversions with alert thresholds (e.g., webhook failure rate >5% over 15 min).

## Dependencies and Integrations

- **CMS:** Strapi v5 on Railway PostgreSQL with Cloudflare R2 media; custom plugins for workflow notifications.
- **Frontend:** Next.js 15 App Router, TanStack Query 5.x, Shadcn UI, LaunchDarkly feature flags.
- **APIs:** `/api/content/*`, `/api/webhooks/strapi`, `/api/newsletter/subscribe`, `/api/rss/*.xml`, `/api/sitemap.xml`.
- **Analytics & Monitoring:** Segment, OTEL, Sentry, Logtail, Grafana; Lighthouse/axe for SEO/accessibility validation.
- **Growth Stack:** SendGrid Marketing Campaigns (or equivalent) for newsletter management, LaunchDarkly for phased rollouts, RSS feeds for syndication.
- **Caching & Storage:** Redis for recommendation cache, Vercel edge caching, Cloudflare CDN for Strapi assets.

## Acceptance Criteria (Authoritative)

1. Strapi content models (guide, blog, FAQ, showcase, campaign) configured with required fields, localization readiness, and seeded sample data.
2. Editorial workflow supports draft → review → scheduled → published with notifications and audit logs.
3. Content listing/detail pages render correct data, SEO metadata, and accessible layouts for guides, blog posts, showcases, and FAQs.
4. PDPs display related content modules that degrade gracefully when no relationships exist.
5. Dynamic sitemap, robots.txt, canonical tags, and structured headings deployed and validated via automated checks.
6. Schema.org markup emitted for product, article/blog, and guide HowTo pages without validation errors.
7. Recommendation engine surfaces relevant content on product and content pages, with analytics capturing engagement.
8. Newsletter opt-ins integrate with marketing platform using double opt-in and consent logging; RSS feeds available for blog and guides.
9. Localization scaffolding present (locale fields, toggle readiness, documentation) even if additional languages are not yet active.

## Traceability Mapping

| AC | Spec Sections | Components / APIs | Test Idea |
| --- | --- | --- | --- |
| 1 | Services & Modules; Data Models | Strapi schemas, migrations | Automated Strapi schema tests + snapshot of content types. |
| 2 | Services & Modules; Workflows Step 2 | Workflow plugin, notification hooks | Integration tests simulating author/reviewer flows with audit log assertions. |
| 3 | Services & Modules; Workflows Step 4 | `(content)` routes, `packages/ui/content` | Playwright crawl verifying listings, detail pages, SEO meta, accessibility. |
| 4 | Services & Modules; Workflows Step 5 | `RelatedContent` component, `/api/content/recommendations` | Unit tests with fixture data + E2E PDP checks for fallback states. |
| 5 | Workflows Step 6; NFR Performance | `/api/sitemap.xml`, robots utilities | Automated SEO test verifying endpoints and meta tags per page. |
| 6 | Workflows Step 6; Dependencies | JSON-LD generators, schema validation pipeline | Jest tests validating structured data output with Google Rich Results API. |
| 7 | Workflows Step 7; NFR Observability | Recommendation service, analytics instrumentation | Monitor events + integration tests verifying heuristic scoring and logging. |
| 8 | Workflows Step 8; Data Models (NewsletterSubscription) | `/api/newsletter/subscribe`, RSS feeds | Integration tests for opt-in flow, double opt-in webhook, and feed validation. |
| 9 | Workflows Step 9 | Localization documentation, locale-aware components | Manual QA + unit tests ensuring locale fields exist and toggle respects fallback. |

## Risks, Assumptions, Open Questions

- **Risk:** Strapi performance may degrade under heavy content queries. *Mitigation:* enable caching, paginate aggressively, leverage Redis for recommendations.*
- **Risk:** SEO regressions if structured data deviates from specs. *Mitigation:* integrate automated schema validation in CI and lighthouse checks per release.*
- **Assumption:** Marketing platform API keys available for newsletter integration prior to UAT. *Action:* confirm with growth team.*
- **Assumption:** Content team staffing includes reviewers to uphold workflow gates. *Action:* align on roles and training schedule.*
- **Question:** Should recommendation heuristics incorporate user-specific history at launch or remain session-based? *Next Step:* confirm with marketing/ops.*
- **Question:** Do we need multilingual SEO (hreflang) from day one? *Next Step:* decide before enabling locale toggle; update sitemap generation accordingly.*

## Test Strategy Summary

- **Unit Tests:** Strapi lifecycle hooks, DTO mappers, SEO utilities, recommendation scoring functions.
- **Integration Tests:** `/api/content/*`, `/api/newsletter/subscribe`, `/api/webhooks/strapi`, sitemap/RSS generation.
- **E2E Tests:** Playwright flows for content discovery, detail reading, PDP related content, newsletter opt-in, RSS feed validation.
- **Performance Tests:** k6 scripts for content endpoints under peak traffic; monitor Strapi response times and recommendation cache hit rates.
- **SEO & Accessibility:** Automated lighthouse and axe audits; schema validation using Google Rich Results Test API.
- **Monitoring Verification:** Synthetic publish webhook and newsletter opt-in tests post-deploy; check Grafana dashboards/alerts.
- **Manual QA:** Editorial workflow dry run, localization toggle review, marketing compliance checklist for consent messaging.
