# Lumora Platform Admin PRD

> **Ref:** ADR-001 (docs/cto/adr-001-lumora-foundation.md)
> **Status:** Draft
> **Scope:** 用户认证 + 店铺创建 + 权限路由

---

## 1. 产品定义

Platform Admin 是 Lumora 的全局管理层。职责：

1. 用户注册/登录（Supabase Auth）
2. 店铺创建与生命周期管理
3. 成员权限管理
4. 路由用户至对应店铺控制台

**不在本 PRD 范围内：** 商品管理、AI 内容生成、支付、Marketplace。

---

## 2. 数据模型

### 2.1 表结构

```sql
-- ============================================================
-- profiles: 扩展 auth.users
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auth.users 注册后自动创建 profile
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
-- tenants: 店铺
-- ============================================================
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 64),
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings jsonb NOT NULL DEFAULT '{}',
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_tenants_slug ON tenants(slug);

-- ============================================================
-- tenant_members: 用户-店铺关联
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
```

### 2.2 RLS 策略

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- tenants
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

-- tenant_members
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
```

### 2.3 约束与校验规则

| 字段 | 规则 |
|------|------|
| `tenants.name` | 2-64 字符，任意 Unicode |
| `tenants.slug` | 3-50 字符，仅 `[a-z0-9-]`，不以 `-` 开头/结尾 |
| `tenants.slug` 保留词 | `app`, `api`, `www`, `admin`, `store`, `help`, `support`, `blog` |
| `tenant_members.role` | 每个 tenant 至少有一个 `owner` |

---

## 3. 路由结构

```
app.lumora.shop
├── /login                    # 登录页（未认证用户唯一入口）
├── /register                 # 注册页
├── /auth/callback            # OAuth 回调
├── /onboarding               # 开店向导（无店铺时重定向至此）
├── /dashboard                # 店铺列表（有店铺时的默认页）
├── /settings                 # 账号设置（修改名称、头像、密码）
└── /store/[slug]/            # 店铺管理（后续 PRD 定义内容）
    ├── /products
    ├── /orders
    └── /settings
```

**路由守卫逻辑 (middleware.ts)：**

```
请求进入
  ├─ 未认证 + 访问受保护路径 → redirect /login
  ├─ 已认证 + 访问 /login → redirect /dashboard 或 /onboarding
  ├─ 已认证 + 无店铺 + 访问非 /onboarding → redirect /onboarding
  └─ 已认证 + 访问 /store/[slug] + 非该店铺成员 → 404
```

---

## 4. 功能规格

### 4.1 Feature: 用户注册

**Server Action:** `actions/auth.ts#signUp`

```typescript
type SignUpInput = {
  email: string       // 合法 email 格式
  password: string    // >= 8 字符, 含大小写 + 数字
  fullName: string    // 2-64 字符
}

type SignUpResult =
  | { success: true; redirectTo: '/onboarding' }
  | { error: 'email_taken' | 'weak_password' | 'rate_limited' }
```

**Acceptance Criteria:**
- AC1: 提交合法信息后，`auth.users` 和 `profiles` 各新增一条记录
- AC2: 密码不满足强度要求时，表单显示具体错误（"至少 8 位，包含大小写字母和数字"）
- AC3: 已注册邮箱再次注册时，显示"该邮箱已注册"（不泄露是否存在账户——使用统一错误）
- AC4: 注册后发送确认邮件，用户点击确认链接后方可登录
- AC5: 同一 IP 5 分钟内最多尝试 10 次注册

### 4.2 Feature: 用户登录

**Server Action:** `actions/auth.ts#signIn`

```typescript
type SignInInput = {
  email: string
  password: string
}

type SignInResult =
  | { success: true; redirectTo: '/dashboard' | '/onboarding' }
  | { error: 'invalid_credentials' | 'email_not_confirmed' | 'rate_limited' }
```

**Acceptance Criteria:**
- AC1: 邮箱+密码正确时，设置 httpOnly session cookie，重定向至 dashboard（有店铺）或 onboarding（无店铺）
- AC2: 错误凭证时显示"邮箱或密码错误"（不区分哪个错）
- AC3: 连续 5 次失败后锁定 15 分钟
- AC4: 支持 "Remember me" 选项（延长 session 至 30 天，默认 12 小时）

### 4.3 Feature: Google OAuth 登录

**Acceptance Criteria:**
- AC1: 点击 "Sign in with Google" 跳转至 Google consent screen
- AC2: 授权后回调至 `/auth/callback`，自动创建/关联 profile
- AC3: 首次 OAuth 登录的用户，`full_name` 和 `avatar_url` 从 Google 账户同步
- AC4: 已有邮箱密码账户的用户通过 Google 登录时，自动关联（相同 email）

### 4.4 Feature: 开店向导 (Onboarding)

**Server Action:** `actions/tenants.ts#createTenant`

