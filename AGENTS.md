# Repository Guidelines

## Project Structure & Module Organization
Core assets live under `bmad/`. The `bmad/bmm` module stores role personas in `agents/`, delivery-phase workflows in `workflows/`, reusable ceremonies in `tasks/`, and team templates in `teams/`. Foundational engine assets stay in `bmad/core` (default tasks, base workflows, global configuration). Product collateral sits in `docs/`, with story drafts in `docs/stories`. Mirror this layout so agents continue to resolve relative paths.  
Infra-specific assets now live under `deploy/gce/`:
- `prod/docker-compose.yml` + `.env.prod` for production Medusa/Strapi.
- `dev/docker-compose.yml` + `.env.dev` for the dev stack (ports 9001/1338).  
Never revert to a single shared compose file; prod/dev isolation is mandatory.

Documentation lives under `docs/`. Start at `docs/index.md` for topic navigation and use the templates in `docs/templates/` whenever creating new retros/plans/runbooks. Major process changes must update `AGENTS.md` and the index in the same PR.

## Build, Test, and Development Commands
Treat validation as linting. Run `yamllint bmad/bmm/workflows` to catch schema or indentation drift. Use `xmllint --noout bmad/bmm/tasks/*.xml` (or target subdirectories) before committing updated task definitions. After major edits, execute `rg "{project-root}" bmad -g'*.*'` to confirm token usage stays consistent with interpolation variables.  
For backend services use the root `Makefile`:
- `make prod-up|prod-down|prod-logs SERVICE=medusa` wraps `docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml …`.
- `make dev-up|dev-down|dev-logs` wraps the dev stack.  
Do **not** run ad-hoc `docker compose` commands; the project flag and env file must match the chosen environment.
Use `make docs` to see the documentation index and template locations from the CLI.

## Coding Style & Naming Conventions
Follow the existing two-space indentation for YAML and XML blocks; avoid tabs. Directory and file names use lower-kebab-case (`story-ready`, `workflow-status`); mirror that for new agents or workflows. Personas stay in `.md` files with fenced XML and the BMAD power banner. Keep lines under ~120 characters and use semantic headings to help downstream agent renderers parse sections.

## Testing Guidelines
BMM does not ship automated tests, so rely on targeted checks. Verify workflow YAML resolves valid `workflow.yaml` paths and agent IDs by opening referenced files after edits. For task XML, ensure attributes such as `critical="MANDATORY"` remain intact and loadable via the core engine. When updating `docs/stories`, cross-check acceptance criteria against linked workflows and note any manual validation in the pull request.

## Commit & Pull Request Guidelines
This folder is not under Git in the provided workspace; default to Conventional Commit style (`docs: refine analyst persona`) so automation can parse intent. Group related edits per commit, annotate body text with rationale and links to updated workflows, and reference issue or ticket IDs when available. Pull requests need a concise summary plus bullet-point validation notes (mention lint commands run) and screenshots or excerpts if rendered documentation changed.

## Security & Configuration Tips
Sensitive settings live in `bmad/bmm/config.yaml` and `bmad/core/config.yaml`. Avoid committing personal values; document required keys and prefer `{project-root}` tokens so deployments stay portable. When sharing examples, scrub user names (e.g., `Aiden Lux`) unless demonstrating defaults, and ensure new agents read configuration through interpolation rather than hard-coded paths.

## Operational Memory
- When you need to inspect Medusa data (e.g., confirm a product configuration), connect straight to the production Postgres instance using the credentials in `deploy/gce/.env.prod`. Replace `host.docker.internal` with `localhost` before running `psql`. If compose subnets change, immediately update both `pg_hba.conf` and UFW (see `docs/fix/2025-11-17-docker-db-access.md`).  
- Containers cannot access host services via `localhost`; use `host.docker.internal` or the host gateway IP. `docs/basic/docker-container-vs-host-localhost.md` explains the networking model—read it before debugging DB connectivity.  
- The full step-by-step database checklist lives in `docs/runbooks/medusa-db-analysis.md`; review it before running ad-hoc queries so every agent follows the same procedure.  
- Prod/dev isolation rules, networking, firewall requirements, and make targets are summarized in `docs/done/docker-env-best-practices.md`. Consult it whenever editing compose/env/docs to avoid regressions.
