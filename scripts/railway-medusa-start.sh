#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEDUSA_DIR="$ROOT_DIR/apps/medusa"

echo "[railway-medusa-start] Switching to $MEDUSA_DIR"
cd "$MEDUSA_DIR"

missing_env=()
for var in DATABASE_URL REDIS_URL JWT_SECRET COOKIE_SECRET; do
  if [[ -z "${!var:-}" ]]; then
    missing_env+=("$var")
  fi
done

if (( ${#missing_env[@]} )); then
  echo "[railway-medusa-start] WARN: missing env vars ${missing_env[*]}. Medusa config will fall back to defaults."
fi

echo "[railway-medusa-start] Installing Medusa workspace dependencies"
pnpm install --no-frozen-lockfile --filter medusa

echo "[railway-medusa-start] Skipping auto db:migrate/db:sync-links (dev DB managed manually)"
echo "[railway-medusa-start] If you explicitly need migrations, run:"
echo "  pnpm exec medusa db:migrate && pnpm exec medusa db:sync-links"

echo "[railway-medusa-start] Starting Medusa server"
exec pnpm exec medusa start
