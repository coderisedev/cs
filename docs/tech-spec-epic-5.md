# Technical Specification: Downloads Center & Post-Purchase Enablement

Date: 2025-10-19
Author: Aiden Lux
Epic ID: 5
Status: Draft

---

## Overview

This epic operationalizes the downloads center and post-purchase enablement experience outlined in the PRD by centralizing firmware, manuals, and release notes while enforcing governance, telemetry, and support connections. It delivers authenticated access to assets tied to owned products, provides version history with consent tracking, and exposes contextual downloads across PDPs and order history so customers stay productive after purchase.

The solution builds on the architecture’s Strapi + Next.js foundation, layering secure asset delivery, compliance logging, and support workflows that bridge operations, community, and marketing touchpoints.

## Objectives and Scope

**In Scope**
- Model Strapi `download`, `release_note`, and `asset_channel` types with version history, checksum metadata, regional restrictions, and relationships to Medusa products, firmware categories, and support content.
- Implement authenticated downloads center under Next.js `(downloads)` route group with filters, consent prompts, telemetry instrumentation, and legacy access workflows.
- Surface latest downloads within product detail pages and order history, including “What’s new” indicators when new firmware is available.
- Automate release note publishing, notification triggers (email, Discord, in-app banners), and version timelines per asset.
- Capture download telemetry (user, asset, timestamp, IP/device fingerprint), enforce consent flows for export-controlled assets, and document retention policies.
- Embed support escalation hooks, contextual FAQs, and Discord CTAs directly inside downloads experiences.
- Provide verification process for legacy customers (proof-of-purchase submissions, manual approvals, audit logging).

**Out of Scope**
- Automated firmware distribution installers or OTA update systems.
- Full-fledged RMA/ticketing portal beyond escalation hooks.
- Multi-tenant or OEM-specific download portals (single brand only).
- End-to-end DRM or watermarking; rely on signed URL expiration.
- Deep personalization beyond product ownership and recent activity.

## System Architecture Alignment

Epic 5 aligns with the solution architecture by leveraging Strapi content models for downloads metadata, storing binaries in Cloudflare R2/CDN, and issuing signed URLs via `/api/downloads/*` BFF endpoints guarded by NextAuth sessions. Medusa order data drives authorization, while railway-hosted services (Medusa, Strapi) communicate through webhooks to keep inventory, access rights, and release notes in sync. Observability extends OTEL tracing through downloads flows, with Segment capturing engagement and Logtail logging consent records. Support escalations tie into Notion/Slack channels defined in previous epics, and Discord announcements use the established webhooks.

## Detailed Design

### Services and Modules

| Module / Location | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `apps/strapi/src/api/download` | Define Strapi download assets, version history, release notes, compliance flags, and product associations. | Reads/writes PostgreSQL; emits publish webhooks with asset metadata. | Content |
| `apps/strapi/src/api/release-note` | Manage structured release notes linked to downloads with change logs and breaking change indicators. | Stores markdown/MDX body; relates to downloads + products. | Content |
| `apps/web/app/(downloads)` | Authenticated Next.js route group for downloads dashboard, filters, consent modal, legacy request flow. | Fetches via `packages/sdk/downloads`; emits Segment/OTEL events. | Frontend |
| `apps/web/app/api/downloads/*` | BFF layer issuing asset listings, signed URLs, release notes, telemetry logging, and consent validation. | Input: user session, filters; Output: DTOs + signed URL; writes telemetry to data store. | Platform |
| `apps/web/app/api/orders/[id]/downloads` | Serve downloads associated with an order for account history view. | Input: order id, session; Output: asset list with status badges. | Platform |
| `apps/web/app/api/legacy-access/*` | Handle legacy verification submissions, approvals, expirations, and audit logs. | Stores requests in PostgreSQL/Strapi; notifies support via Slack. | Support |
| `packages/sdk/downloads` | Shared SDK with zod schemas, TanStack Query hooks (`useDownloads`, `useReleaseNotes`, `useLegacyRequests`). | Normalizes Strapi data; manages cached consent state. | Platform |
| `packages/ui/downloads` | UI primitives for download cards, consent dialogs, release note timelines, telemetry toasts. | Receives typed props; enforces accessibility and responsive layouts. | Frontend |
| `apps/web/app/(product)/[slug]/components/ProductDownloads.tsx` | PDP module exposing latest downloads with “What’s new” indicator. | Input: product id, download DTOs; Output: curated list + CTA. | Frontend |
| `apps/web/app/api/notifications/release` | Trigger email, Discord, and in-app notifications on critical releases. | Consumes release note publish events; queues SendGrid + Discord webhooks. | Growth |

