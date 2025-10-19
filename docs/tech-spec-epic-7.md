# Technical Specification: Operations, Analytics & Compliance

Date: 2025-10-19
Author: Aiden Lux
Epic ID: 7
Status: Draft

---

## Overview

Epic 7 equips Cockpit Simulator operations with the governance, analytics, and compliance capabilities required for enterprise-scale delivery. It finalizes the operational backbone by implementing robust RBAC, dashboards, analytics instrumentation, fraud detection, privacy tooling, regulatory reporting, and incident readiness so the organization can monitor, govern, and continuously improve the platform post-launch.

This specification builds on the prior epics’ commerce, content, downloads, and community foundations, connecting data flows into centralized observability, ensuring legal/regulatory adherence, and codifying runbooks that keep teams aligned during steady state and incidents.

## Objectives and Scope

**In Scope**
- Define and enforce RBAC across storefront, Medusa, Strapi, and administrative surfaces with audit logging.
- Deliver operations dashboards consolidating orders, support, downloads, and community metrics with alerting for anomalies.
- Roll out a unified analytics and event schema (Segment) covering end-to-end user journeys with data governance documentation.
- Establish fraud monitoring rules, review queues, and reporting loops to mitigate chargebacks and suspicious behavior.
- Provide privacy tooling: consent management UI, data export/deletion workflows, policy acknowledgment tracking.
- Automate tax and regulatory reporting with scheduled exports and reconciliation summaries.
- Produce incident response playbooks, on-call rotations, post-incident templates, and go-live checklists for launch readiness.

**Out of Scope**
- Advanced machine learning risk scoring beyond configurable rules.
- Full-scale SIEM/SOC tooling (integrations provided for future expansion).
- Region-specific tax filing services beyond export-ready reports.
- Long-term data warehouse build-out (dashboards rely on existing analytics stack).
- Physical security procedures (documented separately by operations).

## System Architecture Alignment

Epic 7 aligns with the solution architecture by extending the `operations` module from the monorepo: Next.js admin routes protected by RBAC, Medusa admin APIs, Strapi permissions, and analytics pipelines (Segment → data warehouse). It uses OTEL to correlate operational events, integrates LaunchDarkly for role-gated features, and leverages Redis/PostgreSQL for storing audit trails and consent records. Dashboards pull from analytics storage (Segment exports/BigQuery) and surface via Grafana/Metabase while incident automation reuses notification infrastructure (Slack, PagerDuty, SendGrid). Privacy operations hook into the downloads consent logging and lifecycle automations built in earlier epics.

## Detailed Design

### Services and Modules

| Module / Location | Responsibility | Inputs / Outputs | Owner |
| --- | --- | --- | --- |
| `apps/web/app/(operations)` | Protected operations portal (dashboards, RBAC admin, checklists). | Fetches from `/api/operations/*`; enforces role gate. | Operations |
| `apps/web/app/api/operations/rbac` | Manage role assignments, permission matrices, and audit logs. | Reads Medusa/Strapi roles; writes audit entries to PostgreSQL. | Platform |
| `apps/web/app/api/operations/dashboard` | Aggregate operational KPIs (orders, refunds, downloads, community metrics). | Queries data warehouse/Segment exports; returns dashboard DTO. | Analytics |
| `apps/web/app/api/analytics/events` | Central event schema registry and instrumentation utilities. | Stores event definitions in Strapi; provides schema to clients. | Analytics |
| `apps/web/app/api/risk/fraud-check` | Evaluate orders against risk rules; enqueue review queue entries. | Input: order payload; Output: risk score + recommended action. | Risk |
| `apps/web/app/api/privacy/consent` | Record and update marketing/tracking consent preferences. | Inputs: consent updates; Outputs: stored consent snapshots + analytics. | Compliance |
| `apps/web/app/api/privacy/access-requests` | Manage data export/deletion workflows. | Intake user requests → queue job → notify ops; track status. | Compliance |
| `apps/web/app/api/reporting/tax` | Generate scheduled tax/regulatory exports (CSV/JSON). | Pulls from Medusa + analytics; stores files; notifies finance. | Finance |
| `apps/web/app/api/operations/incidents` | Manage runbooks, severity matrices, on-call rosters, and PIR templates. | Stores documents in Strapi/Notion; integrates with PagerDuty/Slack. | SRE |
| `apps/web/app/api/operations/checklist` | Serve go-live checklist state, sign-offs, and contingency plans. | Uses Strapi or JSON config; tracks completion status. | Program Mgmt |
| `packages/sdk/operations` | SDK exposing hooks (`useOperationsDashboard`, `useRBAC`, `useConsent`) with zod validation. | Normalizes data and enforces type safety. | Platform |
| `packages/ui/operations` | UI primitives for dashboards, consent forms, risk queues, and runbook panels. | Receives typed DTOs; ensures accessible design. | Frontend |
| `infrastructure/jobs/discord-metrics.ts` | Extends community job to feed operations dashboards with trending metrics. | Output to Redis/Segment. | Analytics |

