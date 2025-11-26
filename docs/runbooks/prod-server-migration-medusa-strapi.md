---
title: Prod Server Migration (Medusa & Strapi)
last_updated: 2025-02-16
status: ⚠ Needs Test
related_docs:
  - docs/runbooks/medusa-db-analysis.md
  - docs/done/docker-env-best-practices.md
  - docs/basic/docker-container-vs-host-localhost.md
---

# Purpose
- Move the current Medusa/Strapi production stack to a new server with identical host-Postgres + docker compose layout.

# Prerequisites
- Access to current prod server (source) and target prod server with Docker/Compose, make, corepack/pnpm installed.
- Latest dumps created with `scripts/gce/export-prod-dbs.sh` (keep outside the repo).
- Postgres running on host (not in containers) on the target server.
- Copy of repo at the same commit to `/home/coderisedev/cs` on the target server.
- Credentials from `deploy/gce/.env` copied to `deploy/gce/.env.prod` on the target.

# Procedure
1. **Record source state**  
   - On source: `cd /home/coderisedev/cs && git rev-parse HEAD` (note commit). Ensure new DB dumps are available.
2. **Sync repo and env to target**  
   - Copy repo to `/home/coderisedev/cs` on target (same commit).  
   - Copy `deploy/gce/.env` from source to target as `deploy/gce/.env.prod`; adjust only if host IP/gateway changes.
3. **Install deps on target (if needed)**  
   - Run `scripts/gce/install-deps.sh` or ensure docker, docker compose plugin, make, corepack/pnpm are present.
4. **Transfer dumps to target**  
   - `scp ~/db-backups/medusa-prod-*.dump <target>:~/db-backups/`  
   - `scp ~/db-backups/strapi-prod-*.dump <target>:~/db-backups/`
5. **Prepare target Postgres (host)**  
   - `sudo -iu postgres psql -c "CREATE ROLE cs WITH LOGIN PASSWORD 'n6DYeq3H9uOJudpligATbfYYmjJtUaoV'"` (skip if exists)  
   - `sudo -iu postgres psql -c "CREATE DATABASE medusa_production OWNER cs"`  
   - `sudo -iu postgres psql -c "CREATE DATABASE strapi_production OWNER cs"`
6. **Restore data on target**  
   - Medusa:  
     `pg_restore --clean --if-exists --no-owner --no-privileges \`  
     `  --dbname "postgresql://cs:n6DYeq3H9uOJudpligATbfYYmjJtUaoV@localhost:5432/medusa_production" \`  
     `  ~/db-backups/medusa-prod-*.dump`  
   - Strapi:  
     `pg_restore --clean --if-exists --no-owner --no-privileges \`  
     `  --dbname "postgresql://cs:n6DYeq3H9uOJudpligATbfYYmjJtUaoV@localhost:5432/strapi_production" \`  
     `  ~/db-backups/strapi-prod-*.dump`
7. **Build images on target**  
   - `cd /home/coderisedev/cs`  
   - `docker build -t cs-medusa:prod -f apps/medusa/Dockerfile .`  
   - `docker build -t cs-strapi:prod -f apps/strapi/Dockerfile .`
8. **Start stack via Makefile (prod compose)**  
   - Ensure `deploy/gce/.env.prod` is present.  
   - `make prod-up`  
   - Check logs: `make prod-logs SERVICE=medusa` and `make prod-logs SERVICE=strapi`.
9. **Validate on target**  
   - Health: `curl http://localhost:9000/health` (Medusa), access `http://localhost:1337/admin` (Strapi admin).  
   - Verify Redis/DB connections, uploads (R2) endpoints, and webhook secrets match expectations.  
   - If extra_hosts subnet differs, update `deploy/gce/prod/docker-compose.yml` accordingly.
10. **Cutover**  
    - Update DNS/load balancer to point to the new server.  
    - Monitor logs and metrics. Keep the old server on standby until stability is confirmed.

# Verification
- Medusa health endpoint returns 200; `make prod-logs SERVICE=medusa` shows no DB/Redis errors.
- Strapi admin reachable, can log in and read content; `make prod-logs SERVICE=strapi` clean.
- Spot-check uploads serve from R2 URLs; webhooks (if any) succeed.
- Databases on target contain expected data counts (`psql -d medusa_production -c "SELECT count(*) FROM store;"` as needed).

# Rollback / Cleanup
- If cutover fails, repoint DNS/load balancer back to the source server.  
- To rebuild fresh, `make prod-down` on target, drop/recreate DBs, re-run restore + make prod-up.  
- Remove backup dumps from the target once validated (securely delete per policy).

# References
- `docs/runbooks/medusa-db-analysis.md`  
- `docs/done/docker-env-best-practices.md`  
- `docs/basic/docker-container-vs-host-localhost.md`
