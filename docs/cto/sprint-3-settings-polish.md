# Sprint 3: Settings + Polish

> **Ref:** docs/prd/platform-admin-init.md, docs/cto/adr-001-lumora-foundation.md
> **Prerequisites:** Sprint 1 + Sprint 2 完成
> **Goal:** 账号设置完善，单元/E2E 测试覆盖，生产部署就绪。

---

## 技术栈概要

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| Testing (Unit) | Vitest | ^2.0.0 |
| Testing (E2E) | Playwright | 需安装 |
| UI | Radix UI + CVA + Tailwind v4 | - |
| Storage | Supabase Storage | 用于头像上传 |
| Monitoring | Sentry | @sentry/nextjs 需安装 |
| Deploy | Vercel | - |
| App Location | `apps/lumora-platform/` | - |

---

## Sprint 1 + 2 交付物（前置条件）

- [x] 用户注册/登录/登出全流程可用
- [x] Google OAuth 可用
- [x] 开店向导 + slug 实时校验
- [x] Dashboard 店铺列表 + Empty state
- [x] 店铺控制台骨架 + 权限守卫
- [x] Middleware 路由守卫 + onboarding 重定向
- [x] Free plan 3 店铺限制生效
- [x] 用户菜单 + 登出
- [x] 数据库 schema + RLS 全部就绪
- [x] `pnpm build:lumora` 编译通过

---

## 已就绪的相关代码

### Profile Action (`src/actions/profile.ts` — 已实现)
```typescript
export async function updateProfile(formData: FormData) {
  // Validates: fullName (2-64 chars), avatarUrl (url format)
  // Updates profiles table: full_name, avatar_url
  // Returns { success: true } or { error: { ... } }
}
```

### 相关 Schema
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 现有校验器
```typescript
// src/lib/validators/auth.ts
export const passwordSchema = z.string()
  .min(8).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/);

// src/lib/validators/slug.ts
export function slugify(name: string): string
export function validateSlug(slug: string): { valid: boolean; error?: string }
export const RESERVED_SLUGS: Set<string>
export function suggestSlug(slug: string, attempt?: number): string
```

### 现有常量 (`src/lib/constants.ts`)
```typescript
export const PLAN_LIMITS = {
  free: { maxStores: 3, aiImagesPerMonth: 10, aiTokensPerMonth: 50_000 },
  pro: { maxStores: 20, aiImagesPerMonth: 100, aiTokensPerMonth: 500_000 },
  enterprise: { maxStores: Infinity, aiImagesPerMonth: Infinity, aiTokensPerMonth: Infinity },
};

export const ERROR_MESSAGES = {
  email_taken: "An account with this email already exists",
  weak_password: "Password must be at least 8 characters...",
  invalid_credentials: "Invalid email or password",
  slug_taken: "This store address is already taken",
  limit_reached: "You've reached the maximum...",
  network_error: "Network error. Please try again.",
  unknown_error: "Something went wrong. Please try again.",
};
```

---

## Stories

### S3.1: 账号设置页面
**Priority:** P1 | **Points:** 3

**需创建文件:**
- `src/components/settings/profile-form.tsx`
- `src/components/settings/avatar-upload.tsx`
- `src/components/settings/password-form.tsx`

**需修改文件:**
- `src/app/(protected)/settings/page.tsx` — 实现完整设置页面

**实现细节:**

```tsx
// app/(protected)/settings/page.tsx — Server Component
// 1. 获取 user profile (email, full_name, avatar_url)
// 2. 渲染三个 section：Profile Info, Avatar, Password

// components/settings/profile-form.tsx — Client Component
// - Email（只读，灰色背景 disabled input）
// - Full Name 编辑框（调用 updateProfile Server Action）
// - Save 按钮 + loading state
// - 成功：显示绿色 toast "Profile updated"
// - 失败：显示红色 toast

// components/settings/avatar-upload.tsx — Client Component
// - 当前头像显示（<Avatar> 组件）
// - "Change Avatar" 按钮 → file input
// - 限制：2MB, jpg/png/webp only
// - 上传流程：
//   1. 选择文件 → 预览
//   2. 上传至 Supabase Storage: `avatars/{user_id}/{timestamp}.{ext}`
//   3. 获取 public URL
//   4. 调用 updateProfile({ avatarUrl: publicUrl })
//   5. 刷新页面

// components/settings/password-form.tsx — Client Component
// - Current Password 输入框
// - New Password 输入框（强度指示器，复用 passwordSchema）
// - Confirm Password 输入框
// - Save 按钮
// - 调用 supabase.auth.updateUser({ password: newPassword })
// - 注意：Supabase Auth 的 updateUser 需要当前 session 有效
```

