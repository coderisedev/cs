# GCE Deployment (Medusa + Strapi)

This folder provides a minimal Docker Compose setup for running the Medusa backend and Strapi CMS on a single GCE VM. PostgreSQL and Redis are assumed to run directly on the host (or a managed service), while media assets are stored on Cloudflare R2 via the S3-compatible API.

## Files
- `docker-compose.yml` – starts `medusa` and `strapi` containers only.
- `.env.example` – template containing all required environment variables (DB URLs, Redis, R2 credentials, secrets). Copy to `.env` and customize before running compose.

## Usage
1. On the deployment server, clone the repo and switch to this directory:
   ```bash
   cd /srv/cs/deploy/gce
   cp .env.example .env
   # edit .env with production values
   ```
2. Build or pull your production images. For example:
   ```bash
   docker build -t cs-medusa:prod ../../apps/medusa
   docker build -t cs-strapi:prod ../../apps/strapi
   ```
   Or set `MEDUSA_IMAGE` / `STRAPI_IMAGE` in `.env` to point to images hosted on GHCR/Docker Hub.
3. Start the services:
   ```bash
   docker compose up -d
   ```
4. Verify:
   - `curl http://127.0.0.1:9000/health`
   - `curl http://127.0.0.1:1337/health`
5. Point your Cloudflare Tunnel mappings to `http://127.0.0.1:9000` (Medusa) and `http://127.0.0.1:1337` (Strapi).

## Notes
- Strapi uploads are sent to R2. The local `./strapi/uploads` volume is only a cache/scratch space.
- When you later migrate PostgreSQL/Redis to managed services, update the relevant URLs in `.env` and restart the containers.
- To re-run Strapi or Medusa seeds, use `docker compose exec strapi sh` or `docker compose exec medusa sh` and run the seed scripts inside.
