# Deployment Runbook

This document covers the deployment procedures, troubleshooting steps, and rollback strategies for the Cockpit Simulator platform.

## Overview

- **Platform**: Next.js storefront deployed on Vercel
- **Infrastructure**: Managed via Pulumi (frontend) + Docker Compose on GCE for Medusa/Strapi
- **CI/CD**: GitHub Actions (`deploy-web.yml` for frontend, `deploy-services.yml` for backend)
- **Environments**: Staging, Production

## Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│   CI Pipeline    │───▶│   Vercel Deploy │
│   (push/merge)  │    │   (lint/test)    │    │   (staging/prod)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    main/staging           CI success/failure      Deployment status
     branches              status checks          notifications
```

## Environment Configuration

### Staging Environment
- **Trigger**: Push to `staging` branch
- **URL**: `https://staging.cockpitsimulator.com`
- **Vercel Project**: `cs-staging`
- **Domain**: `staging.cockpitsimulator.com`

### Production Environment
- **Trigger**: Push to `main` branch
- **URL**: `https://cockpitsimulator.com`
- **Vercel Project**: `cs-production`
- **Domain**: `cockpitsimulator.com`

## Deployment Procedures

### 1. Standard Deployments (Frontend)

#### To Staging
```bash
# Push changes to staging branch
git checkout staging
git pull origin staging
git merge feature-branch
git push origin staging
```

#### To Production
```bash
# Merge to main branch (after testing on staging)
git checkout main
git pull origin main
git merge staging
git push origin main
```

### 2. Manual Deployments (Frontend)

#### Using Deployment Script
```bash
# Deploy to staging
pnpm deploy:staging staging

# Deploy to production
pnpm deploy:production main
```

#### Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to specific project
vercel --prod --project cs-staging  # staging
vercel --prod --project cs-production  # production
```

### 3. Backend Services Deployment (GCP)

- Triggered automatically on pushes to `staging` and `main` by `.github/workflows/deploy-services.yml`.
- Builds Medusa and Strapi Docker images, pushes them to GHCR, then SSHes into the GCE host to update `/srv/cs/`.
- Requires repository secrets: `GCE_HOST`, `GCE_USER`, `GCE_SSH_KEY`, and populated `/srv/cs/.env` values for `MEDUSA_IMAGE`, `STRAPI_IMAGE`.
- Detailed host runbook: see `docs/runbooks/gce-backend-playbook.md`.

#### Manual Backend Deployment

```bash
# From the GCE host
/srv/cs/bin/deploy.sh --tag <ghcr-tag> --cwd /srv/cs

# Collect health evidence
/srv/cs/bin/collect-health.sh
```

- Deployment logs are saved under `/srv/cs/logs/` and should be copied into `docs/runbooks/status-log.md`.
- Update Cloudflare Anycast checks and DNS mappings (see **Cloudflare Tunnel Operations** below) after each rollout.

## Monitoring and Observability

### 1. Deployment Status

#### GitHub Actions
- **CI Pipeline**: https://github.com/cockpitsimulator/cs/actions/workflows/ci.yml
- **Deployment Pipeline**: https://github.com/cockpitsimulator/cs/actions/workflows/deploy-web.yml

#### Vercel Dashboard
- **Staging**: https://vercel.com/cockpitsimulator/cs-staging
- **Production**: https://vercel.com/cockpitsimulator/cs-production

### 2. Status Notifications

Deployments automatically post status updates to:
- GitHub commit status checks
- Pull request comments (for PR-triggered deployments)
- Deployment summary in GitHub Actions (frontend and backend pipelines)
- Backend workflow appends `[deploy-log]` lines containing the tail of `/srv/cs/logs/deploy-*.log`

## Troubleshooting

## Cloudflare Tunnel Operations (Backend)

1. Authenticate and create the tunnel once: `cloudflared tunnel create cs-tunnel`.
2. Update `/etc/cloudflared/config.yml` so `api.<domain>` -> `http://127.0.0.1:9000` and `content.<domain>` -> `http://127.0.0.1:1337`.
3. Register DNS routes: `cloudflared tunnel route dns cs-tunnel api.<domain>` and `... content.<domain>`.
4. Enable the service: `sudo systemctl enable --now cloudflared`.
5. After every deploy run:
   ```bash
   curl -I https://api.<domain>/store/health
   curl -I https://content.<domain>/health
   ```
   Record the HTTP status, Anycast IP, and timestamp in `docs/runbooks/status-log.md`.

## Status Logging and Evidence

