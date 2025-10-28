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

# Node.js 22 tightened URLSearchParams bindings; pnpm's proxy agent trips on it.
export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--disable-proto=throw"
export CI="${CI:-true}"

echo "📦 Installing workspace dependencies..."
pnpm install --no-frozen-lockfile
