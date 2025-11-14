# Rebuilding Strapi & Medusa Images

Use this runbook whenever you change source code under `apps/strapi` or `apps/medusa`. Production containers read the code baked into their Docker images, so you must rebuild and restart the service for changes to take effect.

## Prerequisites
- Work from the repo root.
- Ensure `deploy/gce/.env` contains the desired `STRAPI_IMAGE` and `MEDUSA_IMAGE` tags (defaults are `cs-strapi:prod` and `cs-medusa:prod`).
- Docker daemon access on the build host.

## Common Environment Setup
```bash
cd /home/coderisedev/cs
set -a && source deploy/gce/.env && set +a
```
Sourcing the env file exports the image tags so the subsequent `docker build` commands target the correct names.

## Strapi Rebuild & Restart
1. Build the image from the workspace context:
   ```bash
   docker build -f apps/strapi/Dockerfile -t "$STRAPI_IMAGE" .
   ```
   (Alternative: `docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env build strapi`.)
2. Restart the container with the fresh image:
   ```bash
   docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env up -d strapi
   ```
3. Validate:
   ```bash
   docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env logs -f strapi
   ```

## Medusa Rebuild & Restart
1. Build the image:
   ```bash
   docker build -f apps/medusa/Dockerfile -t "$MEDUSA_IMAGE" .
   ```
   (Alternative: `docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env build medusa`.)
2. Restart the container:
   ```bash
   docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env up -d medusa
   ```
3. Validate:
   ```bash
   docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env logs -f medusa
   ```

## Full Stack Restart (Optional)
After rebuilding one or both images you can bring everything up together:
```bash
docker compose -f deploy/gce/docker-compose.yml --env-file deploy/gce/.env up -d
```

## Post-Deploy Checks
- `curl http://127.0.0.1:1337/health` for Strapi.
- `curl http://127.0.0.1:9000/health` for Medusa.
- `docker images "$STRAPI_IMAGE"` / `docker images "$MEDUSA_IMAGE"` to confirm timestamps.
