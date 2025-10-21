# Medusa Railway Deployment Guide

## Build & Start Commands
- **Build:** `./scripts/railway-medusa-build.sh`
  - Installs pnpm when missing, installs workspace dependencies, and runs `pnpm --filter medusa build`.
- **Start:** `./scripts/railway-medusa-start.sh`
  - Enters `apps/medusa` and executes `npx medusa start`.

Update the Medusa service in Railway (staging and production) to reference these scripts so builds and runtime use the monorepo tooling.

## Required Environment Variables
Set the following per environment (staging/production):
- `DATABASE_URL` – PostgreSQL connection string (e.g., `postgresql://postgres:...@postgres.railway.internal:5432/medusa`).
- `REDIS_URL` – Redis instance for jobs/caching (e.g., `redis://default:...@redis.railway.internal:6379`).
- `JWT_SECRET`, `COOKIE_SECRET` – Use random 32+ character hex strings.
- `ADMIN_CORS`, `STORE_CORS`, `AUTH_CORS` – Allowed origins (mirror Story 1.2 templates).
- `MEDUSA_API_KEY`, `PAYPAL_CLIENT_ID`, etc., as required by Story 1.6 and related specs.

## Notes
- Scripts assume repository root execution; keep them executable (`chmod +x scripts/railway-medusa-*.sh`).
- When automating via Pulumi (`railway up`), these scripts will distribute work consistently with Strapi’s setup.
- Track outstanding Railway CLI upload failures (HTTP 404). If they persist, coordinate with Railway support or deploy through the UI and re-trigger Pulumi later.