### Data Models and Contracts

- **RoleDefinition**
  - `{ roleId, name, description, permissions: PermissionKey[], createdAt, updatedAt }` stored in PostgreSQL/Strapi.
  - PermissionKey examples: `operations.view_dashboard`, `support.manage_tickets`, `risk.approve_orders`.

- **RoleAssignment**
  - `{ assignmentId, userId, roleId, grantedBy, grantedAt, expiresAt? }` with audit logs capturing change history.

- **AuditLogEntry**
  - `{ id, actorId, action, resourceType, resourceId, metadata, timestamp }` used for RBAC changes, consent updates, incident steps.

- **OperationsDashboardDTO**
  - `{ revenue: { daily, weekly, monthly }, orders: { total, refunded, pending }, downloads: { total, failureRate }, community: { discordMembers, showcases }, alerts: AlertSummary[] }`.

- **EventSchemaDefinition**
  - `{ eventName, description, properties: PropertyDefinition[], version, owners }` stored in Strapi and exported to developers.

- **FraudRule**
  - `{ ruleId, description, conditions: Condition[], severity, action ('flag'|'review'|'block'), enabled }`.
  - Conditions combine metrics like `orderValue > threshold`, `country in list`, `velocity > N`.

- **RiskQueueEntry**
  - `{ entryId, orderId, score, triggeredRules[], status ('open'|'reviewed'|'escalated'), assignedTo, notes[] }`.

- **ConsentSnapshot**
  - `{ consentId, userId, consentType ('marketing'|'tracking'), status ('granted'|'revoked'), timestamp, policyVersion }`.

- **PrivacyRequest**
  - `{ requestId, userId, type ('access'|'deletion'), submittedAt, status, completedAt?, artifactsUrl? }`.

- **TaxReportRecord**
  - `{ reportId, periodStart, periodEnd, region, fileUrl, generatedAt, generatedBy }`.

- **IncidentRecord**
  - `{ incidentId, severity, startedAt, resolvedAt?, description, runbookLink, postmortemLink, participants[] }`.

- **LaunchChecklistItem**
  - `{ itemId, category, description, ownerRole, status ('pending'|'approved'), notes?, dueDate, completedAt? }`.

### APIs and Interfaces

| Endpoint / Interface | Method / Signature | Request | Response / Notes |
| --- | --- | --- | --- |
| `GET /api/operations/dashboard` | GET | Query: `range=7|30|90` | Returns `OperationsDashboardDTO`. |
| `POST /api/operations/rbac/assign` | POST | `{ userId, roleId, expiresAt? }` | Grants role; writes audit log. |
| `POST /api/operations/rbac/revoke` | POST | `{ userId, roleId }` | Revokes role; logs action. |
| `GET /api/analytics/schema` | GET | Query: `version?` | Returns list of `EventSchemaDefinition`. |
| `POST /api/analytics/events/validate` | POST | `{ eventName, payload }` | Validates payload vs schema; returns result. |
| `POST /api/risk/fraud-check` | POST | Order payload | Returns `{ score, action, triggeredRules }`; enqueues RiskQueueEntry if needed. |
| `GET /api/risk/queue` | GET | Query: `status`, `assignedTo` | Returns paginated risk queue entries. |
| `POST /api/risk/queue/[id]/decision` | POST | `{ status, notes }` | Updates queue entry; logs review. |
| `POST /api/privacy/consent` | POST | `{ consentType, status }` | Records consent update; returns snapshot. |
| `POST /api/privacy/access-requests` | POST | `{ type, reason? }` | Creates privacy request ticket; returns tracking id. |
| `PATCH /api/privacy/access-requests/[id]` | PATCH | `{ status, artifactsUrl?, completedAt? }` | Updates request status; notifies user. |
| `POST /api/reporting/tax/generate` | POST | `{ periodStart, periodEnd, region }` | Triggers report generation; returns job id. |
| `GET /api/reporting/tax` | GET | Query: `region`, `period` | Returns available reports metadata. |
| `GET /api/operations/incidents` | GET | Query: `status`, `severity` | Returns incident records. |
| `POST /api/operations/incidents` | POST | `{ severity, description, runbookId }` | Creates incident record; notifies on-call. |
| `POST /api/operations/incidents/[id]/update` | POST | `{ status, notes }` | Updates incident; writes audit log. |
| `GET /api/operations/checklist` | GET | — | Returns `LaunchChecklistItem[]`. |
| `POST /api/operations/checklist/[id]/complete` | POST | `{ notes? }` | Marks checklist item complete; audit log + owner sign-off. |
| `useOperationsDashboard(range)` | Hook | Range parameter | TanStack Query hook returning dashboard data. |
| `useRBAC()` | Hook | — | Provides role assignments, grant/revoke handlers. |
| `useConsentManager()` | Hook | — | Manages consent toggles, integrates with privacy API. |
| `useRiskQueue(filters)` | Hook | Filters map | Retrieves and updates risk queue entries. |
| `useLaunchChecklist()` | Hook | — | Returns checklist items and completion handlers. |

