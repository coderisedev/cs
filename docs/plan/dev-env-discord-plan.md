---
last_updated: 2025-11-17
status: ✅ Approved
related_docs:
  - docs/fix/dev-env-bringup-retro.md
  - docs/done/discord-oauth-retro.md
---

# Dev/Staging Environment Split Plan

## Goal
Introduce a dedicated dev configuration so Discord OAuth (and other integrations) can run against `dev.aidenlux.com` without leaking prod callbacks or secrets. Deliverables include environment files, compose overrides, and documentation.

## Tasks

1. **Environment files**
   - Copy `deploy/gce/.env.prod` → `deploy/gce/.env.dev`, scrub/replace with dev credentials.
   - Update key entries:
     - `MEDUSA_BACKEND_URL=https://dev-api.aidenlux.com`, `STRAPI_ADMIN_BACKEND_URL=https://dev-content.aidenlux.com`.
     - `DISCORD_OAUTH_CALLBACK_URL=https://dev.aidenlux.com/auth/discord/callback`.
     - `STORE_CORS/AUTH_CORS` include `https://dev.aidenlux.com`.
     - Point DB/Redis to dev instances (or new schemas), rotate JWT/cookie secrets.
   - Document required var differences (OAuth clients, webhook secrets, file buckets).

2. **Docker Compose override**
   - Add `deploy/gce/dev/docker-compose.yml` defining standalone services (`medusa_dev`, `strapi_dev`) that mirror the prod config but load `.env.dev`, run dev-tagged images, and expose unique host ports (`9001:9000`, `1338:1337`) pointing to `dev-api.aidenlux.com` / `dev-content.aidenlux.com`.
   - Dedicate a `cs-dev-net` network and mount any required volumes so dev and prod stacks can run simultaneously without port/name conflicts.
   - Launch via `docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d`; tear down with the same flags and `down --remove-orphans`.

3. **Front-end env wiring**
   - Create `.env.dev.local` for `apps/dji-storefront` with:
     - `MEDUSA_BACKEND_URL=https://dev-api.aidenlux.com`
     - `STRAPI_API_URL=https://dev-content.aidenlux.com`
     - `STOREFRONT_BASE_URL=https://dev.aidenlux.com`
   - Add a script (`pnpm dev:dji-storefront:dev`) or docs to load that file when running `next dev`.

4. **Medusa configuration**
   - Ensure `apps/medusa/medusa-config.ts` uses `loadEnv` so the dev vars apply automatically.
   - Document running Medusa locally with `NODE_ENV=development MEDUSA_BACKEND_URL=https://dev-api.aidenlux.com pnpm --filter medusa start` if hitting the remote dev DB.

5. **Documentation & validation**
   - Add `docs/runbooks/dev-env-setup.md` detailing how to spin up the dev stack, seed data, and validate with `curl -X POST https://dev-api.aidenlux.com/auth/customer/discord`.
   - Note required lint/validation commands (`yamllint`, `xmllint`) when editing infra docs.
