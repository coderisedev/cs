# PayPal Payment Integration Setup

本文档说明如何配置 PayPal 支付集成。

## 前置条件

1. 拥有 PayPal Business 账户
2. 访问 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

## 获取 PayPal 凭证

### 1. 创建 PayPal App

1. 登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 点击 **Apps & Credentials**
3. 选择 **Sandbox** 或 **Live** 环境
4. 点击 **Create App**
5. 输入 App 名称，选择 **Merchant** 类型
6. 创建后获取 **Client ID** 和 **Secret**

### 2. 创建 Sandbox 测试账户

在 Sandbox 环境测试时：

1. 进入 **Sandbox** → **Accounts**
2. 创建 Business 账户（商家）和 Personal 账户（买家）
3. 记录测试账户的邮箱和密码

---

## 环境配置

### Medusa 后端

**文件:** `apps/medusa/.env`

```env
# PayPal Configuration
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_IS_SANDBOX=true   # 生产环境设为 false
```

### Storefront 前端

**文件:** `apps/dji-storefront/.env.local`

```env
# PayPal Payment
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-client-id
```

> **注意:** 前端只需要 Client ID，不需要 Secret

---

## Medusa Admin 配置

启动 Medusa 后，需要在 Admin Dashboard 启用 PayPal 支付提供商：

1. 登录 Medusa Admin Dashboard
2. 进入 **Settings** → **Regions**
3. 选择目标 Region（如 **US**）
4. 在 **Payment Providers** 部分启用 **PayPal**
5. 保存更改

---

## 验证集成

### 1. 检查后端配置

启动 Medusa 后，查看日志确认 PayPal provider 已加载：

```bash
cd apps/medusa
pnpm dev
```

### 2. 测试支付流程

1. 在 Storefront 添加商品到购物车
2. 进入 Checkout 页面
3. 填写收货地址信息
4. 点击 PayPal 按钮
5. 使用 Sandbox Personal 账户登录并完成支付
6. 确认订单创建成功

---

## 切换到生产环境

1. 在 PayPal Developer Dashboard 切换到 **Live** 模式
2. 获取 Live 环境的 Client ID 和 Secret
3. 更新环境变量：

**Medusa:**
```env
PAYPAL_CLIENT_ID=live-client-id
PAYPAL_CLIENT_SECRET=live-client-secret
PAYPAL_IS_SANDBOX=false
```

**Storefront:**
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID=live-client-id
```

4. 重启服务

---

## 故障排查

### PayPal 按钮未显示

- 检查 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 是否正确配置
- 检查浏览器控制台是否有错误

### 支付失败

- 确认 Sandbox 测试账户余额充足
- 检查 Medusa 后端日志中的错误信息
- 确认 Region 已启用 PayPal 支付提供商

### Provider ID 格式

PayPal provider ID 为 `pp_paypal_paypal`，格式为：`pp_{id}_{module_name}`

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `apps/medusa/medusa-config.ts` | Medusa Payment 模块配置 |
| `apps/medusa/.env.template` | 环境变量模板 |
| `apps/dji-storefront/src/components/checkout/paypal-button.tsx` | PayPal 按钮组件 |
| `apps/dji-storefront/src/lib/actions/checkout.ts` | Checkout 服务端操作 |

---

## 参考链接

- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal REST API Documentation](https://developer.paypal.com/docs/api/overview/)
- [@rd1988/medusa-payment-paypal](https://github.com/DRX-1877/medusa-payment-paypal)
- [@paypal/react-paypal-js](https://github.com/paypal/react-paypal-js)

---

*文档创建日期：2025-12-04*
