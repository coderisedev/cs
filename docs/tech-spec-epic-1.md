# Technical Specification: Platform Foundation & Deployment Pipeline

Date: 2025-10-19  
Author: Aiden Lux  
Epic ID: 1  
Status: Draft

---

## Overview

This epic lays the engineering runway for the Cockpit Simulator DTC platform by establishing a composable monorepo that hosts the Next.js storefront, Medusa commerce service, and Strapi content service. It delivers reproducible development environments, continuous delivery pipelines, and baseline observability so every subsequent epic can ship safely. Outcomes align with the solution architecture’s three-tier service model and ensure developer onboarding, code quality, and deployment hygiene meet enterprise expectations.

## Objectives and Scope

**In Scope**
- Scaffold monorepo structure (apps, shared packages, infra scripts) with pnpm/turbo tooling.
- Define environment configuration strategy for local, preview, staging, and production, including secrets management.
- Implement GitHub Actions CI pipelines (lint, typecheck, unit/integration tests) and enforce required status checks.
- Provision Vercel projects (staging/production) and Railway services with Pulumi-driven automation.
- Enable preview deployments per pull request with automatic teardown on merge/close.
- Bootstrap integration and smoke testing harness (Playwright) wired to CI.
- Seed observability stack (Sentry, OpenTelemetry exporters, Logtail) and default dashboards.
- Produce developer onboarding documentation and operational runbooks.

**Out of Scope**
- Feature-specific schemas or endpoints (handled in later epics).  
- Full infrastructure scaling policies (addressed in Operations epic).  
- Production incident response tooling (initial hooks only).  
- Advanced cost optimization automation.

## System Architecture Alignment

The monorepo mirrors the architecture document: `apps/web` (Next.js App Router), `apps/medusa`, `apps/strapi`, `packages/ui`, `packages/sdk`, and `infra/pulumi`. Pipelines deploy the frontend to Vercel and services to Railway using the prescribed IaC workflow. Secrets and environment variables adhere to the solution architecture’s environment configuration strategy, and observability setup connects to the shared OpenTelemetry/Sentry stack. This epic operationalizes the architecture’s hosting, CI/CD, and developer workflow sections.

## Detailed Design

### Services and Modules

| Module / Location         | Responsibility                                                                 | Inputs / Outputs                                   | Owner |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------- | ----- |
| `apps/web`                | Next.js frontend scaffolding (App Router, RSC), middleware, shared utilities   | Depends on `packages/ui`, `packages/sdk`           | Web |
| `apps/medusa`             | Medusa v2 service scaffold with basic config and subscriber hooks              | Connects to Railway Postgres, Redis; emits webhooks| Backend |
| `apps/strapi`             | Strapi v5 CMS scaffold with initial content types (placeholders)               | Connects to Railway Postgres; admin auth           | Content |
| `packages/ui`             | Tailwind + Shadcn design system tokens, primitives, docs                      | Exposed via npm-style exports                      | Frontend |
| `packages/sdk`            | Shared TypeScript SDK (Medusa/Strapi clients, API typings)                     | Consumed by web and services                       | Platform |
| `infra/pulumi`            | Pulumi TypeScript project provisioning Railway services, Redis, secrets       | Uses Pulumi stack configs, GitHub OIDC             | DevOps |
| `scripts/`                | CLI scripts for bootstrap, migrations, smoke tests                            | Called from CI and onboarding guides               | Platform |
| GitHub Actions workflows  | `ci.yml`, `deploy-web.yml`, `deploy-services.yml`                              | Triggered on PR/main; interact with Vercel/Railway | DevOps |

### Data Models and Contracts

- **Environment configuration (`env` templates)**  
  - `apps/web/.env.local.example`: `NEXTAUTH_SECRET`, `MEDUSA_API_URL`, `STRAPI_API_URL`, `PAYPAL_CLIENT_ID`, `SENTRY_DSN`, `SEGMENT_WRITE_KEY`, `REDIS_URL`.  
  - `apps/medusa/.env.example`: `DATABASE_URL`, `REDIS_URL`, `NODE_ENV`, `JWT_SECRET`, `PAYPAL_SECRET`, `STRAPI_WEBHOOK_SECRET`.  
  - `apps/strapi/.env.example`: `DATABASE_URL`, `ADMIN_JWT_SECRET`, `APP_KEYS`, `API_TOKEN_SALT`, `CLOUDINARY_TOKEN`.  
  - `infra/pulumi/StackConfig`: strongly typed secrets map referencing GitHub OIDC.

- **Pulumi stack state schema**  
  ```
  interface RailwayStackConfig {
    vercelProjectId: string;
    railwayServiceMedusa: string;
    railwayServiceStrapi: string;
    postgresInstanceId: string;
    redisInstanceId: string;
    environment: 'staging' | 'production';
  }
  ```

