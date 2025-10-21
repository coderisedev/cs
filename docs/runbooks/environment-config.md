# Environment Configuration Runbook

## Overview

This document provides comprehensive guidance for managing environment configuration across all CS platform services. It covers variable management, security practices, and operational procedures for local development and production deployments.

## Architecture

### Services and Their Configuration

| Service | Primary Config File | Template Location | Environment Variables |
|---------|--------------------|------------------|---------------------|
| Storefront | `.env.local` | `apps/storefront/.env.local.example` | Frontend URLs, auth, analytics, feature flags |
| Medusa | `.env` | `apps/medusa/.env.template` | Database, Redis, payments, CORS, security |
| Strapi | `.env` | `apps/strapi/.env.example` | Database, security keys, storage, integrations |

### Shared Configuration Package

- **Location**: `packages/config`
- **Purpose**: Centralized validation schemas and utilities
- **Usage**: Import `@cs/config` in services for environment validation

## Environment Types

### Local Development
- **Purpose**: Development on developer machines
- **Database**: Local PostgreSQL/Redis via Docker
- **Services**: `localhost` ports (3000, 9000, 1337)
- **Features**: Debug mode, development tools, reduced security

### Preview Environment
- **Purpose**: Automatic previews for pull requests
- **Database**: Ephemeral Railway databases
- **Domains**: `-preview.cs.com` subdomains
- **Features**: Full functionality with sandbox payments

### Staging Environment
- **Purpose**: Production-like testing before releases
- **Database:** Persistent Railway staging databases
- **Domains**: `-staging.cs.com` subdomains
- **Features**: Full production functionality

### Production Environment
- **Purpose**: Live customer-facing platform
- **Database**: Persistent Railway production databases
- **Domains**: `cs.com` primary domain
- **Features**: Full production functionality with enhanced monitoring

## Variable Matrix

### Critical Security Variables

| Variable | Service | Required Length | Rotation Cadence | Owner | Storage |
|----------|---------|----------------|------------------|-------|---------|
| `NEXTAUTH_SECRET` | Storefront | 32+ chars | Quarterly | DevOps | Vercel Environment |
| `JWT_SECRET` | Medusa | 32+ chars | Quarterly | DevOps | Railway Environment |
| `COOKIE_SECRET` | Medusa | 32+ chars | Quarterly | DevOps | Railway Environment |
| `APP_KEYS` | Strapi | 6×16+ chars | Quarterly | DevOps | Railway Environment |
| `ADMIN_JWT_SECRET` | Strapi | 32+ chars | Quarterly | DevOps | Railway Environment |
| `API_TOKEN_SALT` | Strapi | 16+ chars | Quarterly | DevOps | Railway Environment |
| `TRANSFER_TOKEN_SALT` | Strapi | 16+ chars | Quarterly | DevOps | Railway Environment |
| `JWT_SECRET` | Strapi | 32+ chars | Quarterly | DevOps | Railway Environment |
| `ENCRYPTION_KEY` | Strapi | 32+ chars | Quarterly | DevOps | Railway Environment |

### Database Configuration

| Variable | Service | Local Value | Remote Value | Owner |
|----------|---------|-------------|--------------|-------|
| `DATABASE_URL` | Medusa/Strapi | `postgres://cs:cs@127.0.0.1:5432/medusa_local` | Managed by Pulumi | DevOps |
| `REDIS_URL` | Medusa | `redis://127.0.0.1:6379` | Managed by Pulumi | DevOps |

### Third-Party Integrations

| Variable | Service | Provider | Rotation Cadence | Owner | Escalation |
|----------|---------|----------|------------------|-------|------------|
| `GOOGLE_CLIENT_ID/SECRET` | Storefront | Google OAuth | As needed | Product | Security Team |
| `PAYPAL_CLIENT_ID/SECRET` | Medusa | PayPal | As needed | Product | Finance |
| `STRIPE_API_KEY/WEBHOOK` | Medusa | Stripe | As needed | Product | Finance |
| `SENDGRID_API_KEY` | Medusa/Strapi | SendGrid | As needed | Product | Marketing |
| `SENTRY_DSN/AUTH_TOKEN` | All | Sentry | As needed | DevOps | Security Team |
| `DISCORD_WEBHOOK_URL` | Strapi | Discord | As needed | Community | Community Manager |
| `SLACK_WEBHOOK_URL` | Strapi | Slack | As needed | Product | Product Manager |

### Storage Configuration

| Variable | Service | Provider | Rotation Cadence | Owner |
|----------|---------|----------|------------------|-------|
| `R2_*` variables | All | Cloudflare R2 | As needed | DevOps |

## Bootstrap Script Usage

### Generating Environment Files

```bash
# Generate local development environment
tsx scripts/bootstrap.ts --env local

# Generate preview environment (for PR deployments)
tsx scripts/bootstrap.ts --env preview

# Generate staging environment
tsx scripts/bootstrap.ts --env staging

# Generate production environment
tsx scripts/bootstrap.ts --env production
```

### Generated Files

| Environment | Storefront File | Medusa File | Strapi File |
|-------------|-----------------|-------------|-------------|
| local | `apps/storefront/.env.local` | `apps/medusa/.env` | `apps/strapi/.env` |
| preview | `apps/storefront/.env.preview` | `apps/medusa/.env` | `apps/strapi/.env` |
| staging | `apps/storefront/.env.staging` | `apps/medusa/.env` | `apps/strapi/.env` |
| production | `apps/storefront/.env.production` | `apps/medusa/.env` | `apps/strapi/.env` |

