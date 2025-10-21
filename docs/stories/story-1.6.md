# Story 1.6: Provision Railway Services for Medusa & Strapi

Status: Ready

## Story

As a platform engineer,  
I want Medusa and Strapi automatically deployed to Railway across staging and production,  
so that our backend services stay in lockstep with storefront releases.

## Acceptance Criteria

1. Railway staging and production projects exist for Medusa and Strapi with documented branch-to-environment mappings.  
2. Git-based deployment pipelines trigger Railway builds on `staging` → staging and `main` → production and report status back to GitHub checks.  
3. Environment variables, secrets, and database connection strings mirror the configuration strategy established in Story 1.2 across all Railway environments.

## Tasks / Subtasks

- [ ] Provision Railway infrastructure via Pulumi (AC: #1)
  - [ ] Extend `infra/pulumi` stacks to declare Medusa, Strapi, Postgres, and Redis services for staging and production. (AC: #1)
  - [ ] Document branch-to-environment mappings in stack config and team runbooks. (AC: #1)
  - [ ] Run `pulumi preview` and `pulumi up` per environment with approvals captured in pipeline logs. (AC: #1)
- [ ] Wire deployment automation to Railway (AC: #2)
  - [ ] Update `deploy-services.yml` GitHub Actions workflow with Railway deploy steps gated on branch filters. (AC: #2)
  - [ ] Ensure pipeline posts success/failure status checks on relevant commits and surfaces logs for debugging. (AC: #2)
- [ ] Synchronize secrets and runtime configuration (AC: #3)
  - [ ] Mirror Story 1.2 environment templates into Railway variables (Medusa, Strapi, Postgres, Redis). (AC: #3)
  - [ ] Validate secrets sync through Pulumi config (GitHub OIDC) without storing production values in repo. (AC: #3)
  - [ ] Execute verification script to confirm services boot with expected configuration in staging. (AC: #3)
- [ ] Testing & verification (AC: #1, #2, #3)
  - [ ] Run `pnpm test:integration` against staging endpoints once deployments complete. (AC: #2, #3)
  - [ ] Trigger synthetic deployment to confirm GitHub status checks and Railway build outputs. (AC: #2)
  - [ ] Capture Railway dashboard screenshots or logs as evidence in the status file decisions log. (AC: #1)

## Dev Notes

- Pulumi is the authoritative IaC path; leverage existing stack schema for Railway service IDs and enforce per-environment separation to avoid accidental cross-promotion. [Source: docs/tech-spec-epic-1.md]
- GitHub Actions already owns deployment orchestration—extend `deploy-services.yml` to call `railway up`/Pulumi apply and publish job summaries for observability. [Source: docs/tech-spec-epic-1.md]
- ADR-002 mandates Railway for Medusa/Strapi, so ensure resource sizing aligns with architecture guidance (auto-scaling containers, managed Postgres, dedicated Redis). [Source: docs/architecture-decisions.md]
- Maintain consistency with environment configuration strategy by sourcing secrets from Pulumi + GitHub OIDC instead of manual dashboard edits; reuse Story 1.2 templates for variable definitions. [Source: docs/tech-spec-epic-1.md]

### Project Structure Notes

- Infrastructure changes live under `infra/pulumi` with environment-specific stack config files; keep TypeScript modules aligned with existing naming (`railwayServices`, `database`) to preserve linting.  
- GitHub workflow updates occur in `.github/workflows/deploy-services.yml`; reference existing CI patterns for caching and concurrency limits.  
- Scripts that validate deployment health should remain under `scripts/` with shared utilities in `packages/sdk` when accessing APIs.

### References

- docs/tech-spec-epic-1.md  
- docs/architecture-decisions.md  
- docs/solution-architecture.md

## Dev Agent Record

### Context Reference

- docs/stories/story-context-1.6.xml

### Agent Model Used

gpt-4.1 Scrum Master

### Debug Log References

- 2025-10-20: Capture Pulumi deployment outputs and Railway dashboard links after first staging rollout.
- 2025-10-21: Planned implementation steps —
  1. Add Pulumi module (or approved CLI bridge) to provision Railway services/databases per environment and document branch mappings.
  2. Extend `.github/workflows/deploy-services.yml` with Railway deploy matrix, status check reporting, and rollback guard.
  3. Introduce secrets sync helpers pulling Story 1.2 templates into Railway env vars with validation script plus staged smoke tests.
  Blocked on step 1 because the repository lacks an official Pulumi Railway provider or sanctioned CLI automation package; cannot satisfy AC1 without that dependency.
- 2025-10-21: Added Pulumi command-provider bridge and injected Railway project tokens; direct `railway up` calls now reach the project (`serviceId=29cbdaaa-443f-4230-aac1-e8702537fb7c`) but uploads fail with `404 Not Found` from `https://backboard.railway.com/.../up`. Suspect CLI bug or deploy token scope; manual UI deployment or support ticket required before Pulumi automation can proceed.
- 2025-10-21: Updated Strapi database configuration to default to PostgreSQL when `DATABASE_URL` is present. Requires Railway env vars (`DATABASE_CLIENT=postgres`, `DATABASE_URL`, connection secrets) and Strapi app keys once Postgres service is provisioned.
- 2025-10-21: Added Railway helper scripts for Medusa (`scripts/railway-medusa-build.sh`, `scripts/railway-medusa-start.sh`) and documented required env vars for PostgreSQL/Redis deployment.

### Completion Notes List

### File List
