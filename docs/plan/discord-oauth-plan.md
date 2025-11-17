# Discord OAuth Integration Plan

## Goal
Rebuild the Discord login flow so it mirrors the proven Google OAuth implementation (per `docs/basic/google-oauth-login-flow.md`), delivering a full-page, stateful OAuth experience that ends with a Medusa-issued JWT and storefront redirect.

## Workstream

1. **Mirror Google architecture**
   - Study `/auth/google` and `/auth/google/callback` plus Medusa’s `@medusajs/auth-google` behaviour.
   - Identify every touchpoint: Next.js routes, login UI, Medusa provider module, env vars.

2. **Frontend revisions (Next.js)**
   - `/auth/[provider]`: store `state -> returnTo` cookie, call Medusa `/auth/customer/discord`, 302 to Discord consent.
   - `/auth/[provider]/callback`: read state, call `sdk.auth.callback("customer","discord", query)`, set `_medusa_jwt`, revalidate cache tags, run `transferCart`, 302 to `returnTo`.
   - Ensure buttons in `LoginClient` use full-page navigation (no popup/postMessage) and obey `NEXT_PUBLIC_ENABLE_DISCORD_OAUTH`.

3. **Medusa provider updates**
   - Refactor `apps/medusa/src/modules/auth-discord/service.ts`: `authenticate` emits Discord authorize URL, `validateCallback` exchanges code, fetches profile, persists auth identity.
   - Confirm env wiring (`DISCORD_CLIENT_ID/SECRET/OAUTH_CALLBACK_URL`) through `medusa-config.ts` and docker-compose env.

4. **Build & deploy**
   - Rebuild `cs-medusa:prod`, restart `medusa` service so `.medusa/server` includes new logic.
   - `pnpm --filter medusa build` for local verification.
   - Update env templates + README with final Discord vars.

5. **Validation & logging**
   - Exercise `/auth/discord?returnTo=/us/account` in staging; monitor browser network + `docker compose logs medusa`.
   - Add log hooks mirroring Google (success/failure messages, state storage).
   - Document manual QA steps/runbook for future credential rotation and troubleshooting.
