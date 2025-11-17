# Dev/Staging Environment Split Plan

## Goal
Introduce a dedicated dev configuration so Discord OAuth (and other integrations) can run against `dev.aidenlux.com` without leaking prod callbacks or secrets. Deliverables include environment files, compose overrides, and documentation.

## Tasks

1. **Environment files**
   - Copy `deploy/gce/.env` → `deploy/gce/.env.dev`, scrub/replace with dev credentials.
   - Update key entries: `DISCORD_OAUTH_CALLBACK_URL=https://dev.aidenlux.com/auth/discord/callback`, `STORE_CORS/AUTH_CORS` include dev host, point DB/Redis to dev instances, rotate JWT/cookie secrets.
   - Document required var differences (OAuth clients, webhook secrets, file buckets).

2. **Docker Compose override**
   - Add `deploy/gce/docker-compose.dev.yml` referencing `.env.dev`, exposing distinct ports (e.g., 9100/14337) or dev images (`cs-medusa:dev`, `cs-strapi:dev`).
   - Provide helper command in README/Makefile: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d`.

3. **Front-end env wiring**
   - Create `.env.dev` for `apps/dji-storefront` with `NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://dev-api.aidenlux.com`, `NEXT_PUBLIC_ENABLE_DISCORD_OAUTH=true`, etc.
   - Add npm scripts or docs to run `pnpm dev:storefront:dev` loading the dev env file (via `dotenv` or `cross-env`).

4. **Medusa configuration**
   - Verify `apps/medusa/medusa-config.ts` pulls from `loadEnv` so `DISCORD_OAUTH_CALLBACK_URL`/other overrides apply when `NODE_ENV=development`.
   - Document running `NODE_ENV=development DISCORD_OAUTH_CALLBACK_URL=https://dev.aidenlux.com/auth/discord/callback pnpm --filter medusa start`.

5. **Documentation & validation**
   - Add `docs/runbooks/dev-env-setup.md` describing how to sync env files, rotate dev secrets, and validate with `curl -X POST http://localhost:9000/auth/customer/discord` (should return dev callback).
   - Note required lint/validation commands (`yamllint bmad/bmm/workflows`, `xmllint ...`) if any docs/workflows change.
