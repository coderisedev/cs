# Social Auth Expansion Plan

## Context
- 当前 Medusa 后端通过 `@medusajs/auth` 统一会话，默认启用了 `auth-emailpass` 与 Google（标准 OAuth 以及 One Tap 自研模块）。
- Storefront/Admin 均依赖 Medusa 颁发的 `jwt`/cookie，因此必须保持“后端是真实源，前端只负责发起 OAuth”这一边界，避免多套会话逻辑。
 - 业务希望新增 Discord、Facebook 登录，同时沿用既有部署（GCE + Cloudflare + Redis/Postgres）与运维流程。

## Technical Approach
1. **模块化 Provider**  
   - 每个社交登录实现一个 `src/modules/auth-<provider>` 模块，继承 `AbstractAuthModuleProvider`，对接对应的 OAuth API（token exchange + profile 拉取），并使用 `authIdentityService` 维护用户绑定。  
   - 模块通过 `ModuleProvider(Modules.AUTH, { services: [...] })` 导出，并在 `medusa-config.ts` 里依据环境变量拼装 `AUTH_PROVIDERS`。
2. **统一配置与密钥管理**  
   - 在 `apps/medusa/.env.template`、`deploy/gce/env/medusa.env`、`docs/medusa-strapi-local-setup.md` 补充 `DISCORD_CLIENT_ID`/`SECRET`/`OAUTH_CALLBACK_URL` 等占位符，保持一处更新。  
   - 生产 secrets 依旧注入到 `deploy/gce/.env`，并通过 Terraform/Pulumi 复制到 Vercel/Cloudflare 等边缘层。
3. **前端配合**  
   - `apps/dji-storefront`（Next.js 14 App Router）是唯一客户入口：它只负责发起 `/auth/{provider}` 跳转并处理窗口通信，所有 token 交换仍在 Medusa 完成。  
   - 新增的 Discord/Facebook 按钮共用与 `auth/google` 相同的弹窗/回调框架；无需在前端维护第三方 access token。
4. **可观测与治理**  
   - Provider 服务在成功/失败时写入结构化日志（provider、错误类型、clientId hash），同时在 Datadog/Grafana 设置失败率报警。  
   - 在 Medusa Admin 暴露每个用户绑定的 provider 列表，支持客服解绑与重新授权。  
   - 新增 runbook 说明如何旋转客户端密钥/回滚 Provider。

## Execution Plan

### Phase 1 – 基础设施与准备
1. 文档与 env 模板：更新 `docs/medusa-strapi-local-setup.md`、`apps/medusa/.env.template`、`deploy/gce/env/medusa.env.example`，加入三方 OAuth 所需变量及说明。  
2. 安全审查：确认 OAuth 回调 URL、https 证书与 Cloudflare Tunnel 配置，登记在 secrets 管理清单。  
3. 监控骨架：在 `apps/medusa/src/subscribers` 中新增通用日志/metrics 帮助器，供各 Provider 复用。

### Phase 2 – Provider 实现
1. Discord  
   - 模块：`src/modules/auth-discord`（service + index + migrations/seed 如需）。  
   - 功能：实现 OAuth2 code exchange，校验 `email_verified`，写入 Auth Identity。  
   - 测试：新增 workflow/integration 测试模拟 Discord token 响应；手动回归 `/auth/discord/callback`。  
2. Facebook  
   - 模块：`src/modules/auth-facebook`。  
   - 处理长短期 token 交换（`/oauth/access_token` & `/debug_token`），必要时缓存 `appsecret_proof`。  
   - 注意“必须 https”与 App Review 需求，文档化流程。

### Phase 3 – 集成与发布
1. `medusa-config.ts`：按环境变量动态启用新 Provider；在 deploy 清单里确保变量同步。  
2. Storefront/Admin：在 `apps/dji-storefront` 中添加 Discord/Facebook 登录入口、`/auth/<provider>` 路由和回调页面（沿用 Google 弹窗模式），并编写 Cypress/E2E 脚本覆盖。  
3. Observability：Grafana Dashboard + Datadog monitor（登录失败率、provider 启用状态）。  
4. Runbook / Training：在 `docs/runbooks` 记录常见报错、密钥轮转步骤；在每次发布前执行 `medusa db:migrate` 和 OAuth smoke test。

### Phase 4 – Beta 验证与 GA
1. Beta：挑选内部账号/灰度环境验证各 provider；记录问题并修复。  
2. GA：更新公开文档、`docs/stories` 中的故事记录，合并 CI 校验（lint、yamllint、`pnpm --filter medusa test:integration`）。  
3. 维护：制定季度回归计划，跟踪第三方 API 变更（Facebook token 过期策略），并在 backlog 中列出后续 provider（Apple 等）。
