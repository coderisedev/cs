# DTC Storefront + SEO CMS Architecture Assessment

Date: 2025-10-27  
Author: Aiden (with assistant synthesis)

## Executive Summary
- Goal: Launch a DTC commerce site with an SEO-driven content engine and a downloads/guide hub, tied to community touchpoints.
- Architecture: Next.js (storefront) + Medusa (commerce) + Strapi v5 (content), with CI/CD, preview smoke tests, post-deploy health checks, and observability.
- Verdict: Appropriate and not over-engineered for the stated outcomes. The stack supports SEO, performance, and long-term extensibility. BMAD methodology fits well for traceable, low-regret delivery.

## Reasoning Basis
- Product scope and goals from `docs/PRD.md`.
- Current pipelines and ops from `.github/workflows/*.yml` and `docs/runbooks/*`.
- Status and artifacts from `docs/sprint-status.yaml` and `docs/stories/*`.

## Feasibility and Fit
- Business fit: Content→traffic→conversion loop is well supported via Strapi content types linked to Medusa products (PRD FR011/FR012). Downloads hub + tutorials reinforce trust and reduce support.
- SEO and performance: Next.js App Router + SSR/ISR, Schema.org (PRD FR021), and content/product association enable topic clusters and rich snippets.
- Payments and compliance: Starting with PayPal is pragmatic; taxes/shipping can phase in. Add Stripe/Apple Pay later if needed.
- Extensibility: Clear separation of concerns (Medusa for commerce, Strapi for content) enables future i18n, channels, and growth.

## Engineering and Operations
- Keep: Preview deployments with smoke tests, post-deploy health checks, Sentry, and structured logging — high ROI quality gates.
- Consider simplifying (for very small teams/MVP-only):
  - Host backends on a managed PaaS (Render/Railway/Cloud Run) to avoid server management; retain health checks and Sentry.
  - Start with single-currency and simpler tax rules; expand later.
  - Begin search with basic filters; scale to Meilisearch/Algolia as content grows.

## BMAD Method Assessment
- Pros: End-to-end traceability (PRD→Epic→Story→Context→Implementation→Review→Done)、质量闸门体系化（预览/E2E/健康/观测性）、跨角色配合清晰。
- Cost: 比“脚手架直写”更有流程开销。若单人快攻，可在不牺牲关键闸门（预览烟测、健康、Sentry）的前提下适度下调文档密度。
- 结论：与你的目标（内容、转化、运维可靠性）高度契合，值得采用。

## Phased Roadmap (Suggested)
- MVP: 目录/详情、购物车、PayPal 单币种、基础 SEO（产品/文章 Schema、sitemap、canonical）、内容↔商品关联、下载中心雏形。指标：首单、SEO 首批索引、内容→商品转化漏斗可观测。
- MMP: 多币种、税费与运费完善、增强搜索（FR015）、OAuth、用户仪表盘（订单/下载）。
- Mature: 运营自动化（公告、推荐、Newsletter）、产品对比（FR023）、更丰富的社区桥接与 UGC。

## Risks and Mitigations
- 税务/合规/隐私：分阶段引入；严格区分 Sentry/日志与 PII；在 `docs/runbooks/environment-config.md` 明确敏感项来源与注入方式。
- 内容发布流转：Strapi 草稿/审核/发布与前端 ISR/再验证对齐，避免 SEO 抖动。
- 依赖一致性：锁定关键工具版本（如 Playwright）并在 CI 内检测漂移；清理 ESM/CJS 混用（已记录）。
- 报警：完善 GCP Uptime Alert 的通知渠道与阈值调优（参考 `docs/runbooks/observability-baseline.md`）。

## Immediate Improvements (Low Effort / High Value)
- SEO 基线：`sitemap.xml`/`robots.txt`、OpenGraph/Twitter、面包屑与聚合页 Schema；核查核心模板 LCP/CLS。
- 内容结构：在 Strapi 规范“教程/指南/FAQ/博客”字段（slug/meta/关联商品/相关推荐），打造主题集群与落地页。
- 监控：为 Vercel 前台补充外部 Uptime/Synthetic；完善 GCP 告警通知通道与阈值。
- 转化度量（PRD FR020）：定义“内容→商品→下单”的事件流，在 GA4/自建埋点中落地。

## References (Repo Paths)
- PRD: `docs/PRD.md`
- Workflows: `.github/workflows/ci.yml`, `.github/workflows/deploy-services.yml`
- Observability: `docs/runbooks/observability-baseline.md`, `infra/gcp/monitoring/*`
- Stories/Status: `docs/stories/*`, `docs/sprint-status.yaml`

## Conclusion
- 架构与目标高度匹配，不算过度设计；当前工程护栏（预览/E2E/健康/观测）应保留。
- 若需更快上线，可临时降低运维复杂度（托管型后端、税务简化、基础搜索），上线后逐步补齐。
- BMAD 方法论适配此类多模块、长期演进的项目，建议继续沿用并在小团队场景下“轻文档、重闸门”。

## Next Steps (Actionable)
1. 进入 Epic 2：按建议起草 Story 2.1（“配置 Medusa 商店并种子化基础目录”）并生成上下文。
2. 落地 SEO 基线与事件度量方案；为首页/商品/文章模板补齐结构化数据与分享卡片。
3. 完成 GCP 告警通知通道配置与阈值调优；为前台补充外部 Uptime。
4. 锁定 E2E 工具版本并修正预览 ESM 细节；在 CI 中做依赖漂移检测。

