# GCE Deployment (Medusa + Strapi)

This folder provides Docker Compose manifests for running the Medusa backend and Strapi CMS on a single GCE VM. PostgreSQL and Redis are assumed to run directly on the host (or a managed service), while media assets are stored on Cloudflare R2 via the S3-compatible API.

## Files
- `prod/docker-compose.yml` – production Medusa/Strapi stack (ports 9000/1337).
- `dev/docker-compose.yml` – development Medusa/Strapi stack (ports 9001/1338) that points to dev DBs and DNS.
- `.env.example` – template containing all required environment variables (DB URLs, Redis, R2 credentials, secrets). Copy to `.env.prod` (and optionally `.env.dev`) and customize before running compose.
- `.env.prod` – production secrets (not committed).
- `.env.dev` – development secrets (not committed).

## Usage
1. On the deployment server, clone the repo and switch to this directory:
   ```bash
   cd /srv/cs/deploy/gce
   cp .env.example .env.prod  # production
   cp .env.example .env.dev   # optional dev sandbox
   # edit the files with the appropriate values
   ```
2. Build or pull your production images. For example:
   ```bash
   docker build -t cs-medusa:prod ../../apps/medusa
   docker build -t cs-strapi:prod ../../apps/strapi
   ```
   Or set `MEDUSA_IMAGE` / `STRAPI_IMAGE` in `.env.prod` to point to images hosted on GHCR/Docker Hub.
3. Start the production services:
   ```bash
   docker compose -p cs-prod --env-file ./.env.prod -f prod/docker-compose.yml up -d
   ```
   (Dev stack: `docker compose -p cs-dev --env-file ./.env.dev -f dev/docker-compose.yml up -d`)
   The repo root also provides `make prod-up`, `make prod-down`, `make dev-up`, etc., as shortcuts.
4. Verify:
   - `curl http://127.0.0.1:9000/health`
   - `curl http://127.0.0.1:1337/health`
5. Point your Cloudflare Tunnel mappings to `http://127.0.0.1:9000` (Medusa) and `http://127.0.0.1:1337` (Strapi).

## Notes
- Strapi uploads are sent to R2. Named Docker volumes (`strapi_uploads_prod`, `strapi_uploads_dev`) only provide a cache/scratch space.
- When you later migrate PostgreSQL/Redis to managed services, update the relevant URLs in `.env.prod`/`.env.dev` and restart the containers.
- To re-run Strapi or Medusa seeds, use `docker compose exec strapi sh` or `docker compose exec medusa sh` and run the seed scripts inside.
