# Quick Deployment Guide

This is a condensed version of the GCE Backend Deployment Playbook for quick reference.

## Prerequisites
- Ubuntu 22.04+ GCE instance
- Docker Compose v2
- PostgreSQL 15 + Redis 7
- Cloudflare account with domain
- GitHub repository with Actions enabled

## One-Command Setup

```bash
# Clone and run the setup script
curl -fsSL https://raw.githubusercontent.com/your-org/cs-tw/main/scripts/gce/setup-backend.sh | bash -s -- --dry-run

# Remove --dry-run to actually execute
```

## Manual Steps Summary

### 1. Directory Setup
```bash
sudo mkdir -p /srv/cs/{env,bin,logs}
sudo cp infra/gcp/*.{yml,example,sh} /srv/cs/
sudo chown deploy:deploy -R /srv/cs
```

### 2. Environment Configuration
```bash
# Edit these files with production values
/srv/cs/.env                 # Registry images
/srv/cs/env/medusa.env       # Medusa secrets
/srv/cs/env/strapi.env       # Strapi secrets
```

### 3. Cloudflare Tunnel
```bash
cloudflared tunnel create cs-tunnel
# Edit /etc/cloudflared/config.yml with your domains
cloudflared tunnel route dns cs-tunnel api.yourdomain.com
cloudflared tunnel route dns cs-tunnel content.yourdomain.com
sudo systemctl enable --now cloudflared
```

### 4. GitHub Secrets
Add these to repository settings → Secrets:
- `GCE_HOST` - VM IP address
- `GCE_USER` - SSH user (deploy)
- `GCE_SSH_KEY` - Private SSH key

### 5. Deploy
```bash
# Push to staging branch to trigger deployment
git push origin staging

# Or trigger manually via Actions tab
```

## Health Checks
```bash
curl -I https://api.yourdomain.com/store/health
curl -I https://content.yourdomain.com/health
```

## Logs
- Deployment: `/srv/cs/logs/deploy-*.log`
- Health: `/srv/cs/logs/health-*.log`
- Evidence: `docs/runbooks/status-log.md`

## Rollback
```bash
cd /srv/cs
TAG=<previous-tag> ./bin/deploy.sh --tag $TAG
```

## Security
- Firewall: 22, 80, 443 only
- Services bound to localhost
- Regular backups scheduled
- Secrets in vault (1Password/GCP Secret Manager)

## Support
- Check `docs/runbooks/gce-backend-playbook.md` for detailed steps
- Review `infra/gcp/README.md` for troubleshooting
- Monitor GitHub Actions for deployment status