#!/bin/bash

# Clear Strapi cache and rebuild
echo "🧹 Clearing Strapi cache..."

cd "$(dirname "$0")/.."

# Remove build and cache directories
rm -rf .strapi/client
rm -rf .cache
rm -rf dist
rm -rf build

echo "✅ Cache cleared!"
echo "📦 Rebuilding Strapi..."

# Rebuild
pnpm build

echo "✨ Done! You can now start Strapi with: pnpm develop"
