# Sprint 1: Foundation + Auth Core

> **Ref:** docs/prd/platform-admin-init.md, docs/cto/adr-001-lumora-foundation.md
> **Start Date:** 2026-01-24
> **Goal:** 用户可以注册、登录、登出。Supabase 数据库就绪。

---

## 技术栈上下文

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| Language | TypeScript | ^5 |
| Runtime | React | 19.2.3 |
| Styling | Tailwind CSS | v4 |
| Auth | Supabase Auth | @supabase/ssr ^0.5, @supabase/supabase-js ^2.45 |
| Database | Supabase Postgres + RLS | - |
| Validation | Zod | ^3.23 |
| UI Components | Radix UI + CVA | - |
| Package Manager | pnpm | 10.18.2 |
| Monorepo | Turborepo | - |
| App Location | `apps/lumora-platform/` | - |

**环境变量 (`.env.local`):**
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**启动命令:**
```bash
# 从 monorepo root
pnpm dev:lumora          # = pnpm --filter lumora-platform dev
pnpm build:lumora        # = pnpm --filter lumora-platform build
pnpm test:lumora         # = pnpm --filter lumora-platform test:unit
```

---

## 数据库 Schema

**Migration 文件:** `supabase/migrations/20260124000001_initial_schema.sql`

```sql
-- ============================================================
-- profiles: extends auth.users
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- tenants: stores
-- ============================================================
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 64),
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings jsonb NOT NULL DEFAULT '{}',
  custom_domain text,
  domain_verified boolean NOT NULL DEFAULT false,
  domain_verified_at timestamptz,
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE UNIQUE INDEX idx_tenants_custom_domain
  ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read own tenants"
  ON tenants FOR SELECT
  USING (id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users create tenants"
  ON tenants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owner/admin update tenant"
  ON tenants FOR UPDATE
  USING (id IN (
    SELECT tenant_id FROM tenant_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================
-- tenant_members: user-store association
-- ============================================================
CREATE TABLE public.tenant_members (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);

ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see co-members"
  ON tenant_members FOR SELECT
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Owner/admin manage members"
  ON tenant_members FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- ============================================================
-- reserved_slugs: system-reserved addresses
-- ============================================================
CREATE TABLE public.reserved_slugs (
  slug text PRIMARY KEY
);

INSERT INTO reserved_slugs (slug) VALUES
  ('app'), ('api'), ('www'), ('admin'), ('store'),
  ('help'), ('support'), ('blog'), ('docs'), ('status'),
  ('billing'), ('login'), ('register'), ('onboarding'),
  ('dashboard'), ('settings'), ('new'), ('create');
```

---

## 已就绪的项目骨架

以下文件已在项目初始化阶段创建，本 Sprint 需要 **实现其具体功能**：

### Supabase 客户端
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/lib/supabase/server.ts` | ✅ 完成 | Server Component 用 Supabase client |
| `src/lib/supabase/client.ts` | ✅ 完成 | Browser 用 Supabase client |
| `src/lib/supabase/middleware.ts` | ✅ 完成 | Middleware session 刷新 helper |

### 校验器
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/lib/validators/auth.ts` | ✅ 完成 | signUpSchema, signInSchema (Zod) |
| `src/lib/validators/slug.ts` | ✅ 完成 | slugify, validateSlug, RESERVED_SLUGS |

### Server Actions
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/actions/auth.ts` | ✅ 完成 | signUp, signIn, signInWithGoogle, signOut |
| `src/actions/tenants.ts` | ✅ 完成 | createTenant, checkSlugAvailability |
| `src/actions/profile.ts` | ✅ 完成 | updateProfile |

### Middleware
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/middleware.ts` | ✅ 完成 | 路由守卫 + onboarding 检测 + 租户权限 |

### 常量
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/lib/constants.ts` | ✅ 完成 | PLAN_LIMITS, ERROR_MESSAGES |
| `src/lib/utils.ts` | ✅ 完成 | cn() helper |

### UI 组件
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/components/ui/button.tsx` | ✅ 完成 | 基于 CVA 的按钮组件 |
| `src/components/ui/input.tsx` | ✅ 完成 | 表单输入框 |
| `src/components/ui/card.tsx` | ✅ 完成 | 卡片容器 |
| `src/components/ui/label.tsx` | ✅ 完成 | 表单 Label |

