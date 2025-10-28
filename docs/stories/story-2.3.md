# Story 2.3: Integrate PayPal Checkout (Single Channel)

Status: in-progress

## Story

As a release engineer,
I want a single-channel PayPal checkout integrated end-to-end,
so that users can complete purchases quickly while we defer complex payment/tax logic.

## Acceptance Criteria

1. PayPal 集成（Sandbox → Production 切换）可用；PDP/Cart 到 PayPal 跳转路径畅通。  
2. 成功/取消回调路径文档化；成功页提供最小订单反馈。  
3. Secrets 通过环境变量注入；不写入仓库。  
4. E2E 烟测：发起支付跳转（302/外站），取消返回可见提示；成功流本地可模拟。

## Tasks / Subtasks

- [ ] PayPal 配置与环境变量注入（Sandbox）  
- [x] 发起支付前端触发点（PDP 直购按钮到 Payment Link；最小 MVP）  
- [ ] 成功/取消回调处理与提示  
- [ ] 文档：切换 Production 步骤、密钥位置、测试账户说明  
- [ ] E2E：发起→取消 返回 200/提示

## Dev Notes

- 仅集成单一支付以降低复杂度；多渠道后续迭代。  
- 结合 2.1/2.2，确保产品 SKU/价格能正确传递至支付发起逻辑。

### References

- docs/prd-quick-launch-plan-b-2025-10-27.md

## Dev Agent Record

### Context Reference

- docs/stories/2-3-integrate-paypal-checkout.context.md

### Agent Model Used

sm (Scrum Master)

### Debug Log References
2025-10-27: 最小 PayPal（Payment Link）接入
- 新增：apps/storefront/src/lib/payments.ts（读取 NEXT_PUBLIC_PAYPAL_LINK）
- PDP 显示 "Buy with PayPal" 按钮（指向 Payment Link）
- 增加成功/取消页：/checkout/success、/checkout/cancel（最小文案）
- apps/storefront/.env.local.example 增加 NEXT_PUBLIC_PAYPAL_LINK

### Completion Notes List

### File List

- apps/storefront/src/lib/payments.ts
- apps/storefront/src/app/checkout/success/page.tsx
- apps/storefront/src/app/checkout/cancel/page.tsx