**Supabase Storage 配置（需手动创建 bucket）:**
```sql
-- 在 Supabase Dashboard → Storage 中创建 bucket
-- Name: avatars
-- Public: true（允许公开访问头像 URL）
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
```

**验收标准:**
- 修改名称后保存，dashboard header UserMenu 显示新名称
- 上传头像后立即显示新头像（不需刷新整页）
- 超过 2MB 的文件显示 "File too large (max 2MB)"
- 非图片文件显示 "Only JPG, PNG, and WebP are supported"
- 密码修改成功后显示 toast "Password updated"
- Email 字段为只读状态

---

### S3.2: 邮箱验证流程
**Priority:** P1 | **Points:** 2

**需创建文件:**
- `src/app/(auth)/verify-email/page.tsx`

**需修改文件:**
- `src/actions/auth.ts#signUp` — 成功后跳转 /verify-email 而非 /onboarding
- `src/app/(auth)/login/page.tsx` — 未验证用户显示提示

**实现细节:**

```tsx
// app/(auth)/verify-email/page.tsx
// - 标题："Check your email"
// - 描述："We sent a verification link to {email}. Click the link to verify."
// - "Resend email" 按钮（调用 supabase.auth.resend({ type: 'signup', email })）
// - "Back to login" 链接

// 修改 signUp action:
// - 注册成功后 redirect("/verify-email?email=" + email)
// - 而非直接 redirect("/onboarding")

// 修改 login page:
// - 如果 Supabase 返回 "Email not confirmed" 错误
// - 显示 "Please verify your email" + "Resend" 按钮
```

**Supabase 配置:**
- Dashboard → Authentication → Email Templates → 自定义确认邮件模板
- Dashboard → Authentication → URL Configuration:
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000/auth/callback`
- 确认链接格式: `{SITE_URL}/auth/callback?code={TOKEN}&next=/onboarding`

**验收标准:**
- 注册后显示 "Check your email" 页面
- 未验证用户尝试登录时显示 "Please verify your email" + 重发按钮
- 点击邮件中确认链接后自动登录，跳转至 /onboarding
- "Resend email" 点击后显示 "Email sent" 确认

---

### S3.3: 响应式布局适配
**Priority:** P1 | **Points:** 2

**需修改文件:**
- `src/app/(auth)/layout.tsx`
- `src/app/(protected)/layout.tsx`
- `src/app/(protected)/dashboard/page.tsx`
- `src/components/layout/store-sidebar.tsx`
- `src/components/layout/user-menu.tsx`

**Tasks:**
- [ ] 所有页面在 375px 宽度下正常显示（iPhone SE）
- [ ] Dashboard 卡片从 3 列 → 2 列 → 1 列响应
- [ ] Auth 页面在移动端居中显示（`max-w-sm mx-auto px-4`）
- [ ] Protected layout Header 在移动端：
  - Logo 左对齐
  - UserMenu 右对齐
  - 中间内容隐藏（如有）
- [ ] Store admin sidebar 在移动端收缩为 hamburger menu
  - 使用 `@radix-ui/react-dialog` 实现 mobile drawer
  - `lg:` 以上显示为固定侧边栏
- [ ] 表单输入框在移动端不被键盘遮挡（使用 `scroll-mt-4`）

**Tailwind v4 断点参考：**
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

**验收标准:**
- Chrome DevTools 模拟 iPhone SE (375px) 宽度，所有页面可正常操作
- Dashboard 卡片在 375px 为 1 列，768px 为 2 列，1024px+ 为 3 列
- 移动端 Store sidebar 点击 hamburger 展开为 drawer
- 所有表单在移动端可完整显示，不超出屏幕

---

### S3.4: 错误处理与 Toast 系统
**Priority:** P1 | **Points:** 2

**需创建文件:**
- `src/components/ui/toast.tsx` (基于 `@radix-ui/react-toast`)
- `src/components/ui/toaster.tsx` (全局 Toast 容器)
- `src/hooks/use-toast.ts` (Toast state management)

**需修改文件:**
- `src/app/layout.tsx` — 添加 `<Toaster />` 到 body 底部
- 所有 form 组件 — 成功/失败统一使用 toast

**实现细节:**

```tsx
// hooks/use-toast.ts
// 简单的 toast state manager（不引入 zustand）：
// - toast({ title, description, variant: 'default' | 'success' | 'destructive' })
// - 自动 5s 后消失
// - 支持手动关闭

