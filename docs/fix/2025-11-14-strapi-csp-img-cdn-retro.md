# Strapi Admin CDN Image CSP Fix – 2025-11-14

## Context
- Admin uploads store assets on Cloudflare R2 (`https://img.aidenlux.com`).
- After recent hardening, the Strapi admin UI stopped rendering uploaded images—even though uploads succeeded (HTTP 201, objects present in `upload/files`).
- Goal: restore image previews in the admin panel without relaxing security for other origins.

## Observed Symptoms
- Browser console: `Refused to load the image 'https://img.aidenlux.com/…' because it violates the document's Content Security Policy.
- Strapi logs: every `/upload` call returned 201; no provider errors.
- `curl https://img.aidenlux.com` returned 404 (expected for bucket root), confirming DNS/SSL fine.
- Admin UI still blank because CSP blocked the CDN host.

## Diagnosis
1. Confirmed Strapi server response headers via `curl -i http://127.0.0.1:1337/health` – CSP showed `img-src 'self' data: blob: strapi-ai-…` with **no** mention of `img.aidenlux.com`.
2. Checked `apps/strapi/config/middlewares.ts`: file still defaulted to `export default [ 'strapi::logger', …, 'strapi::public' ]` with no custom security config, meaning the admin enforced Strapi defaults (no CDN host whitelisting).
3. Conclusion: CSP was the sole reason admin UI couldn’t display uploaded images.

## Fix
- Replaced `config/middlewares.ts` with an env-aware factory that augments `strapi::security`:
  ```ts
  export default ({ env }) => {
    const assetHosts = [
      env('STRAPI_UPLOAD_CDN_HOST'),
      env('STRAPI_AWS_PUBLIC_URL'),
      env('AWS_PUBLIC_URL'),
    ].filter((v): v is string => typeof v === 'string' && v.length > 0)

    const withAssets = (directives: string[]) => {
      const hosts = Array.from(new Set(assetHosts))
      return hosts.length ? [...directives, ...hosts] : directives
    }

    return [
      'strapi::logger',
      'strapi::errors',
      {
        name: 'strapi::security',
        config: {
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              'img-src': withAssets(["'self'", 'data:', 'blob:']),
              'media-src': withAssets(["'self'", 'data:', 'blob:']),
            },
          },
        },
      },
      …
    ]
  }
  ```
- Rebuilt and redeployed Strapi via `docker build -t cs-strapi:prod -f apps/strapi/Dockerfile .` and `cd deploy/gce && docker compose up -d --force-recreate --no-deps strapi`.
- Verified CSP now includes `https://img.aidenlux.com` in `img-src` and `media-src` (curl header snapshot captured in the worklog).
- Browser refresh started loading thumbnails immediately.

## Validation
- Admin panel now renders uploaded assets from the CDN without console errors.
- Logs show clean 200 responses for `/upload/files` and no CSP violations.
- `curl -i http://127.0.0.1:1337/health` reflects updated CSP directives.

## Lessons Learned
1. When adopting external CDNs, always extend Strapi’s CSP (security middleware) or requests will be blocked even if uploads succeed.
2. Use env-driven host lists so different environments (preview/staging/prod) can specify their CDNs without code changes.
3. Regression tests should include checking admin CSP headers whenever the upload provider config is touched.

## Follow-ups
1. Consider adding `STRAPI_UPLOAD_CDN_HOST` to `.env.example` and documenting the middleware requirement in `docs/medusa-strapi-local-setup.md`.
2. Add an automated check (e.g., smoke test hitting `/health`) in CI/CD to verify CSP includes the configured CDN host before promoting new images.
3. Align frontend domains with `img-src` to support future subdomains (e.g., `cdn.aidenlux.com`) without another redeploy.
