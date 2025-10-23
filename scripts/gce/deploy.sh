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

{
  echo "== Deployment triggered at $TIMESTAMP =="
  echo "Working directory: $TARGET_DIR"
  echo "Using TAG=$TAG"
  echo "Running $compose_cmd pull"
  $compose_cmd pull
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
