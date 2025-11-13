# Repository Guidelines

## Project Structure & Module Organization
Core assets live under `bmad/`. The `bmad/bmm` module stores role personas in `agents/`, delivery-phase workflows in `workflows/`, reusable ceremonies in `tasks/`, and team templates in `teams/`. Foundational engine assets stay in `bmad/core` (default tasks, base workflows, global configuration). Product collateral sits in `docs/`, with story drafts in `docs/stories`. Mirror this layout so agents continue to resolve relative paths.

## Build, Test, and Development Commands
Treat validation as linting. Run `yamllint bmad/bmm/workflows` to catch schema or indentation drift. Use `xmllint --noout bmad/bmm/tasks/*.xml` (or target subdirectories) before committing updated task definitions. After major edits, execute `rg "{project-root}" bmad -g'*.*'` to confirm token usage stays consistent with interpolation variables.

## Coding Style & Naming Conventions
Follow the existing two-space indentation for YAML and XML blocks; avoid tabs. Directory and file names use lower-kebab-case (`story-ready`, `workflow-status`); mirror that for new agents or workflows. Personas stay in `.md` files with fenced XML and the BMAD power banner. Keep lines under ~120 characters and use semantic headings to help downstream agent renderers parse sections.

## Testing Guidelines
BMM does not ship automated tests, so rely on targeted checks. Verify workflow YAML resolves valid `workflow.yaml` paths and agent IDs by opening referenced files after edits. For task XML, ensure attributes such as `critical="MANDATORY"` remain intact and loadable via the core engine. When updating `docs/stories`, cross-check acceptance criteria against linked workflows and note any manual validation in the pull request.

## Commit & Pull Request Guidelines
This folder is not under Git in the provided workspace; default to Conventional Commit style (`docs: refine analyst persona`) so automation can parse intent. Group related edits per commit, annotate body text with rationale and links to updated workflows, and reference issue or ticket IDs when available. Pull requests need a concise summary plus bullet-point validation notes (mention lint commands run) and screenshots or excerpts if rendered documentation changed.

## Security & Configuration Tips
Sensitive settings live in `bmad/bmm/config.yaml` and `bmad/core/config.yaml`. Avoid committing personal values; document required keys and prefer `{project-root}` tokens so deployments stay portable. When sharing examples, scrub user names (e.g., `Aiden Lux`) unless demonstrating defaults, and ensure new agents read configuration through interpolation rather than hard-coded paths.

## Operational Memory
- When you need to inspect Medusa data (e.g., confirm a product configuration), connect straight to the production Postgres instance using the credentials in `deploy/gce/.env`. Replace `host.docker.internal` with `localhost` before running `psql`.  
- The full step-by-step database checklist lives in `docs/runbooks/medusa-db-analysis.md`; review it before running ad-hoc queries so every agent follows the same procedure.
