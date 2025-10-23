#!/usr/bin/env bash
set -euo pipefail

TIMESTAMP="$(date --utc +%Y-%m-%dT%H:%M:%SZ)"
LOG_DIR="${LOG_DIR:-/srv/cs/logs}"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/health-$TIMESTAMP.log"

exec >"$LOG_FILE" 2>&1

echo "== Cockpit Simulator backend health report =="
echo "timestamp=$TIMESTAMP"

echo "-- medusa /store/health --"
curl --silent --show-error --fail http://127.0.0.1:9000/store/health

echo "-- strapi /health --"
curl --silent --show-error --fail http://127.0.0.1:1337/health

echo "Report saved to $LOG_FILE"
