# Technical Specification: Community & Growth Activation

Date: 2025-10-19
Author: Aiden Lux
Epic ID: 6
Status: Draft

---

## Overview

This epic activates the community and growth programs that convert buyers into long-term advocates by connecting storefront experiences with Discord, showcases, campaigns, and lifecycle marketing. It delivers a community hub, live Discord metrics, showcase galleries, and campaign landing templates while automating newsletter journeys so momentum compounds after launch.

The solution leverages the existing Strapi + Next.js architecture to orchestrate community surfaces, instrumentation, and growth automations, ensuring engagement data feeds analytics and operations teams with clear feedback loops.

## Objectives and Scope

**In Scope**
- Build a community landing hub highlighting Discord stats, showcases, events, and value propositions for joining the ecosystem.
- Automate Discord metrics ingestion and render them across community and downloads surfaces with graceful fallbacks.
- Launch curated showcase galleries tied to Strapi entries, enabling filtering by product, simulator, and featured flag.
- Provide reusable campaign landing page templates and scheduling controls for marketing teams to launch promotions without engineering.
- Implement lifecycle email automations (welcome, post-purchase, win-back) and ensure triggers integrate with storefront events and analytics tracking.
- Surface community CTAs (Discord, showcases, campaigns) within PDPs, downloads center, and marketing emails in a measurable, privacy-compliant way.
- Instrument growth analytics and dashboards to observe engagement, campaign conversions, and community health.

**Out of Scope**
- Building a full-fledged ticketing or moderation console within the storefront (rely on Discord/native tools).
- Custom Discord bot development beyond webhook announcements and metrics ingestion.
- Advanced personalization or ML-based recommendation engines (heuristics only).
- Multi-brand campaign management; focus on Cockpit Simulator properties.
- Paid advertising attribution pipelines; limited to owned channels and analytics.

## System Architecture Alignment

Epic 6 extends the architecture’s community module by combining Strapi content (showcases, campaigns) with Next.js route groups `(community)` and `(campaigns)` that render SSR pages, powered by TanStack Query and LaunchDarkly flags for staged rollouts. Scheduled jobs (Node cron workers or GitHub Actions) call Discord API endpoints, store metrics in Strapi/Redis, and update navigation components. Engagement events flow through Segment and OTEL so growth teams can monitor user journeys, while SendGrid automations and Slack/Discord webhooks reuse the notification infrastructure defined in prior epics.

## Detailed Design

### Services and Modules

| Module / Location | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `apps/web/app/(community)` | Community landing page, Discord CTA blocks, events showcase, and engagement flows. | Fetches via `packages/sdk/community`; emits Segment events. | Frontend |
| `apps/web/app/(community)/showcases` | Showcase gallery with filtering, search, and responsive layout. | Consumes Strapi showcase entries via SDK; supports query params. | Frontend |
| `apps/web/app/(campaigns)/[slug]` | Campaign landing template rendering Strapi campaign content with hero, highlights, CTAs, schedules. | Input: Strapi campaign DTO; Output: marketing page + analytics. | Frontend |
| `apps/web/app/api/community/discord` | Fetch and cache Discord metrics (member count, active users) and expose to frontend. | Calls Discord API via bot token; stores in Redis/Strapi; returns DTO. | Platform |
| `apps/web/app/api/community/announcements` | Post announcements to Discord channels when campaigns or releases trigger notifications. | Receives event payload; posts to Discord webhook; logs telemetry. | Platform |
| `apps/web/app/api/community/metrics` | Aggregate engagement metrics (showcase views, CTA clicks) for dashboards. | Writes to analytics store/Segment; returns daily aggregates. | Growth |
| `apps/web/app/api/campaigns` | List and fetch campaign landing configs from Strapi. | Accepts filtering by schedule/status; returns normalized DTOs. | Platform |
| `apps/strapi/src/api/showcase` | Manage community showcase entries with product associations, media, localization, and moderation fields. | Reads/writes PostgreSQL; exposes workflow states. | Content |
| `apps/strapi/src/api/campaign` | Campaign CMS models with theming, scheduling, CTAs, and analytics tags. | Provides content to landing templates; triggers publish webhooks. | Marketing |
| `apps/strapi/plugins/community-automation` | Plugin orchestrating Discord metric ingestion, showcase approval notifications, and campaign start/end alerts. | Scheduled tasks via Strapi cron; posts to Slack/Discord. | Platform |
| `packages/sdk/community` | SDK layer exposing hooks (`useCommunityStats`, `useShowcases`, `useCampaign`) with zod validation. | Normalizes Strapi + Discord API responses; caches metrics. | Platform |
| `packages/ui/community` | UI components for metric cards, showcase tiles, event banners, CTAs, campaign modules. | Receives typed props; ensures WCAG/Responsive behavior. | Frontend |
| `apps/web/app/api/automation/lifecycle` | Trigger marketing automation flows (welcome, post-purchase, win-back) via SendGrid/ESP API. | Input: event type, user context; Output: automation trigger result. | Growth |

