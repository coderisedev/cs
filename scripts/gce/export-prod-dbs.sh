#!/usr/bin/env bash
set -euo pipefail

# Export Medusa and Strapi production Postgres databases using credentials in deploy/gce/.env.
# Usage: ENV_FILE=deploy/gce/.env BACKUP_DIR=~/db-backups ./scripts/gce/export-prod-dbs.sh

ENV_FILE="${ENV_FILE:-deploy/gce/.env}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/db-backups}"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump is required but not found on PATH" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found at $ENV_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

set -a
source "$ENV_FILE"
set +a

# Replace container host mapping with local host when running on the prod server.
MEDUSA_URL="${MEDUSA_DATABASE_URL/host.docker.internal/localhost}"
STRAPI_URL="${STRAPI_DATABASE_URL/host.docker.internal/localhost}"

echo "Dumping Medusa to $BACKUP_DIR/medusa-prod-$TIMESTAMP.dump"
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_DIR/medusa-prod-$TIMESTAMP.dump" \
  "$MEDUSA_URL"

echo "Dumping Strapi to $BACKUP_DIR/strapi-prod-$TIMESTAMP.dump"
pg_dump \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$BACKUP_DIR/strapi-prod-$TIMESTAMP.dump" \
  "$STRAPI_URL"

echo "Done. Dumps are in $BACKUP_DIR"
