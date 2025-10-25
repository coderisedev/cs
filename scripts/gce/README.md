# GCE Backend Deployment Scripts

This directory contains a comprehensive suite of scripts for deploying the Medusa + Strapi backend stack to Google Compute Engine (GCE) as outlined in `docs/runbooks/gce-backend-playbook.md`.

## Overview

The deployment consists of:
- **Medusa v2.x** - Commerce backend (port 9000)
- **Strapi v5** - Headless CMS (port 1337)
- **PostgreSQL 15** - Primary database
- **Redis 7** - Caching and job queues
- **Cloudflare Tunnel** - Secure ingress without exposing ports

## Scripts

### Main Orchestrator
- **`deploy-backend.sh`** - Main orchestrator script
  ```bash
  sudo ./deploy-backend.sh setup              # Complete setup
  sudo ./deploy-backend.sh setup --dry-run    # Preview commands
  sudo ./deploy-backend.sh status             # Show deployment status
  ```

### Individual Components
- **`setup-backend.sh`** - Complete playbook implementation (steps 1-9)
- **`install-deps.sh`** - System dependencies (Docker, PostgreSQL, Redis)
- **`configure-secrets.sh`** - Interactive secrets configuration
- **`configure-tunnel.sh`** - Cloudflare tunnel setup
- **`verify-deployment.sh`** - Health checks and verification

### Supporting Files
- **`deploy.sh`** - Deployment automation (copied to server)
- **`collect-health.sh`** - Health collection helper (copied to server)

## Quick Start

### 1. Prerequisites
- Ubuntu 22.04+ GCE instance
- GitHub repository with Actions enabled
- Cloudflare account with domain
- Docker Hub/GHCR access

### 2. Complete Setup (Recommended)
```bash
# Clone repository
git clone <your-repo>
cd cs-tw

# Run complete setup
sudo scripts/gce/deploy-backend.sh setup

# Follow the prompts for:
# - GitHub organization/repository
# - Domain names
# - Database credentials
# - Integration keys
```

### 3. Step-by-Step Setup
```bash
# Install system dependencies
sudo scripts/gce/deploy-backend.sh deps

# Configure secrets and environment variables
sudo scripts/gce/deploy-backend.sh secrets

# Configure Cloudflare tunnel
sudo scripts/gce/deploy-backend.sh tunnel

# Verify deployment
scripts/gce/deploy-backend.sh verify --domain your-domain.com
```

## Directory Structure

After setup, your GCE instance will have:

```
/srv/cs/
├── .env                    # Main environment (registry images)
├── docker-compose.yml      # Service definitions
├── env/
│   ├── medusa.env         # Medusa configuration
│   └── strapi.env         # Strapi configuration
├── bin/
│   ├── deploy.sh          # Deployment script
│   └── collect-health.sh  # Health collection
└── logs/
    ├── deploy-*.log       # Deployment logs
    └── health-*.log       # Health check logs
```

## Configuration

### Environment Variables
Key configuration files:

**`/srv/cs/.env`**
```env
COMPOSE_PROJECT_NAME=cs
MEDUSA_IMAGE=ghcr.io/your-org/cs-medusa
STRAPI_IMAGE=ghcr.io/your-org/cs-strapi
TAG=latest
```

**`/srv/cs/env/medusa.env`**
```env
DATABASE_URL=postgres://user:pass@host:5432/medusa_production
REDIS_URL=redis://host:6379
JWT_SECRET=your-jwt-secret
STORE_CORS=https://yourdomain.com,https://staging.yourdomain.com
```

**`/srv/cs/env/strapi.env`**
```env
DATABASE_URL=postgres://user:pass@host:5432/strapi_production
URL=https://content.yourdomain.com
APP_KEYS=your-app-keys
```

### GitHub Secrets
Configure in repository Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `GCE_HOST` | VM IP address |
| `GCE_USER` | SSH username (deploy) |
| `GCE_SSH_KEY` | Private SSH key |

## Deployment

