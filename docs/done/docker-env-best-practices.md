---
last_updated: 2025-11-17
status: ✅ Active
related_docs:
  - docs/fix/2025-11-17-docker-db-access.md
  - docs/basic/docker-container-vs-host-localhost.md
  - docs/basic/docs-maintenance-best-practices.md
---

# Docker Prod/Dev Best-Practice Split – Implementation Summary

**Date:** 2025-11-17  
**Owner:** Codex (supporting Aiden Lux)  
**Scope:** Isolating Medusa/Strapi prod and dev deployments on a single GCE host while preserving operational best practices.

---

## Goals
- Remove cross-talk between production and development containers (ports, volumes, env files).
- Ensure developers can run `make dev-up` without risking prod stability.
- Document the final architecture so future bring-ups follow the same pattern.

---

## Architecture Highlights

1. **Directory Layout**
   - `deploy/gce/prod/docker-compose.yml` for production services.
   - `deploy/gce/dev/docker-compose.yml` for development services.
   - `deploy/gce/.env.prod` and `.env.dev` hold environment-specific secrets (no more shared `.env`).

2. **Networking**
   - Prod network `cs-prod-net` pinned to `172.30.0.0/16`; dev network `cs-dev-net` pinned to `172.31.0.0/16`.
   - PostgreSQL `pg_hba.conf` and UFW rules explicitly allow these CIDRs for ports 5432/6379.
   - Containers access host databases via `host.docker.internal` mapped to the gateway (172.30.0.1 / 172.31.0.1).

3. **Images & Secrets**
   - Prod images (`cs-medusa:prod`, `cs-strapi:prod`) set via `.env.prod`.
   - Dev images (`cs-medusa:dev`, `cs-strapi:dev`) referenced in `.env.dev`.
   - Standardized folder for Strapi uploads replaced with distinct Docker named volumes (`strapi_uploads_prod`, `strapi_uploads_dev`) so prod/dev never share filesystem state.

4. **Tooling**
   - Root `Makefile` exposes `make prod-up/down/logs` and `make dev-up/down/logs` to avoid command drift.
   - Docs (e.g., `docs/fix/dev-env-bringup-retro.md`, `docs/runbooks/rebuild-strapi-medusa-images.md`) now call the correct compose paths/env files.

5. **Security**
   - UFW default deny stays intact; only the specific Docker CIDRs get access to DB/Redis ports.
   - `pg_hba.conf` uses `scram-sha-256` for remote entries; passwords remain in managed env files.

---

## Implementation Steps (Key Milestones)

1. **Compose Split**
   - Migrated the legacy `deploy/gce/docker-compose.yml` into dedicated prod/dev files.
   - Removed `container_name` collisions and pinned unique host ports (prod 9000/1337, dev 9001/1338).

2. **Env Files**
   - Renamed root `.env` → `.env.prod`.
   - Cloned a sanitized `.env.dev` with dev DB URLs, CORS, OAuth callbacks, and dev image tags.

3. **Tooling Update**
   - Added Makefile plus docs referencing `docker compose -p cs-prod …` vs `-p cs-dev …`.
   - Updated scripts (e.g., `scripts/sync-medusa-customer.sh`) to load `.env.prod` and target prod compose.

4. **Firewall & DB Access**
   - Added pg_hba entries + UFW rules for the new CIDRs to fix the KnexTimeout errors when stacks launched concurrently.

5. **Validation**
   - `docker ps` shows four containers (`cs-prod-medusa-1`, `cs-prod-strapi-1`, `cs-dev-medusa_dev-1`, `cs-dev-strapi_dev-1`) with non-conflicting ports.
   - Health endpoints respond on both prod (`https://api.aidenlux.com/health`, `https://content.aidenlux.com/health`) and dev domains.

---

## Lessons Learned

1. **Host Services ≠ Container `localhost`**  
   Containers must use the host gateway IP or `host.docker.internal`, not `127.0.0.1`. Documented in `docs/basic/docker-container-vs-host-localhost.md`.

2. **Firewall Changes Are Mandatory When Subnets Change**  
   Compose-level isolation is useless unless pg_hba/ufw mirror the new ranges. Automate or document those steps early.

3. **Avoid Reusing Container Names**  
   Let Compose manage names via project prefixes (`cs-prod-*`, `cs-dev-*`). Hardcoding `container_name` caused collisions and was removed.

4. **Documentation Prevents Regression**  
   Updating runbooks, plans, and retros ensures future contributors don’t revert to single-stack habits.

---

## Next Steps / Recommendations

1. Consider scripting firewall + pg_hba updates (Ansible/Terraform) so new hosts inherit the rules automatically.
2. Evaluate moving Postgres/Redis into managed services or Dockerized services to simplify network policy.
3. Add smoke tests (curl health checks or `pg_isready` from a container) to CI whenever compose files change.
4. Monitor disk usage of named volumes (Strapi uploads) and apply consistent backup/rotation policies per environment.

This summary should serve as the canonical reference for how prod and dev Docker stacks coexist safely on the same host. Future deployments should follow the same pattern to maintain isolation and stability.
