#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
# Absolute path to the project directory on the server
PROJECT_DIR="/home/coderisedev/cs"
ECOSYSTEM_FILE="ecosystem.config.cjs"

# --- 1. Enter Project Directory ---
echo "🚀 Starting deployment..."
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
    echo "📂 Working directory: $(pwd)"
else
    echo "❌ Directory not found: $PROJECT_DIR"
    exit 1
fi

# --- 2. Pull Latest Code ---
echo "📥 Pulling latest code..."
git fetch origin main
# Hard reset to ensure local state matches remote exactly (discarding any local changes on server)
git reset --hard origin/main

# --- 3. Install Dependencies ---
echo "📦 Installing dependencies..."
# Monorepo install - this handles dependencies for all workspaces
pnpm install --frozen-lockfile

# --- 4. Build Medusa ---
echo "🏗️ Building Medusa..."
cd apps/medusa
pnpm build
# Medusa admin build steps (if needed separately, though usually included in build)
# Ensuring public/admin exists and is populated is handled by the build script or medusa-config usually
cd ../..

# --- 5. Build Strapi ---
echo "🏗️ Building Strapi..."
cd apps/strapi
pnpm build
cd ../..

# --- 6. Reload PM2 ---
echo "🔄 Reloading PM2 processes..."
# Reload achieves 0-downtime if instances > 1, or minimal downtime otherwise.
# --update-env ensures any new environment variables in ecosystem.config.cjs are picked up.
if pm2 list | grep -q "medusa-store"; then
    pm2 reload "$ECOSYSTEM_FILE" --update-env
else
    echo "⚠️ PM2 processes not found running. Starting them..."
    pm2 start "$ECOSYSTEM_FILE"
fi

echo "✅ Deployment finished successfully!"
