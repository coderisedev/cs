# Deployment Plan: Medusa & Strapi on GCE (Docker + R2 + CF Tunnel)

## 1. Environment Overview
- **Server**: GCP Compute Engine running Docker (docker-compose v3.9).
- **Databases**: PostgreSQL + Redis installed directly on host (127.0.0.1). Future migration to managed services is straightforward by updating connection strings.
- **Media Storage**: Cloudflare R2 (S3 compatible) with a public CDN domain (e.g., `https://img.example-cdn.com`).
- **Ingress**: Cloudflare Tunnel terminates TLS and forwards traffic to `http://127.0.0.1:9000` (Medusa) and `http://127.0.0.1:1337` (Strapi).
- **Code**: Repo cloned on the server at `/srv/cs`, containers built locally or pulled from registry.

## 2. Directory Layout
```
/srv/cs/
  docker-compose.yml
  .env
  strapi/uploads/           # optional local cache
  apps/... (optional)       # source if building locally
```

## 3. Environment Variables (.env)
```env
# Generic
NODE_ENV=production
PORT=9000
PORT_STRAPI=1337

# Database (host-level Postgres)
DATABASE_URL=postgres://medusa_user:pass@127.0.0.1:5432/medusa_prod
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME_STRAPI=strapi_prod
DATABASE_USERNAME_STRAPI=strapi_user
DATABASE_PASSWORD_STRAPI=pass

# Redis
REDIS_URL=redis://127.0.0.1:6379/0

# Medusa secrets
MEDUSA_BACKEND_URL=https://api.example.com
JWT_SECRET=...
COOKIE_SECRET=...
STRAPI_WEBHOOK_SECRET=...

# Strapi secrets
APP_KEYS=key1,key2
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
STRAPI_ADMIN_BACKEND_URL=https://cms.example.com
STRAPI_URL=https://cms.example.com

# Cloudflare R2 (S3 compatible)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=yyy
R2_SECRET_ACCESS_KEY=zzz
R2_BUCKET=cs-assets
R2_ENDPOINT=https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://img.example-cdn.com

# Map for Strapi provider-upload
AWS_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
AWS_ACCESS_SECRET=${R2_SECRET_ACCESS_KEY}
AWS_BUCKET_NAME=${R2_BUCKET}
AWS_ENDPOINT=${R2_ENDPOINT}
AWS_PUBLIC_URL=${R2_PUBLIC_URL}

# Map for Medusa S3 file service
MEDUSA_S3_BUCKET=${R2_BUCKET}
MEDUSA_S3_ENDPOINT=${R2_ENDPOINT}
MEDUSA_S3_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
MEDUSA_S3_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
MEDUSA_S3_REGION=auto
```

## 4. docker-compose.yml (Medusa + Strapi only)
```yaml
version: "3.9"
services:
  medusa:
    image: cs-medusa:prod    # build or pull beforehand
    container_name: medusa
    restart: unless-stopped
    env_file: .env
    environment:
      PORT: ${PORT:-9000}
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      S3_BUCKET: ${MEDUSA_S3_BUCKET}
      S3_ENDPOINT: ${MEDUSA_S3_ENDPOINT}
      S3_ACCESS_KEY_ID: ${MEDUSA_S3_ACCESS_KEY_ID}
      S3_SECRET_ACCESS_KEY: ${MEDUSA_S3_SECRET_ACCESS_KEY}
      S3_REGION: ${MEDUSA_S3_REGION:-auto}
    ports:
      - "9000:9000"
    networks: [cs-net]

  strapi:
    image: cs-strapi:prod
    container_name: strapi
    restart: unless-stopped
    env_file: .env
    environment:
      NODE_ENV: production
      PORT: ${PORT_STRAPI:-1337}
      HOST: 0.0.0.0
      DATABASE_CLIENT: postgres
      DATABASE_HOST: ${DATABASE_HOST}
      DATABASE_PORT: ${DATABASE_PORT}
      DATABASE_NAME: ${DATABASE_NAME_STRAPI}
      DATABASE_USERNAME: ${DATABASE_USERNAME_STRAPI}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD_STRAPI}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_ACCESS_SECRET: ${AWS_ACCESS_SECRET}
      AWS_BUCKET_NAME: ${AWS_BUCKET_NAME}
      AWS_ENDPOINT: ${AWS_ENDPOINT}
      AWS_PUBLIC_URL: ${AWS_PUBLIC_URL}
    ports:
      - "1337:1337"
    volumes:
      - ./strapi/uploads:/app/public/uploads
    networks: [cs-net]

networks:
  cs-net:
    driver: bridge
```
> Note: Ports can be bound to `127.0.0.1:9000:9000` if Cloudflare Tunnel is the only ingress. Update images and commands as needed.

## 5. Deployment Steps
1. Fill `.env` with accurate DB/Redis/R2/secret values.
2. Build/pull Docker images:
   ```bash
   docker build -t cs-medusa:prod ./apps/medusa
   docker build -t cs-strapi:prod ./apps/strapi
   ```
3. Start services:
   ```bash
   docker compose up -d
   ```
4. Verify health endpoints:
   - `curl http://127.0.0.1:9000/health`
   - `curl http://127.0.0.1:1337/health`
5. Configure Cloudflare Tunnel mappings: `api.example.com -> http://127.0.0.1:9000`, `cms.example.com -> http://127.0.0.1:1337`.
6. Test Strapi Admin uploads and Medusa product media to ensure R2 receives files and CDN serves them.

## 6. Maintenance & Future Migration
- Updating images: `docker compose pull` (or rebuild) → `docker compose up -d`.
- Migrating DB/Redis to managed services: only update `.env` connection strings.
- Add backups for `/srv/cs/strapi/uploads` (optional) and Cloudflare R2 bucket.
- Document Strapi seed scripts (`strapi console` + `seedNewReleases`) for future schema changes.
