# Sprint 2: Store Management

> **Ref:** docs/prd/platform-admin-init.md, docs/cto/adr-001-lumora-foundation.md
> **Prerequisite:** Sprint 1 完成（Auth + DB 就绪）
> **Goal:** 用户可以创建店铺，查看店铺列表，进入店铺控制台。

---

## 技术栈概要

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| Auth | Supabase Auth | @supabase/ssr ^0.5 |
| Database | Supabase Postgres + RLS | - |
| Validation | Zod | ^3.23 |
| UI | Radix UI + CVA + Tailwind v4 | - |
| App Location | `apps/lumora-platform/` | - |

---

## Sprint 1 交付物（前置条件）

本 Sprint 开始前，以下已完成：

- [x] Supabase 数据库 schema 就绪（profiles, tenants, tenant_members, reserved_slugs）
- [x] RLS 策略全部激活
- [x] 用户可通过邮箱注册并登录
- [x] Google OAuth 可用（或 P1 延迟则仅邮箱）
- [x] Middleware 路由守卫工作正常
- [x] 注册/登录表单组件完成
- [x] `pnpm build:lumora` 编译通过

---

## 相关数据模型

### tenants 表
```sql
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 64),
  slug text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$'),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  settings jsonb NOT NULL DEFAULT '{}',
  custom_domain text,
  domain_verified boolean NOT NULL DEFAULT false,
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
```

### tenant_members 表
```sql
CREATE TABLE public.tenant_members (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  PRIMARY KEY (user_id, tenant_id)
);
```

### Plan 限制 (`src/lib/constants.ts`)
```typescript
export const PLAN_LIMITS = {
  free: { maxStores: 3 },
  pro: { maxStores: 20 },
  enterprise: { maxStores: Infinity },
} as const;
```

---

## 已就绪的代码骨架

### Server Actions（已实现，本 Sprint 直接使用）

**`src/actions/tenants.ts`:**
- `createTenant(formData)` — 创建店铺 + tenant_member
  - 验证 name (2-64 chars) + slug (regex)
  - 检查 reserved_slugs
  - 检查 owner 店铺数量 ≤ `PLAN_LIMITS.free.maxStores`
  - 检查 slug 唯一性
  - 创建 tenant → 创建 membership (role=owner)
  - 成功后 redirect `/store/{slug}/admin`
- `checkSlugAvailability(slug)` — 实时检查 slug 可用性
  - 返回 `{ available: boolean, error?: string, suggestion?: string }`

### 校验器（已实现）

**`src/lib/validators/slug.ts`:**
```typescript
export function slugify(name: string): string
// "My Shop" → "my-shop", removes special chars, limits to 50 chars

export function validateSlug(slug: string): { valid: boolean; error?: string }
// checks: 3-50 chars, regex, not in RESERVED_SLUGS

export function suggestSlug(slug: string, attempt?: number): string
// "my-shop" → "my-shop-1"
```

### Middleware（已实现，本 Sprint 验证其行为）

**`src/middleware.ts` 相关逻辑:**
```typescript
// 1. 已认证 + 无店铺 + 非 /onboarding → redirect /onboarding
if (pathname !== "/onboarding" && pathname !== "/settings") {
  const { count } = await supabase
    .from("tenant_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (count === 0) {
    redirect("/onboarding");
  }
}

// 2. /store/[slug] 路径成员校验
const storeMatch = pathname.match(/^\/store\/([^/]+)/);
if (storeMatch) {
  // 查 tenants → 查 tenant_members → 非成员返回 404
}
```

### 占位页面（本 Sprint 需实现具体功能）

| 文件 | 当前状态 | 本 Sprint 目标 |
|------|---------|--------------|
| `src/app/(protected)/onboarding/page.tsx` | 占位 | 完整开店向导 |
| `src/app/(protected)/dashboard/page.tsx` | 占位 | 店铺列表 |
| `src/app/(protected)/layout.tsx` | 占位 | Header + 用户菜单 |
| `src/app/store/[slug]/admin/page.tsx` | 占位 | 店铺控制台骨架 |

---

## Stories

### S2.1: 开店向导页面 (Onboarding)
**Priority:** P0 | **Points:** 5

**需创建文件:**
- `src/components/tenant/create-tenant-form.tsx`

**需修改文件:**
- `src/app/(protected)/onboarding/page.tsx` — 引入 CreateTenantForm

**实现细节:**

