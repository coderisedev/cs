# GCP Production Runtime Playbook

This folder provides the files that must exist on the production GCE host under `/srv/cs`.  They match the expectations in `docs/gcp.md` and Story 1.6 acceptance criteria.

## Directory Layout

```
/srv/cs
├── .env                     # Copied from .env.example; sets TAG + image registries
├── docker-compose.yml       # From docker-compose.yml in this folder
├── env/
│   ├── medusa.env           # Based on env/medusa.env.example
│   └── strapi.env           # Based on env/strapi.env.example
└── bin/
    └── collect-health.sh    # Optional helper for recording health probes
```

Copy the examples from this directory, fill in production values, and restrict permissions so only the deployment user can read the files (`chmod 600`).

## 1. Host Preparation (AC1 / Tasks 1.x)

1. Create the `/srv/cs` directory structure and copy these templates.
2. Install Docker Engine and the Compose plugin on the Ubuntu host.
3. Install and harden PostgreSQL and Redis on the host:
   - Postgres 15: set `listen_addresses='127.0.0.1'` and restrict `pg_hba.conf` to loopback clients.
   - Redis 7: configure `bind 127.0.0.1`, `protected-mode yes`, and an optional password.
   - Allow container access via the `host.docker.internal` alias (Compose template already maps the host gateway).
4. Ensure the deployment user is in the `docker` group and owns `/srv/cs`.

## 2. Docker Compose Lifecycle

The root `.env` file drives Compose variables:

```
MEDUSA_IMAGE=ghcr.io/<org>/cs-medusa
STRAPI_IMAGE=ghcr.io/<org>/cs-strapi
TAG=<commit-sha>
```

Deployment automation updates `TAG` on each release, then runs `docker compose pull && docker compose up -d`.

Use the helper script after a deployment to record health evidence:

```
/bin/bash bin/collect-health.sh > logs/health-$(date +%Y%m%dT%H%M%S).log
```

## 3. Cloudflare Tunnel Integration (AC2 / Tasks 2.x)

1. Authenticate the Cloudflare CLI (`cloudflared login`).
2. Create the tunnel once:
   ```bash
   cloudflared tunnel create cs-tunnel
   ```
3. Update `/etc/cloudflared/config.yml` so the Anycast endpoints forward to the GCE host:
   ```yaml
   tunnel: cs-tunnel
   credentials-file: /etc/cloudflared/cs-tunnel.json
   ingress:
     - hostname: api.example.com
       service: http://127.0.0.1:9000
     - hostname: content.example.com
       service: http://127.0.0.1:1337
     - service: http_status:404
   ```
4. Register DNS routes:
   ```bash
   cloudflared tunnel route dns cs-tunnel api.example.com
   cloudflared tunnel route dns cs-tunnel content.example.com
   ```
5. Enable the systemd unit:
   ```bash
   sudo systemctl enable --now cloudflared
   sudo systemctl status cloudflared
   ```
6. Record the commands, Anycast IPs, and verification curl output in the deployment status log (`docs/runbooks/status-log.md`).

## 4. Deployment Automation Hook (AC3 / Tasks 3.x)

The GitHub Actions workflow (`.github/workflows/deploy-services.yml`) copies `scripts/gce/deploy.sh` to the host and runs it with the new image tag.  Ensure the following secrets are present in the repository so the workflow can authenticate:

- `GCE_HOST` – public IP or hostname
- `GCE_USER` – deployment user on the VM
- `GCE_SSH_KEY` – private key with access to the host
- `GHCR_WRITE_TOKEN` (optional) if the default `GITHUB_TOKEN` cannot push to GHCR

Populate the root `.env` with the GHCR image prefixes before running the workflow for the first time.

## 5. Documentation & Evidence (AC4 / Tasks 4.x)

- Platform engineers should mirror the production environment variables into local `.env` files using the templates for consistency.
- Update `docs/runbooks/status-log.md` after each deployment with:
  - Image tags pushed to GHCR (`cs-medusa`, `cs-strapi`)
  - Output of `collect-health.sh`
  - Links to the GitHub Actions run
  - Tunnel verification snapshots or curl output

## 6. Rollback

To roll back manually:

```bash
cd /srv/cs
sed -i "s/^TAG=.*/TAG=<previous-sha>/" .env
docker compose pull
docker compose up -d
/bin/bash bin/collect-health.sh
```

Document the rollback in the status log and notify the team via the chosen incident channel.
