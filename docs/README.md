# Documentation Entry Points

- **Index:** [`docs/index.md`](./index.md) – grouped links for Docker, Auth, Runbooks, Dev Env, etc.
- **Templates:** [`docs/templates/`](./templates) – start here when creating new retros, plans, or runbooks.
- **Maintenance Guide:** [`docs/basic/docs-maintenance-best-practices.md`](./basic/docs-maintenance-best-practices.md) – explains metadata requirements, cross-linking, and review cadence.
- **Optimization Plan:** [`docs/plan/docs-optimization-plan.md`](./plan/docs-optimization-plan.md) – current rollout plan for keeping docs current.

When adding or modifying documentation:
1. Update or add front matter (`last_updated`, `status`, `related_docs`) to the file.
2. Insert cross-links in both the document and `docs/index.md`.
3. Mention changes in `docs/sprint-status.yaml` under the `documentation` section.
4. Ensure `AGENTS.md` references any new processes or runbooks.
