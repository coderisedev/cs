---
last_updated: 2025-11-26
status: 📝 Draft
related_docs:
  - docs/runbooks/medusa-prod-db-manual-ops.md
  - docs/runbooks/strapi-db-startup-behavior.md
  - docs/runbooks/strapi-content-model-maintenance.md
---

# 商品评论功能方案（草案）

## 目标
为商品增加评论/评分能力，支持前台展示、提交，具备审核与防刷控制，并与现有 Medusa/Strapi 体系兼容。

## 数据归属选型
- **若需与订单强绑定（已购校验、推荐/折扣联动）**：优先放 Medusa。
- **若偏内容运营/富文本，复用 CMS 审核**：可放 Strapi。

## Medusa 实现要点（推荐）
1) **表设计**：`review`（id, product_id, customer_id, 可选 order_id, rating, title, content, status: pending/approved/rejected, metadata, created_at/updated_at）。
2) **约束/关系**：外键 product/customer；可选 order_id 关联；可加唯一约束 product_id + customer_id + order_id 防重复。
3) **业务规则**：
   - 仅完成订单且包含该 product 的 customer 可提交；默认 status=pending。
   - 管理端审核后才对外展示。
   - 评分范围校验（1–5）。
4) **API**：
   - Storefront：POST `/store/reviews`（需 customer auth + 购买校验），GET `/store/products/:id/reviews`（仅 approved）。
   - Admin：GET/POST/PATCH `/admin/reviews`（审核/隐藏）。
5) **实现**：新增迁移 + service + repositories + validators；增加索引（product_id, status, created_at）。
6) **前端**：提交前检查登录；提交后提示审核中；列表只展示 approved。
7) **防刷/安全**：rate limit、长度/敏感词检查、默认审核、可选举报。

## Strapi 实现要点（替代方案）
- 内容类型 `review`：字段含 product_id/handle, customer_email, rating, content, status。
- 公开 GET 仅过滤 status=approved；POST 需验证（可加 Turnstile/Recaptcha）。
- 若要校验购买，可在自建 API 中调用 Medusa 订单校验，再写入 Strapi。
- 审核通过 Strapi Admin 完成。

## 推荐流程（选 Medusa 路线）
1) 设计迁移与表；实现 review service + store/admin 路由 +校验。
2) 购买校验：订单行项目检查。
3) 默认 pending + 管理端审核。
4) 前端提交/展示对接；加速率限制与基本内容校验。
5) 文档化并添加必要索引。

## 后续确认
- 选择存储端（Medusa vs Strapi）。
- 是否强制“已购才能评”。
- 审核流细节（自动/人工、是否支持举报）。
