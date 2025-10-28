# Story Context: 1.8 Seed Observability & Logging Baseline

## Metadata
- Epic: 1
- Story: 1.8
- Title: Seed Observability & Logging Baseline
- Source Story: docs/stories/1-8-seed-observability-logging-baseline.md
- Generated: 2025-10-26

## Story
- asA: reliability engineer
- iWant: centralized logging and monitoring hooks in place
- soThat: issues are detected as soon as the platform goes live

## Acceptance Criteria
1. Logging strategy defined for storefront, Medusa, and Strapi (structured logs + log levels).
2. Error tracking (e.g., Sentry) integrated with environment-specific DSNs across Vercel and Railway runtimes.
3. Basic uptime and performance dashboards configured for staging/production, aggregating Vercel storefront and Railway backend metrics.

## Tasks (from Story)
- Logging strategy and baselines
- Error tracking integration
- Uptime and performance dashboards

## Documentation Artifacts
- docs/epics.md (Epic 1 → Story 1.8)
- docs/tech-spec-epic-1.md (Observability stack; Test Strategy Summary)
- docs/ci-cd-gce-flow-2025-10-26.md (Health checks and validation steps)
- docs/cheat-sheet.md (Operational quick checks)

## Code Artifacts and Interfaces
- .github/workflows/deploy-services.yml — post-deploy health checks; job summary lines
- apps/medusa — interface: GET /health → 200 (health endpoint)
- apps/strapi — interface: GET /_health → 204 (or /health → 200)

## Constraints
- Use structured JSON logs; avoid PII in logs.
- Configure environment-specific Sentry DSNs; do not leak secrets in CI logs.
- Keep smoke tests and monitors idempotent and lightweight.

## Dependencies and Frameworks
- Node.js monorepo with pnpm + Turbo
- Testing: Vitest (unit), Playwright (E2E)
- Planned observability deps: Sentry SDKs, OpenTelemetry exporters, log aggregation target (TBD)

## Testing Standards and Ideas
- Standards: Unit via Vitest; E2E via Playwright. Attach HTML reports in CI. Collect traces on retry.
- Locations: tests/e2e/**/*.spec.ts; packages/**/__tests__/**/*.ts; apps/*/src/**/__tests__/**
- Ideas:
  - [AC3] Verify monitors for health endpoints return expected codes.
  - [AC2] Trigger a test Sentry event in staging; verify event captured with correct environment tag.
  - [AC1] Assert logger outputs structured fields at INFO/WARN/ERROR levels without PII.