// components/ui/toast.tsx
// 基于 @radix-ui/react-toast：
// - Toast.Provider duration={5000}
// - Toast.Root (variants: default=灰色, success=绿色, destructive=红色)
// - Toast.Title + Toast.Description
// - Toast.Close (X 按钮)
// - Toast.Viewport (fixed bottom-right, mobile bottom-center)

// components/ui/toaster.tsx
// - 渲染所有 active toasts
// - 添加到 app/layout.tsx 的 body 底部
```

**所有需要 Toast 的场景:**
| 场景 | Variant | Title |
|------|---------|-------|
| Profile updated | success | "Profile updated" |
| Avatar uploaded | success | "Avatar updated" |
| Password changed | success | "Password updated" |
| Store created | success | "Store created" |
| Network error | destructive | ERROR_MESSAGES.network_error |
| Unknown error | destructive | ERROR_MESSAGES.unknown_error |
| Email resent | default | "Verification email sent" |

**验收标准:**
- 所有 Server Action 成功/失败通过 Toast 反馈
- Toast 5 秒后自动消失
- 可手动点击 X 关闭
- 断开网络后提交表单显示 "Network error" toast
- 移动端 Toast 在底部居中显示

---

### S3.5: 单元测试
**Priority:** P1 | **Points:** 2

**需创建文件:**
- `src/lib/validators/slug.test.ts`
- `src/lib/validators/auth.test.ts`
- `src/lib/constants.test.ts`
- `vitest.config.ts`（如果还没有）

**测试框架已在 `package.json` 中配置:**
```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

**测试用例细节:**

```typescript
// src/lib/validators/slug.test.ts
describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('My Shop')).toBe('my-shop');
  });
  it('removes special characters', () => {
    expect(slugify('Shop@#$%')).toBe('shop');
  });
  it('handles Chinese characters', () => {
    // Chinese chars are removed by the regex, result should be empty or hyphens only
    expect(slugify('我的店铺')).toBe('');
  });
  it('collapses multiple hyphens', () => {
    expect(slugify('my---shop')).toBe('my-shop');
  });
  it('trims leading/trailing hyphens', () => {
    expect(slugify('-my-shop-')).toBe('my-shop');
  });
  it('truncates to 50 chars', () => {
    expect(slugify('a'.repeat(100)).length).toBeLessThanOrEqual(50);
  });
  it('lowercases input', () => {
    expect(slugify('MY SHOP')).toBe('my-shop');
  });
});

describe('validateSlug', () => {
  it('rejects empty slug', () => {
    expect(validateSlug('')).toEqual({ valid: false, error: 'Slug is required' });
  });
  it('rejects < 3 chars', () => {
    expect(validateSlug('ab').valid).toBe(false);
  });
  it('rejects > 50 chars', () => {
    expect(validateSlug('a'.repeat(51)).valid).toBe(false);
  });
  it('rejects starting with hyphen', () => {
    expect(validateSlug('-myshop').valid).toBe(false);
  });
  it('rejects ending with hyphen', () => {
    expect(validateSlug('myshop-').valid).toBe(false);
  });
  it('rejects uppercase', () => {
    expect(validateSlug('MyShop').valid).toBe(false);
  });
  it('rejects special characters', () => {
    expect(validateSlug('my_shop').valid).toBe(false);
  });
  it('accepts valid slug', () => {
    expect(validateSlug('my-shop')).toEqual({ valid: true });
  });
  it('rejects reserved slug "admin"', () => {
    expect(validateSlug('admin')).toEqual({
      valid: false,
      error: 'This address is reserved',
    });
  });
  it('rejects all reserved slugs', () => {
    RESERVED_SLUGS.forEach(slug => {
      expect(validateSlug(slug).valid).toBe(false);
    });
  });
});

describe('suggestSlug', () => {
  it('appends -1 by default', () => {
    expect(suggestSlug('my-shop')).toBe('my-shop-1');
  });
  it('appends custom attempt number', () => {
    expect(suggestSlug('my-shop', 3)).toBe('my-shop-3');
  });
});
```

