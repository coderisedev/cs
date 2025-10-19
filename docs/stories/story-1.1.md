# Story 1.1: Scaffold Monorepo & Core Services

Status: Ready

## Story

As a platform engineer, I want the Next.js storefront, Medusa service, and Strapi service scaffolded inside a single monorepo, so that teams can develop features in parallel with consistent tooling. 【docs/epics.md:38-47】

## Acceptance Criteria

1. Monorepo initialized with pnpm/turbo workspace tooling and shared linting/prettier configs. 【docs/epics.md:44-47】【docs/tech-spec-epic-1.md:16-24】
2. Baseline Next.js, Medusa, and Strapi apps boot locally using `.env.local.example` values. 【docs/epics.md:44-47】【docs/tech-spec-epic-1.md:53-57】
3. README documents workspace structure and commands. 【docs/epics.md:44-47】【docs/tech-spec-epic-1.md:16-24】

## Tasks / Subtasks

- [ ] Task 1 (AC: 1) – Initialize pnpm/turbo monorepo skeleton with `apps/web`, `apps/medusa`, `apps/strapi`, shared packages, infra, scripts, and tests folders matching the proposed source tree. 【docs/tech-spec-epic-1.md:16-48】【docs/solution-architecture.md:292-328】
  - [ ] Subtask 1.1 – Configure TurboRepo workspace, pnpm workspaces, linting/prettier configs, and root scripts that orchestrate `lint`, `test:unit`, and `build`. 【docs/tech-spec-epic-1.md:16-24】【docs/tech-spec-epic-1.md:153-158】
- [ ] Task 2 (AC: 2) – Scaffold baseline Next.js, Medusa, and Strapi apps with shared environment templates and verify each service boots locally against example `.env` files. 【docs/epics.md:44-47】【docs/tech-spec-epic-1.md:53-57】
  - [ ] Subtask 2.1 – Author `.env.local.example` files and a bootstrap script that populates environment variables for each service; smoke-test local startup. 【docs/tech-spec-epic-1.md:53-57】
  - [ ] Subtask 2.2 – Execute `pnpm lint` and `pnpm test:unit` to confirm scaffolds meet baseline CI expectations before Story 1.3 automation. 【docs/tech-spec-epic-1.md:153-158】
- [ ] Task 3 (AC: 3) – Produce README onboarding guidance describing workspace layout, commands, and developer workflow expectations. 【docs/epics.md:44-47】【docs/tech-spec-epic-1.md:16-24】
  - [ ] Subtask 3.1 – Document development prerequisites (Node.js 20.x, pnpm 9.x, TurboRepo) and cross-link to future onboarding/runbook docs. 【docs/tech-spec-epic-1.md:145-151】

## Dev Notes

- Adopt the three-service architecture (Next.js storefront, Medusa commerce, Strapi CMS) with shared packages per the solution architecture and tech spec. 【docs/solution-architecture.md:9-49】【docs/tech-spec-epic-1.md:16-48】
- Ensure workspace scripts wire into CI (`pnpm lint`, `pnpm test:unit`) ahead of Story 1.3 CI automation. 【docs/tech-spec-epic-1.md:153-158】
- Use Pulumi project scaffolding (`infra/pulumi`) and scripts directory placeholders to align with future automation tasks. 【docs/tech-spec-epic-1.md:47-48】
- Keep README aligned with PRD goals for a composable architecture that cleanly separates Next.js, Medusa, and Strapi. 【docs/PRD.md:5-16】

### Project Structure Notes

- Follow the proposed source tree under `apps/`, `packages/`, `infra/`, and shared `scripts/`/`tests/` directories. 【docs/solution-architecture.md:292-328】
- Verify workspace naming conventions and paths remain consistent with architecture guidance to avoid downstream Story Context adjustments. 【docs/tech-spec-epic-1.md:16-48】

## Change Log

| Date | Change | Author |
| ---- | ------ | ------ |
| 2025-10-19 | Initial draft created via create-story workflow | Scrum Master Agent |

### References

- docs/epics.md:38-47 – Epic 1 Story 1.1 definition and acceptance criteria.
- docs/tech-spec-epic-1.md:16-158 – Platform foundation technical specification, services/modules, environment templates, CI expectations.
- docs/solution-architecture.md:9-328 – Composable architecture overview and proposed source tree.
- docs/PRD.md:5-16 – Product goals reinforcing composable Next.js + Medusa + Strapi stack.

## Dev Agent Record

### Context Reference

- docs/stories/story-context-1.1.xml

### Agent Model Used

gpt-4.1 Scrum Master

### Debug Log References

- 2025-10-19: Plan to scaffold monorepo by (1) configuring pnpm workspace/turbo config at repo root, (2) generating Next.js app under `apps/web` via `pnpm dlx create-next-app`, (3) generating Medusa service with `pnpm dlx create-medusa-app`, (4) generating Strapi service with `pnpm dlx create-strapi-app`, (5) adding shared workspace tooling and `.env` templates, (6) writing bootstrap and README updates.
- 2025-10-19: Attempted `pnpm dlx create-next-app@latest apps/web ...` but registry fetch failed with `EAI_AGAIN` due to blocked external network; cannot scaffold required frameworks without npm access.

### Completion Notes List

- Blocked: npm registry access is required to scaffold Next.js, Medusa, and Strapi services; registry fetch fails with `EAI_AGAIN`, preventing completion of AC2.

### File List
