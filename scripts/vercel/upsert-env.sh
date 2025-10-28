#!/usr/bin/env bash
set -euo pipefail

# Upsert a single Vercel project environment variable via API.
# Usage: VERCEL_TOKEN=... ./upsert-env.sh <project_id> <key> <value> <targets_csv> [team_id]
# Example: ./upsert-env.sh proj_abc NEXT_PUBLIC_MEDUSA_URL https://api.aidenlux.com production,preview team_123

if [[ $# -lt 4 ]]; then
  echo "Usage: VERCEL_TOKEN=... $0 <project_id> <key> <value> <targets_csv> [team_id]" >&2
  exit 1
fi

PROJECT_ID="$1"
KEY="$2"
VALUE="$3"
TARGETS_CSV="$4"
TEAM_ID="${5-}"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "VERCEL_TOKEN is required" >&2
  exit 1
fi

BASE_URL="https://api.vercel.com"
TEAM_QS=""
if [[ -n "$TEAM_ID" ]]; then
  TEAM_QS="?teamId=$TEAM_ID"
fi

# List existing envs and find by key
LIST_URL="$BASE_URL/v10/projects/$PROJECT_ID/env${TEAM_QS}"
EXISTING=$(curl -fsSL -H "Authorization: Bearer $VERCEL_TOKEN" "$LIST_URL" | jq -r --arg KEY "$KEY" '.envs[]? | select(.key==$KEY) | .id' || true)

if [[ -n "$EXISTING" ]]; then
  # Delete existing to avoid conflicts
  DEL_URL="$BASE_URL/v10/projects/$PROJECT_ID/env/$EXISTING${TEAM_QS}"
  curl -fsSL -X DELETE -H "Authorization: Bearer $VERCEL_TOKEN" "$DEL_URL" >/dev/null || true
fi

# Create new
IFS=',' read -r -a TARGETS_ARR <<< "$TARGETS_CSV"
TARGETS_JSON=$(printf '%s\n' "${TARGETS_ARR[@]}" | jq -R . | jq -s .)

CREATE_URL="$BASE_URL/v10/projects/$PROJECT_ID/env${TEAM_QS}"
PAYLOAD=$(jq -n \
  --arg key "$KEY" \
  --arg value "$VALUE" \
  --argjson target "$TARGETS_JSON" \
  '{ key: $key, value: $value, target: $target, type: "plain" }')

curl -fsSL -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "$CREATE_URL" >/dev/null

echo "Upserted $KEY -> [$TARGETS_CSV] on project $PROJECT_ID"

