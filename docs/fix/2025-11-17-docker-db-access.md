---
last_updated: 2025-11-17
status: ✅ Active
related_docs:
  - docs/done/docker-env-best-practices.md
  - docs/basic/docker-container-vs-host-localhost.md
  - docs/basic/docs-maintenance-best-practices.md
---

# Docker Prod/Dev Stack Failing To Reach Postgres – 2025-11-17 Retro

## Summary
- Symptoms: after splitting prod/dev compose stacks (`make prod-up` / `make dev-up`), every Medusa/Strapi container spammed `KnexTimeoutError: Timeout acquiring a connection` during boot. Strapi never reached “Welcome back!” and Medusa crashed after repeated DB retries.
- Impact: both prod (`https://api.aidenlux.com`, `https://content.aidenlux.com`) and dev (`https://dev-api.aidenlux.com`, `https://dev-content.aidenlux.com`) backends were unusable until the host database accepted connections from the new Docker CIDR ranges.

## Root Cause
- The new isolated networks introduced by `deploy/gce/prod/docker-compose.yml` and `deploy/gce/dev/docker-compose.yml` use dedicated subnets (`172.30.0.0/16`, `172.31.0.0/16`).
- Host-level ACLs were never updated:
  - `pg_hba.conf` still only allowed `127.0.0.1`, `::1`, and legacy Docker ranges (`172.17/172.18`). Connections from `10.168.0.2` (container egress IP) hit “no pg_hba.conf entry”.
  - UFW only permitted ports 5432/6379 from the old ranges, so even an explicitly set `extra_hosts: host.docker.internal:172.30.0.1` couldn’t pass traffic through the firewall.
- Because SSH (port 22) was already open globally, connectivity checks against that port succeeded, masking the database firewall problem until runtime.

## Fix
1. **pg_hba access** – appended:
   ```
   host all all 172.30.0.0/16 scram-sha-256
   host all all 172.31.0.0/16 scram-sha-256
   ```
   Reloaded PostgreSQL via `sudo systemctl reload postgresql`.
2. **Host firewall (UFW)** – allowed both Postgres and Redis from the new subnets:
   ```
   sudo ufw allow from 172.30.0.0/16 to any port 5432
   sudo ufw allow from 172.31.0.0/16 to any port 5432
   sudo ufw allow from 172.30.0.0/16 to any port 6379
   sudo ufw allow from 172.31.0.0/16 to any port 6379
   ```
3. Recreated networks/containers (`make prod-down && make dev-down` followed by `make prod-up && make dev-up`) so the compose stacks picked up the pinned subnets and the updated access rules.

## Verification
- `docker compose … logs` now show Strapi’s “Strapi started successfully” banner for both prod/dev, and Medusa reports “Server is ready on port 9000”.
- Manual psql from the host (`psql -h 172.30.0.1 …`) succeeds, confirming pg_hba matches.
- Storefront smoke tests against `https://api.aidenlux.com/health` and `https://dev-api.aidenlux.com/health` return 200, confirming the DB layer is reachable.

## Follow-ups
1. Document the firewall requirement alongside the Docker isolation plan so future installs add the matching UFW/pg_hba entries before launching containers.
2. Consider moving PostgreSQL to a managed service or running it in Docker to avoid host-network ACL mismatches.
3. Add a basic CI/health check script that runs `pg_isready` from an ephemeral container on the target network whenever compose files change subnets.
