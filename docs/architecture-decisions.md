# Architecture Decision Records

**Project:** cs  
**Date:** 2025-10-19  
**Author:** Aiden Lux

---

## Overview

This document captures key architectural decisions made while producing the Cockpit Simulator DTC solution architecture. Each ADR records context, options, the chosen direction, and follow-up considerations.

---

## Decisions

### ADR-001: Adopt Next.js App Router with React Server Components
**Date:** 2025-10-19  
**Status:** Accepted  
**Decider:** Architecture Working Group (Aiden Lux, Winston)

**Context**  
Frontend must deliver SEO-grade marketing surfaces and highly dynamic commerce/account flows. Candidate frameworks: Next.js App Router, Remix, Astro + client islands.

**Options Considered**  
1. **Next.js App Router**  
   - Pros: Mature SSR/SSG mix, Vercel-first deployment, RSC support, strong ecosystem.  
   - Cons: Learning curve for RSC and server actions, tight coupling to React.  
2. **Remix**  
   - Pros: Excellent data loading, nested routing, web standards alignment.  
   - Cons: Less first-class support for static optimization, smaller ecosystem.  
3. **Astro + Client Islands**  
   - Pros: Extremely fast static output, flexible island architecture.  
   - Cons: Requires integrating multiple SPA frameworks for dynamic sections, limited enterprise patterns.

**Decision**  
Choose Option 1 – Next.js App Router.

**Rationale**  
Best balance of performance, DX, and ecosystem alignment with PRD/UX needs; integrates seamlessly with Vercel and server actions avoid custom BFF for many flows.

**Consequences**  
- Positive: Simplified deployment, unified server/client paradigm, strong community support.  
- Negative: Need to train team on RSC patterns and streaming behavior.  
- Neutral: Requires codifying patterns for server vs client component split.

**Rejected Options**  
- Remix lacked native support for ISR and static marketing pages without extra plumbing.  
- Astro introduced additional complexity to manage React islands for commerce/account UI.

---

### ADR-002: Host Frontend on Vercel; Medusa & Strapi on Railway
**Date:** 2025-10-19  
**Status:** Accepted (migration to GCE initiated via Story 1.6; update pending new ADR)  
**Decider:** Architecture Working Group

**Context**  
Need a scalable yet managed hosting story for three services with preview environments and edge capabilities.

**Options Considered**  
1. **Vercel (frontend) + Railway (services)**  
   - Pros: Native Next.js support, preview deployments, managed Postgres, simple secrets.  
   - Cons: Multi-provider management, cost monitoring required.  
2. **Full AWS (Lambda + ECS + RDS)**  
   - Pros: Full control, enterprise-grade.  
   - Cons: Slower spin-up, higher operational overhead, more IaC effort.  
3. **DigitalOcean Apps + Managed DB**  
   - Pros: Simpler than AWS, predictable pricing.  
   - Cons: Less mature preview workflow, limited edge support.

**Decision**  
Select Option 1 – Vercel + Railway.

**Rationale**  
Meets preview requirement, reduces operational burden, and keeps latency low via Vercel edge. Railway aligns with Medusa community guidance and offers quick scaling.

**Consequences**  
- Positive: Rapid environment creation, low DevOps maintenance.  
- Negative: Vendor lock-in risks; need to monitor cost as usage grows.  
- Neutral: Must configure cross-provider observability.

**Rejected Options**  
- AWS path postponed due to overhead and timeline.  
- DigitalOcean lacked desired preview and edge capabilities.

---

### ADR-003: Use Medusa for Commerce and Strapi v5 for Content/Downloads
**Date:** 2025-10-19  
**Status:** Accepted  
**Decider:** Product & Architecture Team

**Context**  
Commerce engine must support multi-currency, PayPal, account dashboards; content platform must deliver guides, downloads, showcases with editorial workflow.

**Options Considered**  
1. **Medusa + Strapi**  
   - Pros: Purpose-built for e-commerce and headless CMS; plugin ecosystems; TypeScript support.  
   - Cons: Two services to maintain; requires integration glue.  
2. **Shopify + Contentful**  
   - Pros: Managed SaaS, less infra.  
   - Cons: Higher recurring costs, limited customization for downloads, vendor lock-in.  
3. **Custom Node API + Markdown CMS**  
   - Pros: Single service, full control.  
   - Cons: Longer build time, reinventing commerce primitives.