```typescript
// src/lib/validators/auth.test.ts
describe('signUpSchema', () => {
  it('rejects invalid email', () => {
    const result = signUpSchema.safeParse({
      email: 'not-an-email', password: 'Test1234', fullName: 'Test' });
    expect(result.success).toBe(false);
  });
  it('rejects short password', () => {
    const result = signUpSchema.safeParse({
      email: 'a@b.com', password: 'Aa1', fullName: 'Test' });
    expect(result.success).toBe(false);
  });
  it('rejects password without uppercase', () => {
    const result = signUpSchema.safeParse({
      email: 'a@b.com', password: 'test1234', fullName: 'Test' });
    expect(result.success).toBe(false);
  });
  it('rejects password without number', () => {
    const result = signUpSchema.safeParse({
      email: 'a@b.com', password: 'Testtest', fullName: 'Test' });
    expect(result.success).toBe(false);
  });
  it('accepts valid input', () => {
    const result = signUpSchema.safeParse({
      email: 'a@b.com', password: 'Test1234', fullName: 'Test User' });
    expect(result.success).toBe(true);
  });
  it('rejects fullName < 2 chars', () => {
    const result = signUpSchema.safeParse({
      email: 'a@b.com', password: 'Test1234', fullName: 'T' });
    expect(result.success).toBe(false);
  });
});
```

```typescript
// src/lib/constants.test.ts
describe('PLAN_LIMITS', () => {
  it('free plan has maxStores = 3', () => {
    expect(PLAN_LIMITS.free.maxStores).toBe(3);
  });
  it('pro plan has maxStores = 20', () => {
    expect(PLAN_LIMITS.pro.maxStores).toBe(20);
  });
  it('enterprise plan has unlimited stores', () => {
    expect(PLAN_LIMITS.enterprise.maxStores).toBe(Infinity);
  });
  it('all plans have required fields', () => {
    for (const plan of Object.values(PLAN_LIMITS)) {
      expect(plan).toHaveProperty('maxStores');
      expect(plan).toHaveProperty('aiImagesPerMonth');
      expect(plan).toHaveProperty('aiTokensPerMonth');
    }
  });
});

describe('ERROR_MESSAGES', () => {
  it('has all required error codes', () => {
    const requiredCodes = [
      'email_taken', 'weak_password', 'invalid_credentials',
      'slug_taken', 'slug_reserved', 'limit_reached',
      'network_error', 'unknown_error',
    ];
    requiredCodes.forEach(code => {
      expect(ERROR_MESSAGES).toHaveProperty(code);
      expect(typeof ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]).toBe('string');
    });
  });
});
```

**验收标准:**
- `pnpm --filter lumora-platform test:unit` 全部通过
- 覆盖 slugify、validateSlug、suggestSlug 的所有边界情况
- 覆盖 signUpSchema 的所有校验规则
- 覆盖 PLAN_LIMITS 和 ERROR_MESSAGES 结构

---

### S3.6: E2E 测试
**Priority:** P2 | **Points:** 3

**需安装:**
```bash
pnpm --filter lumora-platform add -D @playwright/test
npx playwright install chromium
```

**需创建文件:**
- `playwright.config.ts`
- `e2e/auth.spec.ts`
- `e2e/store.spec.ts`

**Playwright 配置:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  use: { trace: 'on-first-retry' },
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**测试用例:**

```typescript
// e2e/auth.spec.ts
test('register new account → redirects to verify-email', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="fullName"]', 'Test User');
  await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
  await page.fill('[name="password"]', 'Test1234');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/verify-email/);
});

test('login with wrong password → shows error', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'wrong@example.com');
  await page.fill('[name="password"]', 'WrongPass1');
  await page.click('button[type="submit"]');
  await expect(page.getByText('Invalid email or password')).toBeVisible();
});

test('authenticated user visiting /login → redirects to /dashboard', async ({ page }) => {
  // Login first, then visit /login
  // Should redirect to /dashboard
});

test('logout → redirects to /login', async ({ page }) => {
  // Login → click user menu → Sign Out
  await expect(page).toHaveURL('/login');
});
```

```typescript
// e2e/store.spec.ts
test('create store → redirects to admin', async ({ page }) => {
  // Login → go to /onboarding
  await page.fill('[name="name"]', 'My Test Store');
  await expect(page.locator('[name="slug"]')).toHaveValue('my-test-store');
  // Wait for slug check
  await expect(page.getByText('Available')).toBeVisible();
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/store\/my-test-store\/admin/);
});

test('dashboard shows created store', async ({ page }) => {
  // After creating store, go to /dashboard
  await expect(page.getByText('My Test Store')).toBeVisible();
});

test('non-member cannot access other store', async ({ page }) => {
  // Login as different user → visit /store/my-test-store/admin
  // Should get 404
});
```

**验收标准:**
- `pnpm --filter lumora-platform test:e2e` 全部通过（需要本地 Supabase 运行）
- 覆盖 6 个核心场景

