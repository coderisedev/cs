# Strapi Admin Login Incident – 2025-11-09

## Summary
- **Symptom**: Logging into `https://content.aidenlux.com/admin` returned “Internal Server Error” and Strapi logs showed `Failed to create admin refresh session Cannot send secure cookie over unencrypted connection`.
- **Impact window**: First noticed after the GCE deployment (UTC 2025-11-09 ~02:30) until config fix applied (UTC ~03:08). Strapi admin unavailable for initial administrator creation/login.

## Root Cause
- Strapi 5 sets admin refresh cookies with `secure: true` whenever `NODE_ENV=production`.
- Our deployment terminates TLS at Cloudflare Tunnel; Strapi only receives plain HTTP from cloudflared and does **not** automatically trust the proxy. As a result, Koa rejected setting secure cookies (“cannot send secure cookie over unencrypted connection”), causing the admin login flow to fail with HTTP 500.

## What Was Fixed
1. **Proxy Awareness**  
   - `apps/strapi/config/server.ts` updated to expose `url` and `proxy` properties deriving from `STRAPI_ADMIN_BACKEND_URL` / `STRAPI_ENABLE_PROXY`. This lets Strapi understand the public HTTPS origin and treat Cloudflare as a trusted proxy.
2. **Cookie Policy Override**  
   - Added `admin.auth.cookie.secure` override in `apps/strapi/config/admin.ts`, controllable via `ADMIN_COOKIE_SECURE`.  
   - For the Cloudflare tunnel, `deploy/gce/.env` sets `ADMIN_COOKIE_SECURE=false`, allowing Strapi to emit cookies even though the immediate connection is HTTP.
3. **Secret Refresh & Redeploy**  
   - Rotated all placeholder secrets in `deploy/gce/.env` (JWTs, salts, webhook, etc.) and rebuilt both Medusa/Strapi production images to ensure consistent config.
4. **Config propagation**  
   - Rebuilt `cs-strapi:prod`, ran `docker compose up -d`, verified logs show the admin URL and no further cookie errors.

## Verification
- `docker compose logs strapi` now reports “Welcome back! … https://content.aidenlux.com/admin” with no cookie errors.
- Browser login to `https://content.aidenlux.com/admin` succeeds through Cloudflare tunnel.

## Lessons / Follow-ups
1. **Proxy defaults**: Strapi doesn’t auto-detect Cloudflare tunnels. Future deployments must always set `server.proxy=true` (or equivalent) and provide the public URL.
2. **Cookie flexibility**: Keep `ADMIN_COOKIE_SECURE` configurable. When moving behind a TLS-terminating proxy, set it to `false` *only* if the proxy path is fully trusted.
3. **Secrets hygiene**: Avoid shipping placeholder secrets in `.env`. Automate generation (e.g., `secrets.token_urlsafe`) before first deploy.