**Decision**  
Choose Option 1 – Medusa + Strapi.

**Rationale**  
Balances flexibility with speed; aligns with monorepo strategy and PRD requirements (content-commerce linking, downloads, community).

**Consequences**  
- Positive: Extensible architecture, open-source, community plugins.  
- Negative: Need synchronization logic between systems.  
- Neutral: Must ensure unified RBAC across two admin portals.

**Rejected Options**  
- Shopify/Contentful limited required downloads experience and API flexibility.  
- Custom build would delay timeline and increase maintenance burden.

---

### ADR-004: Introduce Redis for Job Queues and API Caching
**Date:** 2025-10-19  
**Status:** Accepted  
**Decider:** Architecture Team

**Context**  
Need background processing (email, inventory sync), rate-limited API cache, and download telemetry buffering.

**Options Considered**  
1. **Redis (Managed)**  
   - Pros: Battle-tested, Medusa-native support, simple integration.  
   - Cons: Additional managed service, cost.  
2. **PostgreSQL Advisory Locks**  
   - Pros: No new infrastructure.  
   - Cons: Less efficient for queues/caching, potential DB contention.  
3. **In-memory Node Queues**  
   - Pros: Zero infra.  
   - Cons: Not durable, no scaling, unacceptable for enterprise.

**Decision**  
Adopt Option 1 – Managed Redis (Upstash or Railway).

**Rationale**  
Provides reliable queues and caching with minimal integration overhead; Medusa already supports Redis subscriber pattern.

**Consequences**  
- Positive: Durable job processing, faster API responses.  
- Negative: Need to manage Redis sizing and security.  
- Neutral: Introduces additional monitoring dashboards.

**Rejected Options**  
- Postgres locks insufficient for throughput.  
- In-memory queues violate reliability requirements.

---

### ADR-005: Integrate Discord via Webhooks Instead of SSO at Launch
**Date:** 2025-10-19  
**Status:** Accepted  
**Decider:** Product & Architecture Team

**Context**  
Community integration is key, but full Discord SSO adds scope. Evaluate pragmatic approach for launch.

**Options Considered**  
1. **Webhook-based Integration (CTA + Metrics)**  
   - Pros: Fast to implement, minimal security concerns, fits UX spec.  
   - Cons: Users must authenticate separately in Discord.  
2. **Full Discord OAuth SSO**  
   - Pros: Seamless experience, unified identity.  
   - Cons: Additional compliance, time-consuming implementation.  
3. **Embedded Discord Widget Only**  
   - Pros: Very quick.  
   - Cons: Little control, poor analytics, not aligned with brand experience.

**Decision**  
Choose Option 1 – Webhook integration with CTAs and metrics ingestion.

**Rationale**  
Delivers community touchpoints quickly while leaving path for future SSO. Supports analytics goals and operations alerts.

**Consequences**  
- Positive: Launch-ready, low risk, measurable engagement.  
- Negative: Users manage two auth flows.  
- Neutral: ADR notes future upgrade to SSO when priority/resources align.  
- Update: Backend services are migrating to GCE (Story 1.6); retain this ADR for historical context until a replacement is ratified.

**Rejected Options**  
- Full SSO deferred to post-MVP due to complexity.  
- Embedded widget alone failed requirements for engagement tracking and brand control.

---

## Decision Index

| ID      | Title                                           | Status   | Date       | Decider                    |
| ------- | ----------------------------------------------- | -------- | ---------- | -------------------------- |
| ADR-001 | Adopt Next.js App Router with React Server Components | Accepted | 2025-10-19 | Architecture Working Group |
| ADR-002 | Host Frontend on Vercel; Medusa & Strapi on Railway | Accepted | 2025-10-19 | Architecture Working Group |
| ADR-003 | Use Medusa for Commerce and Strapi v5 for Content/Downloads | Accepted | 2025-10-19 | Product & Architecture Team |
| ADR-004 | Introduce Redis for Job Queues and API Caching   | Accepted | 2025-10-19 | Architecture Team          |
| ADR-005 | Integrate Discord via Webhooks Instead of SSO at Launch | Accepted | 2025-10-19 | Product & Architecture Team |

---

_This ADR register will evolve as additional decisions are made during solutioning and implementation._