### Workflows and Sequencing

1. **RBAC Foundation** — Map roles and permissions across Medusa, Strapi, Next.js; implement API endpoints, UI, and audit logs; update documentation.
2. **Operational Dashboard & Metrics Pipeline** — Configure data pipelines (Segment → warehouse), build `/api/operations/dashboard`, and render analytics UI with alert thresholds.
3. **Unified Event Schema** — Document event taxonomy in Strapi, provide validation endpoint, integrate with teams for consistent instrumentation.
4. **Fraud Monitoring & Risk Queue** — Implement risk scoring rules, queue UI, decision logging, and escalation notifications to finance/support.
5. **Privacy & Consent Management** — Ship consent UI, integrate with marketing preferences, build GDPR/CCPA request workflows with automation.
6. **Regulatory & Tax Reporting** — Automate report generation using Medusa data + analytics, store outputs, and notify finance; document reconciliation SOP.
7. **Incident Response & Runbooks** — Define severity matrix, on-call rotation, incident API, Slack/PagerDuty integration, and post-incident templates.
8. **Launch Readiness Checklist** — Build checklist module, track owner sign-offs, and publish contingency plans and go/no-go process.
9. **QA & Monitoring** — Execute testing across RBAC, analytics, risk, privacy, reporting, runbooks, and checklist flows; verify dashboards and alerts.

## Non-Functional Requirements

### Performance
- Operations dashboard API responds ≤400 ms p95, supported by pre-aggregated metrics in warehouse/Redis.
- Risk check endpoint executes ≤250 ms p95; asynchronous queue processing handles heavy workloads.
- Privacy export/deletion processes complete within regulatory SLA (<30 days) with progress tracking.
- Incident/alert notifications propagate within 60 seconds of trigger.

### Security
- Enforce least privilege with dual approval for role grants above designated sensitivity (e.g., admin roles).
- All operational APIs require JWT with `operations.*` scope; sensitive actions require MFA confirmation.
- Audit logs immutable and stored in append-only tables; daily backups.
- Consent and privacy request data encrypted at rest; access limited to compliance role.
- Report exports stored with presigned URLs expiring in 24 hours; access logged.

### Reliability/Availability
- Operational APIs target 99.5% uptime; graceful degradation for dashboard (fallback to cached data when warehouse unavailable).
- Risk queue persists events even if downstream services fail; DLQ for automation jobs.
- Privacy requests retried with exponential backoff; manual intervention workflows documented for failures.
- Incident runbook service remains available even during partial outages (hosted separately with redundancy).

### Observability
- OTEL spans for RBAC changes, dashboard fetch, fraud checks, privacy requests, tax reports, incident updates, and checklist completion with correlation IDs.
- Segment events instrument operations actions: `Role Granted`, `Dashboard Viewed`, `Fraud Flagged`, `Consent Updated`, `Privacy Request Submitted`, `Launch Checklist Completed`.
- Logtail collects audit entries and anomaly logs; Grafana dashboards monitor risk queue volume, consent trends, incident MTTR, and automation success rates with alerts.

## Dependencies and Integrations

- **Platforms:** Medusa admin APIs, Strapi v5 (operations content), Next.js operations portal, Redis caching, PostgreSQL audit tables.
- **Analytics & Monitoring:** Segment (event ingestion), BigQuery/Snowflake (warehouse), Grafana dashboards, OTEL instrumentation, Sentry error tracking.
- **Notifications:** Slack, PagerDuty, SendGrid, Discord (optional) for alerts and communications.
- **Security & Compliance:** LaunchDarkly for feature gating, Pulumi-managed secrets, Cloudflare Turnstile for sensitive forms, Data retention policies referencing downloads consent logs.
- **Finance & Reporting:** TaxJar or manual rate tables, CSV exports to finance SFTP, integration hooks for accounting systems.
- **Support Tooling:** Notion/Confluence for runbooks, Jira/Linear for ticket escalation, operations console UI.

