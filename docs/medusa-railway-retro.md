# Medusa Railway Deployment Retro – 2025-10-21

## Context
- Goal: bring Medusa 2.x service online in Railway with PostgreSQL + Redis, matching the infrastructure targeted by Story 1.6.
- Starting point: Medusa ran locally but Railway builds failed due to missing dependencies, CLI mismatches, and an empty database schema.

## What Changed
- Introduced deployment-friendly build/start commands that install pnpm only if missing, run `pnpm --filter medusa build`, and start via `cd apps/medusa && npx medusa start`.
- Kept `pnpm-lock.yaml` aligned with dependency changes (`--no-frozen-lockfile` at build time) to avoid frozen-lock errors.
- Added required admin/dashboard modules: `@medusajs/admin-bundler`, `@medusajs/dashboard`, `@medusajs/draft-order`, plus `@babel/runtime` to satisfy Vite rollup imports.
- Provisioned dedicated PostgreSQL and Redis services for Medusa on Railway; set `DATABASE_URL`, `REDIS_URL`, JWT/Cookie secrets, and CORS env vars for staging/production.
- Latest runtime errors narrowed to uninitialized schema—Medusa expects tables (regions, tax providers, payment providers, currencies) that migrations create.

## Lessons Learned
- Medusa admin features pull optional packages; watch Vite warnings to ensure all required dependencies are added explicitly.
- Railway’s Railpack builder still runs `pnpm install --frozen-lockfile`; ensure lockfile is updated before pushing or relax the flag if necessary.
- Global installs (pnpm) must guard against existing binaries to avoid `EEXIST`.
- Postgres-backed services must run migrations (and seeds if desired) before the service logs “ready”.

## Follow-ups
1. Execute `pnpm --filter medusa medusa migrations run` (and optional seed) against the Railway database to populate tables.
2. After migrations succeed, wire the step into pre-deploy automation (Pulumi or Railway hooks) for reproducible setups.
3. Monitor logs on first production run to confirm regions, tax modules, payment providers, and notification modules initialize without missing schema errors.
