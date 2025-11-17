# Discord OAuth Flow – Implementation Deep Dive

**Project:** cs  
**Date:** 2025-11-16  
**Audience:** Dev & Product leads seeking a concrete understanding of how Discord login works end-to-end in this repo.

---

## 1. Entry Point – Storefront Login

- `apps/dji-storefront/src/components/auth/login-client.tsx` renders `OAuthPopupButton` for Discord.  
- Button click performs a full-page navigation to `/auth/discord?returnTo=/us/account` on the current origin (e.g., `https://dev.aidenlux.com`).  
- No popups: user experience stays in one tab, matching product preference.

---

## 2. Next.js Route `/auth/[provider]`

File: `apps/dji-storefront/src/app/auth/[provider]/route.ts`

1. Validates provider (`discord`) using `getOAuthProviderConfig`.  
2. Sanitizes `returnTo` (defaults to `/us/account`).  
3. Calls Medusa’s start endpoint:
   ```http
   POST https://api.aidenlux.com/auth/customer/discord
   Headers: x-publishable-api-key, content-type
   Body: {}
   ```
4. Medusa responds with Discord’s authorize URL and `state`.  
5. Next stores `state -> returnTo` in a cookie (`discord_oauth_state_<state>`) and issues `302` to the Discord consent page.

---

## 3. Medusa Provider – Start Phase

File: `apps/medusa/src/modules/auth-discord/service.ts`

- `authenticate()` now mirrors Google’s implementation: generate random `state`, persist `{ callback_url }` via `authIdentityService.setState`, build Discord’s authorize URL with `client_id`, `scope`, and `state`.  
- `deploy/gce/.env` sets `DISCORD_OAUTH_CALLBACK_URL=https://dev.aidenlux.com/auth/discord/callback`, so dev flows always return to the dev domain.  
- Environment alignment is critical—without it Discord would redirect to the old prod callback.

---

## 4. Discord Consent

- The user authorizes `client_id=1439560846819721438`.  
- Discord redirects back to `https://dev.aidenlux.com/auth/discord/callback?code=...&state=...`.

---

## 5. Next.js Callback `/auth/[provider]/callback`

File: `apps/dji-storefront/src/app/auth/[provider]/callback/route.ts`

1. Resolves `returnTo` from the state cookie; deletes the cookie afterward.  
2. Forwards Discord query params to Medusa via `sdk.auth.callback("customer","discord", query)`.  
3. Waits for a JWT token; on success:
   - Persists `_medusa_jwt` cookie using `setAuthToken` (HttpOnly, SameSite=Lax, `domain=dev.aidenlux.com`).  
   - Calls `transferCart(token)` and revalidates `customers` cache tag.  
   - Verifies session by hitting `/store/customers/me`; attempts customer bootstrap if Medusa still returns 401.  
4. Redirects to the absolute URL derived from `returnTo` + `STOREFRONT_BASE_URL`.  

**Cookie domain fix:** `apps/dji-storefront/src/lib/server/cookies.ts` now derives a shared `COOKIE_DOMAIN` from `STOREFRONT_BASE_URL` / `AUTH_COOKIE_DOMAIN`, ensuring SSR requests on `/us/account` read the same `_medusa_jwt`.

---

## 6. Medusa Callback Route (Custom)

File: `apps/medusa/src/api/auth/customer/discord/callback/route.ts`

> Matches the approach taken for Google:

1. Reads `DISCORD_CLIENT_ID/SECRET/OAUTH_CALLBACK_URL` + optional `DISCORD_SCOPE`.  
2. Exchanges the authorization code with Discord (`POST https://discord.com/api/oauth2/token`).  
3. Fetches the user profile (`GET https://discord.com/api/users/@me`) and validates `email` + `verified`.  
4. Ensures a Medusa customer exists via `Modules.CUSTOMER` (creates one if missing).  
5. Signs a HS256 JWT (7-day TTL) with payload:
   ```json
   {
     "actor_type": "customer",
     "actor_id": "cus_...",
     "provider": "discord",
     "sub": "1360083079884046346",
     "email": "...",
     "username": "aidenlux",
     "iat": 1731778300,
     "exp": 1732383100
   }
   ```
6. Returns `{ token, state }`. The JS SDK unwraps this and passes the bare token back to Next.

---

## 7. Post-Login Experience

- The user lands on `/us/account` (or `returnTo`). Because `_medusa_jwt` lives on `dev.aidenlux.com`, all server components and API calls include `Authorization: Bearer <token>` + `x-publishable-api-key`.  
- Medusa now responds with 200 for `/store/customers/me`, `/store/orders`, etc.  
- The prior redirect loop (landing back on `/us/login`) is resolved.

---

## Validation & Observability

- `curl -X POST http://localhost:9000/auth/customer/discord` returns the authorize URL → start flow works.  
- Browser QA confirms `GET /auth/discord/callback` followed by `302` to `/us/account` with an authenticated session.  
- Medusa logs show paired 200s:
  - `POST /auth/customer/discord`  
  - `GET /auth/customer/discord/callback?...`
- Storefront dev logs show `_medusa_jwt` cookie set for `dev.aidenlux.com` and `/store/customers/me` returning 200 after the callback.

---

## Key Takeaways

1. **Stateful provider start**: Always persist `state` + callback URL on Medusa to support multiple origins (dev vs prod).  
2. **Custom callback**: When Medusa providers don’t emit a JWT by default, add an API route under `apps/medusa/src/api/auth/.../callback` to mint tokens yourself (same pattern as Google).  
3. **Cookie alignment**: Authentication only “sticks” if the cookie domain matches the user-facing domain; use `STOREFRONT_BASE_URL`/`AUTH_COOKIE_DOMAIN` to keep Next’s server actions and SSR in sync.  
4. **Full-page redirects**: Avoid popup race conditions by keeping the entire OAuth experience in the main window.  
5. **Testing**: After each change, rebuild `cs-medusa:prod`, restart `medusa` (`docker compose -f deploy/gce/docker-compose.yml up -d medusa`), then run the flow on `https://dev.aidenlux.com` while tailing `docker compose logs medusa`.

This doc, coupled with `docs/done/discord-oauth-retro.md`, should give you both the timeline (retro) and the mechanics (this file) needed to reason about Discord SSO in this project.