```tsx
// components/tenant/create-tenant-form.tsx 需实现：
//
// State:
// - name: string (controlled input)
// - slug: string (auto-generated from name, can be manually edited)
// - slugStatus: 'idle' | 'checking' | 'available' | 'taken' | 'invalid'
// - isSubmitting: boolean
// - error: string | null
//
// UI:
// - Store Name 输入框（2-64 字符，onChange 时自动更新 slug）
// - Slug 输入框（显示 slugify(name) 结果，可手动修改）
// - Slug 状态指示器：
//   - 🟢 绿色勾 + "Available" when slugStatus === 'available'
//   - 🔴 红色叉 + error message when slugStatus === 'taken' or 'invalid'
//   - ⏳ spinner when slugStatus === 'checking'
// - 预览文字：`{slug}.lumora.shop`（灰色小字）
// - Submit 按钮（disabled when slug not available or isSubmitting）
// - 错误信息区域
//
// Logic:
// 1. name onChange → slugify(name) → setSlug
// 2. slug onChange → debounce 300ms → checkSlugAvailability(slug)
// 3. submit → call createTenant Server Action
// 4. 成功 → redirect /store/[slug]/admin（由 Server Action 处理）
// 5. 错误处理：
//    - slug_taken → 显示 "This address is taken" + suggestSlug() 建议
//    - limit_reached → 显示 "You've reached the maximum..." + 升级提示
//    - slug_reserved → 显示 "This address is reserved"
```

**Debounce 实现要点:**
```typescript
// 使用 useRef + setTimeout 实现（不引入额外依赖）
const debounceRef = useRef<NodeJS.Timeout>();

function onSlugChange(value: string) {
  setSlug(value);
  setSlugStatus('idle');
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(async () => {
    if (value.length < 3) return;
    setSlugStatus('checking');
    const result = await checkSlugAvailability(value);
    setSlugStatus(result.available ? 'available' : 'taken');
  }, 300);
}
```

**验收标准:**
- 输入 "My Shop" 后 slug 自动变为 "my-shop"
- slug 已被占用时实时显示红色提示 + 建议（如 "my-shop-1"）
- 提交后 `tenants` + `tenant_members` 各新增一条记录
- `tenant_members.role` = 'owner'
- Free 用户第 4 个店铺被拒绝，显示 limit_reached 错误
- 输入 "admin" 作为 slug 时显示 "This address is reserved"

---

### S2.2: Middleware 开店检测验证
**Priority:** P0 | **Points:** 1

**涉及文件:**
- `src/middleware.ts` — 已实现，需验证行为

**Tasks:**
- [ ] 验证：已认证 + 无店铺 + 访问 /dashboard → redirect /onboarding
- [ ] 验证：已认证 + 有店铺 + 访问 /onboarding → 正常显示（允许创建更多）
- [ ] 验证：middleware 中 `tenant_members` count 查询性能（< 50ms）
- [ ] 确认 `/settings` 路径不受 onboarding 重定向影响

**验收标准:**
- 新注册用户首次登录自动进入 onboarding
- 已有店铺的用户可以正常访问 /onboarding 创建更多店铺
- 访问 /settings 不触发 onboarding 重定向

---

### S2.3: 店铺列表页面 (Dashboard)
**Priority:** P0 | **Points:** 3

**需创建文件:**
- `src/components/tenant/store-card.tsx`

**需修改文件:**
- `src/app/(protected)/dashboard/page.tsx` — 实现完整店铺列表

**实现细节:**

```tsx
// app/(protected)/dashboard/page.tsx — Server Component
//
// 数据获取：
// 1. const supabase = await createClient()
// 2. const { data: memberships } = await supabase
//      .from("tenant_members")
//      .select("role, tenants(id, name, slug, plan, status, created_at)")
//      .eq("user_id", user.id)
//      .neq("tenants.status", "deleted")  // 不显示已删除
//      .order("tenants(created_at)", { ascending: false })
//
// 布局：
// - 页面标题 "Your Stores"
// - 右上角 "Create Store" 按钮 → 链接至 /onboarding
// - 卡片网格：lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4
// - Empty state：无店铺时显示插图 + "Create your first store" CTA
//
// StoreCard 组件 props：
// - name: string
// - slug: string
// - plan: 'free' | 'pro' | 'enterprise'
// - status: 'active' | 'suspended'
// - role: 'owner' | 'admin' | 'editor' | 'viewer'
// - 点击跳转 /store/[slug]/admin
// - plan badge（Free=灰色, Pro=蓝色, Enterprise=金色）
// - role badge（Owner=绿色, Admin=蓝色, Editor=黄色, Viewer=灰色）
// - status='suspended' → 卡片灰色 + ⚠️ 警告文字
```

**验收标准:**
- 创建 2 个店铺后 dashboard 显示 2 张卡片
- 卡片显示正确的 plan badge 和 role badge
- 点击卡片跳转至 `/store/{slug}/admin`
- 无店铺时显示 Empty state + "Create Store" 按钮
- suspended 店铺显示灰色 + 警告标识
- deleted 状态的店铺不显示

---

### S2.4: 租户权限守卫验证
**Priority:** P0 | **Points:** 2

**涉及文件:**
- `src/middleware.ts` — 已实现，需验证行为

