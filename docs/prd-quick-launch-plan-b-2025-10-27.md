# 快速上线 PRD（方案 B）— DTC 商城 + SEO 内容（简化版）

Date: 2025-10-27  
Owner: Aiden  
Methodology: BMAD（PRD → Epic → Story/Context → 实施/测试 → Review → Done）

## 1) 背景与目标（简述）
- 目标：在 1–2 周内上线“可购买、可索引、可追踪”的站点，支持少量 SKU 的交易；建立基础 SEO 能力，为后续扩展留足空间。
- 战略定位：内容驱动（教程/指南/下载）拉动自然流量 → 导流到商品 → 转化为订单。

## 2) 范围（Scope）
- In Scope（MVP 必需）
  - 前台：Next.js（Vercel）主页/目录页/产品详情页（PDP）
  - 电商后端：Medusa（最小模块：商品/价格/订单）
  - 支付：单一支付渠道 PayPal（先期不并行 Stripe）
  - 登录：Google 一键登录（Google OAuth；用于最小账户体系/下载访问；下单可先支持游客）
  - 库存/税运：从简（库存布尔；固定税率/固定运费或最小规则）
  - SEO 基线：robots.txt、sitemap.xml、canonical、OG/Twitter、Product/Article Schema
  - 指标追踪：内容 → 商品 → 下单 事件埋点（转化漏斗）
  - 观测性：Sentry（前台）、外部 Uptime（首页、/shop）、上线后健康检查
  - 内容：3–5 篇 MDX 核心指南；与产品静态映射（Strapi 延后）
- Out of Scope（后续迭代）
  - 多币种/复杂税运/物流报价；站内搜索/对比；用户仪表盘/订单历史；内容工作流（Strapi 审核流）；多环境灰度与 A/B；运营自动化

## 3) 架构与技术栈（方案 B 简化，采用已配置的 GCE 自托管）
- 前台：Next.js（Vercel）
- 电商：Medusa（最小启用），后端运行在已配置的 GCE 自托管（Postgres/Redis 在 GCE/主机侧），后续如需可迁移至 Render/Railway/Cloud Run 以降低运维。
- 内容：先用本地 MDX；Strapi 迁移为后续 Epic
- 支付：PayPal（Medusa 官方/社区集成或前端引导到 PayPal）
- 登录：Google OAuth（NextAuth 或等价方案；最小持久化即可）
- 观测/监控：Sentry + 外部 Uptime；上线后健康探测

## 4) 功能需求（FR，MVP）
1. FR001（目录/详情）：/shop 展示少量 SKU；PDP 含名称/价格/图/描述/可用性；面包屑与类别聚合
2. FR002（下单流程）：PDP → 加购/或直接下单 → PayPal 跳转结账 → 成功返回提示
3. FR003（库存/税运简化）：库存布尔；税/运费固定或最小规则，明确在 PDP 与结账中展示
4. FR004（Google 登录）：前台可使用 Google OAuth 登录；下载区域或下单表单可识别登录态（下单支持游客）
5. FR005（SEO 基线）：sitemap/robots/canonical/OG；PDP 输出 Product Schema；核心模板通过 Lighthouse 基线
6. FR006（内容页）：3–5 篇 MDX 核心指南；与产品建立静态关联卡片；Article/HowTo Schema
7. FR007（指标追踪）：定义内容→商品→下单事件；出具最小仪表说明（文档）
8. FR008（观测/监控）：Sentry DSN 配置；Uptime 两条检测（/ 与 /shop）；部署后健康检查通过

## 5) 非功能需求（NFR）
- 性能：移动端 Core Web Vitals 达到可用基线；首屏 LCP 图像合理配置
- 可用性：移动端优先；无阻塞首要路径（浏览 → 支付）
- 安全/合规：Cookie/隐私最小声明；不记录支付敏感数据；Sentry/日志避免 PII
- 可维护：环境变量精简（local/prod）；文档与 Runbooks 最小闭环

## 6) 里程碑与验收（DoD）
- 端到端：PDP → PayPal 跳转 → 成功页回访（或确认邮件）
- 登录：Google OAuth 登录成功；可在前台识别登录状态
- SEO：sitemap/robots/canonical/OG 生效；PDP Product Schema 通过 Rich Results 测试
- 观测：Sentry 触发一次测试事件；Uptime 检测绿灯；部署后健康检查通过
- 指标：内容→商品→下单 事件在埋点中可见（文档化）

## 7) 两周路线图（示例）
- 第 1 周
  - 最小路由与模板（/、/shop、/product/[slug]）
  - Medusa 最小商店与 SKU 种子；PayPal 集成
  - Google OAuth 登录（NextAuth）；游客下单策略
  - catalog.json/MDX 指南三篇；PDP 静态关联
- 第 2 周
  - SEO 基线（sitemap/robots/canonical/OG；Product/Article Schema）
  - 指标追踪事件与 README 操作指南
  - 观测（Sentry + Uptime）；上线后健康检查
  - 预发布 Check：E2E 烟测、Rich Results、移动端 Lighthouse

## 8) BMAD 映射（Epic/Story 初稿）
- Epic：Epic 2 — 快速上线（方案 B）
  - Story 2.1：配置 Medusa 商店并种子化基础目录（种子 5–10 SKU；在托管平台运行）
  - Story 2.2：构建 /shop 与 /product/[slug] 模板（面包屑/类目聚合）
  - Story 2.3：接入 PayPal（单一渠道；下单回调/成功提示）
  - Story 2.4：Google OAuth 登录（NextAuth；游客下单仍可用）
  - Story 2.5：库存/税运从简配置（固定规则/最小说明）
  - Story 2.6：SEO 基线（sitemap、robots、canonical、OG、Product/Article Schema）
  - Story 2.7：事件追踪（内容→商品→下单）与最小仪表文档
  - Story 2.8：观测/监控（Sentry + Uptime；上线后健康检查）
  - Story 2.9：预发布 Checklist（E2E 烟测、Rich Results、移动端 Lighthouse）

> 每个 Story 均需：
> - 明确 Acceptance Criteria（基于 FR/NFR/DoD）
> - Dev Agent Record 记录文件清单与测试结果
> - 在 `docs/sprint-status.yaml` 维护状态流转（backlog → drafted → ready-for-dev → in-progress → review → done）

## 9) 风险与应对
- 支付集成：优先官方/成熟插件；回调与错误路径需文档化与演练
- 登录一键化：Google OAuth 配置/域名回调；游客下单兜底
- SEO 抖动：发布前验证 schema 与 meta；上线后 Search Console 监控收录
- 运维：当前阶段沿用已配置的 GCE 自托管（脚本与 SSH 流程见 `.github/workflows/deploy-services.yml` 与 docs/runbooks/gce-backend-playbook.md）；当团队人力受限或需要更快环境扩张时，再迁移到 Render/Railway 以降低维护成本。

## 10) 成功度量（MVP）
- 首单完成 + 订单触达邮箱
- Search Console 收录首批页面（/shop、2 个 PDP、2 篇指南）
- 转化漏斗事件可见（内容→商品→下单）
- Sentry/uptime/健康检查均为绿灯
