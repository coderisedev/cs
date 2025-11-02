# Development Service Management Guide

**Project**: Composable Commerce Monorepo  
**Last Updated**: 2025-11-01  
**Environment**: Local Development

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Infrastructure Services (Docker)](#infrastructure-services-docker)
3. [Application Services (Host)](#application-services-host)
4. [Complete Startup Sequence](#complete-startup-sequence)
5. [Graceful Shutdown](#graceful-shutdown)
6. [Service Health Checks](#service-health-checks)
7. [Troubleshooting](#troubleshooting)
8. [Daily Development Workflows](#daily-development-workflows)

---

## Quick Start

### TL;DR - Start Everything

```bash
# 1. Start infrastructure (Docker)
docker compose -f docker-compose.local.yml up -d

# 2. Start backend (terminal 1)
pnpm --filter medusa dev

# 3. Start storefront (terminal 2)
pnpm --filter medusa-next dev

# 4. (Optional) Start CMS (terminal 3)
pnpm --filter strapi develop
```

### TL;DR - Stop Everything

```bash
# 1. Stop application services (Ctrl+C in each terminal)
# Press Ctrl+C in terminals running medusa, medusa-next, strapi

# 2. Stop infrastructure
docker compose -f docker-compose.local.yml down
```

---

## Infrastructure Services (Docker)

Infrastructure services run in Docker containers and provide database and cache functionality.

### Services Included

- **PostgreSQL** (Port 5432)
  - Medusa database: `medusa_local`
  - Strapi database: `strapi_local`
  - User: `cs` / Password: `cs`
  
- **Redis** (Port 6379)
  - Used by Medusa for caching and job queues

### Start Infrastructure

```bash
# Start PostgreSQL and Redis in detached mode
docker compose -f docker-compose.local.yml up -d

# Verify containers are running
docker ps | grep cs
```

**Expected Output:**
```
cs-postgres-1   Up 5 seconds   0.0.0.0:5432->5432/tcp
cs-redis-1      Up 5 seconds   0.0.0.0:6379->6379/tcp
```

### Stop Infrastructure

```bash
# Stop containers but keep data
docker compose -f docker-compose.local.yml stop

# Stop and remove containers (data persists in volumes)
docker compose -f docker-compose.local.yml down

# Stop and remove everything including volumes (⚠️ deletes all data)
docker compose -f docker-compose.local.yml down -v
```

### Check Infrastructure Status

```bash
# Check container status
docker compose -f docker-compose.local.yml ps

# View logs
docker compose -f docker-compose.local.yml logs -f postgres
docker compose -f docker-compose.local.yml logs -f redis

# Check PostgreSQL connection
docker exec -it cs-postgres-1 psql -U cs -d medusa_local -c '\dt'
```

---

## Application Services (Host)

Application services run directly on your host machine using pnpm, enabling hot reload and better development experience.

### Service Overview

| Service | Filter Name | Port | Purpose |
|---------|-------------|------|---------|
| Medusa Backend | `medusa` | 9000 | Commerce API |
| Next.js Storefront | `medusa-next` | 8000 | Customer-facing store |
| Strapi CMS | `strapi` | 1337 | Content management |

### Prerequisites

Ensure infrastructure services are running before starting application services.

---

### 1. Medusa Backend

**Start Command:**
```bash
pnpm --filter medusa dev
```

**What It Does:**
- Starts Medusa commerce backend on `http://localhost:9000`
- Connects to PostgreSQL and Redis
- Enables hot reload for backend changes
- Exposes admin dashboard at `http://localhost:9000/app`

**Expected Output:**
```
info:    Starting Medusa...
info:    Medusa is ready on: http://localhost:9000
```

**First Time Setup:**
```bash
# Seed demo data (only needed once or when you want fresh data)
pnpm --filter medusa seed
```

**Stop Command:**
- Press `Ctrl+C` in the terminal

---

### 2. Next.js Storefront (medusa-next)

**Start Command:**
```bash
pnpm --filter medusa-next dev
```

**What It Does:**
- Starts Next.js storefront on `http://localhost:8000`
- Connects to Medusa backend at `http://localhost:9000`
- Enables hot reload for frontend changes
- Uses Turbopack for faster development builds

**Expected Output:**
```
▲ Next.js 15.x
- Local:        http://localhost:8000
- Network:      http://192.168.x.x:8000

✓ Ready in 2.5s
```

**Environment Variables Required:**
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (in `apps/web/.env.local`)
- `NEXT_PUBLIC_BASE_URL=http://localhost:8000`
- `NEXT_PUBLIC_DEFAULT_REGION=dk`

**Stop Command:**
- Press `Ctrl+C` in the terminal

---

### 3. Strapi CMS (Optional)

**Start Command:**
```bash
pnpm --filter strapi develop
```

**What It Does:**
- Starts Strapi CMS on `http://localhost:1337`
- Connects to PostgreSQL database `strapi_local`
- Admin panel at `http://localhost:1337/admin`

**Expected Output:**
```
[INFO] ⏳ Starting Strapi...
[INFO] ✅ Strapi is running on http://localhost:1337
```

**Stop Command:**
- Press `Ctrl+C` in the terminal

---

## Complete Startup Sequence

### Recommended Order

Follow this sequence for a smooth development experience:

#### Step 1: Start Infrastructure (5 seconds)

```bash
cd /Users/luokai/code/cs
docker compose -f docker-compose.local.yml up -d
```

Wait for containers to be healthy:
```bash
# Should show both containers running
docker ps | grep cs
```

#### Step 2: Start Medusa Backend (10-15 seconds)

Open a new terminal:
```bash
cd /Users/luokai/code/cs
pnpm --filter medusa dev
```

Wait for: `Medusa is ready on: http://localhost:9000`

#### Step 3: Start Storefront (3-5 seconds)

Open another terminal:
```bash
cd /Users/luokai/code/cs
pnpm --filter medusa-next dev
```

Wait for: `✓ Ready in X.Xs`

#### Step 4: (Optional) Start Strapi

Open another terminal:
```bash
cd /Users/luokai/code/cs
pnpm --filter strapi develop
```

### Using Terminal Multiplexer (tmux/screen)

```bash
# Create a new tmux session
tmux new -s dev

# Split panes
# Ctrl+B then % (vertical split)
# Ctrl+B then " (horizontal split)

# In each pane:
# Pane 1: pnpm --filter medusa dev
# Pane 2: pnpm --filter medusa-next dev
# Pane 3: pnpm --filter strapi develop

# Detach from session: Ctrl+B then d
# Reattach: tmux attach -t dev
```

---

## Graceful Shutdown

### Recommended Shutdown Order

#### Step 1: Stop Application Services

Press `Ctrl+C` in each terminal running:
1. Strapi (if running)
2. Storefront (medusa-next)
3. Medusa backend

**Important:** Wait for each service to finish shutdown process before closing terminal.

#### Step 2: Stop Infrastructure

```bash
docker compose -f docker-compose.local.yml down
```

**Options:**
```bash
# Stop containers but keep them (fast restart)
docker compose -f docker-compose.local.yml stop

# Stop and remove containers (clean shutdown)
docker compose -f docker-compose.local.yml down

# Nuclear option - remove everything including data (⚠️)
docker compose -f docker-compose.local.yml down -v
```

---

## Service Health Checks

### Quick Health Check Script

```bash
#!/bin/bash
# Save as: scripts/health-check.sh

echo "=== Infrastructure Services ==="
docker ps | grep cs || echo "❌ Docker containers not running"

echo -e "\n=== PostgreSQL ==="
docker exec cs-postgres-1 pg_isready -U cs 2>/dev/null && echo "✅ PostgreSQL ready" || echo "❌ PostgreSQL not ready"

echo -e "\n=== Redis ==="
docker exec cs-redis-1 redis-cli ping 2>/dev/null && echo "✅ Redis ready" || echo "❌ Redis not ready"

echo -e "\n=== Medusa Backend ==="
curl -s http://localhost:9000/health >/dev/null && echo "✅ Medusa ready (port 9000)" || echo "❌ Medusa not responding"

echo -e "\n=== Next.js Storefront ==="
curl -s http://localhost:8000 >/dev/null && echo "✅ Storefront ready (port 8000)" || echo "❌ Storefront not responding"

echo -e "\n=== Strapi CMS ==="
curl -s http://localhost:1337/_health >/dev/null && echo "✅ Strapi ready (port 1337)" || echo "❌ Strapi not responding"
```

### Manual Health Checks

```bash
# Check PostgreSQL
docker exec -it cs-postgres-1 psql -U cs -c '\l'

# Check Redis
docker exec -it cs-redis-1 redis-cli ping

# Check Medusa
curl http://localhost:9000/health

# Check Storefront
curl -I http://localhost:8000

# Check Strapi
curl http://localhost:1337/_health

# Check all ports
lsof -i :5432,6379,9000,8000,1337
```

---

## Troubleshooting

### Issue: "Port already in use"

```bash
# Find what's using the port
lsof -i :9000  # or :8000, :5432, etc.

# Kill the process
kill -9 <PID>

# Or use pkill
pkill -f "next dev"
pkill -f "medusa dev"
```

### Issue: "Cannot connect to database"

```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check logs
docker logs cs-postgres-1

# Restart PostgreSQL
docker restart cs-postgres-1

# Verify connection
docker exec cs-postgres-1 psql -U cs -d medusa_local -c 'SELECT 1;'
```

### Issue: "Redis connection failed"

```bash
# Check Redis container
docker ps | grep redis

# Check Redis logs
docker logs cs-redis-1

# Test Redis connection
docker exec cs-redis-1 redis-cli ping

# Restart Redis
docker restart cs-redis-1
```

### Issue: "Medusa seed data missing"

```bash
# Re-seed Medusa database
pnpm --filter medusa seed

# Or reset and seed
docker exec cs-postgres-1 psql -U cs -c 'DROP DATABASE medusa_local;'
docker exec cs-postgres-1 psql -U cs -c 'CREATE DATABASE medusa_local;'
pnpm --filter medusa dev  # Wait for migration
# Press Ctrl+C when ready
pnpm --filter medusa seed
```

### Issue: "Images not displaying"

This was resolved in previous fix. Ensure:
1. S3 URLs are accessible: `curl -I https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png`
2. Image components use `unoptimized` prop for external images
3. Next.js config includes proper remote patterns

### Issue: "Field parameters causing 500 errors"

All `fields` query parameters have been commented out due to Medusa v2 compatibility issues. If you encounter 500 errors:
1. Check if any new code added `fields` parameters
2. Remove or comment out the `fields` parameter
3. Refer to `/Users/luokai/code/cs/docs/fix/product-page-errors-fix-retrospective.md`

### Issue: "Middleware redirect loop"

Fixed in previous iteration. Ensure middleware uses `NextResponse.next()` instead of redirect when URL already has country code.

---

## Daily Development Workflows

### Morning Startup

```bash
# Quick start for a new day
cd /Users/luokai/code/cs

# 1. Start infrastructure
docker compose -f docker-compose.local.yml up -d

# 2. Start services in separate terminals
pnpm --filter medusa dev
pnpm --filter medusa-next dev

# Access:
# - Storefront: http://localhost:8000
# - Backend API: http://localhost:9000
# - Admin: http://localhost:9000/app
```

### End of Day Shutdown

```bash
# 1. Stop app services (Ctrl+C in each terminal)

# 2. Stop infrastructure
docker compose -f docker-compose.local.yml down

# Optional: Keep infrastructure running overnight for faster startup
docker compose -f docker-compose.local.yml stop
```

### Frontend-Only Development

If you're only working on the storefront:

```bash
# Infrastructure should already be running
pnpm --filter medusa dev     # Backend (let it run in background)
pnpm --filter medusa-next dev  # Your main focus
```

### Backend-Only Development

If you're only working on Medusa backend:

```bash
# Start infrastructure
docker compose -f docker-compose.local.yml up -d

# Start backend
pnpm --filter medusa dev

# Test with curl or Postman
curl http://localhost:9000/store/products
```

### Full-Stack Development

When working across frontend and backend:

```bash
# Terminal 1: Backend
pnpm --filter medusa dev

# Terminal 2: Frontend
pnpm --filter medusa-next dev

# Terminal 3: Available for commands
# Run tests, check logs, etc.
```

---

## Useful Commands Reference

### pnpm Commands

```bash
# Install dependencies (after pulling code)
pnpm install

# Update dependencies
pnpm update

# Run linting
pnpm lint

# Run tests
pnpm test:unit

# Build all packages
pnpm build

# Clean node_modules and reinstall
pnpm clean
pnpm install
```

### Docker Commands

```bash
# View all containers
docker ps -a

# View logs
docker compose -f docker-compose.local.yml logs -f

# Enter PostgreSQL shell
docker exec -it cs-postgres-1 psql -U cs -d medusa_local

# Enter Redis CLI
docker exec -it cs-redis-1 redis-cli

# Restart a service
docker restart cs-postgres-1

# Check resource usage
docker stats
```

### Database Commands

```bash
# List databases
docker exec cs-postgres-1 psql -U cs -c '\l'

# List tables in medusa_local
docker exec cs-postgres-1 psql -U cs -d medusa_local -c '\dt'

# Backup database
docker exec cs-postgres-1 pg_dump -U cs medusa_local > backup.sql

# Restore database
cat backup.sql | docker exec -i cs-postgres-1 psql -U cs -d medusa_local

# Reset database
docker exec cs-postgres-1 psql -U cs -c 'DROP DATABASE medusa_local;'
docker exec cs-postgres-1 psql -U cs -c 'CREATE DATABASE medusa_local;'
```

---

## Environment Files Checklist

Ensure these files exist and are configured:

- ✅ `/Users/luokai/code/cs/apps/medusa/.env`
  - `DATABASE_URL=postgres://cs:cs@127.0.0.1:5432/medusa_local`
  - `REDIS_URL=redis://127.0.0.1:6379`

- ✅ `/Users/luokai/code/cs/apps/web/.env.local`
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...`
  - `NEXT_PUBLIC_BASE_URL=http://localhost:8000`
  - `NEXT_PUBLIC_DEFAULT_REGION=dk`

- ✅ `/Users/luokai/code/cs/apps/strapi/.env`
  - `DATABASE_URL=postgres://cs:cs@127.0.0.1:5432/strapi_local`

---

## Service URLs Quick Reference

| Service | URL | Credentials |
|---------|-----|-------------|
| Storefront | http://localhost:8000 | N/A |
| Medusa API | http://localhost:9000 | N/A |
| Medusa Admin | http://localhost:9000/app | admin@medusa-test.com / supersecret |
| Strapi Admin | http://localhost:1337/admin | (first-time setup) |
| PostgreSQL | localhost:5432 | cs / cs |
| Redis | localhost:6379 | (no auth) |

---

## Tips for Efficient Development

1. **Use Terminal Tabs/Panes**: Keep infrastructure logs, backend, and frontend in separate visible panes

2. **Keep Infrastructure Running**: Docker containers can run 24/7 on your machine with minimal resources

3. **Hot Reload**: Both Medusa and Next.js support hot reload - no need to restart after code changes

4. **Check Logs First**: When something breaks, check the relevant service logs before restarting

5. **Graceful Shutdown**: Always use Ctrl+C instead of killing processes to avoid database locks

6. **Regular Backups**: Export your database occasionally if you have custom seed data

7. **Monitor Resources**: Use `docker stats` to ensure containers aren't consuming too much memory

8. **Use pnpm Only**: Never mix npm/yarn commands to avoid dependency conflicts

---

## Summary Cheat Sheet

```bash
# START EVERYTHING
docker compose -f docker-compose.local.yml up -d
pnpm --filter medusa dev              # Terminal 1
pnpm --filter medusa-next dev         # Terminal 2

# STOP EVERYTHING
# Ctrl+C in each terminal
docker compose -f docker-compose.local.yml down

# CHECK STATUS
docker ps | grep cs                    # Infrastructure
curl http://localhost:9000/health      # Backend
curl -I http://localhost:8000          # Frontend

# COMMON ISSUES
lsof -i :<port>                        # Find what's using a port
docker logs cs-postgres-1              # Check database logs
pnpm --filter medusa seed              # Reset seed data
```

---

**Last Updated**: 2025-11-01  
**Maintained By**: Development Team  
**Related Docs**:
- [Medusa Integration Summary](/Users/luokai/code/cs/docs/basic/medusa-next-integration-summary.md)
- [Product Page Fix Retrospective](/Users/luokai/code/cs/docs/fix/product-page-errors-fix-retrospective.md)
- [Image Display Fix Retrospective](/Users/luokai/code/cs/docs/fix/image-display-fix-retrospective.md)
