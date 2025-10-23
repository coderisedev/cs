# Backend Deployment Status Log

Use this log to capture evidence for Story 1.6 acceptance criteria and future deployments.  Append a new section for every production or staging rollout executed via `.github/workflows/deploy-services.yml`.

## Template

```
## 2025-10-26 – Staging Deploy (TAG=abc123def456)
- GitHub Actions run: https://github.com/<org>/<repo>/actions/runs/<id>
- GHCR Images:
  - ghcr.io/<org>/cs-medusa:abc123def456
  - ghcr.io/<org>/cs-strapi:abc123def456
- Tunnel verification:
  - curl -I https://api.example.com/store/health → HTTP/2 200 (CF-Ray: ...)
  - curl -I https://content.example.com/health → HTTP/2 200 (CF-Ray: ...)
- Host evidence:
  - /srv/cs/logs/deploy-2025-10-26T12:00:00Z.log (tail below)
  - /srv/cs/logs/health-2025-10-26T12:00:10Z.log
```

### deploy-2025-10-26T12:00:00Z.log (tail)
```
[deploy-log] == Deployment triggered at 2025-10-26T12:00:00Z ==
[deploy-log] Running docker compose pull
[deploy-log] Running docker compose up -d --remove-orphans
[deploy-log] Collecting health probes via bin/collect-health.sh
```

### health-2025-10-26T12:00:10Z.log
```
== Cockpit Simulator backend health report ==
timestamp=2025-10-26T12:00:10Z
-- medusa /store/health --
{"status":"ok"}
-- strapi /health --
{"status":"ok"}
```

> Keep raw log files in `/srv/cs/logs/` for audit purposes and include excerpts here for reviewers.
