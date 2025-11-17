# Discord OAuth Launch – Dev Instance Retrospective

**Date:** 2025-11-16  
**Owner:** Codex (on behalf of Aiden Lux)  
**Scope:** Full-page Discord OAuth for DJI Storefront (`https://dev.aidenlux.com`)

---

## Context

- ADR-001/002 anchor the Next.js + Medusa architecture; discord SSO had been deferred (ADR-005).  
- Google login already used a custom callback (`apps/medusa/src/api/auth/customer/google/callback/route.ts`) that minted a Medusa-compatible JWT. Discord initially reused the provider service directly, which returned only an auth identity and triggered 401s once the storefront hit `/store/customers/me`.  
- The storefront also ran under `https://dev.aidenlux.com` while Next dev server listened on `https://localhost:3000`, causing redirect origin mismatches and cookies scoped to `localhost`.

## What We Shipped

1. **Stateful Medusa provider**  
   - `apps/medusa/src/modules/auth-discord/service.ts` now mirrors Google’s start flow: generate `state`, persist `{ callback_url }`, return Discord’s consent URL.  
   - `deploy/gce/.env` updated so `DISCORD_OAUTH_CALLBACK_URL=https://dev.aidenlux.com/auth/discord/callback`, aligning Medusa with the dev domain.

2. **Custom Discord callback (Medusa)**  
   - Added `apps/medusa/src/api/auth/customer/discord/callback/route.ts`.  
   - Exchanges the Discord code, fetches the profile, ensures `customer` exists via `Modules.CUSTOMER`, then signs a JWT (HS256, 7‑day TTL) identical to Google’s format.  
   - Returns `{ token, state }` so `sdk.auth.callback("customer","discord",…)` in Next receives a usable JWT.

3. **Storefront plumbing**  
   - `/auth/[provider]` & `/auth/[provider]/callback` now build absolute redirects via `resolveBaseUrl`, honoring `STOREFRONT_BASE_URL` or `x-forwarded-*` headers.  
   - `apps/dji-storefront/src/lib/server/cookies.ts` sets `_medusa_jwt`/`_medusa_cart_id` with `domain=dev.aidenlux.com` when `STOREFRONT_BASE_URL` (or `AUTH_COOKIE_DOMAIN`) is present, fixing cookie scope.  
   - `.env.local` includes `STOREFRONT_BASE_URL=https://dev.aidenlux.com`.  
   - Login UI switched to full-page navigation, matching the “no popup” preference.

4. **Infra**  
   - Rebuilt `cs-medusa:prod` with the new callback logic and recycled the `medusa` container (`docker compose -f deploy/gce/docker-compose.yml up -d medusa`).

## Validation

- Browser test: `https://dev.aidenlux.com/us/login` → “Sign in with Discord” → Discord consent → callback → lands on `/us/account` already authenticated (no extra `/us/login` hop).  
- Verified `_medusa_jwt` cookie domain is `.dev.aidenlux.com`; server requests from the account page include `Authorization: Bearer <JWT>` and return 200.  
- Medusa logs show paired 200s:
  - `POST /auth/customer/discord` returns authorize URL.
  - `GET /auth/customer/discord/callback?...` 200 (token issued).  
- Manual `curl -X POST http://localhost:9000/auth/customer/discord` shows JSON with Discord authorize URL, confirming start endpoint no longer returns 401.  
- After callback, `/store/customers/me` logs moved from 401 to 200 during local verification (QA repeated on dev domain by user).

## Remaining Follow-ups

- Document the callback pattern for Facebook before implementation.  
- Consider a dedicated ADR updating ADR-005 (Discord SSO is now live for dev).  
- Add an automated smoke test (Playwright) that hits `/auth/discord` in staging once credentials can be stored securely.  
- Clean up `.claude/settings.local.json` change before committing (local-only).  
- When production goes live, set `DISCORD_OAUTH_CALLBACK_URL=https://prd.aidenlux.com/auth/discord/callback` and ensure `AUTH_COOKIE_DOMAIN=.aidenlux.com` to share cookies across locales.
