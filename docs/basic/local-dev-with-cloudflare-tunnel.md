# Local Development with Cloudflare Tunnel (No Docker)

This guide sets up the Next.js storefront (apps/dji-storefront) locally and exposes it via a stable Cloudflare Tunnel domain such as `dev.aidenlux.com`. Medusa and Strapi remain remote.

## 1) Prerequisites

- Node.js 18+ and pnpm 10+
- Cloudflare account + `cloudflared` CLI installed

## 2) Install deps and run Next.js locally

```bash
pnpm install
cp apps/dji-storefront/.env.local.example apps/dji-storefront/.env.local
# edit .env.local:
#   MEDUSA_BACKEND_URL=https://api.aidenlux.com
#   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
#   NEXT_PUBLIC_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
#   NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH_POPUP=true
#   NEXT_PUBLIC_DEFAULT_REGION=us

pnpm --filter dji-storefront dev  # http://localhost:3000
```

## 3) Create and run a Cloudflare Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create dji-storefront-dev
cloudflared tunnel route dns dji-storefront-dev dev.aidenlux.com
```

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /home/<you>/.cloudflared/<YOUR_TUNNEL_ID>.json
ingress:
  - hostname: dev.aidenlux.com
    service: http://localhost:3000
  - service: http_status:404
```

Run the tunnel:

```bash
cloudflared tunnel run dji-storefront-dev
```

Now your local Next.js app is reachable at https://dev.aidenlux.com

## 4) Google OAuth flow (recommended)

- Keep the production Google OAuth callback: `https://prd.aidenlux.com/auth/google/callback`.
- From the dev domain, start OAuth with the built-in buttons:
  - Popup: Continue with Google (Popup)
  - Fallback: Continue with Google (Full Page)
- The callback page on `prd.aidenlux.com` posts the token to your dev window. The dev window writes the session via `POST /api/auth/session` and then navigates.

Notes:
- Cookies use HttpOnly + Secure + SameSite=Lax + path=/
- Auth routes force Node runtime and dynamic rendering to avoid Edge/caching issues.

## 5) Validate session locally

Open:

- `https://dev.aidenlux.com/api/debug/session` → `{ ok: true, hasJwt: true }` if JWT cookie is present server-side.
- `/us/account` should show the signed-in customer.

If the page still shows not logged in, provide the test timestamp and check Vercel logs for:

- `[auth] google callback exchanged token via sdk|fallback ...`
- `[auth] session cookie set at ...`

## 6) Optional: Add dev domain to Medusa CORS (only if client calls are blocked)

If a purely client-side call triggers CORS errors, add `https://dev.aidenlux.com` to Medusa `STORE_CORS` and `AUTH_CORS`, then restart Medusa. SSR calls don’t require CORS.

## 7) Troubleshooting checklist

- Vercel env has `MEDUSA_BACKEND_URL=https://api.aidenlux.com` and a valid `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.
- Browser cookies: `_medusa_jwt` exists for dev domain, `path=/`, `SameSite=Lax`.
- If popup is flaky in your environment, use the Full Page button.

