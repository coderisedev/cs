# Troubleshooting Guide

Date: 2025-10-26
Owner: Platform

## Contacts & Ownership
- Primary Owner: Platform Team (`{ops-contact}`)
- On-call (incidents): `{oncall-contact}` (see schedule)
- Escalation Path: Platform → Engineering Manager → CTO

## Service Level Expectations (SLE)
- Incident acknowledgment: within 15 minutes during support hours
- Initial mitigation: within 1 hour for P1, 4 hours for P2
- Resolution target: 4 hours (P1), 24 hours (P2), next sprint (P3)

## Common Issues

- Build failures: check CI job logs for lint/type errors. See `.github/workflows/ci.yml`.
- GHCR pull denied on host: ensure PAT configured or fallback to GITHUB_TOKEN in deploy script.
- Port conflicts (9000/1337): stop conflicting processes; redeploy via `/srv/cs/bin/deploy.sh`.
- DB timeouts: verify Postgres listen on docker0, pg_hba rules, and firewall allowances.
- Health probe mismatch: Medusa `/health` (200), Strapi `/_health` (204).

## Quick Checks

- Curl health endpoints (external + loopback)
- Tail last deploy log: `tail -n 200 /srv/cs/logs/deploy-*.log`
- Container list: `docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'`

## References

- CI/CD flow: `docs/ci-cd-gce-flow-2025-10-26.md`
- Cheat sheet: `docs/cheat-sheet.md`
- GCE playbook: `docs/runbooks/gce-backend-playbook.md`
- Observability baseline: `docs/runbooks/observability-baseline.md`
- Deployments: `docs/runbooks/deployments.md`
