#!/usr/bin/env bash

set -eo pipefail

echo "📦 Starting Vercel install for storefront"
echo "📂 Working directory: $(pwd)"
echo "🔢 Node version: $(node -v)"

if command -v pnpm >/dev/null 2>&1; then
  echo "🔢 pnpm version (pre-corepack): $(pnpm -v)"
else
  echo "ℹ️ pnpm not available before corepack enable"
fi

corepack enable pnpm
echo "🔢 pnpm version: $(pnpm -v)"

if [ -n "${NODE_OPTIONS:-}" ]; then
  echo "ℹ️ Clearing NODE_OPTIONS to avoid Next.js runtime conflicts"
  unset NODE_OPTIONS
fi

# Ensure CI-friendly install behavior.
export CI="${CI:-true}"

echo "📦 Installing workspace dependencies..."
pnpm install --no-frozen-lockfile
