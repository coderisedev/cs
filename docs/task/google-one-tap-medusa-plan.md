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
  - 利用 Auth Module（v2）或自定义 `/store/auth/google` API
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
   - 建立 `modules/auth/providers/google`（v2）或 API route（v1 风格）
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