### Data Models and Contracts

- **Strapi `download` Content Type**
  - Fields: `slug`, `title`, `description`, `product_refs[]`, `supported_simulators[]`, `version_current`, `version_history[]`, `file_id`, `file_size`, `checksum_sha256`, `release_channel (stable|beta|legacy)`, `requires_consent`, `regions_allowed`, `legacy_access_required`.
  - Relationships: `release_notes[]`, `support_articles`, `faq_entries`, `discord_announcements`.

- **Release Note Model**
  - Fields: `version`, `published_at`, `importance_level`, `summary`, `breaking_changes[]`, `prerequisites`, `known_issues`, `download_ref`.
  - Markdown/MDX body stored with heading anchors for navigation.

- **Download DTO**
  - `{ id, title, description, productIds[], version, channel, checksum, size, lastUpdated, consentRequired, legacyOnly, downloadUrl?, releaseNotes[], badges[] }`.
  - `badges`: `[{ type: 'new'|'legacy'|'critical', label, tooltip }]`.

- **TelemetryRecord**
  - `{ id, userId, assetId, version, timestamp, ipHash, userAgent, source ('dashboard'|'pdp'|'order'), consentVersion, legacyAccessId? }`.
  - Stored in PostgreSQL or analytics warehouse; minimal PII (hashed IP).

- **ConsentSnapshot**
  - `{ userId, assetId, consentVersion, acceptedAt, policyVersion, signature (hash) }` persisted for compliance review.

- **LegacyAccessRequest**
  - `{ requestId, email, productSku, proofUrl, status ('submitted'|'approved'|'rejected'|'expired'), approvedBy?, expiresAt, notes }`.
  - Audit log entries capture transitions: `{ requestId, actorId, action, timestamp }`.

- **SupportEscalation**
  - `{ ticketId, assetId, userId, version, issueCategory, severity, createdAt, status }`, optionally linked to Notion/Jira/Ticket system through connectors.

### APIs and Interfaces

| Endpoint / Interface | Method / Signature | Request | Response / Notes |
| --- | --- | --- | --- |
| `GET /api/downloads` | GET | Query: `productId`, `channel`, `simulator`, `search`, `page`, `pageSize` | Returns paginated `DownloadDTO[]`; requires auth. |
| `GET /api/downloads/[id]` | GET | Path `id` | Returns detailed DownloadDTO with release notes and consent requirements. |
| `POST /api/downloads/[id]/authorize` | POST | `{ consentVersion?, source }` | Validates ownership/consent; issues signed URL token + telemetry seed. |
| `GET /api/downloads/[id]/file` | GET | Query `token` | Streams file via signed URL (Cloudflare R2); logs TelemetryRecord. |
| `GET /api/downloads/release-notes` | GET | Query: `productId`, `channel`, `limit` | Returns release note summaries for dashboards + notifications. |
| `POST /api/legacy-access/request` | POST | `{ email, productSku, proofFile }` | Creates LegacyAccessRequest; returns tracking id. |
| `POST /api/legacy-access/[id]/decision` | POST | `{ status, notes }` (ops only) | Updates request, triggers Slack/Email notifications. |
| `POST /api/support/download-issue` | POST | `{ assetId, version, issueSummary, severity }` | Creates SupportEscalation; returns ticket reference. |
| `GET /api/orders/[id]/downloads` | GET | Path `id` | Returns downloads associated with order items + new version badges. |
| `useDownloads(filters)` | React hook | `{ productId?, channel?, simulator?, page }` | TanStack Query hook for downloads dashboard. |
| `useReleaseNotes(productId)` | React hook | `productId` | Fetches timeline for release notes with caching. |
| `useLegacyAccess()` | React hook | — | Manages legacy request submission state + polling. |