**注意事项:**
- E2E 测试需要本地 Supabase 实例运行
- 每次测试前需要清理测试数据或使用唯一 email
- CI 中需配置 Supabase local 环境

---

### S3.7: 部署配置
**Priority:** P1 | **Points:** 2

**Tasks:**
- [ ] Vercel 项目创建（连接 GitHub repo）
- [ ] 配置 Root Directory: `apps/lumora-platform`
- [ ] 配置 Framework Preset: Next.js
- [ ] 配置环境变量：
  - `NEXT_PUBLIC_SUPABASE_URL` = 生产 Supabase URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 生产 Anon Key
  - `NEXT_PUBLIC_SITE_URL` = `https://app.lumora.shop`
- [ ] 确认 preview deploy 正常（PR 创建后自动部署到临时 URL）
- [ ] 配置自定义域名 `app.lumora.shop`（如已购买）
  - Vercel → Domains → Add `app.lumora.shop`
  - DNS: CNAME `app` → `cname.vercel-dns.com`
- [ ] Supabase 项目 URL Configuration 更新：
  - Site URL: `https://app.lumora.shop`
  - Redirect URLs: `https://app.lumora.shop/auth/callback`

**Vercel `vercel.json`（如需要）:**
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

**验收标准:**
- push 到 main 后 Vercel 自动部署
- 访问 `app.lumora.shop`（或 Vercel 分配的域名）可正常使用
- PR 创建后自动生成 preview URL
- 环境变量正确（注册/登录功能在生产环境可用）

---

### S3.8: Sentry 集成
**Priority:** P2 | **Points:** 1

**需安装:**
```bash
pnpm --filter lumora-platform add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**需创建/修改文件:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.ts` — 添加 Sentry webpack plugin

**实现细节:**

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,  // 10% of transactions
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
```

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === "production",
});
```

**环境变量（Vercel）:**
- `NEXT_PUBLIC_SENTRY_DSN` = Sentry 项目 DSN
- `SENTRY_DSN` = 同上（server-side）
- `SENTRY_AUTH_TOKEN` = 用于 source map 上传
- `SENTRY_ORG` = Sentry 组织名
- `SENTRY_PROJECT` = Sentry 项目名

**验证方式:**
```typescript
// 临时添加一个测试 API route
// app/api/sentry-test/route.ts
export async function GET() {
  throw new Error("Sentry test error - please ignore");
}
```

**验收标准:**
- 生产环境触发错误后，Sentry Dashboard 中可看到错误报告
- Source map 正确上传（错误 stacktrace 显示原始 TypeScript 行号）
- 开发环境不发送错误到 Sentry（`enabled: NODE_ENV === "production"`）

---

## Sprint 3 Definition of Done

- [ ] 账号设置页面完整可用（修改名称、头像、密码）
- [ ] 邮箱验证流程正常（注册后需验证才能登录）
- [ ] 移动端响应式正常（375px 可操作）
- [ ] Toast 系统统一反馈所有操作结果
- [ ] 单元测试覆盖关键校验逻辑（`pnpm test:lumora` 通过）
- [ ] E2E 覆盖核心用户流程
- [ ] Vercel 部署成功，访问域名可正常使用
- [ ] Sentry 错误监控就绪
- [ ] Lighthouse Performance > 90, Accessibility > 90
- [ ] `pnpm build:lumora` 编译通过

---

## 性能目标 (Lighthouse)

| 指标 | 目标 | 方法 |
|------|------|------|
| Performance | > 90 | SSR + 代码分割 + 图片优化 |
| Accessibility | > 90 | 语义 HTML + ARIA labels + 键盘导航 |
| Best Practices | > 90 | HTTPS + 安全 headers |
| SEO | > 90 | Meta tags + OpenGraph |

**关键优化项：**
- 所有图片使用 `next/image`
- Auth 表单组件动态导入（`next/dynamic`）
- CSS Tailwind v4 自动 tree-shaking
- 避免第三方字体（使用系统字体或 `next/font`）

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| Supabase Storage 上传 CORS | 确保 Storage bucket 配置允许 `localhost:3000` 和生产域名 |
| Playwright 在 CI 中不稳定 | 使用 `retries: 2` 配置，锁定 chromium 版本 |
| Sentry 增加 bundle size | 使用 tree-shaking，仅在生产环境初始化 |
| Tailwind v4 与 Radix UI 样式冲突 | 使用 `data-*` 属性选择器而非 class override |
| 邮箱验证在本地开发无法测试 | Supabase local 会在终端打印验证链接（`supabase start` 后查看 Inbucket） |
