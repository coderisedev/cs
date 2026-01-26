# Task S1-06: Middleware 路由守卫验证

> **Sprint:** 1 - Auth Foundation
> **Priority:** P0 | **Points:** 2
> **Prerequisites:** S1-02 (数据库 Migration 完成)
> **Blocks:** 无

---

## 目标

验证已实现的 Middleware 路由守卫行为正确：未认证重定向、已认证重定向、session 续期、静态资源放行。

---

## 已实现的 Middleware 代码

**文件：** `src/middleware.ts`

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login", "/register", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 公开路径：允许未认证访问，但已认证用户重定向至 /dashboard
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const { user, supabaseResponse } = await updateSession(request);
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 2. 保护路径：未认证重定向至 /login
  const { user, supabaseResponse, supabase } = await updateSession(request);
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 3. Onboarding 重定向：无店铺用户强制进入 onboarding
  if (pathname !== "/onboarding" && pathname !== "/settings") {
    const { count } = await supabase
      .from("tenant_members")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (count === 0 && !pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  }

  // 4. 租户成员校验：/store/[slug] 路径
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

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Session 更新 helper：** `src/lib/supabase/middleware.ts`

```typescript
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return { user, supabaseResponse, supabase };
}
```

---

## 验证测试矩阵

### 场景 1: 未认证访问保护路径

| 请求 | 预期响应 |
|------|---------|
| GET /dashboard | 302 → /login?next=/dashboard |
| GET /onboarding | 302 → /login?next=/onboarding |
| GET /settings | 302 → /login?next=/settings |
| GET /store/my-shop/admin | 302 → /login?next=/store/my-shop/admin |

**验证方式：**
```bash
# 确保无 auth cookie（使用无痕窗口或 curl）
curl -v http://localhost:3000/dashboard 2>&1 | grep "location:"
# 预期：location: /login?next=%2Fdashboard
```

### 场景 2: 已认证访问公开路径

| 请求 | 预期响应 |
|------|---------|
| GET /login | 302 → /dashboard |
| GET /register | 302 → /dashboard |

**验证方式：**
```
1. 先登录获取 session cookie
2. 再访问 /login
3. 应自动跳转至 /dashboard
```

### 场景 3: 公开路径未认证正常访问

| 请求 | 预期响应 |
|------|---------|
| GET /login | 200 (login page) |
| GET /register | 200 (register page) |
| GET /auth/callback?code=xxx | 正常处理 callback |

### 场景 4: 静态资源不拦截

| 请求 | 预期响应 |
|------|---------|
| GET /_next/static/... | 200 (直接响应，不经过 middleware) |
| GET /favicon.ico | 200 |
| GET /some-image.png | 200 |
| GET /logo.svg | 200 |

**验证方式：**
```
- 在未认证状态下检查页面的 CSS/JS 是否正常加载
- 如果 middleware 拦截了静态资源，页面会显示无样式或报错
```

### 场景 5: Session Cookie 续期

| 步骤 | 验证 |
|------|------|
| 1. 登录获取 session | cookie 包含 `sb-xxxx-auth-token` |
| 2. 等待并刷新页面 | response 中 Set-Cookie 更新 token |
| 3. 仍保持登录 | 不被 redirect 到 /login |

**验证方式：**
```bash
# 检查 response headers 中是否有 Set-Cookie
curl -v -b "cookies.txt" http://localhost:3000/dashboard 2>&1 | grep "set-cookie"
```

### 场景 6: Onboarding 重定向（无店铺用户）

| 条件 | 请求 | 预期响应 |
|------|------|---------|
| 已认证 + 无店铺 | GET /dashboard | 302 → /onboarding |
| 已认证 + 无店铺 | GET /onboarding | 200 (正常显示) |
| 已认证 + 无店铺 | GET /settings | 200 (正常显示) |
| 已认证 + 有店铺 | GET /dashboard | 200 (正常显示) |

**验证方式：**
```
1. 注册新用户（无任何 tenant_members 记录）
2. 登录后访问 /dashboard → 应跳转 /onboarding
3. 访问 /settings → 应正常显示（不跳转）
```

### 场景 7: 租户成员校验

| 条件 | 请求 | 预期响应 |
|------|------|---------|
| slug 不存在 | GET /store/nonexistent/admin | 404 JSON |
| 用户非成员 | GET /store/other-user-shop/admin | 404 JSON |
| 用户是成员 | GET /store/my-shop/admin | 200 |

**验证方式：**
```sql
-- 准备测试数据
-- 1. 创建用户 A，创建店铺 slug='shop-a'
-- 2. 创建用户 B（无店铺）
-- 3. 用户 B 访问 /store/shop-a/admin → 404

-- 如果还没有创建店铺，此场景在 Sprint 2 中完整验证
-- Sprint 1 中重点验证 slug 不存在 → 404
```

---

## 手动测试流程

### 完整流程测试

```
1. 打开无痕窗口
2. 访问 http://localhost:3000/dashboard
   → 验证：跳转到 /login?next=/dashboard

3. 点击注册链接，创建新账户
   → 验证：注册成功后跳转

4. 用新账户登录
   → 验证：跳转到 /onboarding（因为无店铺）

5. 在同一浏览器新 tab 访问 /login
   → 验证：自动跳转 /dashboard（或 /onboarding）

6. 访问 /settings
   → 验证：正常显示（不被 onboarding 拦截）

7. 访问 /store/nonexistent/admin
   → 验证：返回 404 JSON

8. 登出
   → 验证：cookie 清除

9. 再次访问 /dashboard
   → 验证：跳转到 /login
```

---

## Matcher 配置说明

```typescript
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**含义：** 匹配所有路径，**排除**以下：
- `/_next/static/*` — Next.js 静态资源
- `/_next/image/*` — Next.js 图片优化
- `/favicon.ico` — 网站图标
- `/*.svg|png|jpg|jpeg|gif|webp` — 所有图片文件

---

## 验收标准

| # | 条件 | 验证方式 |
|---|------|---------|
| 1 | 未认证 → redirect /login | 无痕窗口访问 /dashboard |
| 2 | 已认证 + /login → redirect /dashboard | 登录后访问 /login |
| 3 | Session cookie 续期正常 | 多次刷新保持登录 |
| 4 | 静态资源不被拦截 | 页面 CSS/JS 正常加载 |
| 5 | /login 携带 ?next 参数 | 未认证访问 /dashboard，检查 URL |
| 6 | 无店铺 → onboarding | 新用户登录后验证跳转 |
| 7 | /settings 不受 onboarding 影响 | 无店铺用户可访问 /settings |
| 8 | 不存在的 slug → 404 | 访问 /store/fake/admin |

---

## 注意事项

- 本任务不需要编写新代码，主要是验证已有实现的正确性
- 如果发现 bug，直接修复 `src/middleware.ts`
- 租户成员校验（场景 7）的完整测试需要 Sprint 2 的创建店铺功能
- 在 Sprint 1 中重点验证 场景 1-6 + slug 不存在的 404
- 如果 `updateSession` 中 `supabase.auth.getUser()` 返回 null 但 cookie 存在，可能是 cookie 过期或被篡改，这是正常行为