- **CI configuration**  
  - `turbo.json`: pipeline definitions for `lint`, `test`, `build`.  
  - `package.json` root scripts: `lint`, `test:unit`, `test:integration`, `test:e2e`, `prepare`.  
  - `vitest.config.ts`, `playwright.config.ts` pre-populated with base settings.

### APIs and Interfaces

- **CI/CD Workflows**  
  - `ci.yml`: triggered on PRs/`main`; jobs `setup` (pnpm install), `lint`, `typecheck`, `test-unit`, `test-integration`, `test-e2e` (Playwright, smoke subset). Requires Node 20.x, caches via Turbo.  
  - `deploy-web.yml`: triggered on main merges; kicks Vercel deploy with `vercel deploy --prebuilt`, sets environment secrets via Vercel CLI.  
  - `deploy-services.yml`: manual or tag-triggered; runs `pulumi up` to apply infrastructure changes then hits Railway API to deploy latest container images.

- **Pulumi Program Interfaces**  
  - `createRailwayService(name: string, image: string, env: Record<string,string>): RailwayService`.  
  - `createVercelEnvironment(name: string, branch: string, env: EnvVarSpec[]): void`.  
  - Output secrets projected back to GitHub Actions via Pulumi stack outputs.

- **Bootstrap Script (`scripts/bootstrap.ts`)**  
  Accepts flags `--env <env>` to generate `.env` files from templates and fetch secrets from Pulumi stack or 1Password.

### Workflows and Sequencing

1. **Repository Bootstrap**  
   - Run `pnpm dlx create-turbo` base template → replace with tailored structure.  
   - Execute `pnpm install`, `pnpm lint`.  
   - Generate `.env` files using `scripts/bootstrap.ts --env local`.

2. **CI Pipeline Execution**  
   - Developer pushes branch → GitHub Actions `ci.yml` runs all jobs in parallel.  
   - On success, PR status checks (Lint, Typecheck, Unit, Integration, E2E Smoke) report success; failure blocks merge.

3. **Preview Deployment Flow**  
   - `ci.yml` job `preview` uses Vercel CLI with GitHub token; obtains preview URL.  
   - Bot comment posts URL and environment metadata to PR.  
   - On merge/close, GitHub Action `cleanup-preview.yml` triggers `vercel rm` for preview env.

4. **Staging/Production Promotion**  
   - Merge to `main` triggers `deploy-web.yml` promoting to Vercel production; `deploy-services.yml` runs on manual approval or schedule to ensure infrastructure drift detection.

5. **Observability Setup**  
   - Deploy Sentry DSNs across web/Medusa/Strapi; OTEL exporter initialized in each service.  
   - Logtail agents configured via Pulumi to ingest logs; dashboards templated in Grafana.

6. **Onboarding Documentation**  
   - `docs/onboarding.md` outlines prerequisites (Node 20, pnpm, Docker), bootstrap steps, common scripts, debugging tips.  
   - `docs/runbooks/deployments.md` records release cadence, rollback steps, contact chain.

## Non-Functional Requirements

### Performance
- CI pipeline end-to-end duration ≤ 12 minutes on standard PR (target 8 minutes with caching).  
- Preview deployment availability ≤ 5 minutes after PR push.  
- Pulumi deploy operations complete within 10 minutes; provide real-time logs to GitHub Actions.

### Security
- Secrets never committed; stored in Pulumi encrypted config, Vercel encrypted env vars, Railway secrets.  
- GitHub OIDC used for Pulumi authentication—no static cloud credentials.  
- Enforce Dependabot/ Renovate security updates on weekly cadence.  
- Branch protection: require signed commits optional, but status checks mandatory.

### Reliability/Availability
- Staging and production infrastructure created via IaC ensuring parity.  
- Preview environments isolated to prevent cross-branch data collisions (distinct DB instances or seeded data).  
- Automated rollback: Vercel deploy history and Railway release reversal documented.  
- Daily Postgres backups configured via Railway; verify snapshots weekly.

### Observability
- Sentry instrumentation on web/Medusa/Strapi with environment tags (`preview`, `staging`, `production`).  
- OpenTelemetry traces exported to Grafana Tempo (via Logtail bridge) with span context linking deployments.  
- Metrics: CI job success/failure, deploy durations, service uptime, error rates.  
- Logs structured (JSON) with correlation IDs across services; accessible via Logtail dashboards.

## Dependencies and Integrations

