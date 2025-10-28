# GCP Monitoring Setup (API/CMS Uptime + Alerts)

## Prerequisites
- gcloud SDK installed and authenticated
- Project-level role: Monitoring Admin (or equivalent)

## Quick Start

1) Configure uptime checks (API and CMS):

```
GCP_PROJECT=<project-id> \
API_HOST=api.aidenlux.com \
CMS_HOST=content.aidenlux.com \
BASH_ENV=/dev/null bash infra/gcp/monitoring/setup-uptime.sh
```

2) Apply alert policy (optional):

```
GCP_PROJECT=<project-id> \
BASH_ENV=/dev/null bash infra/gcp/monitoring/setup-uptime.sh --apply-alert-policy
```

- Policy file: `infra/gcp/monitoring/alert-policy-uptime.json`
- Edit to add notification channels after initial creation.

## Notes
- Re-run is idempotent (create commands are guarded). Update commands can be added later as needed.
- See `docs/runbooks/observability-baseline.md` for full context and dashboard guidance.

