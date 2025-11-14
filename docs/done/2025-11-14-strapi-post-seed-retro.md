# Strapi Post Seeder Retro – 2025-11-14

## Context
- Production Strapi (deploy/gce) needed fresh `api::post.post` entries sourced from `apps/strapi/scripts/seeds/posts.json`.
- Prior CLI attempts failed because the seeder could not locate compiled config (only `.ts` files existed) and the running container already occupied port 1337.
- Goal: make the seeder runnable against the production container, ensure data is idempotently inserted, and document the path for future runs.

## What Happened
- Patched `apps/strapi/scripts/import-post-seeds.js` to log its root, prefer the compiled `dist` directory when present, and always call `strapi.destroy()` safely so scripts exit cleanly even if Knex aborts.
- Rebuilt `cs-strapi:prod` from repo root and redeployed `deploy/gce`’s `strapi` service so the new script shipped with the running container.
- Exec’d the script inside the container with `NODE_ENV=production PORT=31337` to avoid clashing with the live HTTP listener and confirmed each slug was created/updated once the DB connection reused the `.env` secrets.

## Validation
- Seeder output reported six posts updated (`cs-320a-mcdu-metal-craft`, `daisy-chain-kit-simplifies-setups`, `cs-737m-cdu-v2-upgrade-notes`, `pick-right-cdu-737x-777x-747x`, `cs-320n-fcu-ecosystem-overview`, `737x-mcp-efis-mode-control-stack`).
- No lingering `Cannot destructure property 'client'` or `better-sqlite3` warnings; `/srv/app/apps/strapi/dist` is now honored during boot.
- Production admin verified the posts exist, completing the acceptance check for this task.

## Lessons Learned
- Strapi CLIs rely on compiled JS when running in production mode; always pass `distDir` (or run from the built image) if the TypeScript sources remain untranspiled.
- Temporary Strapi processes need a free port even when only seeding; override `PORT` via env so you can run alongside the main container without downtime.
- Wrap `strapi.destroy()` in a try/catch so transient pool shutdown errors don’t mask a successful seed run; exit codes should reflect data state, not teardown noise.

## Follow-ups
1. Consider a make/PNPM task (e.g., `pnpm --filter strapi seed:posts:prod`) that shells into the container with the correct `PORT` override so future ops are copy/pasteable.
2. Capture the six canonical slugs and authors in `docs/stories` or a runbook so content reviewers know what “baseline” looks like before overriding seeds.
3. When time allows, lint the remaining Strapi scripts to ensure all automation prefers `dist` output; this will avoid similar errors when new tasks/helpers are added.