- **Tooling:** Node.js 20.x, pnpm 9.x, TurboRepo, TypeScript 5.x.  
- **Platforms:** Vercel (frontend deployments), Railway (Medusa/Strapi/Redis/Postgres), GitHub Actions.  
- **Infrastructure:** Pulumi TypeScript SDK, OpenTelemetry packages, Sentry SDK, Logtail node client.  
- **Testing:** Vitest, Testing Library, Playwright (with Chromium), MSW for API mocking.  
- **Eventing:** Medusa webhook subscribers, Strapi webhooks (publish/unpublish) hitting Next.js API routes.  
- **Secrets:** Pulumi + SSM/1Password integration, GitHub environment secrets, Vercel KV for preview tokens (optional).  
- **Analytics placeholders:** Segment SDK (disabled in non-prod).

## Acceptance Criteria (Authoritative)

1. Monorepo contains `apps/web`, `apps/medusa`, `apps/strapi`, `packages/ui`, `packages/sdk`, `infra/pulumi`, and shared tooling configs; `pnpm lint && pnpm test:unit` succeed locally.  
2. `.env.example` files for each app enumerate all required variables with comments; `scripts/bootstrap.ts` generates environment-specific `.env` files without manual edits.  
3. GitHub Actions `ci.yml` runs lint, typecheck, unit, integration, and Playwright smoke tests on every PR; all jobs must pass before merge.  
4. PRs automatically receive Vercel preview deployments with URL posted as PR comment; preview environments destroyed when PR closes/merges.  
5. Staging and production Vercel projects plus Railway services (Medusa, Strapi, Postgres, Redis) provisioned via Pulumi; `pulumi up` on clean repo instantiates all resources.  
6. Observability stack (Sentry + OTEL + Logtail) records errors/traces/logs from preview environment within 5 minutes of deployment.  
7. Developer onboarding guide published at `docs/onboarding.md` covering tooling setup, common commands, and troubleshooting; runbook for deployments stored under `docs/runbooks/`.  
8. Version-controlled Playwright smoke suite (`tests/e2e/smoke.spec.ts`) executes against Vercel preview and reports results in CI.

## Traceability Mapping

| AC | Spec Sections                     | Components / APIs                         | Test Idea |
|----|-----------------------------------|-------------------------------------------|-----------|
| 1  | Services and Modules, Workflows   | Monorepo structure, pnpm scripts          | Verify repo tree; run lint/unit scripts locally and in CI. |
| 2  | Data Models and Contracts         | `.env.example` templates, bootstrap script| Execute `pnpm bootstrap --env local`; assert generated files match schema. |
| 3  | APIs and Interfaces (CI workflows)| GitHub Actions `ci.yml` jobs              | Trigger PR; confirm required checks gating merge. |
| 4  | Workflows and Sequencing (Preview)| Vercel preview job, cleanup workflow      | Create PR, inspect bot comment + preview environment teardown. |
| 5  | Services/Modules, Workflows       | Pulumi stack configs, Railway resources   | Run Pulumi in staging; confirm resources and DNS endpoints created. |
| 6  | Non-Functional Requirements (Observability) | Sentry DSN, OTEL exporters, Logtail config | Deploy preview; trigger synthetic error; verify logs/traces. |
| 7  | Workflows (Onboarding), Dependencies | `docs/onboarding.md`, runbook docs        | QA review ensures doc completeness; new dev follows guide successfully. |
| 8  | APIs and Interfaces (Testing), Test Strategy | `tests/e2e` Playwright config            | CI run outputs Playwright report with smoke scenarios passing. |

## Risks, Assumptions, Open Questions

- **Risk:** Preview environments might exhaust Railway resource quotas. *Mitigation:* enforce TTL cleanup, monitor usage via alerts.  
- **Risk:** Pulumi misconfiguration could delete production resources. *Mitigation:* require approval workflow and stack locks; use separate state files per environment.  
- **Assumption:** Developers have access to required SaaS accounts (Vercel, Railway, Sentry, Logtail). *Action:* confirm access provisioning with operations.  
- **Assumption:** Redis sizing (1GB) sufficient for initial queues/cache. *Action:* review metrics monthly.  
- **Question:** Do we need automatic DB seeding for preview environments? *Next Step:* align with Platform + Content teams before Epic 2 kicks off.  
- **Question:** Should we integrate 1Password or AWS Secrets Manager for long-term secret storage? *Next Step:* evaluate during Operations epic.

## Test Strategy Summary

- **Unit Tests:** Vitest for shared packages and bootstrap scripts; coverage enforced via `pnpm test:unit`.  
- **Integration Tests:** Vitest + supertest hitting local Medusa/Strapi endpoints; ensure migrations and basic health endpoints respond.  
- **E2E Tests:** Playwright smoke suite targeting preview deployments (critical flows: homepage load, login screen, basic nav).  
- **CI Gates:** All tests + lint/typecheck must pass; failing jobs block merge.  
- **Monitoring Tests:** Synthetic Sentry event triggered post-deploy to confirm alerting; Pulumi “dry run” executed weekly to detect drift.  
- **Documentation QA:** Checklist review ensuring onboarding/runbooks remain current.
