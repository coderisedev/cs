# syntax=docker/dockerfile:1.5

FROM node:20-bookworm-slim AS builder

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
ENV PNPM_NODE_LINKER=hoisted
ENV NODE_PATH=/app/apps/medusa/node_modules:/app/node_modules/.pnpm/node_modules

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential python3 ca-certificates git \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable \
  && corepack prepare pnpm@10.18.2 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/medusa/package.json apps/medusa/package.json
COPY apps/strapi/package.json apps/strapi/package.json
COPY packages packages
COPY scripts scripts

# Copy the rest of the workspace to ensure shared packages are available
COPY . .

RUN pnpm install --frozen-lockfile \
  && pnpm --filter medusa build \
  && mkdir -p apps/medusa/public \
  && cp -a apps/medusa/.medusa/server/public/. apps/medusa/public/

FROM node:20-bookworm-slim AS runner

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=${PNPM_HOME}:${PATH}
ENV PNPM_NODE_LINKER=hoisted
ENV NODE_ENV=production
ENV NODE_PATH=/srv/app/apps/medusa/node_modules:/srv/app/node_modules/.pnpm/node_modules
ENV CI=true

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

RUN pnpm install --filter medusa --prod --frozen-lockfile

EXPOSE 9000

CMD ["pnpm", "--filter", "medusa", "start"]