```typescript
type CreateTenantInput = {
  name: string    // 2-64 字符
  slug: string    // 3-50 字符, [a-z0-9-], 非保留词
}

type CreateTenantResult =
  | { success: true; tenant: { id: string; slug: string }; redirectTo: string }
  | { error: 'slug_taken' | 'slug_reserved' | 'invalid_name' | 'limit_reached' }
```

**Acceptance Criteria:**
- AC1: 输入 Store Name 时，自动生成 slug 建议（`slugify(name)`），用户可手动修改
- AC2: slug 输入框实时校验可用性（debounce 300ms），显示绿色勾/红色叉
- AC3: 提交后在单个事务中：INSERT tenants + INSERT tenant_members(role='owner')
- AC4: 事务失败时回滚并显示错误，不产生孤立记录
- AC5: Free plan 用户最多创建 3 个店铺，超出时提示升级
- AC6: 创建成功后重定向至 `/store/[slug]`
- AC7: slug 不允许使用保留词列表中的值

**slug 校验逻辑（实时）：**

```typescript
// Server Action: actions/tenants.ts#checkSlugAvailability
type CheckSlugInput = { slug: string }
type CheckSlugResult =
  | { available: true }
  | { available: false; suggestion: string }  // e.g., "my-shop-2"
```

### 4.5 Feature: 店铺列表 (Dashboard)

**数据获取：** Server Component 直接通过 Supabase client 查询（RLS 自动过滤）

```typescript
// 查询当前用户的所有店铺（含角色信息）
const { data: memberships } = await supabase
  .from('tenant_members')
  .select('role, tenant:tenants(id, name, slug, plan, status, created_at)')
  .eq('user_id', user.id)
```

**Acceptance Criteria:**
- AC1: 展示当前用户所有店铺，卡片形式，显示 name + slug + plan badge + role badge
- AC2: 点击卡片跳转至 `/store/[slug]`
- AC3: 右上角 "Create Store" 按钮跳转至 `/onboarding`
- AC4: 无店铺时显示 empty state，引导至 onboarding
- AC5: status='suspended' 的店铺显示灰色 + 警告标记，点击后显示原因
- AC6: status='deleted' 的店铺不显示

### 4.6 Feature: 账号设置 (Settings)

**Server Action:** `actions/profile.ts#updateProfile`

```typescript
type UpdateProfileInput = {
  fullName?: string
  avatarUrl?: string  // Supabase Storage public URL
}
```

**Acceptance Criteria:**
- AC1: 可修改 full_name（2-64 字符）
- AC2: 可上传头像（限 2MB，jpg/png/webp），上传至 `avatars/{user_id}` bucket
- AC3: 可修改密码（需输入当前密码验证）
- AC4: 显示当前邮箱（只读，不支持修改——后续 ADR 定义邮箱变更流程）
- AC5: "Delete Account" 按钮：二次确认后软删除（标记 auth.users 为 banned）

### 4.7 Feature: 登出

**Acceptance Criteria:**
- AC1: 点击 "Sign Out" 后清除 session cookie，重定向至 `/login`
- AC2: 登出后再次访问受保护页面会被 middleware 拦截至 `/login`

---

## 5. 非功能需求

### 5.1 性能

| 指标 | 目标 (P95) |
|------|-----------|
| 登录响应时间 | < 500ms |
| slug 可用性检查 | < 200ms |
| 店铺创建事务 | < 1s |
| Dashboard 页面加载 (TTFB) | < 300ms |
| Onboarding 页面加载 (TTFB) | < 200ms |

### 5.2 安全

| 策略 | 实现 |
|------|------|
| CSRF | Next.js Server Actions 内置 CSRF token |
| XSS | React 默认 escape + CSP header |
| Rate Limiting | Vercel Edge Middleware: 10 req/min/IP (auth endpoints) |
| Session | httpOnly, Secure, SameSite=Lax cookie |
| 密码存储 | Supabase Auth 内置 bcrypt |
| SQL 注入 | Supabase SDK 参数化查询，RLS 兜底 |

### 5.3 可用性

- 支持移动端响应式布局（min-width: 375px）
- 表单校验错误实时显示（不等提交后再报错）
- 所有异步操作显示 loading state
- 网络错误时显示 toast 提示 + 重试按钮

---

## 6. UI 组件清单

基于 shadcn/ui，不引入额外 UI 库。

| 页面 | 组件 |
|------|------|
| `/login` | Card, Input, Button, Separator ("or"), Google icon button |
| `/register` | Card, Input, Button, password strength indicator |
| `/onboarding` | Card, Input, slug preview text, availability indicator, Button |
| `/dashboard` | Card grid, Badge (plan/role), Button, Empty state |
| `/settings` | Avatar upload, Input, Button (destructive variant) |

---

## 7. 错误处理矩阵