### 页面路由（占位）
| 文件 | 状态 | 说明 |
|------|------|------|
| `src/app/(auth)/login/page.tsx` | 🔲 占位 | 需实现登录表单 |
| `src/app/(auth)/register/page.tsx` | 🔲 占位 | 需实现注册表单 |
| `src/app/(auth)/layout.tsx` | 🔲 占位 | Auth 页面布局 |
| `src/app/(auth)/auth/callback/route.ts` | ✅ 完成 | OAuth 回调 code exchange |
| `src/app/(protected)/layout.tsx` | 🔲 占位 | Protected 页面布局 |
| `src/app/(protected)/dashboard/page.tsx` | 🔲 占位 | Sprint 2 实现 |
| `src/app/(protected)/onboarding/page.tsx` | 🔲 占位 | Sprint 2 实现 |
| `src/app/globals.css` | ✅ 完成 | Tailwind v4 + CSS 变量 |

---

## Stories

### S1.1: Supabase 项目配置
**Priority:** P0 | **Points:** 2

**Tasks:**
- [ ] 创建 Supabase 项目（或使用本地 `supabase start`）
- [ ] 启用 Email/Password 认证
- [ ] 配置 Google OAuth provider（Google Cloud Console 创建 OAuth Client）
- [ ] 设置 Auth URL 白名单（`http://localhost:3000/auth/callback`）
- [ ] 获取 `SUPABASE_URL` 和 `ANON_KEY`，写入 `.env.local`

**验收标准:**
- `supabase status` 显示所有服务运行中
- `.env.local` 包含正确的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### S1.2: 执行数据库 Migration
**Priority:** P0 | **Points:** 1

**Tasks:**
- [ ] 确认 `supabase/migrations/20260124000001_initial_schema.sql` 内容正确
- [ ] 执行 `supabase db push` 或 `supabase migration up`
- [ ] 验证三张表创建成功（profiles, tenants, tenant_members）
- [ ] 验证 RLS 策略激活（`SELECT * FROM pg_policies`）
- [ ] 验证 trigger 创建成功（`\df public.handle_new_user`）
- [ ] 验证 reserved_slugs 种子数据插入

**验收标准:**
- 通过 Supabase Dashboard SQL Editor 手动验证所有对象存在
- `SELECT count(*) FROM reserved_slugs` 返回 18

**验证 SQL:**
```sql
-- 检查所有表
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- 检查 RLS 策略
SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- 检查 trigger
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

### S1.3: 注册页面实现
**Priority:** P0 | **Points:** 3

**需创建文件:**
- `src/components/auth/register-form.tsx`

**需修改文件:**
- `src/app/(auth)/register/page.tsx` — 引入 RegisterForm

**实现细节:**

```tsx
// components/auth/register-form.tsx 需实现：
// - Email 输入框（实时格式校验）
// - Password 输入框（强度指示器：weak/medium/strong）
// - Full Name 输入框（2-64 字符）
// - Submit 按钮（loading state：disabled + spinner）
// - "Sign in with Google" 按钮
// - 链接至 /login（"Already have an account?"）
// - 调用 actions/auth.ts#signUp
// - 错误状态：email_taken, weak_password 在对应字段下方显示红色文字
```

**密码强度规则（对应 `src/lib/validators/auth.ts`）:**
- 8+ 字符
- 包含小写字母
- 包含大写字母
- 包含数字

**验收标准:**
- 填写合法信息提交后，Supabase `auth.users` 和 `profiles` 表各新增一条记录
- 密码不满足要求时显示具体错误（来自 Zod fieldErrors）
- 表单提交期间按钮显示 loading（`disabled` + spinner 动画）
- 成功后重定向至 `/onboarding`
- Email 格式不对时显示 "Please enter a valid email address"

---

### S1.4: 登录页面实现
**Priority:** P0 | **Points:** 3

**需创建文件:**
- `src/components/auth/login-form.tsx`

**需修改文件:**
- `src/app/(auth)/login/page.tsx` — 引入 LoginForm

**实现细节:**

```tsx
// components/auth/login-form.tsx 需实现：
// - Email 输入框
// - Password 输入框
// - Submit 按钮（loading state）
// - "Sign in with Google" 按钮
// - 链接至 /register（"Don't have an account?"）
// - 调用 actions/auth.ts#signIn
// - 错误状态：invalid_credentials 在表单顶部显示红色 alert
// - URL 参数 ?error=auth_failed 时显示 "Authentication failed"
```

**验收标准:**
- 正确凭证登录后 cookie 设置成功，重定向至 `/dashboard`
- 错误凭证显示 "Invalid email or password"
- 表单提交期间按钮 disabled + loading
- URL 有 `?error=auth_failed` 参数时显示错误提示

---

### S1.5: Google OAuth 流程
**Priority:** P1 | **Points:** 2

**涉及文件:**
- `src/actions/auth.ts#signInWithGoogle` — 已实现
- `src/app/(auth)/auth/callback/route.ts` — 已实现
- 注册/登录表单中的 Google 按钮

