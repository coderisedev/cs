# Fix: OTP Login Returns 500 — Duplicate Provider Identity

## Symptom

用户输入正确的 OTP 验证码后，登录接口返回 HTTP 500 错误，无论是第几次尝试都失败。

pm2 日志中出现如下错误：

```
[ERROR] Auth OTP verify error {
  "error": {
    "message": "Provider identity with entity_id: user@example.com, provider: email-otp, already exists."
  }
}
```

## 影响范围

- 所有通过 OTP 验证码登录的**已注册用户**
- 新用户注册流程不受影响（走的是 `isNewUser` 分支，不涉及 auth identity 查找）

## 根因分析

### 问题出在哪里

文件：`apps/medusa/src/api/store/auth/otp/verify/route.ts`

OTP 验证成功后，系统需要查找或创建用户的 `auth_identity`（认证身份记录）。原代码使用了错误的查询方式：

```typescript
// 错误代码
const existingIdentities = await authService.listAuthIdentities(
  {},       // 没有任何过滤条件
  { take: 100 }  // 只取前 100 条
)

const matchingIdentity = existingIdentities?.find((identity: any) => {
  const providerIdentities = identity.provider_identities
  if (!providerIdentities) return false  // 这里永远是 true，因为关系没有加载
  return providerIdentities.some(
    (pi: any) => pi.provider === "email-otp" && pi.entity_id === normalizedEmail
  )
})
```

### 为什么查不到

这段代码有**两个致命问题**：

#### 1. 关系未加载

`listAuthIdentities` 默认**不加载** `provider_identities` 关系。返回的每条 `auth_identity` 记录中 `provider_identities` 字段为 `undefined`，导致 `.find()` 回调中 `if (!providerIdentities) return false` 永远成立，循环结束后 `matchingIdentity` 始终为 `undefined`。

#### 2. 分页限制不可靠

即使关系被正确加载，`{ take: 100 }` 也是一个隐患。当系统中有超过 100 个 auth identity 时，目标记录可能不在前 100 条中。

### 连锁反应

```
查找失败 → matchingIdentity = undefined
         → 进入 else 分支
         → 尝试创建新的 auth_identity + provider_identity
         → 数据库 unique 约束拦截（entity_id + provider 已存在）
         → 抛出 "already exists" 错误
         → 被外层 catch 捕获
         → 返回 HTTP 500
```

## 修复方案

### 核心思路

不再通过 `auth_identity` 表间接查找，而是直接查询 `provider_identity` 表。Medusa 2.x 的 `IAuthModuleService` 提供了 `listProviderIdentities` 方法，支持按 `provider` 和 `entity_id` 精确过滤。

### 修改前

```typescript
// apps/medusa/src/api/store/auth/otp/verify/route.ts (lines 119-150)

const existingIdentities = await authService.listAuthIdentities(
  {},
  { take: 100 }
)

const matchingIdentity = existingIdentities?.find((identity: any) => {
  const providerIdentities = identity.provider_identities
  if (!providerIdentities) return false
  return providerIdentities.some(
    (pi: any) => pi.provider === "email-otp" && pi.entity_id === normalizedEmail
  )
})

if (matchingIdentity) {
  authIdentityId = matchingIdentity.id
} else {
  const newAuthIdentity = await authService.createAuthIdentities({
    app_metadata: { customer_id: customer.id },
    provider_identities: [{
      entity_id: normalizedEmail,
      provider: "email-otp",
      provider_metadata: {},
    }],
  })
  authIdentityId = newAuthIdentity.id
}
```

### 修改后

```typescript
// apps/medusa/src/api/store/auth/otp/verify/route.ts (lines 119-141)

const providerIdentities = await authService.listProviderIdentities(
  { provider: "email-otp", entity_id: normalizedEmail },
  { take: 1 }
)

if (providerIdentities.length > 0) {
  authIdentityId = providerIdentities[0].auth_identity_id
} else {
  const newAuthIdentity = await authService.createAuthIdentities({
    app_metadata: { customer_id: customer.id },
    provider_identities: [{
      entity_id: normalizedEmail,
      provider: "email-otp",
      provider_metadata: {},
    }],
  })
  authIdentityId = newAuthIdentity.id
}
```

