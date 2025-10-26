#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") --tag <image-tag> [--cwd /srv/cs]

Updates TAG in the Compose environment, pulls latest images, restarts services,
then runs the optional health collection helper.
USAGE
}

TARGET_DIR="/srv/cs"
TAG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)
      TAG="$2"
      shift 2
      ;;
    --cwd)
      TARGET_DIR="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$TAG" ]]; then
  echo "Missing required --tag value" >&2
  usage
  exit 1
fi

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Target directory $TARGET_DIR not found" >&2
  exit 1
fi

cd "$TARGET_DIR"

if [[ ! -f ".env" ]]; then
  echo "No .env found in $TARGET_DIR. Copy infra/gcp/.env.example first." >&2
  exit 1
fi

if grep -q '^TAG=' .env; then
  sed -i "s/^TAG=.*/TAG=$TAG/" .env
else
  echo "TAG=$TAG" >> .env
fi

 TIMESTAMP=$(date --utc +%Y-%m-%dT%H:%M:%SZ)
 LOG_DIR="${LOG_DIR:-$TARGET_DIR/logs}"
 mkdir -p "$LOG_DIR"
 LOG_FILE="$LOG_DIR/deploy-$TIMESTAMP.log"

compose_cmd="docker compose"
if ! docker compose version >/dev/null 2>&1; then
  compose_cmd="docker-compose"
fi

# Always bring down previous stack to free ports managed by compose
echo "Running $compose_cmd down to free any prior port bindings"
$compose_cmd down || true

# Preflight: check host ports are free (helps detect stray processes)
check_port_free() {
  local port="$1"
  local name="$2"
  if ss -ltn 2>/dev/null | awk -v p=":$port" '$4 ~ p {exit 0} END{exit 1}'; then
    echo "ERROR: Port $port appears in use on host. This blocks $name from starting." >&2
    echo "Details:" >&2
    ss -ltnp | awk -v p=":$port" '$4 ~ p {print}' >&2 || true
    echo "If a non-docker process is listening, stop it (e.g., sudo fuser -k ${port}/tcp) and re-run deploy." >&2
    exit 90
  fi
}

check_port_free 9000 "medusa"
check_port_free 1337 "strapi"

{
  echo "== Deployment triggered at $TIMESTAMP =="
  echo "Working directory: $TARGET_DIR"
  echo "Using TAG=$TAG"
  echo "Running $compose_cmd pull"
  $compose_cmd pull
  echo "Running pre-migration for Medusa (safe to skip if not applicable)"
  $compose_cmd run --rm medusa bash -lc 'cd /srv/app/apps/medusa && pnpm medusa db:migrate' || echo "[warn] medusa migration step skipped or failed; continuing"
  echo "Running $compose_cmd up -d --remove-orphans"
  $compose_cmd up -d --remove-orphans

  if [[ -x bin/collect-health.sh ]]; then
    echo "Collecting health probes via bin/collect-health.sh"
    bash bin/collect-health.sh
  else
    echo "bin/collect-health.sh not present or executable; skipping health probes"
  fi
} | tee "$LOG_FILE"

echo "Deployment log saved to $LOG_FILE"
