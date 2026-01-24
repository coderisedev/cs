# Lumora Platform Admin: Sprint Plan

> **Ref:** docs/prd/platform-admin-init.md, docs/cto/adr-001-lumora-foundation.md
> **Start Date:** 2026-01-24
> **Team Size:** 1 developer
> **Sprint Duration:** 1 week per sprint
> **Total Sprints:** 3

---

## Sprint 1: Foundation + Auth Core

**Goal:** 用户可以注册、登录、登出。Supabase 数据库就绪。

### Stories

#### S1.1: Supabase 项目配置
**Priority:** P0
**Points:** 2

- [ ] 创建 Supabase 项目（或使用本地 `supabase start`）
- [ ] 启用 Email/Password 认证
- [ ] 配置 Google OAuth provider（Google Cloud Console 创建 OAuth Client）
- [ ] 设置 Auth URL 白名单（`http://localhost:3000/auth/callback`）
- [ ] 获取 `SUPABASE_URL` 和 `ANON_KEY`，写入 `.env.local`

**验收：** `supabase status` 显示所有服务运行中

---

#### S1.2: 执行数据库 Migration
**Priority:** P0
**Points:** 1

- [ ] 确认 `supabase/migrations/20260124000001_initial_schema.sql` 内容正确
- [ ] 执行 `supabase db push` 或 `supabase migration up`
- [ ] 验证三张表创建成功（profiles, tenants, tenant_members）
- [ ] 验证 RLS 策略激活（`SELECT * FROM pg_policies`）
- [ ] 验证 trigger 创建成功（`\df public.handle_new_user`）
- [ ] 验证 reserved_slugs 种子数据插入

**验收：** 通过 Supabase Dashboard SQL Editor 手动验证所有对象存在

---

#### S1.3: 注册页面实现
**Priority:** P0
**Points:** 3

- [ ] 创建 `components/auth/register-form.tsx`
  - Email 输入框（实时格式校验）
  - Password 输入框（强度指示器）
  - Full Name 输入框
  - Submit 按钮（loading state）
  - "Sign in with Google" 按钮
  - 链接至 /login
- [ ] 接入 `actions/auth.ts#signUp` Server Action
- [ ] 错误状态显示（email_taken, weak_password）
- [ ] 成功后重定向至 /onboarding

**验收：**
- 填写合法信息提交后，Supabase auth.users 和 profiles 表各新增一条记录
- 密码不满足要求时显示具体错误
- 表单提交期间按钮显示 loading

---

#### S1.4: 登录页面实现
**Priority:** P0
**Points:** 3

- [ ] 创建 `components/auth/login-form.tsx`
  - Email 输入框
  - Password 输入框
  - Submit 按钮（loading state）
  - "Sign in with Google" 按钮
  - 链接至 /register
- [ ] 接入 `actions/auth.ts#signIn` Server Action
- [ ] 错误状态显示（invalid_credentials）
- [ ] 成功后重定向至 /dashboard 或 /onboarding

**验收：**
- 正确凭证登录后 cookie 设置成功，重定向至 dashboard
- 错误凭证显示"Invalid email or password"

---

#### S1.5: Google OAuth 流程
**Priority:** P1
**Points:** 2

- [ ] 实现 `actions/auth.ts#signInWithGoogle`
- [ ] 确认 `/auth/callback/route.ts` 正确处理 code exchange
- [ ] 首次 OAuth 登录时自动创建 profile（通过 trigger）
- [ ] 验证 full_name 和 avatar_url 从 Google 同步

**验收：** 点击 Google 按钮 → Google consent → 回调 → 自动登录 → 重定向

---

#### S1.6: Middleware 路由守卫
**Priority:** P0
**Points:** 2

- [ ] 确认 middleware.ts 正确拦截未认证请求
- [ ] 未认证 → redirect /login
- [ ] 已认证 + /login → redirect /dashboard
- [ ] 验证 session cookie 续期正常工作

**验收：**
- 未登录访问 /dashboard 被重定向至 /login
- 已登录访问 /login 被重定向至 /dashboard

---

### Sprint 1 Definition of Done
- [ ] 用户可通过邮箱注册并登录
- [ ] 用户可通过 Google OAuth 登录
- [ ] 路由守卫正常工作
- [ ] Supabase 数据库 schema 就绪
- [ ] 所有认证错误有明确的用户反馈

---

## Sprint 2: Store Management

**Goal:** 用户可以创建店铺，查看店铺列表，进入店铺控制台。

### Stories

#### S2.1: 开店向导页面 (Onboarding)
**Priority:** P0
**Points:** 5

- [ ] 创建 `components/tenant/create-tenant-form.tsx`
  - Store Name 输入框（2-64 字符校验）
  - Slug 输入框（自动从 name 生成，可手动修改）
  - Slug 可用性实时指示器（绿色勾/红色叉）
  - 预览文字：`{slug}.lumora.shop`
  - Submit 按钮（loading state）