## Acceptance Criteria (Authoritative)

1. RBAC roles defined, enforced across systems, and audit logs recorded for grants/revokes.
2. Operations dashboard operational with real-time KPIs, drill-down links, and alert thresholds.
3. Unified analytics event schema published, instrumentation validated, and governance docs available.
4. Fraud monitoring rules flag high-risk orders, queue workflow enabled, and monthly reports generated.
5. Consent management UI live, privacy requests automated, and policy acknowledgments tracked.
6. Scheduled tax/regulatory reports generated automatically with documentation for finance.
7. Incident response playbooks, on-call rotation, and post-incident templates deployed with integrations.
8. Launch readiness checklist implemented with owner sign-offs and contingency plans recorded.
9. Monitoring/alerts for operations, risk, privacy, and automations integrated into Grafana/Sentry with runbooks referencing responses.

## Traceability Mapping

| AC | Spec Sections | Components / APIs | Test Idea |
| --- | --- | --- | --- |
| 1 | Services & Modules; Workflows Step 1 | `/api/operations/rbac`, audit logs | Integration tests granting/revoking roles verifying permissions + logs. |
| 2 | Workflows Step 2 | `/api/operations/dashboard`, UI widgets | Playwright tests for dashboard data + alert triggers. |
| 3 | Workflows Step 3 | `/api/analytics/schema`, validation endpoint | Schema unit tests + instrumentation smoke tests using mock payloads. |
| 4 | Workflows Step 4 | `/api/risk/fraud-check`, risk queue UI | Simulate high-risk orders E2E; verify queue actions + reports. |
| 5 | Workflows Step 5 | `/api/privacy/consent`, access requests | Automated tests for consent toggles and data export lifecycle. |
| 6 | Workflows Step 6 | `/api/reporting/tax`, scheduled jobs | Trigger report generation; inspect file outputs and notifications. |
| 7 | Workflows Step 7 | Incident APIs, PagerDuty/Slack integration | Synthetic incident triggers verifying notifications and audit logs. |
| 8 | Workflows Step 8 | `/api/operations/checklist` | Playwright verifying checklist completion + audit trail. |
| 9 | Workflows Step 9; Observability | Grafana dashboards, alert definitions | Monitoring tests ensuring alerts fire on simulated anomalies. |

## Risks, Assumptions, Open Questions

- **Risk:** Data warehouse latency may delay dashboard freshness. *Mitigation:* implement caching, asynchronous pre-aggregation, and clear freshness indicators.*
- **Risk:** Fraud false positives could create order friction. *Mitigation:* iterative rule tuning, analytics review, and ops overrides with audit trail.*
- **Assumption:** Finance/legal teams provide tax regions, privacy policy updates, and retention requirements ahead of implementation. *Action:* schedule working sessions.*
- **Assumption:** PagerDuty/Slack integrations available with appropriate access credentials. *Action:* confirm with DevOps/security.*
- **Question:** Should privacy request automation integrate directly with Medusa/Strapi APIs or rely on manual review step? *Next Step:* align with compliance before development.*
- **Question:** Is third-party BI (e.g., Metabase) available for advanced reporting or should dashboard rely solely on custom UI? *Next Step:* confirm tooling preference.*

## Test Strategy Summary

- **Unit Tests:** RBAC permission checks, audit logging utilities, event schema validators, fraud scoring functions, consent handlers, report generation utilities.
- **Integration Tests:** RBAC APIs with Medusa/Strapi, dashboard data assembly (warehouse mocks), fraud queue, privacy workflows, tax report exports, incident API.
- **E2E Tests:** Playwright scenarios for operations portal flows (RBAC update, dashboard view, risk review, privacy request submission, checklist sign-off).
- **Performance Tests:** Stress test dashboard API and risk check endpoint under peak load; verify caching prevents degradation.
- **Security Tests:** Pen-test operations portal, verify RBAC bypass resistance, test consent data encryption, ensure audit logs immutable.
- **Monitoring Verification:** Synthetic checks for Discord metrics ingestion, risk queue, privacy requests, tax report jobs, incident triggers, and alerting pathways.
- **Manual QA:** Runbook tabletop exercises, go-live rehearsal using checklist, finance review of tax reports, compliance review of privacy workflows.
