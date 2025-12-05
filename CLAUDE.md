# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure & Architecture

This is a Turborepo monorepo using pnpm workspaces implementing a composable commerce platform. The architecture combines:

- **`apps/storefront/`** - Next.js 15 App Router frontend with TypeScript, Tailwind CSS, and TanStack Query
- **`apps/medusa/`** - Medusa 2.x commerce backend with PostgreSQL database
- **`apps/strapi/`** - Strapi v5 headless CMS for content management
- **`packages/`** - Shared libraries (ui, config, sdk) consumed by services
- **`bmad/`** - Core BMAD methodology assets, workflows, and agent personas
- **`infra/`** - Infrastructure-as-code with Pulumi for Railway/Vercel deployments
- **`scripts/`** - Build automation and CI helpers
- **`docs/`** - Architecture docs, PRDs, and story drafts

### Application Architecture

The system uses a composable, service-oriented architecture:
- Frontend renders via SSR/SSG with React Server Components
- Medusa handles commerce (catalog, cart, checkout, orders)
- Strapi manages content (guides, blog, downloads, community)
- Services communicate via REST/GraphQL APIs and webhooks
- Shared design system and SDK packages ensure consistency

### BMAD Core Structure

The `bmad/` directory contains methodology assets:

- **`bmad/bmm/`** - Role personas, delivery-phase workflows, reusable ceremonies, team templates
- **`bmad/core/`** - Foundational engine assets, default tasks, base workflows, global configuration
- **`bmad/bmm/config.yaml`** and **`bmad/core/config.yaml`** - Project configuration with interpolation tokens

## Common Development Commands

### Environment Setup

```bash
# Install dependencies across workspace
pnpm install

# Set up environment files (if not already present)
cp apps/storefront/.env.local.example apps/storefront/.env.local
cp apps/medusa/.env.template apps/medusa/.env
cp apps/strapi/.env.example apps/strapi/.env

# Start shared infrastructure (Postgres/Redis)
docker compose -f docker-compose.local.yml up -d
```

### Development

```bash
# Start individual services
pnpm --filter storefront dev      # Next.js storefront (http://localhost:3000)
pnpm --filter medusa dev          # Medusa backend (http://localhost:9000)
pnpm --filter strapi develop      # Strapi CMS (http://localhost:1337)

# Build all packages and apps
pnpm build

# Run linting via Turbo across all packages
pnpm lint

# Run type checking across all packages
pnpm typecheck

# Run unit tests across all packages
pnpm test:unit
```

### Service-Specific Commands

```bash
# Medusa-specific (from apps/medusa directory)
pnpm dev                         # Start Medusa development server
pnpm build                       # Build Medusa for production
pnpm start                       # Start production Medusa server
pnpm seed                        # Seed database with sample data
pnpm test:unit                   # Run Medusa unit tests
pnpm test:integration:http       # Run HTTP integration tests
pnpm test:integration:modules    # Run modules integration tests

# Strapi-specific (from apps/strapi directory)
pnpm develop                     # Start Strapi development server
pnpm build                       # Build Strapi admin panel
pnpm start                       # Start production Strapi server
pnpm deploy                      # Deploy to production
pnpm console                     # Open Strapi console
pnpm upgrade                     # Upgrade Strapi to latest version

# Storefront-specific (from apps/storefront directory)
pnpm dev                         # Start Next.js dev server with Turbopack
pnpm build                       # Build for production with Turbopack
pnpm start                       # Start production server
pnpm lint                        # Run ESLint
```

### BMAD Workflow Validation

Treat BMAD validation as linting:

```bash
# Validate YAML workflows and indentation
yamllint bmad/bmm/workflows

# Validate XML task definitions
xmllint --noout bmad/bmm/tasks/*.xml

# Check for consistent token usage after edits
rg "{project-root}" bmad -g'*.*'
```

## Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **State Management**: TanStack Query 5, Zustand 5
- **Backend**: Medusa 2.x (commerce), Strapi v5 (CMS)
- **Database**: PostgreSQL 15 with Redis for caching/queues
- **Styling**: Tailwind CSS with Shadcn UI components and Radix primitives
- **Testing**: Vitest (unit), Playwright (E2E), Jest (Medusa integration and unit tests)
- **Infrastructure**: Railway (services), Vercel (frontend), Pulumi (IaC)

## Coding Style & Conventions

- **Indentation**: Two spaces for YAML and XML files
- **Naming**: Lower-kebab-case for directories and files (e.g., `story-ready`, `workflow-status`)
- **Components**: PascalCase for React components, camelCase for hooks/utilities
- **Database**: snake_case for database columns
- **Line Length**: Keep lines under ~120 characters
- **Headings**: Use semantic headings to help downstream agent renderers parse sections

## BMAD-Specific Guidelines

### Workflow and Task Management

- Personas are stored in `.md` files with fenced XML and BMAD power banner
- Workflows should resolve valid `workflow.yaml` paths and agent IDs
- Task XML must maintain attributes like `critical="MANDATORY"` for engine loading
- Use `{project-root}` tokens for portable deployments

### Documentation Standards

- Story drafts live in `docs/stories/`
- Cross-check acceptance criteria against linked workflows
- Group related edits per commit with clear rationale
- Reference issue/ticket IDs when available

### Configuration Management

