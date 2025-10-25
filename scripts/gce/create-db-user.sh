#!/usr/bin/env bash
set -euo pipefail

# PostgreSQL bootstrap helper for Medusa + Strapi deployments
# Creates (or updates) the deployment role and the two application databases.
# Usage:
#   sudo ./create-db-user.sh <db-user> <db-password> [medusa_db] [strapi_db]
# Example:
#   sudo ./create-db-user.sh cs 'SuperSecret123!' medusa_production strapi_production

usage() {
  cat <<'USAGE'
Usage: create-db-user.sh <db-user> <db-password> [medusa_db] [strapi_db]

Provision the PostgreSQL role and databases used by the GCE backend stack.

Positional arguments:
  <db-user>      Role (login) name to create or update (e.g. cs)
  <db-password>  Password to assign to the role
  [medusa_db]    Database name for Medusa (default: medusa_production)
  [strapi_db]    Database name for Strapi (default: strapi_production)

Notes:
  - Run as a user with permission to invoke `sudo -u postgres`.
  - The script is idempotent; rerunning rotates the password and keeps databases.
  - Passwords passed via CLI will appear temporarily in process listings; prefer
    a short-lived shell history or wrap invocation in a secure script if needed.
USAGE
}

log() {
  printf '[INFO] %s\n' "$1"
}

warn() {
  printf '[WARN] %s\n' "$1"
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ $# -lt 2 ]]; then
  usage
  exit 1
fi

DB_USER="$1"
DB_PASSWORD="$2"
MEDUSA_DB="${3:-medusa_production}"
STRAPI_DB="${4:-strapi_production}"

if ! command -v sudo >/dev/null 2>&1; then
  warn "sudo not found; attempting to run psql directly"
  PSQL_CMD="psql"
else
  PSQL_CMD="sudo -u postgres psql"
fi

if ! $PSQL_CMD --version >/dev/null 2>&1; then
  printf '[ERROR] Unable to execute psql as postgres user. Ensure PostgreSQL is installed and you have sudo access.\n'
  exit 1
fi

log "Ensuring PostgreSQL role '${DB_USER}' exists"
$PSQL_CMD --set=ON_ERROR_STOP=1 \
  --set=db_user="$DB_USER" \
  --set=db_password="$DB_PASSWORD" <<'SQL'
SELECT format(
  CASE WHEN NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'db_user')
       THEN 'CREATE ROLE %I WITH LOGIN PASSWORD %L'
       ELSE 'ALTER ROLE %I WITH LOGIN PASSWORD %L'
  END,
  :'db_user', :'db_password'
) \gexec
SQL

create_db() {
  local db_name="$1"
  log "Ensuring database '${db_name}' exists and is owned by '${DB_USER}'"
  $PSQL_CMD --set=ON_ERROR_STOP=1 \
    --set=db_name="$db_name" \
    --set=db_user="$DB_USER" <<'SQL'
SELECT format(
  CASE WHEN NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name')
       THEN 'CREATE DATABASE %I OWNER %I'
       ELSE 'ALTER DATABASE %I OWNER TO %I'
  END,
  :'db_name', :'db_user'
) \gexec
SQL

  $PSQL_CMD --set=ON_ERROR_STOP=1 \
    --dbname="$db_name" \
    --set=db_user="$DB_USER" <<'SQL'
REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC;
GRANT ALL PRIVILEGES ON SCHEMA public TO :"db_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"db_user" IN SCHEMA public
  GRANT ALL ON TABLES TO :"db_user";
ALTER DEFAULT PRIVILEGES FOR ROLE :"db_user" IN SCHEMA public
  GRANT ALL ON SEQUENCES TO :"db_user";
SQL
}

create_db "$MEDUSA_DB"
create_db "$STRAPI_DB"

log "PostgreSQL role and databases ready:"
printf '  Role: %s\n' "$DB_USER"
printf '  Medusa DB: %s\n' "$MEDUSA_DB"
printf '  Strapi DB: %s\n' "$STRAPI_DB"
printf '\nRemember to update /srv/cs/env/medusa.env and /srv/cs/env/strapi.env with the new credentials.\n'