### Data Models and Contracts

- **Strapi `showcase` Type**
  - Fields: `title`, `description`, `mediaGallery[]`, `featured`, `simulator`, `product_refs[]`, `discord_user`, `submitted_at`, `approved_at`, `locale`.
  - Workflow states: `draft`, `pending_review`, `approved`, `rejected`, `archived`.
  - Relations to campaigns, guides, and downloads for cross-promotion.

- **Strapi `campaign` Type**
  - Fields: `slug`, `title`, `hero`, `subheading`, `start_at`, `end_at`, `theme_variant`, `cta_primary`, `cta_secondary`, `body_blocks[]`, `seo_meta`, `locale`.
  - Publish webhooks trigger LaunchDarkly flag toggles or direct activation.

- **DiscordMetrics DTO**
  - `{ guildId, memberCount, activeUsers24h, onlineNow, lastSyncedAt, inviteUrl }`.
  - Cached in Redis with TTL 10 minutes and persisted to Strapi for fallback.

- **CommunityStats DTO**
  - Combines Discord metrics, showcase count, active campaigns, downloads center engagement signals.

- **CampaignDTO**
  - `{ slug, title, hero, highlights[], productRefs[], startAt, endAt, theme, seo, ctas[], trackingId }`.

- **ShowcaseDTO**
  - `{ id, title, description, media[], simulator, products[], discordUser, featured, publishedAt, ctaLinks[] }`.

- **AutomationTrigger Payload**
  - `{ userId, email, flow ('welcome'|'post_purchase'|'win_back'), eventContext: { orderId?, campaignId?, source }, traits }`.

- **CommunityEngagement Event Schema**
  - Segment events: `Discord CTA Clicked`, `Showcase Viewed`, `Campaign CTA Clicked`, `Community Join Completed`, `Lifecycle Automation Triggered`.

### APIs and Interfaces

| Endpoint / Interface | Method / Signature | Request | Response / Notes |
| --- | --- | --- | --- |
| `GET /api/community/discord` | GET | Optional `forceRefresh=true` (admin only) | Returns `DiscordMetrics` DTO with caching. |
| `GET /api/community/showcases` | GET | Query: `page`, `simulator`, `productId`, `featured`, `search`, `locale` | Returns paginated `ShowcaseDTO[]`. |
| `GET /api/community/showcases/[id]` | GET | Path `id` | Returns showcase detail with media + related products. |
| `POST /api/community/showcases/[id]/feature` | POST | Admin only; `{ featured: boolean }` | Updates featured flag; triggers notifications. |
| `GET /api/campaigns` | GET | Query: `status=active|upcoming|expired`, `locale` | Returns `CampaignDTO[]`. |
| `GET /api/campaigns/[slug]` | GET | Path `slug` | Returns single `CampaignDTO`; 404 if not active. |
| `POST /api/community/announcements` | POST | `{ channel, message, embeds?, campaignId?, releaseId? }` | Sends message to Discord via webhook; logs result. |
| `POST /api/automation/lifecycle` | POST | `AutomationTrigger` payload | Triggers ESP automation; returns success/failure with trace id. |
| `GET /api/community/metrics` | GET | Query: `range=7|30`, `metric` | Returns aggregated analytics for dashboards. |
| `useCommunityStats()` | React hook | — | Fetches `CommunityStats` with fallback for cached metrics. |
| `useShowcases(filters)` | React hook | `filters` aligning with listing query | TanStack Query hook for showcase gallery. |
| `useCampaign(slug)` | React hook | `slug` | Returns campaign detail + schedule metadata. |
| `useLifecycleAutomation()` | React hook | — | Provides helper to trigger marketing flows (used in checkout/downloads contexts). |

