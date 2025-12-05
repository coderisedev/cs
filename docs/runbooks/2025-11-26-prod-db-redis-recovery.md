---
last_updated: 2025-11-26
status: ✅ Active
related_docs:
  - docs/fix/2025-11-17-docker-db-access.md
  - docs/done/docker-env-best-practices.md
  - docs/basic/docker-container-vs-host-localhost.md
---

# Prod DB/Redis Connectivity & Migration Recovery – 2025-11-26

## Summary
- Prod Medusa/Strapi kept rebooting after `make prod-up` because the host Postgres and Redis stacks
  only listened on loopback and rejected bridge-network traffic.
- Postgres also lacked grants for the `cs` role, so Medusa migrations could not create schema objects.
- Redis protected mode blocked bridge clients even after binding to the gateway IP.
- Resolved by widening Postgres listen/pg_hba, rerunning Medusa migrations, and disabling Redis protected
  mode for the Docker gateway while keeping the service bound to host/bridge addresses.

## Impact
- Prod Medusa/Strapi were unavailable (containers restart loop).
- No data loss; Medusa DB was empty before migrations; Strapi tables remained intact.

## Root Cause
1) **Postgres network scope**: `listen_addresses` was `localhost` and `pg_hba.conf` lacked the Docker
   CIDRs (`172.30.0.0/16`, `172.31.0.0/16`), so containers hit `ECONNREFUSED`/`no pg_hba.conf entry`.
2) **Redis network/protection**: Redis bound only to `127.0.0.1`, then refused `172.30.0.1` with
   protected mode, causing Medusa startup failures.
3) **Schema**: Medusa migrations had never been applied to `medusa_production`, so even after DB
   connectivity it lacked required tables.

## What We Changed
### Postgres
- `/etc/postgresql/18/main/postgresql.conf`: set `listen_addresses = '*'`.
- `/etc/postgresql/18/main/pg_hba.conf`: appended Docker bridge CIDRs:
  - `host all all 172.30.0.0/16 scram-sha-256`
  - `host all all 172.31.0.0/16 scram-sha-256`
- Reloaded then restarted Postgres: `sudo systemctl reload postgresql && sudo systemctl restart postgresql`.
- Granted role privileges for prod DBs:
  - `GRANT ALL ON ALL TABLES/SEQUENCES IN SCHEMA public TO cs;`
  - `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES/SEQUENCES TO cs;`

### Redis
- `/etc/redis/redis.conf`:
  - `bind 127.0.0.1 172.30.0.1 ::1`
  - `protected-mode no`
- Restarted Redis: `sudo systemctl restart redis-server`.

### Medusa migrations
- Ran inside prod image:  
  `docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml run --rm medusa bash -lc "cd apps/medusa && pnpm medusa db:migrate"`
- Recreated stack: `make prod-down && make prod-up`.

## Verification
- `sudo ss -ltnp | grep 5432` shows Postgres on `0.0.0.0:5432`.
- `sudo ss -ltnp | grep 6379` shows Redis on `127.0.0.1` and `172.30.0.1`.
- `curl http://localhost:9000/health` returns `OK`.
- `docker logs cs-prod-strapi-1` reports “Strapi started successfully”.
- `docker ps` shows `cs-prod-medusa-1` and `cs-prod-strapi-1` running on ports 9000/1337.

## Follow-ups / Hardening
1) Set a Redis password and update `MEDUSA_REDIS_URL` in `deploy/gce/.env.prod` to
   `redis://:<password>@host.docker.internal:6379/0`; re-enable `protected-mode yes` afterward.
2) If dev stack will use Redis from the host, add `172.31.0.1` to the Redis bind list.
3) Add a smoke check that runs `pg_isready -h 172.30.0.1 -p 5432` and `redis-cli -h 172.30.0.1 ping`
   before bringing containers up.
4) Seed or restore Medusa data as needed (DB is currently empty post-migration).
