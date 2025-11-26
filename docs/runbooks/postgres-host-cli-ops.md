---
title: Host Postgres CLI Ops
last_updated: 2025-02-16
status: ⚠ Needs Test
related_docs:
  - docs/basic/docker-container-vs-host-localhost.md
  - docs/done/docker-env-best-practices.md
---

# Purpose
- Quick reference for connecting to host-installed Postgres, listing DBs/roles, and creating or updating Medusa/Strapi databases.

# Prerequisites
- SSH access to the target host (sudo privileges for Postgres admin tasks).
- Postgres installed on the host (not containerized).
- If using app roles, know the credentials (e.g., `cs` / password from `deploy/gce/.env`).

# Procedure
1. **Open psql as postgres superuser**  
   ```bash
   sudo -iu postgres psql
   ```
2. **Inspect basics inside psql**  
   - List databases: `\l`  
   - List roles: `\du`  
   - Connect to a DB: `\c database_name`  
   - List tables: `\dt` (after connecting)  
   - Exit: `\q`
3. **Create app role + databases (Medusa/Strapi)**  
   ```sql
   CREATE ROLE cs WITH LOGIN PASSWORD 'n6DYeq3H9uOJudpligATbfYYmjJtUaoV';
   CREATE DATABASE medusa_production OWNER cs;
   CREATE DATABASE strapi_production OWNER cs;
   ```
4. **Test app-role connectivity from shell**  
   ```bash
   psql "postgresql://cs:n6DYeq3H9uOJudpligATbfYYmjJtUaoV@localhost:5432/medusa_production"
   ```
   Replace DB name as needed (`strapi_production` for Strapi).
5. **Reset password (if required)**  
   ```sql
   ALTER ROLE cs WITH PASSWORD 'new-strong-password';
   ```
6. **Drop DB/role (use cautiously)**  
   ```sql
   DROP DATABASE medusa_production;
   DROP ROLE cs;
   ```

# Verification
- `psql` can connect using the app URL (swap `host.docker.internal` to `localhost` when running on the host).
- `\l` shows `medusa_production` and `strapi_production` with owner `cs`.
- No authentication errors in application logs after restarting services.

# Rollback / Cleanup
- If a change breaks auth, reapply the known-good password with `ALTER ROLE ... PASSWORD`.
- To revert unintended DB drops, restore from the latest dump using `pg_restore`.

# References
- `docs/basic/docker-container-vs-host-localhost.md`
- `docs/done/docker-env-best-practices.md`
