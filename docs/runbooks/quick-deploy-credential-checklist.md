# Quick Deploy Credential Checklist

Consolidated reference for secrets required to execute `docs/runbooks/quick-deploy.md`. Validate the items below before running the deployment workflow.

## GitHub Actions Access
- `GCE_HOST` – public IP or hostname for the target VM (`docs/runbooks/quick-deploy.md:47`).
- `GCE_USER` – SSH user with deployment privileges (`docs/runbooks/quick-deploy.md:50`).
- `GCE_SSH_KEY` – private key matching the authorized key on the VM (`docs/runbooks/quick-deploy.md:51`).
- `GHCR_WRITE_TOKEN` – only if `GITHUB_TOKEN` lacks permission to push Medusa/Strapi images to GHCR (`infra/gcp/README.md:82`).

## Cloudflare Tunnel & DNS
- Cloudflare account with permission to manage the relevant zone.
- API token or global key that grants DNS edit and Tunnel management scopes (`infra/gcp/README.md:50`).
- Generated `cs-tunnel` credentials file (`/etc/cloudflared/cs-tunnel.json`) from `cloudflared login` (`infra/gcp/README.md:58`).

## Platform Datastores
- PostgreSQL connection strings for `medusa_production` and `strapi_production` databases, including usernames/passwords (`infra/gcp/env/medusa.env.example:5`, `infra/gcp/env/strapi.env.example:10`).
- Redis endpoint and password (if enabled) for Medusa (`infra/gcp/env/medusa.env.example:6`).

## Medusa Service Secrets
- `JWT_SECRET`, `COOKIE_SECRET` for API authentication (`infra/gcp/env/medusa.env.example:9`).
- CORS domain lists: `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` (`infra/gcp/env/medusa.env.example:13`).
- Third-party integrations: `PAYPAL_*`, `STRIPE_*`, `SENDGRID_API_KEY`, `SENTRY_*`, `R2_*` (`docs/gcp-ubuntu-deployment-brief.md:83`).

## Strapi Service Secrets
- Security keys: `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` (`infra/gcp/env/strapi.env.example:14`, `docs/gcp-ubuntu-deployment-brief.md:90`).
- URL settings: `URL`, `ADMIN_URL` for production domains (`infra/gcp/env/strapi.env.example:7`).
- Cloudflare R2 configuration: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (`docs/runbooks/environment-config.md:84`).
- Integration keys: `SENDGRID_API_KEY`, `DISCORD_WEBHOOK_URL`, `SLACK_WEBHOOK_URL`, `SENTRY_*` (`infra/gcp/env/strapi.env.example:23`, `docs/runbooks/environment-config.md:72`).

## Storage & Vault Locations
- Ensure all secrets above are stored in 1Password or GCP Secret Manager with access for the deployment team (`docs/gcp-ubuntu-deployment-brief.md:97`).
- Mirror production values into `/srv/cs/.env`, `/srv/cs/env/medusa.env`, `/srv/cs/env/strapi.env` before triggering automation (`docs/runbooks/quick-deploy.md:30`).
