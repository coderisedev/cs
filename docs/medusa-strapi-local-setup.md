# Medusa & Strapi Local Environment Setup

This runbook captures the manual steps referenced in `docs/solution-architecture.md` for bootstrapping the commerce (Medusa) and content (Strapi) services on a local workstation.

## 1. Local Prerequisites

- Install Node.js 18+ (LTS 20 recommended), pnpm 8, and Docker Desktop with docker compose v2.
- Create a root `.env.local` with shared variables (`CS_PROJECT_ROOT`, `CS_ENV=local`) and keep service-specific secrets in local `.env` files.
- Ensure PostgreSQL 15.x and Redis 7.x images are available (pulled automatically by docker compose).

## 2. Shared Infrastructure

1. At the repo root, add `docker-compose.local.yml` for Postgres and Redis:

   ```yaml
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_USER: cs
         POSTGRES_PASSWORD: cs
       ports: ["5432:5432"] # adjust host port if 5432 is unavailable
       volumes: [postgres_data:/var/lib/postgresql/data]
     redis:
       image: redis:7
       ports: ["6379:6379"] # adjust host port if 6379 is unavailable
   volumes:
     postgres_data:
   ```

2. Start services: `docker compose -f docker-compose.local.yml up -d`.
3. Create `medusa_local` and `strapi_local` databases with `psql` (connect via host port `5432`), or rely on connection strings that auto-create the schema.

## 3. Medusa Service (`apps/medusa`)

1. Initialize the package:

   ```bash
   pnpm init -y
   pnpm add @medusajs/medusa @medusajs/modules @medusajs/event-bus-local
   pnpm add -D typescript ts-node nodemon @types/node
   ```

2. Add `tsconfig.json` (target `ES2020`) and configure `medusa-config.ts`:

   ```ts
   export default {
     projectConfig: {
       database_url: process.env.MEDUSA_DATABASE_URL,
       redis_url: process.env.MEDUSA_REDIS_URL,
       jwt_secret: process.env.MEDUSA_JWT_SECRET,
       cookie_secret: process.env.MEDUSA_COOKIE_SECRET,
     },
     modules: {
       eventBus: { resolve: '@medusajs/event-bus-local' },
     },
   }
   ```

3. Create `.env` with local credentials:

   ```
   MEDUSA_DATABASE_URL=postgres://cs:cs@127.0.0.1:5432/medusa_local
   MEDUSA_REDIS_URL=redis://127.0.0.1:6379
   MEDUSA_JWT_SECRET=supersecret
   MEDUSA_COOKIE_SECRET=anothersecret
   MEDUSA_ADMIN_EMAIL=admin@cs.dev
   MEDUSA_ADMIN_PASSWORD=Passw0rd!
   ```

4. Add scripts to `package.json`:

   ```json
   {
     "scripts": {
       "dev": "nodemon --watch src --exec ts-node src/index.ts",
       "migrate": "medusa migrations run",
       "seed": "ts-node scripts/seed.ts"
     }
   }
   ```

5. Run migrations and start the dev server:

   ```bash
   pnpm migrate
   pnpm dev
   ```

6. (Optional) Author `scripts/seed.ts` to insert baseline products, regions, and price lists.

## 4. Strapi Service (`apps/strapi`)

1. Scaffold Strapi without running immediately:

   ```bash
   pnpm dlx create-strapi-app@latest . --no-run \
     --db-client=postgres \
     --db-host=127.0.0.1 --db-port=5432 \
     --db-name=strapi_local --db-username=cs --db-password=cs \
     --typescript --install-pnpm
   pnpm add pg
   ```

2. Update `config/database.ts` to enable pooling:

   ```ts
   export default ({ env }) => ({
     connection: {
       client: 'postgres',
       connection: {
         host: env('DATABASE_HOST', '127.0.0.1'),
         port: env.int('DATABASE_PORT', 5432),
         database: env('DATABASE_NAME', 'strapi_local'),
         user: env('DATABASE_USERNAME', 'cs'),
         password: env('DATABASE_PASSWORD', 'cs'),
         ssl: false,
       },
       pool: { min: 2, max: 10 },
     },
   });
   ```

3. Populate `.env`:

   ```
   APP_KEYS=cs_app_key1,cs_app_key2
   API_TOKEN_SALT=api_token_salt
   ADMIN_JWT_SECRET=admin_jwt_secret
   TRANSFER_TOKEN_SALT=transfer_token_salt
   DATABASE_HOST=127.0.0.1
   DATABASE_PORT=5432
   DATABASE_NAME=strapi_local
   DATABASE_USERNAME=cs
   DATABASE_PASSWORD=cs
   ```

4. Build and start Strapi:

   ```bash
   pnpm strapi build
   pnpm strapi develop
   ```

5. Through the Strapi admin (`http://localhost:1337/admin`), create the content types listed in solution architecture (`guide`, `blog_post`, `faq`, `download`, `release_note`, `showcase`, `campaign`) and configure a webhook pointing to `POST /api/webhooks/strapi/publish`.

## 5. Integrated Checks

- Medusa: `curl http://localhost:9000/store/products` should respond with 200; Redis should display job keys for email/inventory queues.
- Strapi: Log into the admin UI, seed example entries, then `curl http://localhost:1337/api/guides`.
- Next.js BFF (future): configure `.env.local` to reference both services for `/api/catalog/*` and `/api/content/*`.

## 6. Follow-Up Improvements

1. Extend `docker-compose.local.yml` with health checks and service wiring to start Medusa and Strapi alongside Postgres/Redis.
2. Add Turbo pipeline targets (`pnpm dev --filter medusa`, `pnpm dev --filter strapi`) for consistent orchestration.
3. Implement webhook-triggered ISR and seeding scripts per sections 3.3 and 4.3 of the solution architecture.
