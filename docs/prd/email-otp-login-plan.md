# 邮件验证码登录方案 (Email OTP Login)

针对"用邮件验证码替代密码登录，简化老客户迁移并统一用户体验"的需求。

## 背景

- 当前登录方式：Email + 密码 / Google / Discord / Facebook
- 当前注册流程：已有完整的 OTP 验证码基础设施（发送6位验证码到邮箱、验证、倒计时重发）
- 目标：将登录改为邮件验证码方式，彻底跳过密码问题

## 现有 OTP 基础设施

系统已具备的能力（用于注册流程）：

- `initiateRegistrationAction()` — 发送 OTP 到邮箱
- `verifyOTPAction()` — 验证6位 OTP
- `resendOTPAction()` — 重发 OTP（60秒冷却）
- 前端 OTP 输入组件和倒计时 UI

## 实施方案

### 1. Medusa 后端：新增 Email OTP 认证 Provider

类似现有的 `auth-google-one-tap` 模块，创建一个 `auth-email-otp` 模块：

```
apps/medusa/src/modules/auth-email-otp/
├── index.ts
└── service.ts    # authenticate() 方法：验证 email + OTP
```

核心逻辑：
- 接收 email → 生成 OTP → 存储（Redis/DB）→ 发送邮件
- 接收 email + OTP → 校验 → 返回 auth identity

### 2. 前端：改造登录流程

当前 `login-client.tsx` 已有注册用的 OTP 视图，登录改为：

```
输入 Email → 发送验证码 → 输入验证码 → 登录成功
```

完全复用现有的 OTP UI 组件和倒计时逻辑。

### 3. 移除密码相关流程

- 去掉登录的密码输入框
- 去掉"忘记密码"/"重置密码"流程
- 注册也不再需要设密码

## 对老客户迁移的好处

| 优势 | 说明 |
|:---|:---|
| **无需密码** | 迁移时完全不用考虑密码问题 |
| **自动激活** | 只要邮箱存在系统中，输入即可收码登录 |
| **注册登录合一** | 新老用户统一流程：输入邮箱 → 收验证码 → 进入系统 |
| **安全性高** | 每次登录都验证邮箱所有权 |

## 开发量评估

- 后端 OTP Provider 模块：参考现有 `auth-google-one-tap` 结构，逻辑不复杂
- 前端改造：大部分 OTP 组件已存在（`verifyOTPAction`、倒计时、重发），主要是调整流程
- 可以保留 Google 一键登录作为辅助方式

## 涉及的关键文件

**Medusa 后端：**
- `apps/medusa/medusa-config.ts` — 注册新 auth provider
- `apps/medusa/src/modules/auth-email-otp/` — 新建 OTP 认证模块（参考 `auth-google-one-tap`）

**DJI Storefront 前端：**
- `apps/dji-storefront/src/components/auth/login-client.tsx` — 改造登录 UI 流程
- `apps/dji-storefront/src/lib/actions/auth.ts` — 新增/修改 OTP 登录 server actions
- `apps/dji-storefront/src/lib/auth/providers.ts` — 更新 provider 配置

## 相关文档

- [定向客户优惠券发放方案](./medusa-targeted-discount-plan.md)
- [WordPress 老客户迁移方案](./wordpress-to-medusa-customer-migration.md)
