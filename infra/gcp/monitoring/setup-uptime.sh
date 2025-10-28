#!/usr/bin/env bash
set -euo pipefail

# Configure GCP Monitoring uptime checks for API/CMS and optionally apply alert policy
# Usage:
#   GCP_PROJECT=<project-id> \
#   API_HOST=api.aidenlux.com CMS_HOST=content.aidenlux.com \
#   bash infra/gcp/monitoring/setup-uptime.sh [--apply-alert-policy]

PROJECT="${GCP_PROJECT:-}"
API_HOST="${API_HOST:-api.aidenlux.com}"
CMS_HOST="${CMS_HOST:-content.aidenlux.com}"
APPLY_ALERT_POLICY=false

for arg in "$@"; do
  case "$arg" in
    --apply-alert-policy) APPLY_ALERT_POLICY=true ;;
  esac
done

if [[ -z "$PROJECT" ]]; then
  echo "ERROR: GCP_PROJECT is required" >&2
  exit 1
fi

echo "==> Setting project: $PROJECT"
gcloud config set project "$PROJECT" >/dev/null

echo "==> Creating uptime check for API host: $API_HOST"
gcloud monitoring uptime-checks create http api-health \
  --path=/health --port=443 --period=60s --timeout=10s \
  --host="$API_HOST" --http-check-use-ssl --no-prompt || true

echo "==> Creating uptime check for CMS host: $CMS_HOST"
gcloud monitoring uptime-checks create http cms-health \
  --path=/_health --port=443 --period=60s --timeout=10s \
  --host="$CMS_HOST" --http-check-use-ssl --no-prompt || true

if [[ "$APPLY_ALERT_POLICY" == "true" ]]; then
  POLICY_FILE="infra/gcp/monitoring/alert-policy-uptime.json"
  echo "==> Applying alert policy from $POLICY_FILE"
  gcloud monitoring policies create --policy-from-file="$POLICY_FILE" || true
fi

echo "✅ Uptime checks configured (and alert policy applied: $APPLY_ALERT_POLICY)"

