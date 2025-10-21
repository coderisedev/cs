# cs Monorepo

Composable commerce workspace combining a custom Next.js storefront, Medusa backend, and Strapi CMS per the
solution architecture in `docs/solution-architecture.md`.

## Prerequisites

- Node.js 20.x
- pnpm 9.x (`corepack enable` recommended)
- Docker Desktop or compatible engine for local Postgres/Redis

## Workspace Layout

- `apps/storefront` – Next.js 15 App Router storefront with Tailwind and shared design system hooks.
- `apps/medusa` – Medusa 2.x service connected to local Postgres/Redis.
- `apps/strapi` – Strapi v5 content service targeting the shared Postgres instance.
- `packages/*` – Shared libraries (`ui`, `config`, `sdk`) consumed by services and frontend.
- `infra/pulumi` – Infrastructure-as-code scaffolding for future deployments.
- `scripts/` – Automation entry-points (bootstrap, validation, CI helpers).
- `tests/` – Integration and end-to-end suites staged for future stories.

## Environment Setup

1. Copy environment templates for each service:
   - `cp apps/storefront/.env.local.example apps/storefront/.env.local`
   - `cp apps/medusa/.env.template apps/medusa/.env`
   - `cp apps/strapi/.env.example apps/strapi/.env`
2. Adjust secrets and URLs as needed; defaults target `docker-compose.local.yml` (Postgres on `5432`, Redis on `6379`).
3. Bring up the shared infrastructure: `docker compose -f docker-compose.local.yml up -d`.

## Core Commands

- `pnpm install` – Install dependencies across the workspace.
- `pnpm lint` – Run linting via Turbo across all packages.
- `pnpm test:unit` – Execute unit tests (placeholder until Story 1.3).
- `pnpm build` – Build all applications and packages.
- `pnpm --filter medusa dev` – Start Medusa development server.
- `pnpm --filter strapi develop` – Run Strapi in development mode.
- `pnpm --filter storefront dev` – Launch the Next.js storefront.

Refer to service-specific READMEs inside `apps/*` for additional scripts (migrations, seeds, etc.).
