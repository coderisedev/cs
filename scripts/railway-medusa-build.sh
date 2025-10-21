#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

if ! command -v pnpm >/dev/null 2>&1; then
  npm install -g pnpm
fi

pnpm install --no-frozen-lockfile
pnpm --filter medusa build

