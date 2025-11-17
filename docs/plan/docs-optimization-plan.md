---
title: Documentation Optimization Rollout
last_updated: 2025-11-17
status: ✅ Approved
related_docs:
  - docs/basic/docs-maintenance-best-practices.md
  - docs/index.md
  - AGENTS.md
---

# Objective
Ensure the current documentation set aligns with the maintenance best practices: consistent templates, metadata, cross-links, and discoverability.

# Deliverables
1. All retro/plan/fix/basic/runbook docs include front-matter metadata (`last_updated`, `status`, `related_docs`).
2. Topic index (`docs/index.md`) kept up to date with every new doc.
3. `AGENTS.md` and `Makefile` expose key doc links/commands.
4. Sprint cadence includes doc freshness checks recorded in `docs/sprint-status.yaml`.

# Implementation Steps
| Step | Owner | Definition of Done |
| --- | --- | --- |
| 1. Audit existing docs | Documentation lead | Spreadsheet or checklist of all files under `docs/` with type classification (retro/plan/basic/etc.) |
| 2. Apply metadata & template | Documentation lead + contributors | Each doc uses correct template sections + front matter; run `rg "last_updated"` to confirm coverage |
| 3. Update cross-links | Infra/auth owners | Each doc lists “Related Docs”; `docs/index.md` includes new entries |
| 4. Automate discovery | CLI tooling owner | `make docs` (or similar) prints important doc paths; `AGENTS.md` references index + key runbooks |
| 5. Embed review cadence | Project manager | `docs/sprint-status.yaml` gains “docsUpdated” flag + link to updated files; sprint retro agenda includes doc review item |

# Validation
- Run `rg -L "last_updated"` to ensure no doc is missing metadata.
- `docs/index.md` lists all major topics (Docker, OAuth, Docs, Runbooks, Dev Env, etc.) and links resolve.
- `make docs` (or help command) outputs the index path and templates.
- Sprint retro notes show documentation review outcomes.

# Risks & Mitigations
- **Scope creep:** limit initial pass to high-impact docs (Docker, OAuth, Runbooks). Mitigation: prioritize via audit list.
- **Staleness persists:** set calendar reminders at sprint end; assign doc owners.
- **Contributor friction:** templates might feel heavy. Mitigation: keep templates concise, offer snippets for common editors.

# Communication
- Share plan + progress in the engineering weekly update.
- During onboarding, point newcomers to `docs/index.md` and the templates so they follow conventions from day one.
