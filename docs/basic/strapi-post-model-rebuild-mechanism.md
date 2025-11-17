---
last_updated: 2025-11-17
status: ✅ Active
related_docs:
  - docs/runbooks/rebuild-strapi-medusa-images.md
  - docs/fix/2025-11-09-strapi-admin-login.md
---

# Strapi Post Model Rebuild Mechanism

## Context
When we edited the Post collection type (`apps/strapi/src/api/post/content-types/post/schema.json`) the production GCE deployment did not pick up the changes until we rebuilt the Strapi Docker image. This note explains why the rebuild is required and what happens during that process.

## Why a Rebuild Is Required
- The production `strapi` service mounts only the named Docker volume `strapi_uploads_prod` as a writable location; the application code comes entirely from the `cs-strapi:prod` image.
- Content-type definitions, controllers, and admin UI assets are bundled during `strapi build`, which runs as part of the Dockerfile. Once the image is built, the running container never reads the repo on the host.
- Therefore, editing schema files in the repository has no effect on an existing container. Rebuilding the image is how we package the updated schema and regenerate Strapi's caches/admin bundle.

## What Happens During `docker build`
1. The Dockerfile copies the entire monorepo into `/app` inside the builder stage.
2. `pnpm install --filter strapi... --frozen-lockfile` installs dependencies for the Strapi workspace.
3. `pnpm --filter strapi build` executes `strapi build`, which:
   - Compiles the React-based admin panel, embedding the latest content-type metadata (so the UI knows Post fields/validations).
   - Generates backend bootstrap files (`.cache/.tmp`) registering routes, controllers, and database mappings for the updated content-types.
4. The runner stage copies the compiled app, node_modules, and workspace files into `/srv/app`, producing an immutable image layer with the new schema baked in.

## Deploying the Updated Model
1. `set -a && source deploy/gce/.env.prod && set +a && docker build -f apps/strapi/Dockerfile -t "$STRAPI_IMAGE" .`
2. `docker compose -p cs-prod --env-file deploy/gce/.env.prod -f deploy/gce/prod/docker-compose.yml up -d strapi`
3. The new container starts with the rebuilt admin bundle and backend cache, so the Post content type immediately reflects the schema changes (no manual migration steps needed if the database already has matching columns).

## Key Takeaways
- Treat Strapi content-type JSON files as source code: they only take effect after `strapi build`.
- Always rebuild and redeploy the image whenever we change anything under `apps/strapi/src/api/**/content-types/**`.
- The uploads volume can stay mounted; only the application layers need recycling to absorb schema updates.
