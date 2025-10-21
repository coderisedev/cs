#!/bin/bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR/apps/medusa"

pnpm install --no-frozen-lockfile --filter medusa
pnpm exec medusa migrations run

exec pnpm exec medusa start