- [ ] 实现 slug 自动生成（`lib/validators/slug.ts#slugify`）
- [ ] 实现 debounced slug 检查（300ms，调用 `checkSlugAvailability`）
- [ ] 保留词拦截（前端 + 后端双重校验）
- [ ] 接入 `actions/tenants.ts#createTenant` Server Action
- [ ] 成功后重定向至 `/store/[slug]/admin`
- [ ] 错误处理：slug_taken（显示建议）、limit_reached（显示升级提示）

**验收：**
- 输入 "My Shop" 后 slug 自动变为 "my-shop"
- slug 已被占用时实时显示红色提示 + 建议
- 提交后 tenants + tenant_members 各新增一条记录
- Free 用户第 4 个店铺被拒绝

---

#### S2.2: Middleware 开店检测
**Priority:** P0
**Points:** 1

- [ ] 已认证 + 无店铺 + 访问非 /onboarding → redirect /onboarding
- [ ] 已认证 + 有店铺 + 访问 /onboarding → 正常显示（允许创建更多）
- [ ] 确认 middleware 中 tenant_members count 查询性能 (< 50ms)

**验收：** 新注册用户首次登录自动进入 onboarding

---

#### S2.3: 店铺列表页面 (Dashboard)
**Priority:** P0
**Points:** 3

- [ ] 实现 Server Component 数据获取（tenant_members + tenants join）
- [ ] 卡片布局：name + slug + plan badge + role badge
- [ ] 点击卡片跳转至 `/store/[slug]/admin`
- [ ] 右上角 "Create Store" 按钮
- [ ] Empty state（无店铺时引导至 onboarding）
- [ ] status='suspended' 显示灰色 + 警告
- [ ] status='deleted' 不显示

**验收：**
- 创建 2 个店铺后 dashboard 显示 2 张卡片
- 卡片显示正确的 plan 和 role 信息

---

#### S2.4: 租户权限守卫
**Priority:** P0
**Points:** 2

- [ ] Middleware 中实现 /store/[slug] 路径的成员校验
- [ ] 非成员访问他人店铺返回 404（不是 403，避免信息泄露）
- [ ] 成员可正常访问自己参与的店铺

**验收：**
- 用户 A 创建店铺 "shop-a"，用户 B 访问 /store/shop-a 得到 404
- 用户 A 访问 /store/shop-a 正常显示

---

#### S2.5: 店铺控制台骨架
**Priority:** P1
**Points:** 2

- [ ] `/store/[slug]/admin/page.tsx` 显示店铺基本信息（name, slug, plan, created_at）
- [ ] 顶部导航栏显示店铺名称 + 返回 dashboard 链接
- [ ] 侧边栏占位（Products, Orders, Settings 链接，暂不实现内容）

**验收：** 点击 dashboard 卡片后进入店铺控制台，显示店铺名称和 slug

---

#### S2.6: 登出功能
**Priority:** P1
**Points:** 1

- [ ] Header 中添加用户菜单（Dropdown）
- [ ] 显示用户 email
- [ ] "Sign Out" 按钮调用 `actions/auth.ts#signOut`
- [ ] 登出后清除 cookie，重定向至 /login

**验收：** 点击 Sign Out 后再次访问 /dashboard 被重定向至 /login

---

### Sprint 2 Definition of Done
- [ ] 完整的注册 → 开店 → dashboard → 进入店铺流程可走通
- [ ] slug 实时校验可用性
- [ ] 非成员无法访问他人店铺
- [ ] Free plan 3 店铺限制生效

---

## Sprint 3: Settings + Polish

**Goal:** 账号设置完善，E2E 测试覆盖，生产部署就绪。

### Stories

#### S3.1: 账号设置页面
**Priority:** P1
**Points:** 3

- [ ] 显示当前 email（只读）
- [ ] Full Name 编辑（接入 `actions/profile.ts#updateProfile`）
- [ ] 头像上传
  - 限制 2MB，jpg/png/webp
  - 上传至 Supabase Storage `avatars/{user_id}`
  - 更新 profiles.avatar_url
- [ ] 密码修改（需输入当前密码）
- [ ] 保存成功/失败 toast 提示

**验收：**
- 修改名称后 dashboard header 显示新名称
- 上传头像后立即显示

---

#### S3.2: 邮箱验证流程
**Priority:** P1
**Points:** 2

- [ ] 注册后显示"验证邮件已发送"提示页
- [ ] 未验证用户尝试登录时显示提示 + 重新发送按钮
- [ ] Supabase Email Template 配置（自定义确认邮件模板）
- [ ] 确认链接点击后自动登录

**验收：** 注册后必须点击邮件链接才能登录

---

#### S3.3: 响应式布局适配
**Priority:** P1
**Points:** 2

- [ ] 所有页面在 375px 宽度下正常显示
- [ ] Dashboard 卡片从 3 列 → 2 列 → 1 列响应
- [ ] Auth 页面在移动端居中显示
- [ ] Header 导航在移动端收缩为 hamburger menu
- [ ] 表单输入框在移动端不被键盘遮挡

