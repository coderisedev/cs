# Medusa + Discourse SSO 集成指南

本文档详细说明如何将 Discourse 论坛的身份认证从 WordPress 切换到 Medusa/Next.js Storefront 作为 Identity Provider，实现官网与论坛之间的双向单点登录。

## 目录

- [背景与目标](#背景与目标)
- [架构总览](#架构总览)
- [DiscourseConnect 协议原理](#discourseconnect-协议原理)
- [实现详解](#实现详解)
  - [1. SSO 工具函数](#1-sso-工具函数)
  - [2. SSO API 端点](#2-sso-api-端点)
  - [3. Medusa 用户同步 Subscriber](#3-medusa-用户同步-subscriber)
  - [4. 登出同步](#4-登出同步)
- [环境变量配置](#环境变量配置)
- [Discourse 管理面板配置](#discourse-管理面板配置)
- [中间件说明](#中间件说明)
- [现有用户迁移策略](#现有用户迁移策略)
- [验证与测试](#验证与测试)
- [安全考量](#安全考量)
- [故障排查](#故障排查)
- [文件清单](#文件清单)

---

## 背景与目标

项目从 WordPress + Discourse 迁移到 Medusa + Next.js 新官网后，需要将 Discourse 论坛的 SSO 认证从 WordPress 切换到 Medusa Storefront。Discourse 之前通过 `wp-discourse` 插件使用 DiscourseConnect 协议做 SSO，现在需要用 Medusa/Storefront 替代 WordPress 成为新的 IdP。

**实现目标：**

| 场景 | 预期行为 |
|------|----------|
| 用户在官网登录后访问论坛 | 自动登录（无感跳转） |
| 用户直接访问论坛（未登录） | 被引导到官网登录页 → 登录后自动回到论坛 |
| 用户在官网注册 | Discourse 自动创建对应账号 |
| 用户在官网更新资料 | Discourse 同步更新 |
| 用户在官网登出 | Discourse 同步登出 |

## 架构总览

```
用户浏览器
    |
    |---- Next.js Storefront (dji-storefront) ---- Medusa Backend
    |         |                                        |
    |         |  GET /api/discourse/sso                |  subscriber:
    |         |  (DiscourseConnect 握手)                |  customer.created
    |         |                                        |  customer.updated
    |         |  signoutAction()                       |  => sync_sso API
    |         |  (登出时同步)                           |
    |         v                                        v
    |---- Discourse Forum <----------------------------+
```

**职责划分：**

- **Storefront (`dji-storefront`)** — 管理用户会话/cookie，承载 SSO 端点和登出同步
- **Medusa Backend** — 通过 subscriber 监听客户事件，调用 Discourse sync_sso API 同步账号
- **Discourse** — 作为 SSO Consumer，所有登录/注册操作交由 Storefront 处理

## DiscourseConnect 协议原理

DiscourseConnect（前身为 Discourse SSO）是一个基于 HMAC-SHA256 签名的简单 SSO 协议。协议不需要 OAuth、SAML 等复杂基础设施，仅依赖一个共享密钥和 HTTP 重定向。

### 登录握手时序图

```
用户                Discourse               Storefront (/api/discourse/sso)
 |                     |                              |
 |-- 访问论坛 -------->|                              |
 |                     |                              |
 |                     |-- 302 重定向 --------------->|
 |                     |   ?sso=BASE64&sig=HMAC       |
 |                     |                              |
 |<------------------- 302 重定向到 /login ------------|  (未登录时)
 |                     |                              |
 |-- 在官网登录 ------>|                              |
 |                     |                              |
 |-- returnTo 回到 --->|                    --------->|
 |   /api/discourse/sso|                              |
 |                     |                              |-- 验证签名
 |                     |                              |-- 获取用户数据
 |                     |                              |-- 构建 response payload
 |                     |                              |-- HMAC 签名
 |                     |                              |
 |                     |<--- 302 重定向 --------------|
 |                     |   ?sso=RESPONSE&sig=HMAC     |
 |                     |                              |
 |                     |-- 验证签名 & 创建会话         |
 |<-- 论坛已登录 ------|                              |
```

### 协议核心要素

| 要素 | 说明 |
|------|------|
| `sso` | Base64 编码的 URL 查询字符串，包含 `nonce` 和 `return_sso_url` |
| `sig` | 对 `sso` 值使用共享密钥计算的 HMAC-SHA256 十六进制摘要 |
| `nonce` | Discourse 生成的一次性随机数，防重放攻击，10 分钟过期 |
| `return_sso_url` | 认证完成后的回调地址（Discourse 端） |
| `external_id` | 外部系统的用户唯一标识（本方案中为 Medusa customer ID） |

### Discourse 请求 payload 示例

```
# Base64 解码后的内容：
nonce=a1b2c3d4e5&return_sso_url=https://forum.example.com/session/sso_login
```

### Storefront 回复 payload 示例

```
# Base64 解码后的内容：
nonce=a1b2c3d4e5&external_id=cus_01ABC123&email=user@example.com&name=John+Doe
```

---

## 实现详解

### 1. SSO 工具函数

**文件：** `apps/dji-storefront/src/lib/util/discourse-sso.ts`

这个模块封装了 DiscourseConnect 协议的所有底层操作，仅使用 Node.js 内置 `crypto` 模块，无需额外依赖。

#### 签名验证

```typescript
import crypto from "crypto"

export function verifyDiscoursePayload(
  sso: string,
  sig: string,
  secret: string = DISCOURSE_SSO_SECRET
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(sso)
    .digest("hex")
  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(sig, "hex")
  )
}
```

关键点：
- 使用 `crypto.timingSafeEqual` 比较签名，防止时序攻击（timing attack）
- `sso` 参数是 Base64 编码的原始字符串，直接参与 HMAC 计算（不先解码）

#### Payload 解码

```typescript
export function decodePayload(sso: string): {
  nonce: string
  return_sso_url: string
} {
  const decoded = Buffer.from(sso, "base64").toString("utf8")
  const params = new URLSearchParams(decoded)
  const nonce = params.get("nonce")
  const returnUrl = params.get("return_sso_url")

  if (!nonce) throw new Error("Missing nonce in Discourse SSO payload")
  if (!returnUrl) throw new Error("Missing return_sso_url in Discourse SSO payload")

  return { nonce, return_sso_url: returnUrl }
}
```

关键点：
- Discourse 的 payload 是标准 URL 查询字符串的 Base64 编码
- `nonce` 和 `return_sso_url` 是必需字段，缺失时抛出异常

#### 构建响应 Payload

```typescript
export function buildResponsePayload(params: {
  nonce: string
  external_id: string
  email: string
  username?: string
  name?: string
  avatar_url?: string
  suppress_welcome_message?: boolean
}): string {
  const payload = new URLSearchParams()
  payload.set("nonce", params.nonce)
  payload.set("external_id", params.external_id)
  payload.set("email", params.email)

  if (params.username) payload.set("username", params.username)
  if (params.name) payload.set("name", params.name)
  if (params.avatar_url) payload.set("avatar_url", params.avatar_url)
  if (params.suppress_welcome_message) {
    payload.set("suppress_welcome_message", "true")
  }

  return Buffer.from(payload.toString()).toString("base64")
}
```

关键点：
- `nonce` 必须原样回传，Discourse 用它匹配请求
- `external_id` 是 Discourse 关联外部用户的唯一键，使用 Medusa customer ID
- `suppress_welcome_message` 为 `true` 时 Discourse 不发送欢迎邮件（适用于自动同步场景）

#### 签名与域名验证

```typescript
export function signPayload(payload: string, secret: string = DISCOURSE_SSO_SECRET): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export function isValidReturnUrl(returnUrl: string): boolean {
  if (!DISCOURSE_URL) return false
  try {
    const parsed = new URL(returnUrl)
    const expected = new URL(DISCOURSE_URL)
    return parsed.origin === expected.origin
  } catch {
    return false
  }
}
```

关键点：
- `isValidReturnUrl` 确保 `return_sso_url` 的 origin（scheme + host + port）与配置的 `DISCOURSE_URL` 一致，防止开放重定向攻击

#### Discourse API 封装

```typescript
// 同步用户到 Discourse（创建或更新）
export async function syncDiscourseUser(params: {
  external_id: string
  email: string
  username?: string
  name?: string
  avatar_url?: string
  suppress_welcome_message?: boolean
}): Promise<void>

// 查找 Discourse 用户并登出
export async function logoutDiscourseUser(externalId: string): Promise<void>
```

`syncDiscourseUser` 调用 `POST /admin/users/sync_sso`，用于：
- 用户注册时在 Discourse 预创建账号
- 用户更新资料时同步到 Discourse

`logoutDiscourseUser` 先通过 `GET /users/by-external/{id}.json` 查找 Discourse 内部 user ID，再调用 `POST /admin/users/{id}/log_out` 登出。如果用户在 Discourse 中不存在（404），则静默跳过。

---

### 2. SSO API 端点

**文件：** `apps/dji-storefront/src/app/api/discourse/sso/route.ts`

这是整个集成的核心——处理 DiscourseConnect 握手的 Next.js API Route。

#### 端点定义

```
GET /api/discourse/sso?sso=BASE64_PAYLOAD&sig=HMAC_SIGNATURE
```

#### 完整流程

```typescript
export async function GET(request: NextRequest) {
  // 1. 获取 SSO 参数（从 query params 或 cookie）
  // 2. 验证 HMAC 签名
  // 3. 解码 payload，验证 return_sso_url 域名
  // 4. 检查用户登录状态
  // 5a. 未登录 → 存 cookie + 重定向到 /login
  // 5b. 已登录 → 构建 response + 重定向回 Discourse
}
```

#### 第 1 步：获取 SSO 参数

```typescript
let sso = searchParams.get("sso")
let sig = searchParams.get("sig")

// 如果从 /login 返回，参数在 cookie 中
if (!sso || !sig) {
  const stored = cookies.get(SSO_COOKIE_NAME)?.value
  if (stored) {
    const parsed = JSON.parse(stored)
    sso = parsed.sso
    sig = parsed.sig
  }
}
```

为什么需要 cookie？因为用户可能是未登录状态访问论坛，被重定向到 `/api/discourse/sso`，此时需要先去 `/login` 登录。登录完成后通过 `returnTo=/api/discourse/sso` 回到本端点，但此时 URL 中已没有原始的 `sso`/`sig` 参数了。所以第一次访问时把它们存入 cookie，登录后再从 cookie 取出。

#### 第 2 步：验证签名

```typescript
if (!verifyDiscoursePayload(sso, sig)) {
  return NextResponse.json({ error: "Invalid SSO signature" }, { status: 403 })
}
```

#### 第 3 步：解码并验证域名

```typescript
const { nonce, return_sso_url: returnSsoUrl } = decodePayload(sso)

if (!isValidReturnUrl(returnSsoUrl)) {
  return NextResponse.json({ error: "Invalid return_sso_url domain" }, { status: 403 })
}
```

#### 第 4 步：检查登录状态

```typescript
const headers = await getAuthHeaders()
let customer: HttpTypes.StoreCustomer | null = null

if (headers.authorization) {
  try {
    const result = await sdk.client.fetch<{
      customer: HttpTypes.StoreCustomer
    }>("/store/customers/me", { method: "GET", headers, cache: "no-store" })
    customer = result.customer
  } catch {
    // Token 过期或无效——视为未登录
  }
}
```

通过读取 `_medusa_jwt` cookie 获取 auth headers，调用 Medusa `/store/customers/me` 获取当前用户数据。

#### 第 5a 步：未登录 → 存 cookie + 重定向

```typescript
if (!customer) {
  const response = NextResponse.redirect(
    new URL(`/${DEFAULT_COUNTRY}/login?returnTo=/api/discourse/sso`, request.url)
  )

  response.cookies.set(SSO_COOKIE_NAME, JSON.stringify({ sso, sig }), {
    maxAge: SSO_COOKIE_MAX_AGE,  // 10 分钟
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  })

  return response
}
```

SSO cookie 设置：
- `httpOnly: true` — 防止 JavaScript 访问
- `sameSite: "lax"` — 允许顶级导航时携带（SSO 重定向需要）
- `maxAge: 600` — 10 分钟，与 Discourse nonce 有效期一致
- `secure: true`（生产环境）— 仅 HTTPS 传输

#### 第 5b 步：已登录 → 构建 response + 重定向

```typescript
const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ")

const responsePayload = buildResponsePayload({
  nonce,
  external_id: customer.id,
  email: customer.email ?? "",
  name: name || undefined,
})

const responseSig = signPayload(responsePayload)

const redirectUrl = new URL(returnSsoUrl)
redirectUrl.searchParams.set("sso", responsePayload)
redirectUrl.searchParams.set("sig", responseSig)

const response = NextResponse.redirect(redirectUrl.toString())

// 清除 SSO cookie
response.cookies.set(SSO_COOKIE_NAME, "", { maxAge: 0, path: "/" })

return response
```

---

### 3. Medusa 用户同步 Subscriber

**文件：** `apps/medusa/src/subscribers/discourse-sync.ts`

Medusa 2.x 的 subscriber 机制允许监听系统事件。此 subscriber 监听客户创建和更新事件，自动同步到 Discourse。

#### 事件监听

```typescript
export const config: SubscriberConfig = {
  event: ["customer.created", "customer.updated"],
}
```

#### 处理流程

```typescript
export default async function discourseSyncHandler({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<CustomerEventData>) {
  // 1. 检查 Discourse 环境变量是否配置（未配置则静默跳过）
  if (!DISCOURSE_URL || !DISCOURSE_SSO_SECRET || !DISCOURSE_API_KEY) {
    return
  }

  // 2. 查询客户数据
  const query = container.resolve("query")
  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { id: data.id },
  })

  // 3. 构建 sync_sso payload
  const payloadParams: Record<string, string> = {
    nonce: crypto.randomUUID(),
    external_id: customer.id,
    email: customer.email,
  }

  // 新注册用户抑制 Discourse 欢迎邮件
  if (eventName === "customer.created") {
    payloadParams.suppress_welcome_message = "true"
  }

  // 4. 签名并调用 Discourse API
  const payload = buildPayload(payloadParams)
  const sig = signPayload(payload)

  const response = await fetch(`${DISCOURSE_URL}/admin/users/sync_sso`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Api-Key": DISCOURSE_API_KEY,
      "Api-Username": DISCOURSE_API_USERNAME,
    },
    body: new URLSearchParams({ sso: payload, sig }).toString(),
  })
}
```

关键设计决策：
- **独立的签名函数**：subscriber 在 Medusa 进程中运行，不能引用 storefront 的代码，所以 `buildPayload` 和 `signPayload` 在此文件中独立实现
- **容错设计**：环境变量未配置时静默返回，API 调用失败时仅打印日志，不会影响 Medusa 主流程
- **`suppress_welcome_message`**：仅在 `customer.created` 时设为 `true`，避免 Discourse 向用户发送冗余的「Welcome to the forum」邮件

#### sync_sso API 说明

`POST /admin/users/sync_sso` 是 Discourse 的管理员 API，其行为：

| 场景 | 行为 |
|------|------|
| `external_id` 不存在 + `email` 不存在 | 创建新用户 |
| `external_id` 不存在 + `email` 已存在 | 将已有账号关联到该 `external_id` |
| `external_id` 已存在 | 更新该用户的信息 |

这使得从 WordPress 迁移时，只要邮箱匹配即可自动关联旧账号。

---

### 4. 登出同步

**文件：** `apps/dji-storefront/src/lib/actions/auth.ts`（修改 `signoutAction`）

在官网登出时同步登出 Discourse，确保用户不会在官网退出后仍在论坛保持登录状态。

#### 修改前

```typescript
export async function signoutAction(countryCode: string = "us") {
  try {
    await sdk.auth.logout()
  } catch (error) {
    console.error("Logout error:", error)
  }

  await removeAuthToken()
  // ...
}
```

#### 修改后

```typescript
import { logoutDiscourseUser } from "@/lib/util/discourse-sso"
import { HttpTypes } from "@medusajs/types"

export async function signoutAction(countryCode: string = "us") {
  // 1. 在 token 失效前获取 customer ID
  let customerId: string | null = null
  try {
    const headers = await getAuthHeaders()
    if (headers.authorization) {
      const { customer } = await sdk.client.fetch<{
        customer: HttpTypes.StoreCustomer
      }>("/store/customers/me", { method: "GET", headers, cache: "no-store" })
      customerId = customer?.id ?? null
    }
  } catch {
    // 获取失败不阻塞登出
  }

  // 2. 执行 Medusa 登出
  try {
    await sdk.auth.logout()
  } catch (error) {
    console.error("Logout error:", error)
  }

  await removeAuthToken()

  // 3. 异步同步 Discourse 登出（fire-and-forget）
  if (customerId) {
    logoutDiscourseUser(customerId).catch((err) => {
      console.error("[discourse] logout sync error:", err)
    })
  }

  // ...
}
```

关键设计：
- **先获取 customer ID**：必须在 `sdk.auth.logout()` 和 `removeAuthToken()` 之前获取，因为之后 token 已失效
- **fire-and-forget**：使用 `.catch()` 而非 `await`，Discourse 登出失败不应阻塞官网登出流程

#### `logoutDiscourseUser` 内部流程

```
1. GET /users/by-external/{customer_id}.json → 获取 Discourse user ID
2. POST /admin/users/{discourse_user_id}/log_out → 登出该用户
```

如果用户在 Discourse 中不存在（404），则静默跳过，不视为错误。

---

## 环境变量配置

### Storefront (`apps/dji-storefront/.env.local`)

```bash
# Discourse Forum SSO (DiscourseConnect)
# Forum URL (no trailing slash)
DISCOURSE_URL=https://forum.yourdomain.com
# Shared secret (must match Discourse admin → discourse_connect_secret)
DISCOURSE_SSO_SECRET=your-32-plus-character-random-secret
# Admin API key from Discourse admin → API Keys
DISCOURSE_API_KEY=your-discourse-admin-api-key
# API username for admin operations (default: system)
DISCOURSE_API_USERNAME=system
```

### Medusa (`apps/medusa/.env`)

```bash
# Discourse Forum Integration (DiscourseConnect)
# Forum URL (no trailing slash)
DISCOURSE_URL=https://forum.yourdomain.com
# Shared secret (must match Discourse admin → discourse_connect_secret)
DISCOURSE_SSO_SECRET=your-32-plus-character-random-secret
# Admin API key from Discourse admin → API Keys
DISCOURSE_API_KEY=your-discourse-admin-api-key
# API username for admin operations (default: system)
DISCOURSE_API_USERNAME=system
```

### 生成共享密钥

```bash
# 生成 64 字符的随机密钥
openssl rand -hex 32
```

> 两个应用的 `DISCOURSE_SSO_SECRET` 必须完全一致，且与 Discourse 管理面板中设置的 `discourse_connect_secret` 相同。

### 获取 Discourse API Key

1. 以管理员身份登录 Discourse
2. 进入 `/admin/api/keys`
3. 点击「New API Key」
4. 选择「All Users」作为 User Level
5. 选择 Global Key（或根据需要限制权限）
6. 保存并复制生成的 Key

---

## Discourse 管理面板配置

进入 Discourse 管理面板 `/admin/site_settings`，搜索并配置：

| 设置项 | 值 | 说明 |
|--------|-----|------|
| `enable_discourse_connect` | `true` | 启用 DiscourseConnect SSO |
| `discourse_connect_url` | `https://yourstore.com/api/discourse/sso` | Storefront 的 SSO 端点 |
| `discourse_connect_secret` | 与环境变量中相同的密钥 | 共享密钥 |
| `discourse_connect_overrides_email` | `true` | 每次 SSO 登录时用 IdP 的 email 覆盖 |
| `discourse_connect_overrides_name` | `true` | 每次 SSO 登录时用 IdP 的 name 覆盖 |
| `verbose_discourse_connect_logging` | `true` | 调试期间开启，上线后可关闭 |
| `logout_redirect` | `https://yourstore.com` | 用户在论坛登出后重定向到官网 |

> **注意**：启用 `enable_discourse_connect` 后，Discourse 将禁用本地登录表单，所有登录操作都通过 SSO 端点完成。请确保 SSO 端点工作正常后再启用此选项。

---

## 中间件说明

Storefront 的中间件 (`apps/dji-storefront/src/middleware.ts`) 负责为所有页面路由添加国家代码前缀（如 `/us/login`）。API 路由**无需修改中间件**，因为 Next.js 中间件的 matcher 配置已经排除了 `/api` 路径：

```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|...).*)",
    //    ^^^ api 开头的路径被排除
  ],
}
```

因此 `/api/discourse/sso` 不会被中间件拦截或添加国家代码前缀。

---

## 现有用户迁移策略

### 场景 1：Discourse 现有用户（WordPress 时代）

这是最常见的迁移场景。用户在 WordPress 时代已有 Discourse 账号，现在需要关联到 Medusa customer ID。

**自动迁移流程：**

1. 用户在新官网用**相同邮箱**注册/登录
2. Medusa subscriber 触发 `customer.created`，调用 `sync_sso` API
3. Discourse 发现 `external_id` 不存在但 `email` 匹配，自动将已有账号关联到 Medusa customer ID
4. 后续登录使用 `external_id` 查找，不再依赖 email 匹配

**用户首次访问论坛的流程：**

1. 用户在官网登录
2. 点击论坛链接
3. Discourse 发起 SSO 握手
4. Storefront 返回 `external_id=cus_xxx, email=user@example.com`
5. Discourse 匹配到已有账号（通过 email），关联 `external_id`
6. 用户看到自己原来的论坛账号，帖子、头像等全部保留

### 场景 2：批量预关联（可选）

如果希望在切换 SSO 之前完成所有用户关联，可以编写脚本批量调用 `sync_sso`：

```bash
# 伪代码：批量同步
for customer in $(medusa_customers); do
  curl -X POST "https://forum.example.com/admin/users/sync_sso" \
    -H "Api-Key: $DISCOURSE_API_KEY" \
    -H "Api-Username: system" \
    -d "sso=$(build_payload $customer)&sig=$(sign_payload)"
done
```

这样用户首次访问论坛时已有预建关联，SSO 登录即时生效。

### 场景 3：仅在官网注册的新用户

Medusa subscriber 在注册时自动调用 `sync_sso` 创建 Discourse 账号（`suppress_welcome_message=true`），用户首次访问论坛时已有预建账号。

---

## 验证与测试

### SSO 流程测试

1. **未登录 → 论坛 → 登录 → 回到论坛**
   - 清除所有 cookie
   - 访问 Discourse 论坛
   - 应被重定向到 `https://yourstore.com/api/discourse/sso?sso=...&sig=...`
   - 由于未登录，应再次重定向到 `/us/login?returnTo=/api/discourse/sso`
   - 在登录页输入凭据并登录
   - 应自动回到论坛并已登录
   - 检查 Discourse 用户信息是否与 Medusa 一致

2. **已登录 → 论坛（无感跳转）**
   - 先在官网登录
   - 访问 Discourse 论坛
   - 应经历快速重定向后自动登录（用户几乎无感知）

### 用户同步测试

3. **新用户注册**
   - 在官网注册新账号
   - 检查 Discourse 管理面板 → 用户列表，应出现对应账号
   - 验证：`external_id` 应为 Medusa customer ID

4. **用户信息更新**
   - 在官网修改用户姓名
   - 检查 Discourse 用户信息是否同步更新

### 登出同步测试

5. **官网登出 → 论坛登出**
   - 在官网和论坛都处于登录状态
   - 在官网点击「登出」
   - 访问论坛，应为未登录状态

### 边界场景

6. **SSO cookie 过期**
   - 访问论坛触发 SSO → 等待超过 10 分钟 → 尝试登录
   - 预期：Discourse nonce 过期，论坛显示错误，用户需重新发起

7. **Discourse 不可达**
   - 停止 Discourse 服务
   - 在官网注册或登出
   - 预期：subscriber 和登出同步打印错误日志，但不影响官网正常功能

8. **现有用户迁移**
   - 用已有 Discourse 账号的邮箱在新官网注册
   - 首次访问论坛
   - 预期：成功关联到原有 Discourse 账号，保留历史帖子

---

## 安全考量

### HMAC 签名验证

- 使用 `crypto.timingSafeEqual` 比较签名，防止时序攻击
- 签名基于 HMAC-SHA256，密钥长度建议 32 字节以上

### 开放重定向防护

- `isValidReturnUrl` 验证 `return_sso_url` 的 origin 与配置的 `DISCOURSE_URL` 一致
- 阻止攻击者构造恶意 payload 将用户重定向到钓鱼网站

### Cookie 安全

SSO cookie (`_discourse_sso`) 配置：
- `httpOnly: true` — JavaScript 无法读取
- `sameSite: "lax"` — 仅顶级导航时发送
- `secure: true`（生产环境）— 仅 HTTPS
- `maxAge: 600` — 10 分钟自动过期

### API Key 保护

- `DISCOURSE_API_KEY` 和 `DISCOURSE_SSO_SECRET` 仅存在于服务端环境变量中
- 不以 `NEXT_PUBLIC_` 前缀暴露到客户端
- Discourse API Key 建议限制权限范围（仅 sync_sso 和 user logout 相关权限）

### 邮箱验证

所有通过 SSO 发送给 Discourse 的邮箱都已经过 Medusa 的 OTP 验证流程确认，不存在未验证邮箱的风险。

---

## 故障排查

### 日志标识

所有 Discourse 相关日志使用统一前缀，方便搜索：

| 来源 | 日志前缀 | 示例 |
|------|----------|------|
| Storefront SSO 工具 | `[discourse]` | `[discourse] sync_sso failed (403): ...` |
| Medusa Subscriber | `[discourse-sync]` | `[discourse-sync] synced user@example.com (customer.created)` |

### 常见问题

**Q: SSO 登录时 Discourse 显示「nonce already used or expired」**

A: nonce 有 10 分钟有效期。可能原因：
- 用户在登录页停留超过 10 分钟
- 多次点击导致 nonce 被消费
- 解决：刷新论坛页面重新发起 SSO

**Q: Discourse 报 403 "invalid signature"**

A: `DISCOURSE_SSO_SECRET` 不一致。检查：
- Storefront `.env.local` 中的 `DISCOURSE_SSO_SECRET`
- Medusa `.env` 中的 `DISCOURSE_SSO_SECRET`
- Discourse 管理面板中的 `discourse_connect_secret`
- 三者必须完全一致（注意尾部空格/换行）

**Q: sync_sso 返回 403**

A: Discourse API Key 权限不足或无效。检查：
- API Key 是否为 Global Key
- `Api-Username` 是否为 `system`（或其他管理员用户名）
- Discourse 管理面板 `/admin/api/keys` 中 Key 是否处于活跃状态

**Q: 登出后论坛仍然保持登录**

A: 可能原因：
- `logoutDiscourseUser` 静默失败，查看 Storefront 日志中的 `[discourse]` 前缀
- Discourse 浏览器 cookie 缓存，尝试硬刷新（Ctrl+Shift+R）
- `DISCOURSE_API_KEY` 或 `DISCOURSE_URL` 未配置

**Q: 启用 verbose_discourse_connect_logging 后如何查看日志**

A: 在 Discourse 管理面板 → `/admin/logs` 或 Docker 容器日志中查看：
```bash
docker logs discourse-app --tail 100 | grep -i sso
```

---

## 文件清单

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新建 | `apps/dji-storefront/src/lib/util/discourse-sso.ts` | SSO 协议工具函数 |
| 新建 | `apps/dji-storefront/src/app/api/discourse/sso/route.ts` | SSO API 端点 |
| 新建 | `apps/medusa/src/subscribers/discourse-sync.ts` | 用户同步 Subscriber |
| 修改 | `apps/dji-storefront/src/lib/actions/auth.ts` | 登出同步（signoutAction） |
| 修改 | `apps/dji-storefront/.env.local.example` | 添加 Discourse 环境变量 |
| 修改 | `apps/medusa/.env.template` | 添加 Discourse 环境变量 |
| 无需修改 | `apps/dji-storefront/src/middleware.ts` | middleware matcher 已排除 /api |
