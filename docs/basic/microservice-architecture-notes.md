# 架构定位：Headless 多服务（Medusa + Strapi + Next.js）

当前仓库虽然没有传统意义上“几十个独立微服务 + 独立团队”，但已经具备多服务协作的核心特征，可理解为一种轻量级微服务/Headless 组合架构：

## 现状
- **Medusa**：专注电商域（商品、库存、购物车、订单）。数据层位于 `src/lib/data/products.ts` 等文件，通过 Medusa SDK + cookies 获取状态。
- **Strapi**：专注内容域（博客、产品详情、SEO 等），前端通过 `getStrapiClient()` 与 `/api/posts`、`/api/product-details` 等接口交互。
- **Next.js**：作为体验层/编排层，在单页中 `Promise.all` 调用多个服务，将结构化数据 + 富内容在 UI 中组合展示。

## 微服务特征对照
1. **业务边界清晰**：电商逻辑与内容逻辑分离，彼此使用 HTTP/JSON 通信，不共享数据库。
2. **独立配置/敏感信息**：Medusa 使用 `MEDUSA_BACKEND_URL`、用户 session；Strapi 使用 `STRAPI_API_URL`、API token。即使某个服务故障，另一个仍可运行。
3. **组合式前端**：商品详情页同时获取 Medusa SKU & Strapi 富文本，类似“前端 orchestrator”模式。
4. **拓展性**：若引入搜索/推荐等新服务，只需在 `src/lib/data/*` 中新增模块，现有结构不受影响。

## 下一步建议
- **独立部署/版本管理**：Medusa 与 Strapi 可分别拥有 CI/CD 流程，前端通过 env 切换目标地址。
- **服务契约文档**：输出 OpenAPI/GraphQL schema，让前端依赖固定版本，避免隐式耦合。
- **可观测性**：为每个服务提供 `/health`、日志、APM，前端出现 fallback 时能快速定位是哪个服务异常。

## 表述建议
可以把此架构描述为：
> “Headless 多服务：Medusa (Commerce) + Strapi (Content) + Next.js (Experience Layer)。前端通过统一的 `src/lib/data/*` 模块 orchestrate 不同服务，实现可独立扩展的组合式体验。”

这样既突出了微服务/Headless 的特性，也契合当前代码库的实际结构。