**Tasks:**
- [ ] 确认 Google Cloud Console OAuth Client 配置：
  - Authorized redirect URI: `http://localhost:3000/auth/callback`
  - Authorized JavaScript origins: `http://localhost:3000`
- [ ] Supabase Dashboard → Authentication → Providers → Google：
  - 填入 Client ID 和 Client Secret
- [ ] 测试 `signInWithGoogle` Action 正确跳转至 Google consent
- [ ] 确认回调 route 正确执行 `exchangeCodeForSession`
- [ ] 验证首次 OAuth 登录时 trigger 自动创建 profile
- [ ] 验证 `full_name` 和 `avatar_url` 从 Google 用户信息同步到 profiles

**验收标准:**
- 点击 Google 按钮 → Google consent 页 → 授权 → 回调 → 自动登录 → 重定向至 `/dashboard`
- `profiles` 表中 `full_name` = Google 显示名称，`avatar_url` = Google 头像 URL

---

### S1.6: Middleware 路由守卫验证
**Priority:** P0 | **Points:** 2

**涉及文件:**
- `src/middleware.ts` — 已实现

**Tasks:**
- [ ] 确认未认证请求被 redirect 至 `/login`
- [ ] 确认已认证用户访问 `/login` 被 redirect 至 `/dashboard`
- [ ] 确认 session cookie 续期正常（`supabaseResponse` 正确传递 Set-Cookie）
- [ ] 确认 `PUBLIC_PATHS` 列表正确（`/login`, `/register`, `/auth/callback`）
- [ ] 确认 matcher 不拦截静态资源（`_next/static`, `_next/image`, 图片文件）

**Middleware 路由逻辑（已实现）:**
```
未认证 + /dashboard → redirect /login?next=/dashboard
已认证 + /login → redirect /dashboard
已认证 + 无店铺 + /dashboard → redirect /onboarding
已认证 + /store/[slug] + 非成员 → 404
```

**验收标准:**
- 未登录访问 `/dashboard` 被重定向至 `/login?next=/dashboard`
- 已登录访问 `/login` 被重定向至 `/dashboard`
- 静态资源（CSS/JS/图片）不受 middleware 影响

---

## Sprint 1 Definition of Done

- [ ] 用户可通过邮箱注册并登录
- [ ] 用户可通过 Google OAuth 登录（P1，可延迟至 Sprint 2）
- [ ] 路由守卫正常工作（未认证 → /login，已认证 → /dashboard）
- [ ] Supabase 数据库 schema 就绪（3 表 + RLS + trigger）
- [ ] 所有认证错误有明确的用户反馈
- [ ] `pnpm build:lumora` 编译通过无错误

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| Google OAuth 配置复杂（需 GCP 项目） | 作为 P1，可先完成 Email 认证，延迟 OAuth 到 Sprint 2 |
| Supabase 本地开发 Docker 不稳定 | 备用：直接用 Supabase Cloud Free Tier |
| Next.js 16 与 @supabase/ssr 兼容性 | 已验证 `@supabase/ssr ^0.5` 兼容 Next.js 16 App Router |

---

## 参考：关键代码片段

### Server Action: signUp (`src/actions/auth.ts`)
```typescript
export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) {
    return { error: { _form: [error.message] } };
  }
  redirect("/onboarding");
}
```

### Supabase Server Client (`src/lib/supabase/server.ts`)
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as any)
            );
          } catch { /* Called from Server Component */ }
        },
      },
    }
  );
}
```

### Auth Validators (`src/lib/validators/auth.ts`)
```typescript
export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});
```