### Workflows and Sequencing

1. **Model Downloads & Release Notes** — Define Strapi schemas, generate migrations, seed sample assets, and document authoring guidelines.
2. **Secure Asset Delivery** — Implement `/api/downloads` BFF endpoints, signed URL issuance (Cloudflare R2), and authorization checks using Medusa orders + entitlements.
3. **Build Downloads Dashboard** — Create Next.js `(downloads)` components with filters, consent modal, telemetry toasts, and legacy request flow.
4. **Integrate PDP & Order Views** — Embed `ProductDownloads` component on PDP and order detail pages, including “What’s new” indicator logic.
5. **Release Notes & Notifications** — Implement release note timeline UI, SendGrid email templates, Discord webhook announcements, and optional in-app banners.
6. **Telemetry & Compliance** — Log TelemetryRecord and ConsentSnapshot to analytics store; expose monitoring dashboards and retention policy documentation.
7. **Support Escalation Hooks** — Add contextual FAQs, Discord CTA, and support escalation form with prefilled data; integrate with existing support channels.
8. **Legacy Access Workflow** — Build request submission, operations approval UI, audit logs, expiration handling, and user notifications.
9. **Testing & Monitoring** — Execute automated tests, run download throughput simulations, verify consent logging, schema validation, and Lighthouse/axe checks on downloads pages.

## Non-Functional Requirements

### Performance
- `/api/downloads` listing responses ≤300 ms p95 with caching; `authorize` endpoint ≤250 ms p95.
- Signed URL generation completes within 200 ms; file delivery leverages CDN with <1 s TTFB for 95th percentile global users.
- Downloads dashboard initial render ≤1.2 s TTFB with streamed server components and cached user entitlements.
- Release note and notification jobs complete within 60 s of publish event.

### Security
- Enforce strict auth on `/downloads` routes via NextAuth; use role checks for operations endpoints.
- Signed URLs expire within 5 minutes and are single-use; tokens tied to user id + asset id, hashed and stored.
- Consent prompts required before downloading controlled assets; consent logs immutable and encrypted at rest.
- Legacy verification documents stored securely with limited retention; PII encrypted and purged after 90 days post decision.
- Data export routines available to satisfy GDPR/CCPA requests for download history.

### Reliability/Availability
- Achieve 99.5% uptime for download APIs; queue release note notifications with retries and DLQ.
- Webhooks and publish events idempotent; repeated releases do not duplicate notifications.
- Graceful degradation: if Strapi unavailable, dashboard shows cached assets with stale badge; file downloads fallback to last known signed URL cache where safe.
- Monitoring alerts trigger when download failure rate exceeds 3% over 10 minutes or consent logging drops below expected thresholds.

### Observability
- OTEL spans for `/api/downloads`, `/api/orders/*/downloads`, `authorize`, `legacy-access`, and notification jobs with correlation ids per asset.
- Segment events: `Download Viewed`, `Download Authorized`, `Download Started`, `Download Completed`, `Release Note Viewed`, `Legacy Access Requested`.
- Logtail structured logs capture consent acceptance, telemetry anomalies, and manual approval actions with actor identifiers.
- Grafana dashboards visualize download throughput, consent acceptance rates, legacy access backlog, release notification latency, and Discord CTA click-through.

## Dependencies and Integrations

- **CMS & Storage:** Strapi v5, PostgreSQL, Cloudflare R2 for asset binaries, Vercel edge caching.
- **Commerce:** Medusa order history for entitlement checks, Redis cache for entitlement lookup and “What’s new” badges.
- **Auth & Compliance:** NextAuth, LaunchDarkly flags for experimental channels, Consent logging service (PostgreSQL table or analytics warehouse).
- **Notifications:** SendGrid transactional emails, Discord webhooks, Slack/Notion for support escalations, Segment analytics, Logtail logs.
- **Support Tools:** Notion/Jira integration for escalation tickets, Cloudflare Turnstile on legacy access submission forms, Google reCAPTCHA fallback.
- **Monitoring:** OTEL collector, Sentry error tracking, Grafana dashboards, k6 for performance tests.

## Acceptance Criteria (Authoritative)

