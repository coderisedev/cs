# Story 2.1: Configure Medusa Store & Seed Base Catalog

Status: in-progress

## Story

As a platform engineer,
I want a minimal Medusa store running on a managed platform with a seeded base catalog,
so that the storefront can render real products and route users to checkout quickly.

## Acceptance Criteria

1. GCE 自托管 Medusa 环境可用，具有公共 BASE_URL 且 `/health` 返回 200。  
2. Seed 5–10 SKUs with name, price, images, availability (boolean).  
3. Environment variables documented for local and production; secrets not committed.  
4. README/runbook note explains how to add/edit products and re-seed.  
5. E2E smoke: storefront can fetch products list and render two PDPs (200).

## Tasks / Subtasks

- [ ] 使用已配置的 GCE 自托管 Medusa 环境  
  - [ ] 校验 Postgres/Redis 与环境变量（MEDUSA_BASE_URL、DATABASE_URL、REDIS_URL）  
  - [x] 通过 `.github/workflows/deploy-services.yml` 完成一次部署并验证 `/health`=200（验证：`curl -I https://api.aidenlux.com/health` → 200）
- [ ] Seed base catalog（5–10 个 SKU）  
  - [ ] Create seed script and images mapping  
  - [ ] Document seed workflow in README
- [ ] Wire storefront to MEDUSA_BASE_URL  
  - [ ] List `/shop` data fetch and two PDP renders（200）
- [ ] Docs  
  - [x] Env keys 与 GCE 部署步骤（docs/runbooks/deployments.md / docs/runbooks/gce-backend-playbook.md / README）  
  - [ ] 产品上新简表（catalog 维护指南）

## Dev Notes

- 采用已配置的 GCE 自托管；支付集成在 Story 2.3 实现。  
- 库存/税运后续在 2.5 简化配置；此故事只需可售卖目录与健康检查。  
- 前台保持 MEDUSA_BASE_URL 可配置；本地/预览/生产可切换。

### References

- docs/prd-quick-launch-plan-b-2025-10-27.md  
- docs/epics.md（Epic 2）  
- docs/runbooks/deployments.md

## Dev Agent Record

### Context Reference

- docs/stories/2-1-configure-medusa-store-seed-base-catalog.context.md

### Agent Model Used

sm (Scrum Master)

### Debug Log References

2025-10-27: 生产环境健康验证
- `curl -I https://api.aidenlux.com/health` → 200
- `curl -I https://content.aidenlux.com/_health` → 204

2025-10-27: 部署与文档
- 更新 `docs/runbooks/deployments.md`，新增“Seed Medusa Catalog（GCE 自托管）”章节

### Completion Notes List

### File List
