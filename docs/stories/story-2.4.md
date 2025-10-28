# Story 2.4: Google OAuth Sign-In (One Tap / NextAuth)

Status: in-progress

## Story

As a quality engineer,
I want Google one-click sign-in so the site can recognize users for downloads or profile flows,
while checkout仍允许游客下单，降低阻力。

## Acceptance Criteria

1. Google OAuth 登录成功（Sandbox 到 Production 可切换）；可在前台识别登录态。  
2. 最小用户持久化（会话）即可；不要求完整账户中心。  
3. 登录入口与退出入口可用；状态显示清晰。  
4. 安全配置与回调域名文档化；不将敏感信息写入仓库。

## Tasks / Subtasks

- [x] 配置位点（.env 示例）与 NextAuth 集成（最小 Session）  
- [x] UI：状态页入口（/auth/status）与 Sign in/out 链接  
- [ ] 文档：回调域名、环境变量、测试步骤

## Dev Notes

- 账户中心与订单历史留待后续迭代；本故事仅提供最小登录能力。  
- 游客下单不受影响。

### References

- docs/prd-quick-launch-plan-b-2025-10-27.md

## Dev Agent Record

### Context Reference

- docs/stories/2-4-google-oauth-sign-in.context.md

### Agent Model Used

sm (Scrum Master)

### Debug Log References
2025-10-27: Google OAuth 最小集成
- 新增：apps/storefront/src/app/api/auth/[...nextauth]/route.ts（Google Provider）
- 新增：apps/storefront/src/app/auth/status/page.tsx（显示登录状态/登出入口）
- 更新：apps/storefront/.env.local.example 增加 NEXTAUTH_URL（本地）
- 类型检查通过：`pnpm --filter storefront typecheck`

### Completion Notes List

### File List

- apps/storefront/src/app/api/auth/[...nextauth]/route.ts
- apps/storefront/src/app/auth/status/page.tsx