| 场景 | 用户看到的信息 | 技术处理 |
|------|--------------|---------|
| 网络超时 | "网络异常，请重试" | 前端 try/catch + toast |
| slug 已占用 | "该地址已被使用，试试: {suggestion}" | 查询后生成候选 slug |
| slug 为保留词 | "该地址为系统保留，请换一个" | 前端 + 后端双重校验 |
| 店铺数量超限 | "Free 计划最多创建 3 个店铺，升级 Pro 解锁更多" | 查询 count + 阻止提交 |
| 创建事务失败 | "创建失败，请稍后重试" | DB transaction rollback + Sentry 上报 |
| OAuth 取消/失败 | "登录已取消" | 回调页检测 error 参数 |
| 邮箱未验证 | "请先验证邮箱，检查收件箱或重新发送" | 显示 resend 按钮 |
| 账户被锁定 | "登录尝试过多，请 15 分钟后再试" | Supabase Auth 内置 + UI 提示 |

---

## 8. 数据库 Migration 文件结构

```
supabase/migrations/
├── 20260124000001_create_profiles.sql
├── 20260124000002_create_tenants.sql
├── 20260124000003_create_tenant_members.sql
├── 20260124000004_rls_policies.sql
└── 20260124000005_seed_reserved_slugs.sql
```

**Reserved slugs seed:**

```sql
-- 20260124000005_seed_reserved_slugs.sql
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

## 9. 项目结构

```
apps/lumora-platform/
├── app/
│   ├── layout.tsx                 # Root layout + Supabase provider
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── auth/callback/route.ts # OAuth callback handler
│   ├── (protected)/
│   │   ├── layout.tsx             # Auth guard layout
│   │   ├── dashboard/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── settings/page.tsx
│   └── store/[slug]/
│       └── layout.tsx             # Tenant guard layout
├── actions/
│   ├── auth.ts                    # signUp, signIn, signOut
│   ├── tenants.ts                 # createTenant, checkSlugAvailability
│   └── profile.ts                 # updateProfile, deleteAccount
├── lib/
│   ├── supabase/
│   │   ├── server.ts              # createServerClient (cookies)
│   │   ├── client.ts              # createBrowserClient
│   │   └── middleware.ts          # updateSession helper
│   ├── validators/
│   │   ├── slug.ts                # slugify, validateSlug, RESERVED_SLUGS
│   │   └── auth.ts                # validatePassword, validateEmail
│   └── constants.ts               # Plan limits, error messages
├── components/
│   ├── auth/                      # LoginForm, RegisterForm, OAuthButton
│   ├── tenant/                    # TenantCard, CreateTenantForm, SlugInput
│   └── ui/                        # shadcn/ui components
├── middleware.ts                   # Route protection + session refresh
└── supabase/
    └── migrations/                 # SQL migration files
```

---

## 10. 开发清单 (Ordered)

### Phase A: 基础设施

- [ ] 初始化 Next.js 15 项目（App Router, TypeScript, Tailwind, shadcn/ui）
- [ ] 配置 Supabase 项目（启用 Email/Password + Google OAuth）
- [ ] 编写并执行 migration files（profiles, tenants, tenant_members, RLS）
- [ ] 实现 Supabase client helpers（server/client/middleware）

### Phase B: 认证

- [ ] 实现 `/register` 页面 + signUp action
- [ ] 实现 `/login` 页面 + signIn action
- [ ] 实现 Google OAuth flow（callback route）
- [ ] 实现 middleware.ts 路由守卫
- [ ] 实现 email confirmation 流程

### Phase C: 店铺管理

- [ ] 实现 `/onboarding` 页面 + createTenant action
- [ ] 实现 slug 实时校验（checkSlugAvailability action）
- [ ] 实现 `/dashboard` 页面（店铺列表）
- [ ] 实现 tenant guard（/store/[slug] layout 权限校验）

### Phase D: 账号设置

- [ ] 实现 `/settings` 页面 + updateProfile action
- [ ] 实现头像上传（Supabase Storage）
- [ ] 实现密码修改
- [ ] 实现登出

### Phase E: 质量保障

- [ ] Vitest 单元测试：validators, slug 生成逻辑
- [ ] Playwright E2E：注册 → 开店 → dashboard → 进入店铺完整流程
- [ ] Sentry 集成
- [ ] 移动端响应式验证

---

## 11. 验收标准 (Definition of Done)

本 PRD 完成的标志：

1. 新用户可通过邮箱或 Google 注册并登录
2. 登录后无店铺时自动进入 onboarding
3. 可输入名称创建店铺，slug 实时校验
4. Dashboard 正确显示用户所有店铺
5. 点击店铺卡片可进入 `/store/[slug]`（页面可为空壳）
6. 非成员访问他人店铺时返回 404
7. RLS 通过手动 SQL 测试验证隔离性
8. 全流程 E2E 测试通过
9. Lighthouse Performance > 90, Accessibility > 90
