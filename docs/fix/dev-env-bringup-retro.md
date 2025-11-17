---
last_updated: 2025-11-16
status: ✅ Active
related_docs:
  - docs/plan/dev-env-discord-plan.md
  - docs/basic/dev-db-clone.md
---

# Dev Environment Bring-up – Retrospective

**Date:** 2025-11-16  
**Owner:** Codex (supporting Aiden Lux)  
**Scope:** Standing up local Medusa/Strapi dev stack on `dev-api.aidenlux.com` / `dev-content.aidenlux.com`.

---

## What We Needed

1. Dedicated dev databases (`medusa_dev`, `strapi_dev`) cloned from prod.
2. Isolated `.env.dev` for backend services plus storefront `.env.local` pointing at dev domains.
3. Docker Compose override to run dev Medusa/Strapi side by side with prod, exposing ports 9001/1338 and mapping DNS.

---

## Steps Taken

1. **Database prep**
   - Created `medusa_dev`, `strapi_dev` on the host Postgres instance (plan documented in `docs/basic/dev-db-clone.md`).
   - Provided dump/restore commands so dev DBs mirror prod as needed.

2. **Env files**
   - Added `deploy/gce/.env.dev` with dev DB URLs, Redis DB 1, CORS entries for `https://dev.aidenlux.com`, and OAuth callbacks pointing to the dev domain.
   - Updated `apps/dji-storefront/.env.local` to use `https://dev-api.aidenlux.com` / `https://dev-content.aidenlux.com` and set `STOREFRONT_BASE_URL=https://dev.aidenlux.com`.

3. **Compose override**
   - Authored `deploy/gce/dev/docker-compose.yml` defining `medusa_dev` and `strapi_dev` services with:
     - Dev images (`cs-medusa:dev`, `cs-strapi:dev`)
     - Unique host ports (`9001:9000`, `1338:1337`)
     - Dedicated `cs-dev-net` network and shared uploads volume for Strapi.
   - DNS was already configured so the dev domains route to localhost on those ports.

4. **Image cleanup + rebuild**
   - Removed old Docker images to free disk space.
   - Rebuilt dev images (`cs-medusa:dev`, `cs-strapi:dev`) before launching the stack.

---

## Issues & Fixes

1. **Compose overriding prod containers**
   - Running `docker compose -f base -f dev up` tried to reuse the `medusa`/`strapi` service definitions, mutating the prod stack.
   - **Fix:** Rewrote the dev compose file to define standalone services (`medusa_dev`, `strapi_dev`) and removed the dependency on the prod compose file. Use `docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d`.

2. **Port conflicts (9000/1337)**
   - Initial override still bound container ports to 9000/1337 on the host because env interpolation pulled values from `.env` (prod) instead of `.env.dev`.
   - **Fix:** Hard-coded host mappings `9001:9000` and `1338:1337` in the dev compose file to eliminate dependence on env variables for port binding.

3. **Container name conflicts**
   - Docker tried to name dev containers `/medusa` and `/strapi`, colliding with prod.
   - **Fix:** Set explicit `container_name: medusa_dev` / `strapi_dev`.

4. **Stale orphan containers & network**
   - Repeated attempts left behind orphaned `cs-dev-medusa_dev-1` instances causing warnings.
   - **Fix:** Use `docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml down --remove-orphans` before relaunching.

5. **App env mismatches**
   - `.env.dev` was missing `MEDUSA_PORT` so the application defaulted incorrectly.
   - **Fix:** Added `MEDUSA_PORT=9000` and ensured other consumers rely on host port mappings, not internal overrides.

---

## Final State

- `docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d` starts:
  - `medusa_dev` (listening on host `:9001`) backed by `medusa_dev` DB.
  - `strapi_dev` (host `:1338`) backed by `strapi_dev` DB.
- Prod stack (`docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml up -d`) keeps `medusa`/`strapi` on ports 9000/1337.
- Storefront `.env.local` points to `https://dev-api.aidenlux.com`/`https://dev-content.aidenlux.com`, so `pnpm dev:dji-storefront` hits the dev services.
- Disk footprint trimmed to four relevant images (prod/dev pairs).

---

## Operational Notes

- Start prod and dev stacks independently; use different project names (`default` vs `cs-dev`).
- When rotating dev databases, follow `docs/basic/dev-db-clone.md` and reapply sanitation before sharing.
- DNS (`dev-api.aidenlux.com`, `dev-content.aidenlux.com`) must continue to point to localhost for local QA; update if host changes.

---

## Dev Backend Playbook

1. **Build dev images**

   ```bash
   docker build -f apps/medusa/Dockerfile -t cs-medusa:dev .
   docker build -f apps/strapi/Dockerfile -t cs-strapi:dev .
   ```

   Rebuild whenever backend code changes.

2. **Start dev stack**

   ```bash
   # or simply `make dev-up`
   docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml up -d
   ```

   - Medusa: `https://dev-api.aidenlux.com` (host port 9001)
   - Strapi: `https://dev-content.aidenlux.com` (host port 1338)
   - Logs: `docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml logs -f medusa_dev` (same for `strapi_dev`)

3. **Stop dev stack**

   ```bash
   # or `make dev-down`
   docker compose -p cs-dev --env-file deploy/gce/.env.dev -f deploy/gce/dev/docker-compose.yml down --remove-orphans
   ```

4. **Update databases**

   - Follow `docs/basic/dev-db-clone.md` to dump prod and restore into `medusa_dev` / `strapi_dev`.
   - Update `.env.dev` with new connection strings if needed.

5. **Storefront dev**

   ```bash
   pnpm --filter dji-storefront dev   # uses apps/dji-storefront/.env.local
   ```

   Ensure `.env.local` points to `https://dev-api.aidenlux.com` / `https://dev-content.aidenlux.com`.

6. **Health checks**

   ```bash
   curl -k https://dev-api.aidenlux.com/store/health
   curl -k https://dev-content.aidenlux.com/admin
   ```

   Use `-k` if self-signed certs are in place locally.

With these adjustments, the dev environment mirrors production behavior without interfering with the live stack and can be brought up/down independently.
