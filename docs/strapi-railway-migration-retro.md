# Strapi Railway Migration Retro – 2025-10-21

## Context
- Story 1.6 required deploying Strapi on Railway with PostgreSQL instead of the default SQLite.
- Existing automation (`pulumi up` invoking `railway up`) failed due to missing CLI support, absent pnpm in the runtime image, and lack of database drivers/secrets.
- Goal: unblock Railway deployments, ensure Strapi runs against the managed PostgreSQL instance, and document the process for future automation fixes.

## What Happened
- Added a Pulumi command-provider bridge (`infra/pulumi/apps/railway.ts`) to drive Railway deployments via CLI.
- Encountered repeated `404 Not Found` uploads from `railway up`; the CLI eventually succeeded once the project accepted the build plan, but Medusa uploads still intermittently fail (tracked separately).
- Adjusted Railway build/start commands to install pnpm and execute Strapi from the app directory (`npm install -g pnpm && pnpm install --no-frozen-lockfile && pnpm --filter strapi build`, `cd apps/strapi && npx strapi start`).
- Updated Strapi configuration to default to PostgreSQL when `DATABASE_URL` is present (`apps/strapi/config/database.ts`), aligned documentation (`docs/pulumi-railway-setup.md`, `docs/stories/story-1.6.md`).
- Provisioned PostgreSQL on Railway and injected required env vars:
  - `DATABASE_CLIENT=postgres`
  - `DATABASE_URL=postgresql://postgres:…@postgres.railway.internal:5432/railway`
  - `DATABASE_SSL=true`, `DATABASE_SSL_REJECT_UNAUTHORIZED=false`
  - Generated Strapi secrets (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`) and set for staging/production.
- Confirmed Strapi service now builds and starts successfully on Railway; remaining blocker is Medusa deploy 404 (outside current scope).

## Lessons Learned
- Railway’s Railpack auto-detects package managers; without explicit install commands it defaults to Yarn v1, so cross-check Build/Start commands after connecting a monorepo.
- Pulumi + Railway CLI is viable but the CLI still has sporadic 404s when uploading archives; keep an eye on Railway updates or consider REST API/SDK alternatives.
- Strapi requires critical secrets beyond database credentials; document and store them centrally to avoid runtime crashes.

## Follow-ups
1. Monitor Railway CLI release notes or open a ticket for the Medusa `404 Up` upload issue; Pulumi automation remains partially blocked.
2. Mirror the updated Strapi environment variables in infrastructure-as-code (Pulumi config or secrets manager) once the deployment process stabilises.
3. Extend the CI workflow (`deploy-services.yml`) to run sanity checks post deploy (e.g., ping Strapi health endpoint) once Medusa pipelines are fixed.
