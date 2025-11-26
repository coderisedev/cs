#!/usr/bin/env bash
set -euo pipefail

# Upgrade host Postgres from 16 to 17 on Ubuntu 24 (noble) using PGDG packages.
# WARNING: This will drop the existing 16/main cluster. Ensure you have backups before running.

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required to run this script." >&2
  exit 1
fi

echo "This will stop Postgres, drop cluster 16/main, purge 16 packages, and install Postgres 17."
echo "Make sure dumps/backups are safe and accessible (e.g., /home/coderisedev/db-backups/*.dump)."
read -r -p "Proceed? (yes/NO): " CONFIRM
if [[ "${CONFIRM,,}" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

echo "[1/7] Stopping Postgres service if running..."
sudo systemctl stop postgresql || true

echo "[2/7] Dropping cluster 16/main if it exists..."
if pg_lsclusters 2>/dev/null | grep -q "^16\s\+main"; then
  sudo pg_dropcluster --stop 16 main
else
  echo "Cluster 16/main not found; skipping drop."
fi

echo "[3/7] Purging Postgres 16 server/client packages (if present)..."
sudo apt-get purge -y postgresql-16 postgresql-client-16 2>/dev/null || true
sudo apt-get autoremove -y

echo "[4/7] Adding PGDG apt repo for Postgres 17 (noble)..."
sudo apt-get update
sudo apt-get install -y curl ca-certificates gnupg
sudo install -d /usr/share/keyrings
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /usr/share/keyrings/postgresql.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt noble-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list >/dev/null

echo "[5/7] Installing Postgres 17 server and client..."
sudo apt-get update
sudo apt-get install -y postgresql-17 postgresql-client-17

echo "[6/7] Checking service status..."
sudo systemctl status postgresql --no-pager || true
/usr/lib/postgresql/17/bin/pg_ctl --version || true

echo "[7/7] Next steps:"
echo "  - Ensure role/db owners exist (e.g., CREATE ROLE cs WITH LOGIN PASSWORD '...')."
echo "  - Restore dumps with:"
echo "      sudo -iu postgres /usr/lib/postgresql/17/bin/pg_restore --clean --if-exists --no-owner --no-privileges --dbname=medusa_production /home/coderisedev/db-backups/medusa-prod-*.dump"
echo "      sudo -iu postgres /usr/lib/postgresql/17/bin/pg_restore --clean --if-exists --no-owner --no-privileges --dbname=strapi_production /home/coderisedev/db-backups/strapi-prod-*.dump"
echo "  - Verify with: psql --version and psql -d medusa_production -c 'select count(*) from product limit 1;'"
echo "Done."