**验收：** Chrome DevTools 模拟 iPhone SE 宽度，所有页面可正常操作

---

#### S3.4: 错误处理与 Toast
**Priority:** P1
**Points:** 2

- [ ] 实现全局 Toast 组件（基于 @radix-ui/react-toast）
- [ ] 所有 Server Action 错误统一通过 Toast 反馈
- [ ] 网络超时显示"Network error, please retry"
- [ ] 成功操作显示绿色确认 Toast

**验收：** 断开网络后提交表单显示错误 toast

---

#### S3.5: 单元测试
**Priority:** P1
**Points:** 2

- [ ] `lib/validators/slug.test.ts`
  - slugify 生成逻辑（中文/特殊字符/空格）
  - validateSlug 校验规则
  - 保留词拦截
  - suggestSlug 候选生成
- [ ] `lib/validators/auth.test.ts`
  - 密码强度校验
  - email 格式校验
- [ ] `lib/constants.test.ts`
  - Plan limits 结构校验

**验收：** `pnpm --filter lumora-platform test:unit` 全部通过

---

#### S3.6: E2E 测试
**Priority:** P2
**Points:** 3

- [ ] 安装 Playwright（`pnpm --filter lumora-platform add -D @playwright/test`）
- [ ] 测试用例：
  1. 注册新账户 → 自动进入 onboarding
  2. 创建店铺 → 重定向至店铺控制台
  3. 返回 dashboard → 显示店铺卡片
  4. 登出 → 重定向至 login
  5. 用错误密码登录 → 显示错误
  6. 非成员访问他人店铺 → 404
- [ ] CI 集成（GitHub Actions 运行 E2E）

**验收：** `pnpm --filter lumora-platform test:e2e` 6 个用例全部通过

---

#### S3.7: 部署配置
**Priority:** P1
**Points:** 2

- [ ] Vercel 项目创建（连接 GitHub repo）
- [ ] 配置环境变量（SUPABASE_URL, ANON_KEY, SITE_URL）
- [ ] 配置 Root Directory 为 `apps/lumora-platform`
- [ ] 确认 preview deploy 正常工作（PR 自动部署）
- [ ] 配置自定义域名 `app.lumora.shop`（如已购买）
- [ ] Supabase 项目切换为 Pro Plan（生产环境）

**验收：** push 到 main 后 Vercel 自动部署，访问域名可正常使用

---

#### S3.8: Sentry 集成
**Priority:** P2
**Points:** 1

- [ ] 安装 `@sentry/nextjs`
- [ ] 配置 `sentry.client.config.ts` 和 `sentry.server.config.ts`
- [ ] 验证错误自动上报（手动触发一个错误）
- [ ] 配置 source map 上传

**验收：** Sentry Dashboard 中看到测试错误

---

### Sprint 3 Definition of Done
- [ ] 账号设置页面完整可用
- [ ] 邮箱验证流程正常
- [ ] 移动端响应式正常
- [ ] 单元测试覆盖关键校验逻辑
- [ ] E2E 覆盖核心用户流程
- [ ] Vercel 部署成功
- [ ] Lighthouse Performance > 90, Accessibility > 90

---

## 总览：Story Point 分配

| Sprint | Stories | Total Points | Focus |
|--------|---------|-------------|-------|
| Sprint 1 | S1.1 - S1.6 | 13 | Auth + DB |
| Sprint 2 | S2.1 - S2.6 | 14 | Store CRUD + Guards |
| Sprint 3 | S3.1 - S3.8 | 17 | Polish + Deploy |

---

## 关键里程碑

| 里程碑 | 完成条件 | 对应 Sprint |
|--------|---------|-------------|
| M1: Auth Works | 注册/登录/登出全流程可用 | Sprint 1 End |
| M2: Core Loop | 开店 → Dashboard → 店铺控制台 | Sprint 2 End |
| M3: Production Ready | E2E 通过 + Vercel 部署 + 监控就绪 | Sprint 3 End |

---

## 风险与依赖

| 风险 | 缓解措施 |
|------|---------|
| Google OAuth 配置复杂 | Sprint 1 中作为 P1（可延迟至 Sprint 2） |
| Supabase 本地开发环境不稳定 | 备用方案：直接用 Supabase Cloud Free Tier |
| Tailwind v4 与 shadcn 兼容性 | 如遇问题，退回 Tailwind v3 |
| Next.js 16 breaking changes | 锁定版本，不在 sprint 期间升级 |

---

## 项目骨架已就绪

Sprint 1 开始前，以下已完成（通过项目初始化）：

- [x] Next.js 16 + App Router + TypeScript
- [x] Tailwind CSS v4 + 主题变量
- [x] Supabase SDK（server/client/middleware helpers）
- [x] UI 组件（Button, Input, Card, Label）
- [x] 校验工具（slug, auth validators）
- [x] Server Actions 骨架（auth, tenants, profile）
- [x] Middleware 路由守卫
- [x] 数据库 Migration 文件
- [x] 目录结构 + 占位页面
