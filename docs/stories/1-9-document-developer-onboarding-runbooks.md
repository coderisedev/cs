# Story 1.9: Document Developer Onboarding & Runbooks

Status: done

## Story

As an engineering lead,
I want onboarding guides and operational runbooks documented,
so that new contributors can spin up environments and troubleshoot quickly.

## Acceptance Criteria

1. Developer onboarding guide covers local setup, environment management, and CI expectations.
2. Runbook outlines deployment process, rollback steps, and contact points.
3. Documentation published in repo `docs/` directory and referenced from README.

## Tasks / Subtasks

- [ ] Onboarding guide (AC: #1)  
  - [x] Update or create `docs/onboarding.md` to cover tooling, environment setup from `.env.example` templates, and CI checks.  
  - [x] Add quickstart scripts/commands, common pitfalls, and local verification steps.  
  - [x] Cross-link environment configuration references (docs/runbooks/environment-config.md).
- [ ] Runbooks (AC: #2)  
  - [x] Author or refine `docs/runbooks/deployments.md` (build, deploy, rollback) and `docs/runbooks/troubleshooting.md` (common failures, escalation).  
  - [x] Confirm contacts/owners and expected SLAs for handoffs.  
  - [x] Ensure guidance aligns with `.github/workflows/*` pipelines and infra scripts.
- [ ] Publication and references (AC: #3)  
  - [x] Ensure docs are stored under `docs/` and linked from `README.md`.  
  - [x] Add a “Developer Onboarding” section in README with pointers to onboarding and runbooks.  
  - [x] Verify links and anchors resolve.

### Review Follow-ups (AI)

- [x] [AI-Review][Med] Add owner contacts and expected SLAs to runbooks; include escalation path.
- [x] [AI-Review][Low] Validate all README links/anchors resolve (CI docs, runbooks, scripts) and update if needed.

## Dev Notes

- Reuse existing documents: `docs/onboarding.md`, `docs/runbooks/*`, CI/CD docs.  
- Keep guides concise, task‑oriented, and aligned with current repo structure and scripts.  
- Validate instructions with a fresh clone scenario.

### Project Structure Notes

- Place onboarding in `docs/onboarding.md`.  
- Place runbooks in `docs/runbooks/` with focused, single-topic guides.  
- Update `README.md` with cross-links and a brief overview.

### References

- docs/epics.md#story-19-document-developer-onboarding--runbooks  
- docs/PRD.md  
- .github/workflows/  
- scripts/

## Dev Agent Record

### Context Reference

- docs/stories/1-9-document-developer-onboarding-runbooks.context.md

### Agent Model Used

sm (Scrum Master)

### Debug Log References

2025-10-27: Drafted onboarding/runbook docs and updated README
- docs/runbooks/deployments.md — CI/CD summary with promote/rollback and health verification
- docs/runbooks/troubleshooting.md — common issues and quick checks
- README.md — added Developer Onboarding and runbook links

### Completion Notes List

### Change Log

- 2025-10-27: Senior Developer Review notes appended; outcome Approve.

## Senior Developer Review (AI)

- Reviewer: Aiden
- Date: 2025-10-27
- Outcome: Approve

### Summary
Onboarding (AC1) and runbooks (AC2) complete, including contacts/owners and SLEs with escalation path. Publication and link verification done (AC3). Docs align with CI/infra scripts.

### Acceptance Criteria Coverage
- AC1: Complete
- AC2: Complete — Contacts/owners and SLEs added to runbooks
- AC3: Complete — Linked from README; links verified

### File List

- docs/runbooks/deployments.md
- docs/runbooks/troubleshooting.md
- README.md
