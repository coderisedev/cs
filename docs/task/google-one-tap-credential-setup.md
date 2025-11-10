# Google One Tap Credential Setup (Task 6.2)

## Overview
We need a single Google Identity Services (GIS) project that issues tokens accepted by both the Medusa backend (server-side verification) and the Next.js storefront (One Tap script). This checklist captures everything required before wiring code.

## Step-by-Step
1. **Create/Select Project**
   - Visit [Google Cloud Console → APIs & Services](https://console.cloud.google.com/apis/dashboard).
   - Create a new project (e.g., `cs-google-login`) or reuse the Cockpit Simulator org project.

2. **Enable APIs**
   - Enable *Google Identity Services* (search “Identity”).
   - Optional: enable Google People API if you plan to fetch additional profile data later.

3. **Configure OAuth Consent Screen**
   - Choose “External” user type (One Tap needs it unless all users are within the same Google Workspace).
   - Fill out app name, support email, developer contact email.
   - Add authorized domains: `localhost`, `<preview>.vercel.app`, `cockpit-simulator.com`, `medusa.cockpit-simulator.com` (adjust once DNS final).
   - Upload logo/policy links if requested.

4. **Create OAuth Client (Web Application)**
   - Navigate to *Credentials → Create Credentials → OAuth client ID*.
   - Name: `cs-one-tap-web`.
   - Authorized JavaScript origins:
     - `http://localhost:3000` (storefront dev)
     - `http://localhost:9000` (Medusa dev if running One Tap from admin)
     - `https://cs-preview.vercel.app`
     - `https://cs-staging.vercel.app`
     - `https://www.cockpit-simulator.com`
   - Authorized redirect URIs (only needed if you also support classic OAuth redirects): `https://medusa.<env>.cockpit-simulator.com/store/auth/google/callback`.
   - Save generated `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`.

5. **Secrets Distribution**
   - Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` inside your secret manager (e.g., Doppler, 1Password, Vault).
   - Populate environments:
     | Environment | Medusa (.env) | Storefront (.env) | Notes |
     | --- | --- | --- | --- |
     | Local | `GOOGLE_CLIENT_ID=...`, `GOOGLE_CLIENT_SECRET=...` | `NEXT_PUBLIC_GOOGLE_CLIENT_ID=...` | Same client ID works for dev. |
     | Preview (Vercel) | Set in deployment secrets | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` via Vercel project settings | |
     | Production | Same as above, consider dedicated prod client | Ensure consent screen is in “Production” status. |

6. **Repo Updates**
   - `apps/medusa/.env.template`: add placeholders for `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
   - `apps/dji-storefront/.env.example`: add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (front-end script uses it).
   - Document feature flag `NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP`.

7. **Verification**
   - Run `pnpm --filter apps/dji-storefront dev` and confirm the One Tap script can initialize (check console for `initialize` logs).
   - From the Medusa backend, hit the new `/store/auth/google` endpoint (once implemented) to ensure the client ID matches.

8. **Hand-off Checklist**
   - Save Client ID/Secret in shared credential doc.
   - Record origins/redirect URIs for future reference.
   - Note expiration/rotation policy (e.g., review quarterly).

Following this checklist completes Task 6.2 and unblocks backend/frontend implementation work.
