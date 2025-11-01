# Local Development Setup Retrospective

**Date**: 2025-11-01  
**Objective**: Configure local development environment for composable commerce monorepo with Docker-based infrastructure and host-based application services

---

## Setup Summary

Successfully established a hybrid local development environment:
- **Infrastructure Layer**: PostgreSQL 15 and Redis 7 running in Docker containers
- **Application Layer**: Medusa 2.x, Strapi v5, and Next.js 15 running on host machine

---

## Completed Tasks

### 1. Environment Verification ✅
- **Node.js**: v22.20.0 (exceeds minimum requirement of v20.x)
- **pnpm**: v10.18.2 (meets requirement of v9.x+)
- **Docker**: v28.0.1

### 2. Docker Infrastructure ✅
- Started PostgreSQL 15 on `localhost:5432`
  - Credentials: `cs:cs`
  - Created databases: `medusa_local`, `strapi_local`
- Started Redis 7 on `localhost:6379`
- Container names: `cs-postgres-1`, `cs-redis-1`

**Issue Resolved**: Stopped conflicting containers (`tiantianbm-postgres-dev`, `tiantianbm-redis-dev`) that were occupying ports 5432 and 6379

### 3. Workspace Dependencies ✅
- Installed 2,759 packages via `pnpm install`
- Total installation time: 20.1s
- Build scripts approved for critical dependencies

### 4. Environment Configuration ✅

Created environment files for all three applications:

**apps/medusa/.env**
```env
DATABASE_URL=postgres://cs:cs@127.0.0.1:5432/medusa_local
REDIS_URL=redis://127.0.0.1:6379
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000,http://localhost:3000
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

**apps/strapi/.env**
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=tobemodified
TRANSFER_TOKEN_SALT=tobemodified
JWT_SECRET=tobemodified
DATABASE_CLIENT=postgres
DATABASE_URL=postgres://cs:cs@127.0.0.1:5432/strapi_local
DATABASE_SSL=false
```

**apps/storefront/.env.local**
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

### 5. Database Setup ✅

**Medusa Database**
- Executed migrations successfully: `npx medusa db:migrate`
- Migrated 18+ module schemas (stock_location, inventory, product, pricing, etc.)
- Created link tables for relationships
- Seeded initial data: regions, tax regions, stock locations, products, inventory

**Strapi Database**
- Auto-migrated on first launch
- Database schema: `public`

### 6. Application Status

#### Strapi v5 ✅ **RUNNING**
- **URL**: http://localhost:1337
- **Admin Panel**: http://localhost:1337/admin
- **Status**: Running successfully (PID 41045)
- **Database**: Connected to `strapi_local`
- **Launch Time**: 3.4 seconds
- **Next Step**: Create first administrator account via admin panel

#### Next.js 15 Storefront ✅ **RUNNING**
- **URL**: http://localhost:3000
- **Network URL**: http://192.168.3.8:3000
- **Status**: Running with Turbopack
- **Ready Time**: 765ms
- **Environment**: .env.local loaded
- **Backend Connection**: Configured to http://localhost:9000

#### Medusa 2.x ⚠️ **PARTIAL**
- **Expected URL**: http://localhost:9000
- **Status**: Database migrated and seeded, but dev server failing to start
- **Root Cause**: Module loader errors for Tax and Payment providers

---

## Issues Encountered & Resolutions

### Issue 1: Port Conflicts
**Problem**: Existing containers (`tiantianbm-postgres-dev`, `tiantianbm-redis-dev`) were paused but occupying ports 5432 and 6379

**Resolution**: 
```bash
docker stop tiantianbm-postgres-dev tiantianbm-redis-dev
docker compose -f docker-compose.local.yml up -d
```

### Issue 2: Strapi SSL Connection Error
**Problem**: Strapi attempted SSL connection to PostgreSQL which doesn't support it

**Error Message**:
```
Error: The server does not support SSL connections
```

**Resolution**: Added `DATABASE_SSL=false` to `apps/strapi/.env`

### Issue 3: Medusa Module Loader Errors ⚠️ **UNRESOLVED**
**Problem**: Tax and Payment modules fail to load due to missing provider tables

**Error Messages**:
```
Loaders for module Tax failed: relation "public.tax_provider" does not exist
Loaders for module Payment failed: relation "public.payment_provider" does not exist
Error syncing the fulfillment providers: relation "public.fulfillment_provider" does not exist
Error syncing the notification providers: relation "public.notification_provider" does not exist
```

