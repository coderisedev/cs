#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/deploy/gce/.env.prod"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[sync-medusa] Missing deploy/gce/.env.prod file" >&2
  exit 1
fi

echo "[sync-medusa] Loading environment from $ENV_FILE"
# Load env manually to preserve spaces in values
while IFS= read -r line; do
  [[ -z "$line" || $line =~ ^[[:space:]]*# ]] && continue
  key="${line%%=*}"
  value="${line#*=}"
  # Trim whitespace around the value
  value="$(echo "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  export "$key"="$value"
done < "$ENV_FILE"

MEDUSA_DB_URL="${MEDUSA_DATABASE_URL:-${DATABASE_URL:-}}"
if [[ -z "$MEDUSA_DB_URL" ]]; then
  echo "[sync-medusa] MEDUSA_DATABASE_URL is not set" >&2
  exit 1
fi

export NODE_ENV=development
if [[ "$MEDUSA_DB_URL" == *host.docker.internal* ]]; then
  MEDUSA_DB_URL_LOCAL="${MEDUSA_DB_URL//host.docker.internal/127.0.0.1}"
else
  MEDUSA_DB_URL_LOCAL="$MEDUSA_DB_URL"
fi

export DATABASE_URL="$MEDUSA_DB_URL_LOCAL"
export TS_NODE_PROJECT="$ROOT_DIR/apps/medusa/tsconfig.json"

echo "[sync-medusa] Running Medusa migrations against $DATABASE_URL"
pnpm -C "$ROOT_DIR/apps/medusa" exec medusa db:migrate

echo "[sync-medusa] Syncing Medusa links"
pnpm -C "$ROOT_DIR/apps/medusa" exec medusa db:sync-links

echo "[sync-medusa] Rebuilding cs-medusa:prod Docker image"
docker build -t cs-medusa:prod -f "$ROOT_DIR/apps/medusa/Dockerfile" "$ROOT_DIR"

echo "[sync-medusa] Restarting medusa service"
docker compose \
  -p cs-prod \
  --env-file "$ROOT_DIR/deploy/gce/.env.prod" \
  -f "$ROOT_DIR/deploy/gce/prod/docker-compose.yml" \
  up -d --force-recreate medusa

echo "[sync-medusa] Completed"
