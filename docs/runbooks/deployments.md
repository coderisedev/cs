# Deployments: Build, Promote, Rollback

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

## Scope
- Summarize CI/CD paths for storefront (Vercel) and services (GCE on GHCR images)
- Provide minimum commands and links to detailed guides

## Pipelines
- Storefront (Vercel): `.github/workflows/ci.yml` preview job on PR; production build on merge to main (external deploy CLI in job)
- Services (GCE): `.github/workflows/deploy-services.yml` builds Medusa/Strapi images, pushes to GHCR, and deploys over SSH

## Promote
- Production: merge to `main` triggers both workflows
- Staging: push to `staging` branch for backend (per workflow); preview deploys on PR for web

## Rollback (Services)
- On host:
```
# Select previous image tag, then
cd /srv/cs && docker compose pull && docker compose up -d --remove-orphans
```
- Verify health endpoints and admin UIs are reachable

## Health Verification
- API: `curl -I https://api.aidenlux.com/health` → 200
- CMS: `curl -I https://content.aidenlux.com/_health` → 204 (or `/health` 200)
- See also: `docs/runbooks/observability-baseline.md`

## Seed Medusa Catalog（GCE 自托管）
- 方式 A：容器内执行内置脚本（apps/medusa/src/scripts/seed.ts）
  - 本地：`pnpm --filter medusa seed`（需本地 DB/Redis）
  - 远端（GCE Docker 主机）：
    - `docker ps` 查找 Medusa 容器名（如 `cs-medusa`）
    - `docker exec -it <medusa-container> medusa exec ./src/scripts/seed.ts`
- 方式 B：通过 Actions 部署后远程脚本
  - 在 `.github/workflows/deploy-services.yml` 完成镜像部署后，使用 `appleboy/ssh-action` 附加一步执行上面命令
- 期望结果：
  - `/health`=200；前台或管理接口可查询到 5–10 个基础 SKU

## References
- CI/CD flow: `docs/ci-cd-gce-flow-2025-10-26.md`
- GCE playbook: `docs/runbooks/gce-backend-playbook.md`
- Required tokens: `docs/runbooks/REQUIRED-TOKENS.md`