### 关键差异

| 对比项 | 修改前 | 修改后 |
|--------|--------|--------|
| 查询目标 | `auth_identity` 表（间接） | `provider_identity` 表（直接） |
| 过滤方式 | 全量拉取 + 内存遍历 | 数据库层精确过滤 |
| 关系加载 | 依赖未加载的关系 | 不需要额外关系 |
| 获取 ID | `matchingIdentity.id`（auth_identity ID） | `providerIdentities[0].auth_identity_id`（外键引用） |
| 分页风险 | `take: 100` 可能遗漏 | `take: 1` 精确匹配 |
| 性能 | O(n) 内存遍历 | O(1) 索引查询 |

## Medusa 2.x Auth 模块数据模型

理解修复方案需要了解 Medusa 的认证数据模型：

```
┌──────────────────┐       ┌──────────────────────┐
│  auth_identity   │       │  provider_identity    │
├──────────────────┤       ├──────────────────────┤
│ id (PK)          │◄──────│ auth_identity_id (FK) │
│ app_metadata     │       │ entity_id             │
│ created_at       │       │ provider              │
│ updated_at       │       │ provider_metadata     │
└──────────────────┘       └──────────────────────┘
                           UNIQUE(entity_id, provider)
```

- **auth_identity**：认证身份的顶层记录，通过 `app_metadata.customer_id` 关联到 customer
- **provider_identity**：具体的认证方式记录（如 email-otp、google 等），通过外键关联到 auth_identity
- 数据库对 `(entity_id, provider)` 有唯一约束，这就是重复创建会报错的原因

### IAuthModuleService 常用方法

```typescript
// 直接查询 provider_identity 表（推荐）
authService.listProviderIdentities(filters, config)

// 查询 auth_identity 表（需要手动指定 relations 才能加载关联数据）
authService.listAuthIdentities(filters, config)

// 创建 auth_identity 及其关联的 provider_identity
authService.createAuthIdentities({
  app_metadata: { customer_id: "..." },
  provider_identities: [{ entity_id: "...", provider: "...", provider_metadata: {} }],
})
```

## 验证步骤

### 1. 重启 Medusa

```bash
npx pm2 restart medusa-backend
```

### 2. 测试登录流程

1. 打开登录页面，输入已注册用户的邮箱
2. 收到 OTP 验证码
3. 输入正确的验证码
4. 应成功登录，返回 JWT token 和 customer 信息

### 3. 检查日志

```bash
npx pm2 logs medusa-backend --lines 50
```

确认日志中：
- 出现 `Existing user logged in via OTP` 表示登录成功
- 不再出现 `Provider identity with entity_id: ... already exists` 错误

### 4. 边界场景验证

| 场景 | 预期结果 |
|------|----------|
| 正确 OTP，首次登录 | 200，返回 token |
| 正确 OTP，重复登录 | 200，返回 token（复用已有 provider_identity） |
| 错误 OTP | 400，显示剩余尝试次数 |
| 连续 5 次错误 | 400，锁定提示 |
| OTP 过期后验证 | 400，过期提示 |
| 新用户 OTP 验证 | 200，`requiresProfile: true` |

## 经验总结

1. **Medusa 2.x 的 `list*` 方法默认不加载关系**。如果需要访问关联数据，必须在 config 中显式指定 `relations`，或者直接查询目标表。

2. **优先使用精确查询而非全量遍历**。`listProviderIdentities` 支持按字段过滤，比拉取所有 `auth_identity` 后内存遍历更可靠、更高效。

3. **注意数据库唯一约束**。当 "查找或创建" 模式中的查找步骤有缺陷时，创建步骤会触发唯一约束冲突，导致 500 错误。这类错误的根因往往在查找逻辑，而非创建逻辑。

4. **pm2 日志是排查的第一入口**。500 错误的具体原因（如 "already exists"）会记录在后端日志中，前端只能看到通用错误信息。
