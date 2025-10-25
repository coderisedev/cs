# syntax=docker/dockerfile:1.5

FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential python3 ca-certificates git \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.18.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/strapi/package.json apps/strapi/package.json
COPY apps/medusa/package.json apps/medusa/package.json
COPY packages packages
COPY scripts scripts

COPY . .

RUN pnpm install --filter strapi... --frozen-lockfile \
  && pnpm --filter strapi build

FROM node:20-bookworm-slim AS runner

ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="$PNPM_HOME:$PATH" \
    NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl libpq5 \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

WORKDIR /srv/app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

EXPOSE 1337

CMD ["pnpm", "--filter", "strapi", "start"]
