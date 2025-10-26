# Docker Recovery Report — 2025-10-26

## Context
Production Compose stack under `/srv/cs` (services `medusa` + `strapi`) was stuck in a restart loop. Health checks constantly failed, `docker compose logs` showed `KnexTimeoutError` for both apps, and `bin/collect-health.sh` could not reach `/store/health`.

## Findings
- **Postgres credentials mismatch**: `env/medusa.env` and `env/strapi.env` still used the placeholder `change-me-password`, but the `cs` role on the host had a different (unknown) password. Every application query failed during boot.
- **Database connectivity from containers**: Postgres/Redis only listened on loopback + 172.17.0.1, while the `cs_default` bridge lives on `172.18.0.0/16`. UFW also lacked rules for that range.
- **Redis protected mode**: Redis rejected remote connections (`DENIED ... protected mode`).
- **Medusa admin bundle**: Image did not ship a prebuilt admin UI, so `medusa start` crashed after migrations with `Could not find index.html in the admin build directory`.
- **Health checks**: Medusa responds on `/app/health` (requires publishable key for `/store/health`) and Strapi exposes `_health`. Compose still probed the old endpoints, so containers never reached `healthy` state even after connectivity fixes.

## Remediation Steps
1. **Rotate DB creds**
   - Generated `n6DYeq3H9uOJudpligATbfYYmjJtUaoV` and ran `ALTER ROLE cs WITH PASSWORD ...` via `sudo -u postgres psql`.
   - Updated `DATABASE_URL` in `/srv/cs/env/medusa.env` and `/srv/cs/env/strapi.env` (line 5 and line 11 respectively).
2. **Refresh secrets in compose env**
   - Ensured `/srv/cs/.env` still points at `ghcr.io/coderisedev/...` images with `TAG=4106661fac53` for this rollout.
3. **Allow container network access**
   - `/etc/postgresql/17/main/postgresql.conf`: set `listen_addresses='*'`.
   - `/etc/postgresql/17/main/pg_hba.conf`: appended `host all all 172.18.0.0/16 scram-sha-256`.
   - `sudo ufw allow from 172.18.0.0/16 to any port 5432 proto tcp` and same for `6379`.
4. **Fix Redis protected mode**
   - `/etc/redis/redis.conf`: switched to `bind 0.0.0.0` and `protected-mode no`, then `sudo systemctl restart redis-server`.
5. **Run Medusa migrations**
   - `sudo docker compose run --rm medusa bash -lc 'cd /srv/app/apps/medusa && pnpm medusa db:migrate'` to create schema + migration scripts.
6. **Provide admin build artifacts**
   - `pnpm --filter medusa build` in the repo, copied `.medusa/server/public/admin` into `/srv/cs/cache/.medusa`.
   - Updated `docker-compose.yml` to mount `/srv/cs/cache/.medusa:/srv/app/apps/medusa/.medusa` and `/srv/cs/cache/public/admin:/srv/app/apps/medusa/public/admin`.
7. **Adjust health checks**
   - Medusa: `test: ["CMD", "curl", "--fail", "http://127.0.0.1:9000/app/health"]`.
   - Strapi: `test: ["CMD", "curl", "--fail", "http://127.0.0.1:1337/_health"]`.
8. **Verify connectivity**
   - Confirmed `curl http://127.0.0.1:9000/app/health -> 200` and `curl http://127.0.0.1:1337/_health -> 204`.
   - `sudo docker compose ps` now shows both services `Up ... (healthy)`.

## Follow-up Recommendations
- Store the new `cs` password in your secrets manager and rotate GH Actions secrets accordingly.
- Bake the admin build into the Medusa image to avoid managing `/srv/cs/cache` manually.
- Consider automating DB migrations + health probes inside the deploy script (`bin/deploy.sh`) so future rollouts repeat these checks.
- Document the required firewall + config changes (Postgres/Redis) in `docs/gcp-ubuntu-deployment-brief.md` for new hosts.
