#!/usr/bin/env bash
set -euo pipefail

# GCE first-time host initialization for CS backend
# - Opens host DB/Redis to docker0 (local bridge) only
# - Adjusts PostgreSQL listen_addresses + pg_hba
# - Adjusts Redis bind/protected-mode
# - Creates role/dbs for cs (optional)
#
# Usage:
#   sudo bash scripts/gce/first-init.sh [--db-password <password>] [--docker-net 172.17.0.0/16] [--docker-gw 172.17.0.1]
#
# Notes:
# - Idempotent where possible; re-running is safe.
# - Requires Ubuntu with systemd, PostgreSQL and Redis installed.

DB_PASSWORD=""
DOCKER_NET="172.17.0.0/16"
DOCKER_GW="172.17.0.1"

log() { echo "[first-init] $*"; }
err() { echo "[first-init][ERROR] $*" >&2; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db-password)
      DB_PASSWORD="${2:-}"
      shift 2;;
    --docker-net)
      DOCKER_NET="${2:-}"
      shift 2;;
    --docker-gw)
      DOCKER_GW="${2:-}"
      shift 2;;
    --help|-h)
      sed -n '1,40p' "$0" | sed 's/^# \{0,1\}//'; exit 0;;
    *) err "Unknown argument: $1"; exit 1;;
  esac
done

require_root() {
  if [[ $(id -u) -ne 0 ]]; then
    err "This script must be run as root (use sudo)."; exit 1
  fi
}

random_pw() { tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32; echo; }

ensure_packages() {
  if ! command -v ss >/dev/null 2>&1; then apt-get update && apt-get install -y iproute2 >/dev/null; fi
  if ! command -v psql >/dev/null 2>&1; then apt-get update && apt-get install -y postgresql-client >/dev/null || true; fi
}

configure_postgres() {
  local pg_main
  pg_main=$(ls -d /etc/postgresql/*/main 2>/dev/null | head -n1 || true)
  if [[ -z "$pg_main" ]]; then log "PostgreSQL main dir not found; skipping PG config"; return 0; fi
  local conf="$pg_main/postgresql.conf"; local hba="$pg_main/pg_hba.conf"

  if [[ -f "$conf" ]]; then
    log "Configuring PostgreSQL listen_addresses in: $conf"
    if grep -qE "^\s*listen_addresses\s*=\s*" "$conf"; then
      sed -i "s/^\s*listen_addresses\s*=.*/listen_addresses = '127.0.0.1,${DOCKER_GW}'/" "$conf"
    else
      echo "listen_addresses = '127.0.0.1,${DOCKER_GW}'" >> "$conf"
    fi
  fi

  if [[ -f "$hba" ]]; then
    log "Ensuring pg_hba allows ${DOCKER_NET}"
    grep -q "${DOCKER_NET} " "$hba" || echo "host all all ${DOCKER_NET} scram-sha-256" >> "$hba"
  fi

  systemctl restart postgresql || true
}

configure_redis() {
  local rc="/etc/redis/redis.conf"
  if [[ ! -f "$rc" ]]; then log "Redis config not found; skipping"; return 0; fi
  log "Configuring Redis bind + protected-mode in: $rc"
  if grep -qE '^\s*bind\s+' "$rc"; then
    sed -i "s/^\s*bind\s.*/bind 127.0.0.1 ${DOCKER_GW}/" "$rc"
  else
    echo "bind 127.0.0.1 ${DOCKER_GW}" >> "$rc"
  fi
  if grep -qE '^\s*protected-mode\s+' "$rc"; then
    sed -i "s/^\s*protected-mode\s.*/protected-mode yes/" "$rc"
  else
    echo "protected-mode yes" >> "$rc"
  fi
  systemctl restart redis-server || true
}

open_firewall() {
  log "Opening firewall from docker0 to 5432/6379"
  if command -v ufw >/dev/null 2>&1; then
    ufw allow from "$DOCKER_NET" to any port 5432 proto tcp || true
    ufw allow from "$DOCKER_NET" to any port 6379 proto tcp || true
    ufw reload || true
  fi
  # iptables immediate allow (idempotent)
  if command -v iptables >/dev/null 2>&1; then
    iptables -C INPUT -i docker0 -p tcp -m multiport --dports 5432,6379 -j ACCEPT 2>/dev/null || \
      iptables -I INPUT -i docker0 -p tcp -m multiport --dports 5432,6379 -j ACCEPT
  fi
}

ensure_db_role_and_dbs() {
  if ! command -v psql >/dev/null 2>&1; then log "psql not available; skip creating DB role"; return 0; fi
  if [[ -z "$DB_PASSWORD" ]]; then DB_PASSWORD=$(random_pw); fi
  log "Ensuring PostgreSQL role/dbs exist (user=cs)"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='cs'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER cs WITH PASSWORD '${DB_PASSWORD}';"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='medusa_production'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE medusa_production OWNER cs;"
  sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='strapi_production'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE strapi_production OWNER cs;"

  echo "DB_PASSWORD=${DB_PASSWORD}" > /root/cs-db-password.txt
  chmod 600 /root/cs-db-password.txt
  log "Created/verified role 'cs' and databases. Saved password to /root/cs-db-password.txt"
}

summary() {
  echo "--- SUMMARY ---"
  ss -ltnp | egrep ':(5432|6379)\\b' || true
  echo "pg_isready (127.0.0.1):"; pg_isready -h 127.0.0.1 -p 5432 || true
  echo "pg_isready (${DOCKER_GW}):"; pg_isready -h "${DOCKER_GW}" -p 5432 || true
  echo "Firewall note: docker0 -> 5432/6379 opened (ufw/iptables where available)"
  if [[ -f /root/cs-db-password.txt ]]; then echo "DB password file: /root/cs-db-password.txt"; fi
}

main() {
  require_root
  ensure_packages
  configure_postgres
  configure_redis
  open_firewall
  ensure_db_role_and_dbs
  summary
}

main "$@"

