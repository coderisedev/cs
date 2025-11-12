# Google OAuth Login Flow – DJI Storefront x Medusa v2

Last updated: 2025-11-12

## Overview

This document describes how our Next.js storefront (apps/dji-storefront) integrates Google
OAuth with Medusa v2. It covers actors, configuration, step-by-step (popup + full-page)
sequence, critical headers/cookies, common pitfalls, and validation checks.

## Actors

- Browser: main window on `/us/login` (Next.js App Router)
- Popup window: `/auth/google` and `/auth/google/callback`
- Next server routes (Vercel Functions):
  - `/auth/google` (initiate OAuth)
  - `/auth/google/callback` (handle Google callback and exchange token)
  - `/api/auth/session` (persist token into HttpOnly cookie for main window)
- Google OAuth: `accounts.google.com`
- Medusa backend: `https://api.aidenlux.com` (Docker service `medusa`)
- Medusa auth endpoints: `/auth/customer/google`, `/auth/customer/google/callback`
- Medusa store APIs (post-login): `/store/customers/me`, `/store/orders`, etc.

## Environment Configuration (must-have)

Vercel (apps/dji-storefront):
- `MEDUSA_BACKEND_URL=https://api.aidenlux.com`
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...apps.googleusercontent.com`
- `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_POPUP=true`
- `NEXT_PUBLIC_DEFAULT_REGION=us`

Medusa (deploy/gce/.env):
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_CALLBACK_URL=https://prd.aidenlux.com/auth/google/callback`
- `STORE_CORS` and `AUTH_CORS` include `https://prd.aidenlux.com`

Cookie policy (our project):
- `_medusa_jwt` and `_medusa_cart_id`: HttpOnly, Secure (prod), SameSite=Lax, path=/

Server requests (SSR):
- Always include `x-publishable-api-key: <pk_...>`
- Include `Authorization: Bearer <_medusa_jwt>` when logged in

## Popup-based OAuth (primary flow)

1) User clicks "Continue with Google (Popup)" on `/us/login`.
   - Main window opens a popup: `window.open('/auth/google?returnTo=...')`.

2) Popup GET `/auth/google` (Next server):
   - Next calls Medusa to start OAuth: `POST /auth/customer/google` with header `x-publishable-api-key`.
   - Medusa responds with Google auth URL including `state`.
   - Next stores `state -> returnTo` in `google_oauth_state_<state>` (HttpOnly, Lax, path=/).
   - Popup 302 redirects to Google consent page.

3) User consents on Google. Google redirects to Next callback:
   - `GET /auth/google/callback?code=...&state=...`.

4) Popup callback exchanges code for token:
   - Preferred: `sdk.auth.callback('customer','google', queryParams)` (auto-sends publishable key).
   - Fallback: `GET /auth/customer/google/callback?...` with `x-publishable-api-key` and tolerant token parsing.
   - On success: popup response sets `_medusa_jwt` cookie and sends `postMessage({ success: true, token, redirectUrl })` to the opener.
   - Popup does NOT navigate opener; the main window controls navigation.

5) Main window receives message:
   - Validates `event.origin` (self + `https://prd.aidenlux.com`).
   - Calls `POST /api/auth/session` with `{ token }` to persist cookie in main window context.
   - Small delay (~100ms), then `window.location.href = redirectUrl` (full navigation).

6) Main window (now redirected to `/us/account` or `returnTo`) makes SSR calls with headers:
   - `x-publishable-api-key: <pk_...>`
   - `Authorization: Bearer <_medusa_jwt>`
   - `/store/customers/me`, `/store/orders` return 200 and show user data.

## Full-Page Redirect OAuth (fallback)

This variant avoids popup edge cases by keeping the entire flow in the main window.

1) User clicks "Continue with Google (Full Page)".
2) Main window navigates to `/auth/google` (same as popup step 2 but no popup).
3) After consent and callback, the main window persists the session and navigates.
4) Cookie is naturally scoped to the main window; SSR requests proceed as in the popup flow.

## (Optional) Google One Tap

If enabled, main window obtains a Google `credential` and calls the Next API route
`POST /api/auth/google-one-tap`. Next authenticates via a custom Medusa provider
(`google-one-tap`) to obtain a token, sets `_medusa_jwt`, and redirects.

## Critical Requirements

- Medusa v2 store endpoints REQUIRE both:
  - `x-publishable-api-key: <pk_...>`
  - Valid customer JWT (Authorization header)
- Cookies: HttpOnly, Secure (in prod), SameSite=Lax, path=/
- Auth-related Next routes run on Node runtime with dynamic rendering to avoid Edge/caching issues.

## Common Pitfalls and Mitigations

- 401 on `/store/customers/me` after successful Google callback:
  - Cause: missing `x-publishable-api-key` or cookie scope/SameSite prevents SSR from reading JWT.
  - Mitigation: inject publishable key on all server requests; set cookies with `Lax` and `path=/`;
    perform `POST /api/auth/session` in the main window before navigating.

- Popup/opener cross-origin quirks (COOP, SameSite, timing):
  - Mitigation: callback uses `postMessage('*')` (opener validates origin), main window performs the
    `POST /api/auth/session` + full navigation after a short delay.

- Edge runtime/caching interfering with cookies():
  - Mitigation: `export const runtime='nodejs'`, `dynamic='force-dynamic'`, `revalidate=0` on auth routes.

## Validation & Observability

- Vercel logs (Functions):
  - Callback: logs whether token exchange used `sdk` or `fallback`.
  - `/api/auth/session`: logs `[auth] session cookie set at <ISO>` when cookie persisted.

- Browser checks:
  - DevTools → Application → Cookies → `prd.aidenlux.com` has `_medusa_jwt` (HttpOnly), `path=/`, `SameSite=Lax`.

- Medusa logs:
  - Callback 200 should be immediately followed by 200 responses on `/store/customers/me`.
  - Repeated 401 indicates missing header or cookie not persisted.

## Endpoints Summary

- Start OAuth: `POST https://api.aidenlux.com/auth/customer/google`
- Google Callback: `GET https://prd.aidenlux.com/auth/google/callback?code=...&state=...`
- Persist session (main window): `POST https://prd.aidenlux.com/api/auth/session`
- Verify session: `GET https://api.aidenlux.com/store/customers/me`