- Use `docs/runbooks/status-log.md` to preserve:
  - GHCR image tags (`cs-medusa`, `cs-strapi`)
  - Output of `/srv/cs/bin/collect-health.sh`
  - Cloudflare verification commands and responses
  - Links to the relevant GitHub Actions runs

## Troubleshooting

### 1. Common Deployment Issues

#### Build Failures
**Symptoms**: CI pipeline fails during build step

**Troubleshooting Steps**:
1. Check CI logs in GitHub Actions
2. Verify `pnpm build` runs locally
3. Check for dependency conflicts
4. Verify environment variables

```bash
# Local debugging
pnpm install
pnpm build
```

#### Environment Variable Issues
**Symptoms**: Application starts but behaves incorrectly

**Troubleshooting Steps**:
1. Check Vercel environment variables in dashboard
2. Verify secret names match expectations
3. Check deployment logs for missing variables

#### Vercel Token Issues
**Symptoms**: Deployment fails with authentication errors

**Troubleshooting Steps**:
1. Verify `VERCEL_TOKEN` in GitHub repository secrets
2. Check token has proper permissions
3. Ensure `VERCEL_ORG_ID` and `VERCEL_TEAM_ID` are correct

### 2. Rollback Procedures

#### Automatic Rollbacks
Vercel provides automatic rollback capabilities:
- Deployments maintain history
- Previous versions can be promoted instantly
- Zero-downtime rollback available

#### Manual Rollback via Vercel CLI
```bash
# List recent deployments
vercel ls cs-production

# Promote previous deployment
vercel promote <deployment-id> --project cs-production
```

#### Manual Rollback via Vercel Dashboard
1. Navigate to project dashboard
2. Click "Deployments" tab
3. Find the stable deployment to rollback to
4. Click "..." menu and select "Promote to Production"

#### Emergency Rollback
For critical issues requiring immediate rollback:

1. **Identify Last Stable Deployment**
   ```bash
   # Check deployment history
   vercel ls cs-production --limit 10
   ```

2. **Promote Stable Version**
   ```bash
   # Rollback to specific deployment
   vercel promote <stable-deployment-id> --project cs-production
   ```

3. **Verify Rollback**
   - Test application functionality
   - Monitor error rates
   - Verify all endpoints working

4. **Communicate**
   - Update team in Slack/Teams
   - Document rollback in incident report
   - Schedule post-mortem if needed

## Emergency Contacts

### Primary On-Call
- **Name**: [On-Call Engineer]
- **Email**: [on-call@cockpitsimulator.com]
- **Phone**: [On-call phone number]

### Secondary Contacts
- **Engineering Lead**: [lead@cockpitsimulator.com]
- **DevOps**: [devops@cockpitsimulator.com]

## Escalation Procedures

### Severity 1 (Critical)
- **Definition**: Production down, revenue impact, security breach
- **Response Time**: 15 minutes
- **Escalation**: Contact on-call immediately
- **Communication**: Incident command activated

### Severity 2 (High)
- **Definition**: Major functionality impaired, degraded performance
- **Response Time**: 1 hour
- **Escalation**: Create incident ticket, notify team
- **Communication**: Slack notification, status page update

### Severity 3 (Medium)
- **Definition**: Minor issues, workarounds available
- **Response Time**: 4 hours
- **Escalation**: Create task ticket, assign to team
- **Communication**: Team notification only

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Monthly (first Tuesday, 2-4 AM UTC)
- **Notification**: 7 days advance notice
- **Communication**: Email, in-app banners, status page

### Emergency Maintenance
- **Definition**: Unscheduled critical fixes
- **Notification**: Minimum 30 minutes when possible
- **Communication**: Status page, Twitter, direct notifications

## Compliance and Audit

### Deployment Logs
- All deployments are logged in GitHub Actions
- Vercel maintains deployment history
- Changes tracked via git commit history

### Access Control
- Deployment secrets stored in GitHub repository secrets
- Role-based access in Vercel team account
- Audit logging enabled for all infrastructure changes

### Change Management
- All production changes require PR review
- Deployment documentation required for significant changes
- Rollback plans documented for major releases

## Performance Metrics

### Deployment Performance Targets
- **Deployment Time**: < 5 minutes
- **Rollback Time**: < 2 minutes
- **Downtime**: 0% (target)
- **Error Rate**: < 1% (post-deployment)

### Monitoring
- Application performance monitoring (APM)
- Real user monitoring (RUM)
- Infrastructure monitoring
- Error tracking and alerting

---

**Last Updated**: 2025-10-20
**Version**: 1.0
**Maintainers**: Cockpit Simulator DevOps Team
