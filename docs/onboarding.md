# Developer Onboarding Guide

## Overview

Welcome to the CS platform! This guide will help you get set up for development, understand our workflows, and contribute effectively to the project.

## Prerequisites

### Required Tools
- **Node.js**: Version 20.x (use nvm or fnm)
- **pnpm**: Version 9.x
- **Git**: Latest version
- **Docker**: Latest version (for local infrastructure)

### Recommended Tools
- **VS Code**: With our recommended extensions
- **GitHub CLI**: For repository interactions
- **PostgreSQL Client**: For local database management

## Getting Started

### 1. Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd cs

# Install dependencies
pnpm install

# Copy environment files
cp apps/storefront/.env.local.example apps/storefront/.env.local
cp apps/medusa/.env.template apps/medusa/.env
cp apps/strapi/.env.example apps/strapi/.env

# Start local infrastructure
docker compose -f docker-compose.local.yml up -d
```

### 2. Environment Configuration

Use the bootstrap script to generate environment-specific configurations:

```bash
# Generate local development environment
tsx scripts/bootstrap.ts --env local

# For other environments (when needed)
tsx scripts/bootstrap.ts --env preview
tsx scripts/bootstrap.ts --env staging
tsx scripts/bootstrap.ts --env production
```

### 3. Start Development

```bash
# Start all services in development mode
pnpm dev

# Or start individual services
pnpm --filter storefront dev
pnpm --filter medusa dev
pnpm --filter strapi develop
```

## Project Structure

```
cs/
├── apps/                          # Main applications
│   ├── storefront/                # Next.js frontend
│   ├── medusa/                    # Commerce backend
│   └── strapi/                    # CMS backend
├── packages/                      # Shared packages
│   ├── config/                    # Configuration utilities
│   ├── ui/                        # Shared UI components
│   └── sdk/                       # API SDKs
├── docs/                          # Documentation
├── scripts/                       # Build and utility scripts
├── infra/                         # Infrastructure as code
└── .github/workflows/             # CI/CD pipelines
```

## Development Workflow

### 1. Branch Strategy

- **main**: Production-ready code
- **feature/***: New features
- **fix/***: Bug fixes
- **chore/***: Maintenance tasks

### 2. Making Changes

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Run linting and tests
pnpm lint
pnpm typecheck
pnpm test:unit

# Commit changes (use conventional commits)
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 3. Pull Request Process

1. **Create PR**: From your feature branch to `main`
2. **CI Pipeline**: Automatically runs linting, tests, and builds
3. **Code Review**: Team reviews your changes
4. **Merge**: After approval and all checks pass

### 4. Conventional Commits

We use conventional commit messages:

```
feat: add new feature
fix: resolve bug in authentication
docs: update API documentation
style: format code with prettier
refactor: restructure component logic
test: add unit tests for user service
chore: update dependencies
```

## Available Scripts

### Development Commands

```bash
# Start all services
pnpm dev

# Start specific service
pnpm --filter <service> dev

# Build all packages
pnpm build

# Clean build artifacts
pnpm clean
```

### Testing Commands

```bash
# Run all unit tests
pnpm test:unit

# Run tests with coverage
pnpm test:unit --coverage

# Run tests in watch mode
pnpm test:unit --watch

# Run tests for specific package
pnpm --filter <package> test
```

### Code Quality Commands

```bash
# Run linting
pnpm lint

# Auto-fix linting issues
pnpm lint --fix

# Type checking
pnpm typecheck

# Format code
pnpm format
```

## Service-Specific Development

### Frontend (Storefront)

```bash
cd apps/storefront

# Development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

**Key Files:**
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable components
- `src/lib/` - Utilities and configurations
- `.env.local` - Environment variables

### Commerce Backend (Medusa)

```bash
cd apps/medusa

# Development server
pnpm dev

# Run migrations
pnpm medusa db:migrate

# Seed data
pnpm seed

# Run tests
pnpm test:unit
```

**Key Files:**
- `src/api/` - API routes
- `src/models/` - Data models
- `src/services/` - Business logic
- `.env` - Environment variables

### CMS Backend (Strapi)

```bash
cd apps/strapi

# Development server
pnpm develop

# Build admin panel
pnpm build

# Run tests
pnpm test
```

**Key Files:**
- `src/api/` - Content types
- `src/components/` - Custom components
- `config/` - Strapi configuration
- `.env` - Environment variables

## Configuration Management

### Environment Variables

The platform uses a structured approach to environment configuration:

1. **Templates**: Each service has an `.env.example` file
2. **Bootstrap Script**: `scripts/bootstrap.ts` generates environment-specific files
3. **Validation**: Shared `@cs/config` package validates variables at runtime

### Adding New Environment Variables

1. Update the relevant `.env.example` file
2. Add validation in `packages/config/src/schemas.ts`
3. Update the bootstrap script if needed
4. Document in `docs/runbooks/environment-config.md`

## Testing Strategy

### Unit Tests
- **Frontend**: Vitest + React Testing Library
- **Backend**: Vitest + Supertest
- **Shared**: Vitest

### Integration Tests
- API endpoint testing
- Database interaction testing
- Cross-service integration testing

### End-to-End Tests
- Playwright for critical user flows
- Visual regression testing
- Performance testing

## CI/CD Pipeline

### GitHub Actions Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`):
   - Linting and type checking
   - Unit tests across all workspaces
   - Build verification
   - Workflow summaries

2. **Branch Protection**:
   - Required status checks before merge
   - Automated PR validation
   - Performance monitoring

### Pipeline Troubleshooting

See `docs/runbooks/ci-pipeline.md` for detailed troubleshooting guidance.

## Code Standards

### TypeScript
- Use strict mode
- Prefer explicit types
- Document complex functions

### React/Next.js
- Use functional components with hooks
- Prefer Server Components when possible
- Follow accessibility guidelines

### CSS/Styling
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent design tokens

### Database
- Use snake_case for column names
- Add proper indexes
- Document schema changes

## Getting Help

### Documentation
- **Architecture**: `docs/solution-architecture.md`
- **API**: Auto-generated API docs
- **Runbooks**: `docs/runbooks/`

### Team Communication
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Slack**: Real-time team communication

### Common Problems

**Installation Issues:**
```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Database Issues:**
```bash
# Reset local database
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d

# Run migrations
pnpm --filter medusa db:migrate
pnpm --filter strapi db:migrate
```

**Port Conflicts:**
```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :9000  # Medusa
lsof -i :1337  # Strapi
```

## Contributing Guidelines

### Before Contributing
1. Read this guide completely
2. Set up local development environment
3. Run existing tests to ensure setup works

### Making Contributions
1. Create descriptive branches
2. Write clear commit messages
3. Include tests for new functionality
4. Update documentation as needed

### Code Review Process
1. Submit pull requests with clear descriptions
2. Respond to review feedback promptly
3. Keep PRs focused and reasonably sized

## Security

### Best Practices
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow dependency security updates
- Report security vulnerabilities privately

### Security Resources
- [GitHub Security Advisories](https://docs.github.com/en/code-security)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [Security Policies](SECURITY.md)

---

## Next Steps

1. **Complete Setup**: Follow all steps in this guide
2. **Explore Codebase**: Browse through different services
3. **Make First Contribution**: Start with documentation or small improvements
4. **Join Team Discussions**: Participate in planning and reviews

Welcome aboard! We're excited to have you contributing to the CS platform.

---

**Last Updated**: 2025-10-20
**Maintained by**: Development Team
**Review Frequency**: Monthly