**Tasks:**
- [ ] 测试：用户 A 创建店铺 "shop-a"
- [ ] 测试：用户 B 访问 `/store/shop-a/admin` → 返回 404
- [ ] 测试：不存在的 slug 如 `/store/nonexistent/admin` → 返回 404
- [ ] 验证：返回 404 而非 403（防止信息泄露）
- [ ] 验证：成员可正常访问自己参与的店铺

**Middleware 权限逻辑（已实现）:**
```typescript
const storeMatch = pathname.match(/^\/store\/([^/]+)/);
if (storeMatch) {
  const slug = storeMatch[1];
  const { data: tenant } = await supabase
    .from("tenants").select("id").eq("slug", slug).single();
  if (!tenant) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const { data: membership } = await supabase
    .from("tenant_members").select("role")
    .eq("tenant_id", tenant.id).eq("user_id", user.id).single();
  if (!membership) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
```

**验收标准:**
- 用户 A 创建店铺 "shop-a"，用户 B 访问 `/store/shop-a` 得到 404
- 用户 A 访问 `/store/shop-a/admin` 正常显示
- 不存在的 slug 返回 404

---

### S2.5: 店铺控制台骨架
**Priority:** P1 | **Points:** 2

**需创建文件:**
- `src/components/layout/store-header.tsx`
- `src/components/layout/store-sidebar.tsx`
- `src/app/store/[slug]/admin/layout.tsx`

**需修改文件:**
- `src/app/store/[slug]/admin/page.tsx` — 显示店铺信息

**实现细节:**

```tsx
// app/store/[slug]/admin/layout.tsx — Server Component
// 1. 获取当前 tenant 信息 (name, slug, plan, created_at)
// 2. 渲染 StoreHeader + StoreSidebar + {children}

// StoreHeader:
// - 左：返回 Dashboard 链接 (← icon + "Back to stores")
// - 中：店铺名称
// - 右：Plan badge

// StoreSidebar:
// - Products（链接 /store/[slug]/admin/products — 占位）
// - Orders（链接 /store/[slug]/admin/orders — 占位）
// - Settings（链接 /store/[slug]/admin/settings — 占位）
// - 所有链接暂显示 "Coming soon" 页面

// app/store/[slug]/admin/page.tsx:
// - 显示店铺信息卡片：name, slug, plan, created_at
// - 格式化 created_at 为人类可读日期
// - 显示 "{slug}.lumora.shop" 作为店铺 URL 预览
```

**验收标准:**
- 点击 dashboard 卡片后进入店铺控制台，显示店铺名称和 slug
- 顶部有 "Back to stores" 链接回 /dashboard
- 侧边栏有 Products / Orders / Settings 占位链接
- 页面显示店铺基本信息（name, slug, plan, 创建日期）

---

### S2.6: 登出功能 + 用户菜单
**Priority:** P1 | **Points:** 1

**需创建文件:**
- `src/components/layout/user-menu.tsx`

**需修改文件:**
- `src/app/(protected)/layout.tsx` — 添加 Header with UserMenu

**实现细节:**

```tsx
// components/layout/user-menu.tsx — Client Component ("use client")
//
// 使用 @radix-ui/react-dropdown-menu
//
// Trigger: 用户头像（Avatar）或首字母圆圈
// Content:
// - 显示用户 email（灰色小字）
// - Separator
// - "Settings" → /settings
// - "Sign Out" → 调用 signOut() Server Action
//
// 数据获取：
// - 从 layout 传入 user email/name/avatar_url
// - layout 是 Server Component，通过 supabase.auth.getUser() 获取

// app/(protected)/layout.tsx:
// - 顶部 Header：左="Lumora" logo, 右=UserMenu
// - 下方 main 区域：{children}
```

**验收标准:**
- Header 右上角显示用户头像/首字母
- 点击头像展开 Dropdown：显示 email + Sign Out
- 点击 "Sign Out" 后清除 cookie，重定向至 /login
- 登出后再次访问 /dashboard 被重定向至 /login

---

## Sprint 2 Definition of Done

- [ ] 完整的 注册 → 开店 → dashboard → 进入店铺 流程可走通
- [ ] slug 实时校验可用性（debounce + 状态指示器）
- [ ] 非成员无法访问他人店铺（返回 404）
- [ ] Free plan 3 店铺限制生效
- [ ] 用户可通过菜单登出
- [ ] Empty state 正确显示
- [ ] `pnpm build:lumora` 编译通过无错误

---

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| Supabase RLS 查询性能（嵌套 subquery） | 确保 `idx_tenant_members_user` 索引存在 |
| tenant + membership 非原子操作 | createTenant 已实现 rollback 逻辑（删除孤立 tenant） |
| Slug 竞态条件（两用户同时注册相同 slug） | DB UNIQUE 约束兜底，应用层给出友好提示 |