### Workflows and Sequencing

1. **Model Showcases & Campaigns** — Define Strapi schemas, permissions (submitter, curator, marketer), workflow states, and moderation guidelines; seed sample showcases/campaigns.
2. **Community Hub & Showcase Gallery** — Build `(community)` pages, hero sections, metrics cards, showcase filtering, and responsive layouts with a11y compliance.
3. **Discord Metrics Ingestion** — Implement scheduled job hitting Discord API, caching metrics, handling rate limits, and exposing them via API/Hooks with fallback values.
4. **Campaign Landing Templates** — Develop `(campaigns)/[slug]` template supporting theming, scheduling via LaunchDarkly or publish windows, SEO metadata, analytics instrumentation.
5. **Lifecycle Automation Integrations** — Connect SendGrid/ESP flows with triggers from checkout, downloads, and community interactions; ensure double opt-in and preference syncing.
6. **Contextual CTAs & Cross-Surface Integration** — Embed community CTAs on PDPs, downloads, account dashboard, and success screens; ensure analytics captures entry/exit points.
7. **Showcase Submission & Moderation** — Build submission forms (optionally behind Discord auth), reviewer dashboards, notifications for approvals/rejections, and featured rotations.
8. **Analytics & Monitoring** — Configure Segment events, Grafana dashboards, and alerts for Discord metrics anomalies, CTA conversion drops, and automation failures.
9. **Launch Playbook** — Document community SOPs (moderation, campaign publishing), update compliance/privacy notes for community data, and rehearsal plan for campaign rollouts.

## Non-Functional Requirements

### Performance
- Community hub pages render with TTFB <1.2 s using streamed server components and prefetching metrics.
- Discord metrics polling limited to every 10 minutes; API responses ≤200 ms when served from cache.
- Showcase gallery supports up to 500 entries with pagination; queries return ≤300 ms p95.
- Campaign pages load critical assets within 1.5 s LCP; non-critical scripts deferred.

### Security
- Discord API tokens stored in Pulumi-managed secrets; rotate quarterly.
- Submitter forms protected by Cloudflare Turnstile; moderation endpoints require marketer/ops roles.
- Lifecycle automation triggers log consent and respect user opt-out preferences pulled from marketing ESP.
- Campaign scheduling obeys LaunchDarkly flag rules to avoid accidental public release.

### Reliability/Availability
- Community API endpoints target 99.5% uptime; Discord ingestion job retries with exponential backoff.
- Showcase and campaign publishing ensure idempotent webhooks; failure alerts escalate to marketing ops.
- Lifecycle automation triggers queued; DLQ handles ESP outages with operator notifications.
- Discord metrics fallback to last-known values with stale indicator if API unavailable beyond 30 minutes.

### Observability
- OTEL spans for community endpoints, Discord ingestion, campaign rendering, and automation triggers with correlation ids tied to campaign/showcase IDs.
- Segment tracks events (`Community Hub Viewed`, `Discord CTA Clicked`, `Showcase Filter Applied`, `Campaign CTA Clicked`, `Lifecycle Automation Triggered`).
- Logtail logs moderation actions, showcase approvals, campaign schedule changes, and automation failures.
- Grafana dashboards visualize community member growth, CTA conversions, campaign performance, and automation throughput with alert thresholds.

## Dependencies and Integrations

- **CMS & Data:** Strapi v5 (`showcase`, `campaign` models), PostgreSQL, Redis cache for metrics.
- **Community Platforms:** Discord API (member stats), Discord webhooks for announcements, Notion/Slack for moderation notifications.
- **Frontend Stack:** Next.js 15, TanStack Query 5.x, LaunchDarkly for gating community features, Shadcn UI components.
- **Marketing & Analytics:** SendGrid Marketing Campaigns (automations), Segment analytics, OTEL/Sentry/Logtail monitoring, Grafana dashboards.
- **Security & Forms:** Cloudflare Turnstile, optional Discord OAuth for showcase submissions, Pulumi secrets management.

## Acceptance Criteria (Authoritative)

