# Story Context: 2.1 Configure Medusa Store & Seed Base Catalog

## Metadata
- Epic: 2
- Story: 2.1
- Title: Configure Medusa Store & Seed Base Catalog
- Source Story: docs/stories/story-2.1.md
- Generated: 2025-10-27

## Acceptance Criteria
- GCE 自托管 Medusa 环境 `/health`=200
- 5–10 SKUs seeded（名称/价格/图片/可用性）
- Env 文档与 secrets 隔离
- README 说明上新/重种子流程
- /shop 与两条 PDP 200

## Tasks (from Story)
- 使用 GCE 自托管环境；校验 DB/Redis 与环境变量
- Seed script + assets mapping
- Wire storefront to MEDUSA_BASE_URL
- Docs（env/seed/上新流程 + GCE 部署）

## Artifacts
- apps/medusa/*（若在本仓库）或外部托管链接
- MEDUSA_BASE_URL（preview/production）
- /health endpoint

## Constraints
- 不实现支付/复杂库存本故事

## Testing Standards & Ideas
- Smoke: GET /health=200；前台 /shop=200，两个 PDP=200
