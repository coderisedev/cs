# Task S1-05: Google OAuth 流程

> **Sprint:** 1 - Auth Foundation
> **Priority:** P1 | **Points:** 2
> **Prerequisites:** S1-03 (注册页面), S1-04 (登录页面)
> **Blocks:** 无

---

## 目标

配置 Google OAuth Provider，验证完整的 OAuth 流程：点击 Google 按钮 → Google consent → 回调 → 自动创建 profile → 重定向。

---

## 已就绪的代码

### Server Action (`src/actions/auth.ts`)

```typescript
export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
  if (error) { return { error: error.message }; }
  redirect(data.url);
}
```

### OAuth Callback Route (`src/app/(auth)/auth/callback/route.ts`)

```typescript
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

### Profile Trigger（数据库已配置）

```sql
-- auth.users INSERT 时自动创建 profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- handle_new_user 会读取 raw_user_meta_data 中的 full_name 和 avatar_url
```

### 注册/登录表单中的 Google 按钮（S1-03/S1-04 已创建）

```tsx
<form action={signInWithGoogle}>
  <Button variant="outline" className="w-full">Sign in with Google</Button>
</form>
```

---

## 配置步骤

### Step 1: Google Cloud Console 配置

1. 访问 https://console.cloud.google.com/
2. 创建新项目或选择已有项目
3. APIs & Services → OAuth consent screen：
   - User Type: External
   - App name: Lumora
   - User support email: 你的邮箱
   - Authorized domains: `localhost`（开发阶段）
   - Developer contact: 你的邮箱
4. APIs & Services → Credentials → Create Credentials → OAuth Client ID：
   - Application type: Web application
   - Name: Lumora Dev
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:54321/auth/v1/callback`
     - （注意：Supabase 处理 OAuth 回调，不是你的 app 直接处理）
5. 复制 Client ID 和 Client Secret

### Step 2: Supabase 配置

**通过 Supabase Dashboard（http://localhost:54323）：**

1. Authentication → Providers → Google：
   - Enable: ON
   - Client ID: `<从 Step 1 复制>`
   - Client Secret: `<从 Step 1 复制>`
   - 保存

**或通过 `supabase/config.toml`（本地开发）：**

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id.apps.googleusercontent.com"
secret = "your-google-client-secret"
redirect_uri = "http://localhost:54321/auth/v1/callback"
```

修改后需要 `supabase stop && supabase start` 重启。

### Step 3: 验证环境变量

确认 `apps/lumora-platform/.env.local` 包含：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

此变量被 `signInWithGoogle` 用于构造 `redirectTo` URL。

---

## 完整流程描述

```
1. 用户点击 "Sign in with Google" 按钮
   ↓
2. 触发 signInWithGoogle Server Action
   ↓
3. supabase.auth.signInWithOAuth({ provider: "google" })
   返回 Google OAuth URL
   ↓
4. redirect(data.url) → 浏览器跳转到 Google consent 页面
   ↓
5. 用户在 Google 授权
   ↓
6. Google 回调到 Supabase: http://localhost:54321/auth/v1/callback
   ↓
7. Supabase 处理 OAuth token，创建/更新 auth.users
   ↓
8. Supabase redirect 到 app: http://localhost:3000/auth/callback?code=xxx
   ↓
9. app/auth/callback/route.ts 执行 exchangeCodeForSession(code)
   ↓
10. session 写入 cookie
    ↓
11. redirect("/dashboard")
    ↓
12. Middleware 检测 user 已认证，允许访问 /dashboard
    ↓
13. 如果是首次 OAuth 登录：
    - auth.users INSERT 触发 handle_new_user trigger
    - profiles 表自动创建，full_name = Google 显示名, avatar_url = Google 头像
    ↓
14. Middleware 检测 tenant_members count = 0
    → redirect /onboarding
```

---

## 验证步骤

### 验证 1: OAuth 跳转

```bash
# 启动 dev server
pnpm dev:lumora

# 访问 http://localhost:3000/login
# 点击 "Sign in with Google"
# 应该跳转到 accounts.google.com
```

### 验证 2: Google Consent

- Google consent 页面应显示 app name "Lumora"
- 点击 "Allow" 授权

### 验证 3: 回调处理

```
# 授权后应跳转到：
http://localhost:3000/auth/callback?code=xxxxx

# 然后自动跳转到 /dashboard（或 /onboarding 如果无店铺）
```

### 验证 4: Profile 自动创建

```sql
-- 在 Supabase SQL Editor 中检查
SELECT u.email, p.full_name, p.avatar_url
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email = '<your-google-email>';

-- 预期：full_name = Google 显示名, avatar_url = Google 头像 URL
```

### 验证 5: 重复登录

- 再次点击 "Sign in with Google"
- 如果浏览器已授权，应直接跳过 consent
- 不应创建重复的 profiles 记录

---

## 常见问题排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 点击 Google 按钮无反应 | Server Action 未绑定 | 确认 form action={signInWithGoogle} |
| Google consent 报错 "redirect_uri_mismatch" | GCP redirect URI 配置错误 | 确认 URI 为 `http://localhost:54321/auth/v1/callback` |
| 回调后显示 "auth_failed" | Supabase 未配置 Google provider | 检查 Dashboard → Providers → Google |
| Profile 未创建 | Trigger 不存在 | 确认 S1-02 migration 执行成功 |
| full_name 为空 | Google user_metadata 格式问题 | 检查 `raw_user_meta_data ->> 'full_name'` 路径 |

---

## 验收标准

| # | 条件 | 验证方式 |
|---|------|---------|
| 1 | Google 按钮跳转正确 | 点击后跳转 Google consent |
| 2 | 授权后回调成功 | 回到 /auth/callback 且无错误 |
| 3 | Session 创建成功 | 回调后 cookie 包含 Supabase session |
| 4 | 重定向至正确页面 | 首次登录 → /onboarding，已有店铺 → /dashboard |
| 5 | Profile 自动创建 | profiles 表包含 Google 用户信息 |
| 6 | full_name 同步 | profiles.full_name = Google 显示名称 |
| 7 | avatar_url 同步 | profiles.avatar_url = Google 头像 URL |
| 8 | 重复登录无异常 | 二次登录不创建新 profile |

---

## 降级方案

如果 Google OAuth 配置遇到阻碍（GCP 项目审核等），此任务可延迟至 Sprint 2。核心 Email/Password 认证不受影响。Google 按钮可暂时保留在 UI 中但标注 "Coming soon" 或禁用状态。
