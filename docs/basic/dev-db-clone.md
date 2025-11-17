---
last_updated: 2025-11-17
status: ✅ Active
related_docs:
  - docs/fix/dev-env-bringup-retro.md
  - docs/runbooks/medusa-db-analysis.md
---

# Dev Database Clone Guide

**Goal:** Create Medusa/Strapi development databases on the host PostgreSQL instance and seed them with the latest production data.

---

## 1. Create Dev Databases

Assuming PostgreSQL runs locally and user `cs` (password `n6DYeq3H9uOJudpligATbfYYmjJtUaoV`) has access.

```bash
# Create medusa_dev
PGPASSWORD='n6DYeq3H9uOJudpligATbfYYmjJtUaoV' \
psql -h localhost -p 5432 -U cs -d postgres \
  -c "CREATE DATABASE medusa_dev OWNER cs"

# Create strapi_dev
PGPASSWORD='n6DYeq3H9uOJudpligATbfYYmjJtUaoV' \
psql -h localhost -p 5432 -U cs -d postgres \
  -c "CREATE DATABASE strapi_dev OWNER cs"
```

If `cs` lacks privileges, run as `postgres`:

```bash
sudo -u postgres psql -c "CREATE DATABASE medusa_dev OWNER cs"
sudo -u postgres psql -c "CREATE DATABASE strapi_dev OWNER cs"
```

Verify:

```bash
psql -h localhost -p 5432 -U cs -d medusa_dev -c '\conninfo'
psql -h localhost -p 5432 -U cs -d strapi_dev -c '\conninfo'
```

---

## 2. Dump Production Databases

Export current prod data to custom-format backups (adjust paths if needed).

```bash
# Medusa production dump
PGPASSWORD='n6DYeq3H9uOJudpligATbfYYmjJtUaoV' \
pg_dump -h localhost -p 5432 -U cs -d medusa_production \
  --format=custom --no-owner --file=/tmp/medusa_prod.backup

# Strapi production dump
PGPASSWORD='n6DYeq3H9uOJudpligATbfYYmjJtUaoV' \
pg_dump -h localhost -p 5432 -U cs -d strapi_production \
  --format=custom --no-owner --file=/tmp/strapi_prod.backup
```

---

## 3. Restore into Dev Databases

```bash
# Restore Medusa into medusa_dev
PGPASSWORD='n6DYeq3H9uOJudpligATbfYYmjJtUaoV' \
pg_restore -h localhost -p 5432 -U cs -d medusa_dev \
  --clean --if-exists --no-owner /tmp/medusa_prod.backup

# Restore Strapi into strapi_dev
PGPASSWORD='n6DYeq3H9uOJudpligATbfYYmjJtUaoV' \
pg_restore -h localhost -p 5432 -U cs -d strapi_dev \
  --clean --if-exists --no-owner /tmp/strapi_prod.backup
```

`--clean --if-exists` drops objects before recreating them; `--no-owner` avoids ownership clashes.

Validate:

```bash
psql -h localhost -p 5432 -U cs -d medusa_dev -c '\dt'
psql -h localhost -p 5432 -U cs -d strapi_dev -c '\dt'
```

---

## 4. Wire Dev Env Files

Update `deploy/gce/.env.dev` or relevant env files:

```
MEDUSA_DATABASE_URL=postgres://cs:n6DYeq3H9uOJudpligATbfYYmjJtUaoV@localhost:5432/medusa_dev
STRAPI_DATABASE_URL=postgres://cs:n6DYeq3H9uOJudpligATbfYYmjJtUaoV@localhost:5432/strapi_dev
```

Point Medusa/Strapi dev services to these URLs before running compose.

---

## 5. Sanitize (Optional but Recommended)

After restoring prod data into dev databases, run any required sanitization scripts (e.g., anonymize user info, remove secrets) before giving broader access.

---

Following this procedure ensures local dev environments mirror production data while remaining isolated from the live system.