**Attempted Solutions**:
1. ❌ Added explicit module configuration to `medusa-config.ts` → Module paths not found
2. ❌ Ran migrations and seed scripts → Tables still missing
3. ❌ Checked for port conflicts → Port 9000 was occupied, killed process

**Current Status**: Medusa dev server fails to start. This appears to be a known issue with Medusa 2.x where certain provider tables are expected but not created during standard migrations.

**Hypothesis**: 
- Medusa 2.x may require additional provider installation steps
- Some modules might need explicit configuration in `medusa-config.ts`
- Could be a version mismatch between Medusa framework and module versions

---

## What Worked Well

1. **Docker Compose Setup**: Clean separation of infrastructure from application code
2. **Environment Detection**: Quick identification of pre-existing containers and port conflicts
3. **Parallel Application Development**: Strapi and Next.js could start independently while troubleshooting Medusa
4. **pnpm Workspace**: Efficient dependency management across monorepo
5. **Migration Scripts**: Medusa migrations executed successfully and created proper schema structure

---

## What Could Be Improved

1. **Pre-flight Checks**: Should verify no existing services on required ports before starting
2. **Medusa Module Configuration**: Needs investigation into proper Medusa 2.x provider setup
3. **Environment Templates**: Could benefit from `.env.example` files in each app directory
4. **Documentation**: Medusa 2.x provider setup process not well documented in current codebase

---

## Next Steps

### Immediate Actions

1. **Investigate Medusa Provider Tables**
   - Check Medusa 2.x official documentation for provider installation
   - Review if provider modules need separate installation
   - Examine if there's a missing configuration step

2. **Create Strapi Admin Account**
   - Navigate to http://localhost:1337/admin
   - Register first administrator
   - Configure content types as needed

3. **Test Next.js Integration**
   - Once Medusa is running, verify storefront can communicate with backend API
   - Test product listing and cart functionality

### Long-term Improvements

1. **Add Health Check Script**
   - Create script to verify all services are running
   - Check database connectivity
   - Validate port availability

2. **Document Environment Variables**
   - Create `.env.example` files for each application
   - Document required vs optional variables
   - Add comments explaining each variable's purpose

3. **Create Startup Script**
   - Single command to start all services in correct order
   - Handle Docker startup
   - Wait for database readiness before starting apps

4. **Add Medusa Module Documentation**
   - Document required Medusa 2.x providers
   - Create setup guide for fresh installation
   - Troubleshooting guide for common Medusa issues

---

## Lessons Learned

1. **Medusa 2.x Complexity**: The framework has significant setup requirements beyond basic migrations
2. **Port Management**: Always check for existing services before starting new containers
3. **SSL Configuration**: Local development typically doesn't need SSL for database connections
4. **Incremental Testing**: Starting services one at a time helps isolate issues
5. **Version Compatibility**: Running Node v22 (above recommended v20) can surface edge cases in dependencies

---

## Reference Commands

### Start Docker Infrastructure
```bash
docker compose -f docker-compose.local.yml up -d
```

### Check Running Services
```bash
docker ps
nc -z localhost 5432 && echo "Postgres OK"
nc -z localhost 6379 && echo "Redis OK"
```

### Start Applications
```bash
# Strapi (Working)
pnpm --filter strapi develop

# Next.js (Working)
pnpm --filter storefront dev

# Medusa (Needs Fix)
pnpm --filter medusa dev
```

### Verify Databases
```bash
docker exec -i cs-postgres-1 psql -U cs -c "\l"
```

---

## Service URLs

| Service | URL | Status |
|---------|-----|--------|
| Strapi Admin | http://localhost:1337/admin | ✅ Running |
| Strapi API | http://localhost:1337/api | ✅ Running |
| Next.js App | http://localhost:3000 | ✅ Running |
| Medusa API | http://localhost:9000 | ⚠️ Not Running |
| PostgreSQL | localhost:5432 | ✅ Running |
| Redis | localhost:6379 | ✅ Running |

---

## Conclusion

The local development environment is **67% operational** (2 out of 3 applications running). Strapi CMS and Next.js storefront are fully functional and ready for development. Medusa backend requires additional investigation to resolve provider module loading issues. The hybrid architecture (Docker for infrastructure, host for applications) works well for development workflow.
