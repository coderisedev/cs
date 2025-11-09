# DJI Storefront – Next.js Deployment Guide

Last updated: 2025-11-09

## 1. Environment variables

Copy `apps/dji-storefront/env.production.example` → `.env.production` (or configure these in your hosting provider):

| Variable | Value for production | Notes |
| -------- | -------------------- | ----- |
| `MEDUSA_BACKEND_URL` | `https://api.aidenlux.com` | Medusa REST base. HTTPS must terminate before reaching the server (Cloudflare Tunnel). |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_live_…` | Create in Medusa Admin → Settings → Publishable API Keys. Exposed to the browser. |
| `NEXT_PUBLIC_DEFAULT_REGION` | `us` (or relevant region code) | Used when cookies / geolocation don’t specify a region. |
| `STRAPI_API_URL` | `https://content.aidenlux.com` | Strapi CMS base. |
| `STRAPI_API_TOKEN` | `strapi_…` | Strapi “Global API token” with `find`/`findOne` scope on Posts. Keep private. |
| `REVALIDATE_SECRET` | random string | Shared with Strapi’s webhook so `/api/revalidate` can bust cached blog pages. |

> **Tip:** `REVALIDATE_SECRET` should be long + random. On Linux/macOS: `python3 - <<'PY'\nimport secrets\nprint(secrets.token_urlsafe(48))\nPY`

## 2. Local verification before deploy

```bash
pnpm install                   # install workspace deps
pnpm --filter dji-storefront lint
pnpm --filter dji-storefront test:mock-medusa
pnpm --filter dji-storefront build
pnpm --filter dji-storefront start  # http://localhost:3000
```

Smoke test:

- `/` landing page hits the live Medusa `/store/products`.
- `/products` lists real inventory.
- `/us/blog` pulls posts from Strapi (requires valid token).

## 3. Deploying to Vercel / Next.js hosting

1. **Create the project**
   - `vercel link` in repo root or import via Vercel dashboard (select `apps/dji-storefront` as root).
2. **Build settings**
   - Framework: **Next.js**
   - Root directory: `apps/dji-storefront`
   - Install Command: `pnpm install`
   - Build Command: `pnpm --filter dji-storefront build`
   - Output Directory: `apps/dji-storefront/.next`
   - Set `NODE_ENV=production`, `PNPM_HOME` if needed.
3. **Environment variables**
   - Add all variables from `.env.production`.
   - Mark `STRAPI_API_TOKEN`, `REVALIDATE_SECRET` as “Encrypted”.
   - (Optional) add `NEXT_TELEMETRY_DISABLED=1`.
4. **Preview branch policy**
   - Optionally use mock data for preview deploys by omitting live tokens (set `USE_MOCK_DATA=true`).

## 4. Strapi → Next.js cache busting

1. In Strapi Admin → Settings → Webhooks, create a webhook:
   - URL: `https://<your-next-domain>/api/revalidate?tag=blog&secret=<REVALIDATE_SECRET>`
   - Events: `Entry publish`, `Entry unpublish`, `Entry delete` for `Post`.
2. Ensure Next.js API route `/api/revalidate` uses the same secret (already wired in project).

## 5. Cloudflare / CDN hints

- Because upstream Medusa/Strapi already sit behind Cloudflare Tunnel, the Next.js app should also be fronted by a CDN (Vercel handles this automatically).
- If hosting on your own infra, put the domain behind Cloudflare and cache static assets (`/_next/static/*`) aggressively.

## 6. Post-deploy validation

- Visit `https://<deploy-domain>/` → confirm hero data matches live Medusa products.
- Check `/us/blog` renders Strapi content and the revalidate API route returns `200` when triggered manually.
- Monitor logs for failed requests to `/store/products` or `/api/revalidate` (missing env vars show up as 500s).

## 7. Rollback plan

- Keep the previous Vercel deployment (or previous Docker image) marked as “Production”. If the new deploy fails, restore with `vercel rollback`.
- Because environment variables are centrally managed, ensure the old deploy still has valid tokens if you roll back.

Feel free to adapt these steps if you host on another platform (Netlify, Render). The critical pieces are the env vars, the build command, and ensuring Cloudflare tunnels remain the source of truth for Medusa/Strapi endpoints.
