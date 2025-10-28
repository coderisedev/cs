# Observability Baseline (Staging/Production)

Date: 2025-10-26
Owner: Platform

## Scope
- Error tracking via Sentry for storefront (Next.js), Medusa, and Strapi
- Uptime and health monitors for public endpoints
- Initial performance views (latency/error rate) using provider dashboards

## Configuration
- Storefront: `NEXT_PUBLIC_SENTRY_DSN` in `apps/storefront/.env.local(.example)` and Vercel envs
- Medusa: `SENTRY_DSN` in `infra/gcp/env/medusa.env.example` and host env `/srv/cs/env/medusa.env`
- Strapi: `SENTRY_DSN` in `apps/strapi/.env.example` and host env `/srv/cs/env/strapi.env`

## Monitors
- Health checks
  - https://api.aidenlux.com/health → expect 200
  - https://content.aidenlux.com/_health → expect 204 (or /health 200)
- Storefront synthetic: GET https://cs.com (200) with <500ms TTFB target (adjust per region)

## Dashboards (starter)
- Sentry
  - Project per service (storefront, medusa, strapi)
  - Releases by commit; environment tags staging/production
  - Alerts: Error rate > 5/min for 5m; P95 latency > 2s for 5m
- Provider dashboards (Vercel/GCP)
  - Vercel: Web vitals, response times by route
  - GCE: CPU, memory, network for service hosts

### GCP Cloud Monitoring (Uptime + Alerts)

- Prerequisites: `gcloud` authenticated to target project with Monitoring Admin role
- Create uptime checks
  - API:
    - `gcloud monitoring uptime-checks create http api-health --path=/health --port=443 --period=60s --timeout=10s --host=api.aidenlux.com --project=$GCP_PROJECT --http-check-use-ssl`
  - CMS:
    - `gcloud monitoring uptime-checks create http cms-health --path=/_health --port=443 --period=60s --timeout=10s --host=content.aidenlux.com --project=$GCP_PROJECT --http-check-use-ssl`
- Create alert policy (error rate / downtime)
  - Example policy file at `infra/gcp/monitoring/alert-policy-uptime.json`
  - Apply: `gcloud monitoring policies create --policy-from-file=infra/gcp/monitoring/alert-policy-uptime.json --project=$GCP_PROJECT`

### Vercel (Storefront)

- Enable Web Analytics for the project; verify environment tags (preview/staging/production)
- Optional: Add synthetic check via third-party if outside Vercel analytics is required

## Verification
- Staging: set DSNs and deploy; trigger test event
  - Storefront: add `/api/sentry-test` route calling `Sentry.captureMessage('test')` (remove after)
  - Medusa/Strapi: `node -e "require('@sentry/node').init({dsn:process.env.SENTRY_DSN}); require('@sentry/node').captureMessage('test')"`
  - Confirm event in Sentry with environment=staging

## Notes
- Avoid logging PII; prefer structured JSON logs (see logger utilities)
- Keep sample rates conservative until cost baselines established
