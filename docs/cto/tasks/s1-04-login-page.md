# Task S1-04: 登录页面实现

> **Sprint:** 1 - Auth Foundation
> **Priority:** P0 | **Points:** 3
> **Prerequisites:** S1-02 (数据库 Migration 完成)
> **Blocks:** S1-05

---

## 目标

实现用户登录表单组件（Email + Password），接入已有的 `signIn` Server Action，包含错误显示、loading 状态和 URL 参数错误提示。

---

## 需创建的文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/components/auth/login-form.tsx` | Client Component | 登录表单 |

## 需修改的文件

| 文件 | 修改内容 |
|------|---------|
| `src/app/(auth)/login/page.tsx` | 替换占位内容为 `<LoginForm />` |

---

## 技术上下文

### 已有的 Server Action

```typescript
// src/actions/auth.ts
export async function signIn(formData: FormData) {
  // 参数：email, password (从 FormData 取)
  // 校验：signInSchema (email: valid email, password: non-empty)
  // 成功：redirect("/dashboard")
  // 失败：return { error: { _form: ["Invalid email or password"] } }
}

export async function signInWithGoogle() {
  // 跳转至 Google OAuth consent
  // 成功：redirect(data.url)
  // 失败：return { error: string }
}
```

### 已有的校验规则

```typescript
// src/lib/validators/auth.ts
export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
```

### 可用 UI 组件

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
```

---

## 实现规格

### `src/components/auth/login-form.tsx`

```tsx
"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
```

**组件 UI 结构（从上到下）：**

1. **URL 参数错误提示**
   - 检查 `searchParams.get("error")`
   - 如果 `error === "auth_failed"`，在表单顶部显示：
   - `<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Authentication failed. Please try again.</div>`

2. **通用表单错误**
   - 来自 `state?.error?._form`
   - `<div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{state.error._form[0]}</div>`

3. **Email 字段**
   - `<Label htmlFor="email">Email</Label>`
   - `<Input id="email" name="email" type="email" placeholder="name@example.com" required autoComplete="email" />`
   - 错误：`{state?.error?.email && <p className="text-sm text-destructive">{state.error.email[0]}</p>}`

4. **Password 字段**
   - `<Label htmlFor="password">Password</Label>`
   - `<Input id="password" name="password" type="password" required autoComplete="current-password" />`
   - 错误显示

5. **Submit 按钮**
   - `<Button type="submit" className="w-full" disabled={pending}>Sign In</Button>`
   - pending 时文字变为 "Signing in..."

6. **分割线**
   - 同 register-form 的 "Or" 分割线样式

7. **Google 按钮**
   - 独立 `<form action={signInWithGoogle}>`
   - `<Button variant="outline" className="w-full">Sign in with Google</Button>`

8. **注册链接**
   - `<p className="text-center text-sm text-muted-foreground">Don't have an account? <a href="/register" className="text-primary underline">Create one</a></p>`

### useActionState 用法

```tsx
const [state, formAction, pending] = useActionState(signIn, null);
// state = null | { error: { email?: string[], password?: string[], _form?: string[] } }

// 注意：useSearchParams 需要 Suspense boundary
// 方案 1：在 page.tsx 中用 <Suspense> 包裹 <LoginForm />
// 方案 2：在 LoginForm 内部使用 useSearchParams（Next.js 16 会自动处理）
```

### 修改 `src/app/(auth)/login/page.tsx`

**当前内容（替换全部）：**

```tsx
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Lumora account</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
```

**注意：** `<Suspense>` 包裹是因为 `useSearchParams()` 在 Next.js 16 中会使组件变为 client-side render，需要 Suspense boundary。

---

## 错误处理场景

| 场景 | 错误来源 | 显示位置 | 显示文字 |
|------|---------|---------|---------|
| Email 格式错误 | Zod validation | email 字段下方 | "Please enter a valid email address" |
| 密码为空 | Zod validation | password 字段下方 | "Password is required" |
| 凭证错误 | Supabase Auth | _form 通用错误 | "Invalid email or password" |
| OAuth 回调失败 | URL ?error=auth_failed | 表单顶部 alert | "Authentication failed. Please try again." |

---

## 与 Middleware 的交互

**已实现的路由逻辑（`src/middleware.ts`）：**

```
已认证 + /login → redirect /dashboard
未认证 + /dashboard → redirect /login?next=/dashboard
```

- 登录成功后 `signIn` action 会 `redirect("/dashboard")`
- Middleware 会将已认证用户从 `/login` 自动重定向到 `/dashboard`
- URL 中的 `?next=` 参数当前未使用（signIn 固定跳 /dashboard），可作为未来优化

---

## 验收标准

| # | 条件 | 验证方式 |
|---|------|---------|
| 1 | 表单渲染正确 | 访问 `/login` 显示 email + password + 按钮 |
| 2 | 正确凭证登录 | 用 S1-02 创建的测试用户登录 → 重定向 `/dashboard` |
| 3 | 错误凭证提示 | 错误密码 → 显示 "Invalid email or password" |
| 4 | 空密码校验 | 不填密码提交 → 显示 "Password is required" |
| 5 | Loading 状态 | 提交期间按钮 disabled + 文字 "Signing in..." |
| 6 | URL 错误参数 | 访问 `/login?error=auth_failed` → 显示 alert |
| 7 | 注册链接可用 | 点击 "Create one" → 跳转 `/register` |
| 8 | Google 按钮存在 | 显示 "Sign in with Google" 按钮 |
| 9 | 已认证重定向 | 已登录状态访问 `/login` → 自动跳转 `/dashboard` |
| 10 | 编译通过 | `pnpm build:lumora` 无错误 |

---

## 注意事项

- `useSearchParams()` 需要 `Suspense` boundary，否则构建时会报 bailout 警告
- `autoComplete` 属性帮助浏览器密码管理器识别字段
- Login 表单比 Register 简单：不需要密码强度指示器，密码校验只要求非空
- 不要在此处实现 "Forgot Password" 功能（超出 Sprint 1 范围）
