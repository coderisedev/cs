# Google One Tap Integration Plan (Medusa v2 + DJI Storefront)

## 1. Product Experience
- 浏览开放：未登录用户可访问首页、集合、产品详情、博客等全部信息页面，也能将商品加入购物车并暂存。
- 登录触发点：
  - 进入结账流程（点击 Checkout）
  - 访问账户中心、订单历史、售后、愿望单、评论等受限功能
  - 提交高价值表单（预约、受限资料下载）
- 提示策略：
  - 顶部导航显示 Login/Account 入口
  - 当用户触发受限操作时弹窗提示登录，提供 Google One Tap + 传统登录选项，除结账外允许“稍后再说”
  - 购物车顶部提示“登录以同步配置”

## 2. Architecture & Limitations
- Medusa v2 未提供官方 Google Auth 插件，需要自建 provider：
  - 利用 Auth Module（v2）
  - 后端使用 `@google-auth-library` 验证 ID Token，按 `sub`/`email` 查找或创建用户
  - 返回 Medusa session / JWT，使前端与现有登录流程一致
- 数据模型：
  - `customers` 表新增 `metadata.googleSub`
  - Cart 合并：匿名 cart ID 登录后与用户 cart merge

## 3. Implementation Steps

### 3.1 Credentials & Config
1. 在 Google Cloud Console 创建 Identity Services One Tap 客户端
2. 配置 `Authorized JavaScript origins`（本地、Vercel preview、生产域名）
3. 收集 `GOOGLE_CLIENT_ID`（One Tap）与可选 `GOOGLE_CLIENT_SECRET`
4. 将变量写入 `.env`, `.env.production`, Vercel/Medusa 部署环境

### 3.2 Medusa Backend
1. **Provider / Route**
   - 建立 `modules/auth/providers/google`（v2）
   - 实现 `authenticate(data)` 或控制器：`verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID })`
2. **User Flow**
   - Google 返回的 ID Token (`response.credential`) 解码后包含 `email`, `email_verified`, `sub`, `name`, `picture` 等字段
   - `verifyIdToken` 通过后，检查 `email_verified`
   - 通过 Medusa `customerService.retrieveRegisteredByEmail(email)` 查找用户
   - 未找到则 `customerService.create({ email, first_name, last_name, metadata: { googleSub: sub, avatarUrl: picture } })`
   - 已存在则更新 `metadata.googleSub` / 头像信息
   - 生成 session / JWT，返回给前端
3. **Security**
   - 校验 `aud`, `iss`, `exp`
   - 强制 HTTPS，启用 CSRF 保护
4. **Testing**
   - 后端单元测试：mock `verifyIdToken`
   - Integration：模拟注册/登录、重复登录、拒绝流程

### 3.3 Next.js Storefront
1. 加载 Google Identity Services 脚本（在 `_app` 或 login 组件 with `next/script`）
2. `google.accounts.id.initialize({ client_id, callback, auto_select: false })`
3. 在登录页和结账前调用 `google.accounts.id.prompt()`
4. `callback` 中将 `response.credential` POST 到 Medusa `/store/auth/google`
5. 成功后刷新用户上下文、cart、跳转回原路径
6. 提供可点击的“Continue with Google”按钮作为 One Tap fallback

## 4. Validation & Release Checklist
- **Local checks**：`yamllint bmad/bmm/workflows`, `xmllint --noout bmad/bmm/tasks/*.xml`, `pnpm --filter apps/dji-storefront lint/test`
- **Vercel Preview**：每个 PR 自动生成预览，验证 One Tap UI、登录流程、拒绝行为
- **Documentation**：更新 `README`, `.env.example`, onboarding docs
- **Feature Flag**：可通过 env 或 config 开关 One Tap，以便快速回滚
- **Monitoring**：记录登录成功率、错误率；Sentry/Logtail 抓取异常

## 5. Rollout Strategy
1. 阶段一：后端 API + 手动调用（隐藏入口）→ QA
2. 阶段二：登录/注册页展示 Google 按钮 → 观察转化
3. 阶段三：开启全站 One Tap 提示（可按地理或用户组渐进式放量）

该计划兼顾用户体验（可匿名浏览 + 关键节点登录）、无现成插件的技术现实，以及两人团队的交付节奏。完成后可提升注册转化并减少表单输入阻力。

## 6. Task Breakdown
1. **Product Checklist** — ✅ 完成  
   - 决定强制登录的触发点，并写接受标准：匿名浏览允许、结账/账户等需登录、One Tap 暂停/拒绝行为。  
   - 产出：`docs/task/google-one-tap-product-checklist.md`
2. **Credential Setup** — ✅ 完成  
   - 在 Google Console 创建 One Tap 客户端，配置 localhost/Vercel/Prod origins。  
   - 将 `GOOGLE_CLIENT_ID` (`GOOGLE_CLIENT_SECRET` 如需) 写入 `.env`, `.env.production`, Vercel/Medusa 环境。  
   - 产出：`docs/task/google-one-tap-credential-setup.md`，并在 `.env` 模板中加入变量。
3. **Medusa Backend – Provider** — ✅ 完成  
   - Scaffold `modules/auth/providers/google`（或等效服务）并接入 `@google-auth-library`。（实现：`apps/medusa/src/modules/auth-google-one-tap`）  
   - 校验 ID Token，查找/创建客户，存储 `googleSub`/头像，生成 session/JWT。  
   - 已接入 `medusa-config.ts`，并在存在 `GOOGLE_CLIENT_ID` 时自动启用。
4. **Backend Testing & Docs** — ⚠️ 未完成  
   - 编写 unit/integration tests（mock `verifyIdToken`、验证 cart merge）。  
   - 更新 README / `.env.example` / onboarding steps。  
   - 需要补充测试覆盖与文档说明。
5. **Next.js Frontend** — ✅ 完成  
   - 在登录页/公共入口加载 Google Identity Services script 并初始化 One Tap。  
   - 处理 `credential` 回调，调用 `/api/auth/google-one-tap`，刷新登录状态与购物车。  
   - 添加显式 “Continue with Google” 按钮作为 fallback。
6. **Experience Guards** — ✅ 完成  
   - 确保匿名 cart 持续存在，登录后自动 merge；在 checkout/account/wishlist 等路由实施登录墙。  
   - 任何受限操作给出引导文案和 One Tap/传统登录选项。  
   - Account/Checkout 页面现已要求登录并保留 `returnTo`。
7. **Validation & Rollout** — ⚠️ 部分完成  
   - 按第 4 节清单跑 lint/tests + 预览验证（已运行 lint，本地验证就绪，待补写说明/截图）。  
   - 设置 feature flag/env toggle，分阶段放量，监控错误率与转化率（目前通过 `NEXT_PUBLIC_ENABLE_GOOGLE_ONE_TAP` 控制，但未记录监控/发布步骤）。
