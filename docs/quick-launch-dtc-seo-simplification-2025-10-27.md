# 快速上线规划（DTC 商城 + SEO 内容）

Date: 2025-10-27  
Scope: 少量 SKU，尽快上线可售卖与可索引版本

## 目标对齐
- 用最小功能集合上线可售卖站点（少量 SKU）。
- 保留基础 SEO 能力与最小可观测性，后续按模块增量扩展。
- 优先实现：可购买、可索引、可追踪；延后非关键复杂度。

## 三种“快上线”路线（从快到稳）
- 方案 A（极简，2–5 天，最短路径）
  - 前台：Next.js（Vercel）仅做主页/目录页/详情页（MDX 或本地 JSON 配置）。
  - 支付：Stripe Checkout/Payment Links（跳转式结账），免后端购物车与自托管支付。
  - 价格/库存：静态配置（少量产品手动维护），无登录/订单中心。
  - SEO：手写 sitemap/robots、Products/Article 的 schema.org、标题/描述/面包屑。
  - 适用：SKU 很少、立刻开卖为首要目标。
- 方案 B（轻量，1–2 周，保留电商底座）
  - 前台：Next.js（Vercel）。
  - 电商：Medusa 启用最小模块（商品、价格、订单、单一支付：PayPal 或 Stripe），库存/税运从简。
  - 内容：先用 Markdown/MDX 写 3–5 篇核心指南，Strapi 延后接入。
  - 管线：保留预览部署 + 烟测（首页 200、PDP 200）。
  - 适用：要保留后续扩展空间且近期会增加 SKU。
- 方案 C（基线，2–3 周，可持续）
  - 前台：Next.js（Vercel）。
  - 后端：Medusa（订单/库存）+ Strapi（内容）托管在 Render/Railway/Cloud Run（替代自管 GCE）。
  - SEO/监控：完整落地（sitemap、结构化数据、外部 Uptime、Sentry）。

建议：先上 A（最快），并在一周内切到 B（把支付/订单收拢在 Medusa），内容规模稳定后再启用 Strapi。

## 上线范围取舍
- 保留（MVP 必需）
  - 列表/详情（固定模板）、结账（Stripe Checkout 或 Medusa+单支付）、最简订单通知邮件、SEO 基线。
- 延后
  - 多币种/复杂税运、站内搜索、用户登录/订单历史、对比功能、内容工作流、多环境灰度。
- 替代
  - 运费/税费：固定规则或 Stripe Tax（若已接 Stripe）。
  - 库存：少量 SKU 可手动维护或仅在结账校验。

## 技术/部署简化
- 托管优先：前台 Vercel；后端若用 Medusa，选 Railway/Render/Cloud Run，省去服务器与镜像管理。
- 支付简化：Stripe Checkout 跳转式付款，最小服务端；或先 PayPal 单一渠道。
- 配置精简：每个服务只保留一份 .env（local/prod），删除未用变量，降低首发摩擦。
- 监控保留：Sentry + 外部 Uptime（UptimeRobot 或 GCP Uptime 二选一）；保留上线后健康探测。

## SEO 快速落地清单
- 全站：robots.txt、sitemap.xml、canonical、OpenGraph/Twitter 卡片、核心模板 LCP/CLS 优化。
- 产品页：Product schema（名称/价格/可用性/品牌）、面包屑、类别聚合页（静态 JSON 驱动）。
- 内容页（若用 MDX）：Article/HowTo schema；“相关产品”静态映射。
- 索引：提交 sitemap 至 GSC，保留 5–10 篇核心落地页（指南/对比/FAQ）。

## 极简运营流程
- 上新：编辑 catalog.json（slug/名称/价格/图片/描述/Stripe 链接/或 Medusa handle），自动生成 PDP。
- 发布：主干合并触发 Vercel 部署；预览烟测 200；Sentry 验证 1 次测试事件。
- 售后：支付成功邮件（用 Stripe/PayPal 默认模板），人工对账可接受。

## 5 天上线排期（方案 A 示例）
- 第 1 天：最小路由（/、/shop、/product/[slug]）；接 Stripe Checkout；准备 catalog.json（5–10 SKU）。
- 第 2 天：SEO 基线（sitemap/robots/canonical/OG）；PDP Product schema；域名与 Vercel 绑定。
- 第 3 天：3 篇核心指南（MDX）；首页区块（主推产品 + 指南入口）；移动端 Lighthouse 校验。
- 第 4 天：Sentry DSN、UptimeRobot 两条检测（/ 与 /shop）；隐私/条款页模板；Cookie 合规最简声明。
- 第 5 天：预发布 Check（首页/目录/2 个 PDP/Checkout 跳转）；Rich Results Test 校验 schema；GSC 提交 sitemap。

## 若坚持 Medusa（方案 B 的快交付要点）
- 托管：Medusa 放 Railway/Render（Postgres/Redis 托管）。
- 支付：仅接 PayPal 或 Stripe 其一；库存先简化为“有货/无货”。
- 前台对接：读取 Medusa products 与 prices；下单直链 Medusa 结账或前台简易购物车。
- 内容：MDX 暂代，Strapi 迁移后增量替换。

## 本次上线“割舍清单”（建议写入 Story）
- 不做：多币种、复杂税运、搜索、账号中心、客服工单、产品对比、多环境灰度。
- 仅做：单币种/固定运费、无登录、跳转式支付、静态内容 + 少量指南。
- 保留：预览部署、Sentry、Uptime、上线后健康探测。

## 可立即执行的后续
- 我可在仓库内生成：catalog.json + 最小路由（/shop、/product/[slug]）+ Stripe Checkout 接入骨架；
  并创建“上线冲刺（5 天）”的 Story（AC 与任务清单），从今天开始执行。

