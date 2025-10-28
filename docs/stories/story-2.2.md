# Story 2.2: Build /shop and /product/[slug] Templates

Status: review

## Story

As a frontend developer,
I want minimal list and detail templates for products with breadcrumbs and category groupings,
so that users can browse a small catalog and reach PDPs with essential info.

## Acceptance Criteria

1. `/shop` renders products from MEDUSA_BASE_URL with name, price, image; 200 OK.  
2. `/product/[slug]` renders PDP with name, price, image gallery, availability, description.  
3. Breadcrumbs visible; category aggregation/landing (static JSON acceptable).  
4. Product Schema.org present on PDP; OG/Twitter metadata populated.  
5. Lighthouse mobile基线通过（可用阈值）。

## Tasks / Subtasks

- [x] `/shop` 列表页组件与数据源  
- [x] `/product/[slug]` PDP 模板与数据源  
- [x] 面包屑组件；类目聚合页（静态 JSON）  
- [x] SEO 元数据：canonical、OG/Twitter、Product schema  
- [ ] E2E 烟测：/shop 200、两条 PDP 200

## Dev Notes

- 仅实现最小差异：名称/价格/图片/可用性；后续扩内容/属性管理。  
- 保持数据抓取对 MEDUSA_BASE_URL 的适配。

### References

- docs/prd-quick-launch-plan-b-2025-10-27.md  
- docs/epics.md（Epic 2）

## Dev Agent Record

### Context Reference

- docs/stories/2-2-build-shop-and-product-templates.context.md

### Agent Model Used

sm (Scrum Master)

### Debug Log References
2025-10-27: 实现 /shop 与 /product/[handle]
- 新增：apps/storefront/src/lib/medusa.ts
- 新增：apps/storefront/src/app/shop/page.tsx
- 新增：apps/storefront/src/app/product/[handle]/page.tsx（含 Product schema 与 OG 元数据）
- 类型检查通过：`pnpm --filter storefront typecheck`
2025-10-27: 类目入口与聚合
- 新增：apps/storefront/src/lib/categories.json
- 新增：apps/storefront/src/app/shop/categories/page.tsx
- 新增：apps/storefront/src/app/shop/category/[slug]/page.tsx
- 在 /shop 顶部添加“Browse Categories”入口链接
2025-10-27: CI 预览烟测接入
- tests/e2e/shop.pdp.smoke.spec.ts 测试名加入 `smoke:` 前缀，匹配 CI `preview-smoke-tests` 的 `--grep="smoke"`
- 报告可在 PR 的 Actions 运行记录中查看（预览烟测工件 `playwright-report/`）

### Completion Notes List
2025-10-27: /shop 与 PDP 模板完成；PDP 注入 Product schema 与 OG 元数据；类型检查通过。E2E 烟测留在 CI 执行（tests/e2e/shop.pdp.smoke.spec.ts）。

### File List
 - apps/storefront/src/lib/medusa.ts
 - apps/storefront/src/app/shop/page.tsx
 - apps/storefront/src/app/product/[handle]/page.tsx

## Senior Developer Review (AI)

- Reviewer: Aiden
- Date: 2025-10-27
- Outcome: Changes Requested

### Summary
/shop 与 PDP 模板已实现，并在 PDP 注入了 Product Schema 与 OG 元数据；类型检查通过。尚缺：
1) 面包屑/类目聚合联动需要最小落地（已提供静态 categories.json 与分类页，但需在导航/入口处可达）。
2) E2E 烟测应在 CI 中跑通（/shop 200 与两条 PDP 200）。
3) Lighthouse 移动端基线需一次验证并记录（首页/列表/PDP）。

### Acceptance Criteria Coverage
- AC1 列表页：已完成（需结合真实 MEDUSA_URL 数据验证）
- AC2 PDP：已完成（含描述/可用性最小展示）
- AC3 面包屑/类目：部分完成（PDP 有面包屑；分类页已建，需入口联动）
- AC4 SEO：PDP Product Schema + OG 已注入；canonical 可随 next-seo/自定义头添加
- AC5 Lighthouse：待验证

### Action Items
1. 在站点导航或 /shop 页面加入口到 /shop/categories；确认分类页可见且可达。
2. 在 CI 中执行 tests/e2e/shop.pdp.smoke.spec.ts，确保 /shop 与两条 PDP 返回 200；将报告链接附加到故事。
3. 跑一次移动端 Lighthouse（列表与 PDP），在 Completion Notes 记录结果与改进项。