1. Community hub page deployed featuring Discord metrics, showcase highlights, events, and clear value proposition.
2. Scheduled Discord sync job updates metrics every 10 minutes with fallbacks and surfaces data across relevant pages.
3. Showcase gallery supports filtering by product/simulator, responsive design, and moderation workflow from submission to publish.
4. Campaign landing template handles theming, scheduling, and analytics instrumentation; marketers can launch campaigns without engineer intervention.
5. Lifecycle email automations (welcome, post-purchase, win-back) triggered via API with consent-aware logging and success monitoring.
6. PDPs, downloads center, and order confirmations include contextual community CTAs tracked via Segment events.
7. Showcase submission flow (or import) includes moderation alerts, approval/rejection actions, and audit logging.
8. Discord announcement workflow posts campaign/release updates to configured channels with success/failure alerts.
9. Community performance dashboards (metrics aggregation, campaign engagement) live with alerting on metric anomalies.

## Traceability Mapping

| AC | Spec Sections | Components / APIs | Test Idea |
| --- | --- | --- | --- |
| 1 | Services & Modules; Workflows Step 2 | `(community)` page, `useCommunityStats` | Playwright test verifying hub renders metrics, showcases, CTAs. |
| 2 | Services & Modules; Workflows Step 3 | Discord ingestion job, `/api/community/discord` | Integration test mocking Discord API and ensuring cache fallback. |
| 3 | Services & Modules; Workflows Step 7 | `showcase` Strapi model, gallery UI | Submission → approval E2E test plus A11y audit. |
| 4 | Workflows Step 4 | `(campaigns)/[slug]`, `/api/campaigns` | Automated test creating campaign in Strapi, verifying schedule + analytics hooks. |
| 5 | Services & Modules; Workflows Step 5 | `/api/automation/lifecycle`, SendGrid integration | Trigger flows in staging; assert logs + ESP delivery. |
| 6 | Workflows Step 6 | PDP/download CTAs, Segment events | Playwright verifying CTA visibility + event dispatch to analytics mock. |
| 7 | Workflows Step 7 | Moderation plugin, Slack notifications | Integration test of submission status changes with audit logs + Slack stub. |
| 8 | Services & Modules; Dependencies | `/api/community/announcements`, Discord webhook | Synthetic announcement test ensuring message posted + logged. |
| 9 | Workflows Step 8 | `/api/community/metrics`, dashboards | Monitoring test verifying metrics API aggregates data and alerts on anomalies. |

## Risks, Assumptions, Open Questions

- **Risk:** Discord API rate limits could throttle metrics updates. *Mitigation:* implement caching, exponential backoff, and manual override tools.*
- **Risk:** Showcase moderation backlog may overwhelm staff. *Mitigation:* provide dashboards, reminder alerts, and optional auto-expire submissions.*
- **Assumption:** Marketing provides campaign creative and automation copy before development handoff. *Action:* align on content calendar.*
- **Assumption:** Discord server already configured with proper channels/webhooks and invite policies. *Action:* confirm with community management.*
- **Question:** Should showcase submissions require Discord authentication at launch or accept manual forms? *Next Step:* decide with community lead.*
- **Question:** Are localized community pages needed at launch? *Next Step:* coordinate with localization plan before enabling multi-locale support.*

## Test Strategy Summary

- **Unit Tests:** Discord metrics utilities, showcase DTO mappers, campaign schedule validators, automation payload builders.
- **Integration Tests:** `/api/community/discord`, `/api/campaigns`, `/api/community/announcements`, lifecycle automation triggers with mocked external services.
- **E2E Tests:** Playwright scenarios for community hub navigation, showcase filters, campaign landing engagement, CTA clicks, automation trigger smoke tests.
- **Performance Tests:** Load test community pages and metrics endpoint under simulated traffic; ensure caching prevents API exhaustion.
- **Security Tests:** Validate Discord token storage, Turnstile/reCAPTCHA enforcement, LaunchDarkly gating, and access controls on moderation endpoints.
- **Monitoring Verification:** Synthetic Discord sync, showcase submission, campaign publish, and automation trigger verifying metrics dashboards and alerts.
- **Manual QA:** Moderation SOP walkthrough, marketing campaign launch rehearsal, review of community messaging for compliance/privacy language.