## Security Practices

### Secret Generation

Generate secure secrets using OpenSSL or password managers:

```bash
# Generate 32-character secrets
openssl rand -base64 32
openssl rand -hex 32

# Generate multiple APP_KEYS for Strapi
for i in {1..6}; do echo "APP_KEY_$i: $(openssl rand -base64 32)"; done
```

### Secret Storage Hierarchy

1. **1Password Vault**: Human-readable secret storage
2. **Pulumi Config**: Infrastructure secrets
3. **GitHub Environment Secrets**: CI/CD secrets
4. **Vercel Environment Variables**: Frontend secrets
5. **Railway Environment Variables**: Backend secrets

### Rotation Procedures

#### Quarterly Security Secret Rotation

1. **Preparation**:
   - Schedule maintenance window (30 minutes)
   - Prepare new secrets using generation scripts
   - Update 1Password vault entries

2. **Update Infrastructure**:
   ```bash
   # Update Pulumi configuration
   pulumi config set --secret jwt_secret "new-secret-value"
   pulumi config set --secret nextauth_secret "new-secret-value"

   # Deploy infrastructure changes
   pulumi up
   ```

3. **Update Service Providers**:
   - Update PayPal/Stripe API keys if needed
   - Update SendGrid configuration
   - Update Sentry DSN

4. **Verification**:
   - Test service startup
   - Verify authentication flows
   - Check monitoring for errors

#### Emergency Secret Rotation

1. **Immediate Actions**:
   - Identify compromised secret
   - Generate replacement immediately
   - Update all storage locations

2. **Deployment**:
   - Deploy infrastructure changes first
   - Update service configurations
   - Restart all services

3. **Post-Incident**:
   - Audit access logs
   - Review rotation procedures
   - Document lessons learned

## Operational Procedures

### Local Development Setup

1. **Initial Setup**:
   ```bash
   # Clone repository and install dependencies
   git clone <repository>
   cd cs
   pnpm install

   # Generate local environment
   tsx scripts/bootstrap.ts --env local

   # Start infrastructure
   docker compose -f docker-compose.local.yml up -d
   ```

2. **Configuration Updates**:
   - Copy generated `.env.local` to `apps/storefront/`
   - Copy generated `.env` to `apps/medusa/` and `apps/strapi/`
   - Update missing API keys and secrets
   - Test service startup

### Service Deployment

1. **Preview Deployments** (Automatic):
   - Triggered by pull request to main branch
   - Uses preview environment configuration
   - Automatic cleanup on PR merge/close

2. **Staging Deployments**:
   ```bash
   # Generate staging configuration
   tsx scripts/bootstrap.ts --env staging

   # Deploy via Pulumi
   pulumi up --stack staging
   ```

3. **Production Deployments**:
   ```bash
   # Generate production configuration
   tsx scripts/bootstrap.ts --env production

   # Deploy via Pulumi
   pulumi up --stack production
   ```

### Troubleshooting

#### Common Configuration Errors

1. **Missing Database Connection**:
   ```
   Error: DATABASE_URL is required
   ```
   **Solution**: Check Railway dashboard for database credentials
   **Command**: `pulumi config get database_url`

2. **Invalid JWT Secret**:
   ```
   Error: JWT_SECRET must be at least 32 characters
   ```
   **Solution**: Generate new secret and update configuration
   **Command**: `openssl rand -base64 32`

3. **CORS Issues**:
   ```
   Error: Origin not allowed by CORS policy
   ```
   **Solution**: Update CORS configuration in environment files
   **Check**: Verify domain names match deployment URLs

#### Service Startup Validation

```bash
# Validate storefront configuration
cd apps/storefront
node -e "require('@cs/config').loadStorefrontConfig()"

# Validate Medusa configuration
cd apps/medusa
node -e "require('@cs/config').loadMedusaConfig()"

# Validate Strapi configuration
cd apps/strapi
node -e "require('@cs/config').loadStrapiConfig()"
```

## Compliance and Auditing

### Access Control

- **1Password Vault**: Product team and DevOps
- **Pulumi State**: DevOps team only
- **GitHub Secrets**: Repository maintainers
- **Vercel Environment**: Frontend team
- **Railway Environment**: Backend team

### Audit Requirements

1. **Quarterly**: Secret rotation audit
2. **Semi-annual**: Access review
3. **Annual**: Compliance assessment
4. **Ad-hoc**: Security incident response

### Monitoring

- **Configuration Errors**: Sentry alerts
- **Service Startup**: Health check monitoring
- **Secret Usage**: Access logging
- **Rotation Status**: Calendar reminders

## Contact Information

### Primary Contacts

| Role | Contact | Responsibilities |
|------|---------|------------------|
| DevOps Lead | devops@cs.com | Infrastructure, secret management |
| Security Lead | security@cs.com | Security procedures, incident response |
| Product Manager | product@cs.com | Third-party integrations |
| Community Manager | community@cs.com | Discord/Slack integrations |

### Escalation Procedures

1. **Configuration Issues**: DevOps → Security Lead
2. **Security Incidents**: Security Lead → Executive Team
3. **Service Outages**: DevOps → Product Manager → Users
4. **Third-Party Issues**: Product Manager → Vendor Support

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-19 | Initial environment configuration matrix and procedures | DevOps Team |

This runbook should be reviewed quarterly and updated as the platform evolves.