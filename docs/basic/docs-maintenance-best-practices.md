---
last_updated: 2025-11-17
status: ✅ Active
related_docs:
  - docs/index.md
  - docs/templates/retro-template.md
---

# Documentation Maintenance Best Practices (2025-11-17)

These guidelines summarize how to keep the `docs/` knowledge base usable as the project evolves.

## 1. Standardize Templates
- Define canonical outlines for the main doc types (Retro, Plan, Runbook, How-to). Example:  
  `Title + Date → Context → Problem/Goal → Actions → Validation → Follow-ups → Related Docs`.
- Store these skeletons in `docs/templates/` and reference them in `docs/README` so every new file is copy/paste friendly.
- When reviewing PRs, reject retros/plans that deviate from the template without justification.

## 2. Cross-Reference & Index
- Maintain a living index (either `docs/README` or dedicated `docs/index.md`) that groups documents by domain (Docker, OAuth, DB, Cloudflare, Frontend, etc.).
- In each document’s header, add a “Related Docs” list pointing to the matching plan/fix/basic entries so readers can traverse context quickly.
- When adding a new document, update the index in the same PR; add a CI/guideline note reminding authors to do this.

## 3. Separate “Basics” vs “Incident Logs”
- Long-lived, reusable knowledge goes to `docs/basic/`.
- Incident retros (`docs/fix/…`) capture context + resolution, then explicitly link to the relevant basic doc rather than duplicating theory.
- When a retro uncovers a new principle, immediately promote it into `docs/basic/…` and leave a short “See basics -> …” note in the retro to avoid divergence.

## 4. Freshness Indicators
- Every doc should start with “Last updated: YYYY-MM-DD” and optionally “Status: ✅ Active / ⚠ Needs review”.
- When infrastructure or process changes, audit affected docs and note the change (e.g., “Superseded by …”). Never delete history; annotate it.
- Create a recurring reminder (sprint retro agenda) to review high-risk docs (deployment, security) for freshness.

## 5. Automation & Entry Points
- Keep `AGENTS.md` synchronized with key runbooks and retros; any new process doc should be linked there.
- Add helper commands (e.g., `make docs` or `pnpm docs:list`) that print links to the latest plan/fix/basic docs so developers can discover them via CLI.
- Consider adding a CI check that warns when a doc is modified but the index/AGENTS are not updated.

## 6. Visual Aids
- For architecture-heavy topics (Docker networking, OAuth flows, Cloudflare tunnels), add Mermaid/PlantUML diagrams to show component interactions.
- Store diagrams near their docs (e.g., `docs/basic/diagram-docker-env.mmd`) and embed them using Markdown fences so GitHub renders them.
- When flows change, update the diagram at the same time; treat it like code.

## 7. Iteration Reviews
- At the end of every sprint, update `docs/sprint-status.yaml` (or similar) with:
  - Docs added/modified
  - Whether `AGENTS.md` was refreshed
  - Any pending documentation debt
- Use the sprint retro to assign owners to outdated docs so maintenance is continuous, not ad-hoc.

Following these practices keeps the knowledge base authoritative, searchable, and onboarding-friendly as the repository grows.