1. Strapi downloads and release note models implemented with seeded sample assets and documented authoring workflow.
2. Authenticated downloads dashboard lists assets filtered by owned products/simulators and enforces sign-in gating.
3. PDPs and order detail views display relevant downloads with “What’s new” badges when new versions exist.
4. Release note timeline shows version history, breaking change highlights, and triggers email/Discord notifications on publish.
5. Consent prompts captured for controlled assets with immutable logs; download telemetry records user, asset, timestamp, and source.
6. Support hooks embedded in downloads center (FAQs, Discord CTA, escalation form) and create tickets with prefilled context.
7. Legacy access workflow allows proof submission, manual approval, time-bound access, and audit logging for grants/revokes.
8. Discord announcements and newsletter updates propagate for critical releases, with analytics capturing CTA engagement.
9. Documentation delivered for compliance (retention, consent), support SOPs, and localization readiness for download strings.

## Traceability Mapping

| AC | Spec Sections | Components / APIs | Test Idea |
| --- | --- | --- | --- |
| 1 | Services & Modules; Data Models | Strapi schemas, seed scripts | Automated Strapi schema tests + migration verification. |
| 2 | Services & Modules; Workflows Step 3 | `(downloads)` routes, `/api/downloads` | Playwright E2E verifying filters, auth gating, and consent modals. |
| 3 | Workflows Step 4 | `ProductDownloads` component, `/api/orders/[id]/downloads` | Integration test linking Medusa orders to asset lists, verifying badge logic. |
| 4 | Workflows Step 5 | Release note API, notifications service | Unit test release timeline + E2E verifying email/Discord dispatch. |
| 5 | Workflows Step 6; NFR Security | Consent logging DB, telemetry pipeline | Automated test generating download to validate consent + telemetry records. |
| 6 | Workflows Step 7 | Support escalation endpoint, UI components | E2E submitting issue; confirm ticket creation and CTA tracking. |
| 7 | Workflows Step 8 | Legacy access API, audit logs | Integration test covering submission → approval → expiration with audit assertions. |
| 8 | Workflows Step 5 & 7; Dependencies | Notification jobs, Segment analytics | Synthetic notification test verifying message delivery + analytics event capture. |
| 9 | Workflows Step 9; Documentation deliverables | `docs/` compliance guides, localization entries | Documentation review + unit tests ensuring locale messages exported. |

## Risks, Assumptions, Open Questions

- **Risk:** High-volume firmware downloads could stress CDN bandwidth. *Mitigation:* enforce rate limiting, monitor usage, and consider regional mirrors if thresholds exceeded.*
- **Risk:** Consent logging failure could create compliance gaps. *Mitigation:* transactional writes with retries, alerting on failed inserts, periodic audit reports.*
- **Assumption:** Medusa order data includes SKU → product mapping required for entitlements. *Action:* confirm with commerce team before integration.*
- **Assumption:** Operations team prepared to manage legacy approvals within SLA. *Action:* define SOP and staffing plan.*
- **Question:** Should we support offline download tokens (e.g., emailed links) for customers in restricted environments? *Next Step:* align with support/compliance.*
- **Question:** Are beta release channels available at launch or behind feature flag? *Next Step:* coordinate with product marketing and use LaunchDarkly for gating.*

## Test Strategy Summary

- **Unit Tests:** DTO mapping, consent logging helpers, signed URL token generation/validation, release note markdown parsing.
- **Integration Tests:** `/api/downloads`, `/api/orders/[id]/downloads`, `/api/legacy-access/*`, `/api/notifications/release` with mocked Medusa/Strapi responses.
- **E2E Tests:** Playwright flows for download authorization, release note browsing, PDP badge display, legacy access submission, support escalation.
- **Performance Tests:** k6 load test hitting `/api/downloads` and signed URL issuance; simulate concurrent downloads to validate CDN performance.
- **Security Tests:** OWASP ZAP scan for downloads endpoints, penetration test for legacy access form, verify signed URL expiration + replay protection.
- **Monitoring Verification:** Synthetic download script run post-deploy to validate telemetry, consent logging, notifications, and Discord CTA instrumentation.
- **Manual QA:** Compliance checklist (consent records, retention docs), support workflow walkthrough, localization copy review for downloads center UI.