### Automated (Recommended)
1. Push to `staging` branch
2. GitHub Actions builds and pushes images
3. Automatically deploys to GCE
4. Health checks verify deployment

### Manual
```bash
# On GCE instance
cd /srv/cs
TAG=<image-tag> ./bin/deploy.sh --tag $TAG
```

## Health Checks

### Local
```bash
# Check local services
curl http://127.0.0.1:9000/store/health  # Medusa
curl http://127.0.0.1:1337/health        # Strapi
```

### External (via Cloudflare Tunnel)
```bash
# Check external endpoints
curl https://api.yourdomain.com/store/health
curl https://content.yourdomain.com/health
```

### Comprehensive Verification
```bash
scripts/gce/verify-deployment.sh --domain yourdomain.com
```

## Management Commands

### Docker Services
```bash
cd /srv/cs
docker compose ps                    # Show status
docker compose logs -f medusa       # Follow logs
docker compose restart strapi       # Restart service
```

### Cloudflare Tunnel
```bash
cs-tunnel status    # Check tunnel status
cs-tunnel logs      # View tunnel logs
cs-tunnel restart   # Restart tunnel
```

### Database
```bash
# PostgreSQL
sudo -u postgres psql -l
sudo systemctl status postgresql

# Redis
redis-cli ping
sudo systemctl status redis-server
```

## Monitoring and Logs

### Log Locations
- **Deployment logs**: `/srv/cs/logs/deploy-*.log`
- **Health logs**: `/srv/cs/logs/health-*.log`
- **Service logs**: `docker compose logs`
- **System logs**: `journalctl -u service-name`

### Status Tracking
Update `docs/runbooks/status-log.md` with deployment evidence:
- GitHub Actions run links
- Health check results
- Tunnel IP addresses
- Any issues or resolutions

## Security

### Network
- Services bound to localhost only
- Cloudflare Tunnel provides secure ingress
- Firewall restricts to 22, 80, 443

### Secrets
- Store production secrets in vault (1Password/GCP Secret Manager)
- Rotate keys regularly
- Use GitHub OIDC where possible

### Backups
```bash
# PostgreSQL
sudo -u postgres pg_dump medusa_production > backup.sql

# Redis
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb backup.rdb
```

## Troubleshooting

### Common Issues

**Docker containers not starting**
```bash
# Check logs
docker compose logs medusa
docker compose logs strapi

# Check environment
cd /srv/cs && docker compose config
```

**Database connection errors**
```bash
# Test PostgreSQL
sudo -u postgres psql -h localhost medusa_production

# Test Redis
redis-cli -h localhost ping
```

**Cloudflare tunnel issues**
```bash
cs-tunnel status
cs-tunnel logs
sudo systemctl restart cloudflared
```

**Health check failures**
```bash
# Run comprehensive verification
scripts/gce/verify-deployment.sh --domain yourdomain.com

# Check individual endpoints
curl -v http://127.0.0.1:9000/store/health
curl -v http://127.0.0.1:1337/health
```

### Rollback
```bash
cd /srv/cs
TAG=<previous-tag> ./bin/deploy.sh --tag $TAG
```

## Maintenance

### Regular Tasks
- Monitor logs and health checks
- Update dependencies (Docker images, system packages)
- Rotate secrets and keys
- Backup databases and configurations
- Review and update firewall rules

### Performance Monitoring
- Monitor disk space, memory, and CPU usage
- Check Docker container resource usage
- Monitor database performance
- Review Cloudflare tunnel metrics

## Support

### Documentation
- **Playbook**: `docs/runbooks/gce-backend-playbook.md`
- **Quick Guide**: `docs/runbooks/quick-deploy.md`
- **GitHub Secrets**: `docs/runbooks/github-secrets-guide.md`
- **Status Tracking**: `docs/runbooks/status-log.md`

### Issues and Contributing
1. Check logs for error messages
2. Review troubleshooting section
3. Check GitHub Issues for known problems
4. Create detailed issue reports with:
   - Steps to reproduce
   - Error messages and logs
   - System information
   - Configuration details (redacted)