- Sensitive settings in config.yaml files should not be committed with personal values
- Prefer interpolation variables over hard-coded paths
- Document required keys for deployment portability

## Architecture Patterns

### Rendering Strategy

- **Marketing content**: SSG with ISR (15min revalidation) for SEO
- **Transactional pages**: SSR with React Server Components for personalization
- **API routes**: BFF layer consolidating Medusa/Strapi calls
- **Mutations**: Next.js Server Actions for secure credential handling

### Data Flow

- **Server Components**: Fetch data directly from Medusa/Strapi via shared SDK
- **Client State**: Zustand for UI state, TanStack Query for server state
- **Caching**: Multi-layer (Vercel edge, Redis, browser cache)
- **Events**: Webhook-driven revalidation and sync between services

### Authentication

- NextAuth with Medusa adapter for credential and OAuth (Google) login
- JWT sessions stored in encrypted cookies (12h expiry)
- Protected routes: `/account/**`, `/downloads/**`, `/community/manage`
- RBAC via Medusa customer groups and Strapi roles

## Testing Approach

### Unit Testing

- Vitest + Testing Library for UI components and utilities
- Jest for Medusa backend (unit and integration tests)
- Coverage targets: 80% statements/branches, 90% for critical modules

### Integration Testing

- Vitest with supertest against Medusa/Strapi endpoints
- Jest integration tests for Medusa HTTP endpoints and modules
- Validate BFF endpoints and webhook processing
- Test composite data flows between services

### E2E Testing

- Playwright suite for critical user journeys
- Key flows: browse-to-buy, downloads access, community join
- Run nightly and on release branches

## Deployment

### Environments

- **Local**: docker-compose.local.yml with Postgres/Redis
- **Preview**: Per PR via Vercel + ephemeral Railway DB
- **GCE Dev/Prod**: Docker containers on GCE VM with host Postgres/Redis
- **Staging/Production**: Managed services with Railway + Vercel

### GCE Docker Deployment

The `deploy/gce/` directory contains Docker deployment configurations for GCE VM:

```
deploy/gce/
├── .env.dev          # Dev environment variables
├── .env.prod         # Prod environment variables
├── docker-compose.yml # Production compose (ports 9000, 1337)
└── dev/
    └── docker-compose.yml # Dev compose (ports 9001, 1338)
```

**Build and Deploy Medusa (from project root):**

```bash
# Build Medusa image (must run from project root due to monorepo structure)
docker build -t cs-medusa:dev -f apps/medusa/Dockerfile .
docker build -t cs-medusa:prod -f apps/medusa/Dockerfile .

# Deploy dev environment
cd deploy/gce/dev
docker compose -p cs-dev --env-file ../.env.dev up -d medusa_dev

# Deploy prod environment
cd deploy/gce
docker compose -p cs-prod up -d medusa
```

**Build and Deploy Strapi:**

```bash
docker build -t cs-strapi:dev -f apps/strapi/Dockerfile .
docker build -t cs-strapi:prod -f apps/strapi/Dockerfile .

# Deploy follows same pattern as Medusa
```

**Key Configuration Notes:**

- Medusa Dockerfile removed hardcoded `NODE_ENV=production` to support both dev/prod modes
- Dev containers use `NODE_ENV=development` for Vite hot-reload admin UI
- Host networking uses `host.docker.internal` mapping (172.31.0.1 for dev network)
- Redis must bind to Docker bridge IP (configure in `/etc/redis/redis.conf`)
- Admin UI requires `admin.vite.server.allowedHosts` in `medusa-config.ts` for custom domains

**Port Mapping:**

| Service     | Dev Port | Prod Port |
|-------------|----------|-----------|
| Medusa      | 9001     | 9000      |
| Strapi      | 1338     | 1337      |

**Useful Commands:**

```bash
# Check container logs
docker logs cs-dev-medusa_dev-1 --tail 50

# Restart container
docker restart cs-dev-medusa_dev-1

# Force recreate with new image
docker compose -p cs-dev --env-file ../.env.dev up -d medusa_dev --force-recreate

# Reset Medusa admin password (via scrypt-kdf in container)
docker exec cs-dev-medusa_dev-1 node -e "
const scrypt = require('scrypt-kdf');
scrypt.kdf('NewPassword123', { logN: 15, r: 8, p: 1 }).then(h => console.log(h.toString('base64')));
"
# Then update provider_identity table with the hash
```

### Infrastructure

- Pulumi for declarative infrastructure management
- Automatic migrations via Medusa CLI and Strapi schema diffs
- Environment secrets via GitHub OIDC to Pulumi/Vercel
- CDN via Cloudflare R2 for assets and downloads

## Repository Guidelines

This project follows the guidelines outlined in `AGENTS.md`, including:
- Conventional Commit style for automation parsing
- BMAD documentation standards
- Security practices for configuration management

Key principles:
- Trunk-based development with short-lived feature branches
- PRs require lint/test/build checks with preview environments
- Weekly architecture reviews ensure cohesion
- Accessibility (WCAG 2.1 AA) and performance as first-class concerns

## Root-Level Commands

The root package.json includes additional deployment and validation commands:

```bash
# Deployment commands (from project root)
pnpm deploy:staging             # Deploy to staging environment
pnpm deploy:production          # Deploy to production environment
pnpm deployment-status          # Check deployment status

# Validation commands
pnpm validate-preview           # Validate preview configuration
```