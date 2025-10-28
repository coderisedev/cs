# Logging Baseline: Shipping & Retention

Date: 2025-10-26
Owner: Platform

## Scope
- Establish initial log strategy, shipping targets, and retention expectations
- Keep payloads minimal and avoid PII

## Strategy
- Emit structured JSON to stdout (see logger utilities in apps/*/src/**/logger.ts)
- Aggregate logs via host platform:
  - Vercel (storefront): Vercel logs + Sentry breadcrumbs
  - GCE (Medusa/Strapi): `docker logs` → journald (default) or Cloud Logging if enabled
- Rotate and retain:
  - Short-term (node): container log rotation (size/time-based)
  - Medium-term: 7–14 days in provider logs; archive longer retention if necessary

## Tasks
- Ensure production hosts have container log rotation enabled
- If Cloud Logging is desired, enable Ops Agent or docker logging driver to GCP
- Define PII redaction rules in application where needed

## References
- docs/runbooks/observability-baseline.md

