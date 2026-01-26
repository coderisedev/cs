# Task S1-03: 注册页面实现

> **Sprint:** 1 - Auth Foundation
> **Priority:** P0 | **Points:** 3
> **Prerequisites:** S1-02 (数据库 Migration 完成)
> **Blocks:** S1-05

---

## 目标

实现用户注册表单组件（Email + Password + Full Name），接入已有的 `signUp` Server Action，包含表单校验、错误显示和 loading 状态。

---

## 需创建的文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/components/auth/register-form.tsx` | Client Component | 注册表单 |

## 需修改的文件

| 文件 | 修改内容 |
|------|---------|
| `src/app/(auth)/register/page.tsx` | 替换占位内容为 `<RegisterForm />` |

---

## 技术上下文

### 可用的 UI 组件（直接 import）

```typescript
import { Button } from "@/components/ui/button";
// variants: default, destructive, outline, secondary, ghost, link
// sizes: default(h-10), sm(h-9), lg(h-11), icon(h-10 w-10)
// props: asChild, disabled, className

import { Input } from "@/components/ui/input";
// 标准 HTML input，带样式

import { Label } from "@/components/ui/label";
// 基于 @radix-ui/react-label

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
```

### 已有的 Server Action

```typescript
// src/actions/auth.ts
export async function signUp(formData: FormData) {
  // 参数：email, password, fullName (从 FormData 取)
  // 成功：redirect("/onboarding")
  // 失败：return { error: { email?: string[], password?: string[], fullName?: string[], _form?: string[] } }
}

export async function signInWithGoogle() {
  // 跳转至 Google OAuth consent
  // 成功：redirect(data.url)
  // 失败：return { error: string }
}
```

### 已有的校验规则 (`src/lib/validators/auth.ts`)

```typescript
export const emailSchema = z.string().email("Please enter a valid email address");
export const passwordSchema = z.string()
  .min(8, "At least 8 characters")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number");
export const fullNameSchema = z.string().min(2, "At least 2 characters").max(64, "Maximum 64 characters");
```

### CSS 变量（Tailwind v4，已配置在 globals.css）

```
--destructive: #ef4444;       ← 错误文字颜色
--muted-foreground: #71717a;  ← 辅助文字
--primary: #18181b;           ← 按钮默认色
--border: #e4e4e7;            ← 分割线
```

---

## 实现规格

### `src/components/auth/register-form.tsx`

```tsx
"use client";

import { useActionState } from "react";
import { signUp, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 组件结构：
// 1. <form action={signUp}> 包裹所有输入
// 2. 使用 React 19 的 useActionState 管理 pending/error 状态
// 3. 每个字段下方显示对应的校验错误（红色小字）
// 4. 表单顶部显示通用错误 (_form)
// 5. Google 按钮独立 form（action={signInWithGoogle}）
```

**组件 UI 结构（从上到下）：**

1. **Full Name 字段**
   - `<Label htmlFor="fullName">Full Name</Label>`
   - `<Input id="fullName" name="fullName" placeholder="Your full name" required />`
   - 错误：`{errors?.fullName && <p className="text-sm text-destructive">{errors.fullName[0]}</p>}`

2. **Email 字段**
   - `<Label htmlFor="email">Email</Label>`
   - `<Input id="email" name="email" type="email" placeholder="name@example.com" required />`
   - 错误显示

3. **Password 字段**
   - `<Label htmlFor="password">Password</Label>`
   - `<Input id="password" name="password" type="password" required />`
   - 密码强度指示器（4 条规则的 checklist）
   - 错误显示

4. **密码强度指示器**
   - 实时显示 4 条规则状态（绿色勾/灰色叉）：
     - 8+ characters
     - Contains lowercase
     - Contains uppercase
     - Contains number
   - 用 `onChange` 事件实时更新，不依赖 Server Action 返回

5. **通用错误区域**
   - `{errors?._form && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors._form[0]}</div>}`

6. **Submit 按钮**
   - `<Button type="submit" className="w-full" disabled={pending}>Create Account</Button>`
   - pending 时文字变为 "Creating account..." 或显示 spinner

7. **分割线**
   - `<div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div></div>`

8. **Google 按钮**
   - 独立 `<form action={signInWithGoogle}>`
   - `<Button variant="outline" className="w-full">Sign in with Google</Button>`
   - 包含 Google SVG icon（可选）

9. **登录链接**
   - `<p className="text-center text-sm text-muted-foreground">Already have an account? <a href="/login" className="text-primary underline">Sign in</a></p>`

### 密码强度指示器实现

```tsx
// 在 RegisterForm 内部用 useState 追踪 password 值
const [password, setPassword] = useState("");

const checks = [
  { label: "At least 8 characters", met: password.length >= 8 },
  { label: "Contains lowercase", met: /[a-z]/.test(password) },
  { label: "Contains uppercase", met: /[A-Z]/.test(password) },
  { label: "Contains number", met: /[0-9]/.test(password) },
];

// 渲染为列表
<ul className="mt-2 space-y-1">
  {checks.map((check) => (
    <li key={check.label} className={`text-xs flex items-center gap-1.5 ${check.met ? "text-green-600" : "text-muted-foreground"}`}>
      {check.met ? "✓" : "○"} {check.label}
    </li>
  ))}
</ul>
```

### useActionState 用法（React 19）

```tsx
const [state, formAction, pending] = useActionState(signUp, null);
// state = null | { error: { email?: string[], password?: string[], fullName?: string[], _form?: string[] } }
// pending = boolean (表单提交中)

<form action={formAction}>
  {/* ... inputs ... */}
  <Button disabled={pending}>
    {pending ? "Creating account..." : "Create Account"}
  </Button>
</form>
```

### 修改 `src/app/(auth)/register/page.tsx`

**当前内容（替换全部）：**

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Start building your AI commerce empire</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
}
```

---

## 错误处理场景

| 场景 | 错误来源 | 显示位置 |
|------|---------|---------|
| Email 格式错误 | Zod validation (前端) | email 字段下方 |
| 密码太短/太弱 | Zod validation (前端) | password 字段下方 |
| 名称太短/太长 | Zod validation (前端) | fullName 字段下方 |
| Email 已被注册 | Supabase Auth API | _form 通用错误区域 |
| 网络错误 | fetch 失败 | _form 通用错误区域 |

---

## 验收标准

| # | 条件 | 验证方式 |
|---|------|---------|
| 1 | 表单渲染正确 | 访问 `/register` 显示完整表单 |
| 2 | 密码强度实时反馈 | 输入密码时 checklist 实时更新 |
| 3 | 合法注册成功 | 填写合法信息提交 → Supabase `auth.users` + `profiles` 各新增 1 条 |
| 4 | 成功后重定向 | 注册成功 → URL 变为 `/onboarding` |
| 5 | 校验错误显示 | 空密码提交 → 密码字段下显示错误 |
| 6 | 重复 email 错误 | 相同 email 再次注册 → 显示通用错误 |
| 7 | Loading 状态 | 提交期间按钮 disabled + 文字变更 |
| 8 | 登录链接可用 | 点击 "Sign in" → 跳转 `/login` |
| 9 | Google 按钮存在 | 页面显示 "Sign in with Google" 按钮 |
| 10 | 编译通过 | `pnpm build:lumora` 无错误 |

---

## 注意事项

- 使用 `"use client"` 因为需要 `useActionState` 和 `useState`
- 不要引入额外依赖，使用已有的 UI 组件
- 密码强度指示器是纯前端逻辑，不调用 Server Action
- Google 按钮的实际 OAuth 流程在 S1-05 中验证，此处只需渲染按钮并绑定 action
