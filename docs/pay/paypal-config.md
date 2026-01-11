# PayPal 生产环境配置指南

本文档说明如何配置 PayPal 支付功能的生产环境参数。

## 凭证信息

### Sandbox 环境（测试）

| 参数 | 值 |
|------|-----|
| App Name | CSDTC |
| Client ID | `AYjf6N1hZ7-LJbUfAQ7ckjaGGjEwAGWnpMBC2mkTlmLe78eMEuUC-fTG4kUUNxGftFFUNQ4owaLlQv63` |
| Secret Key | `EHzdWyUuyQ0Zw1PMzc8yEZMcUoXXpVUaWNBzPpDb5unwNqZsvQcAEqWzJi_CATOT9r6WCRF3oHbHiE0f` |
| API Endpoint | https://sandbox.paypal.com |

**测试账号：**

| 类型 | Email | Password |
|------|-------|----------|
| Business | sb-470m8134299574@business.example.com | N*=l;37M |
| Personal | sb-k4efm34294933@personal.example.com | Y"m0o}M# |

### Live 环境（生产）

| 参数 | 值 |
|------|-----|
| App Name | CSDTCProd |
| Client ID | `Adb44FjOiZLEJHqv-eO9L1dO8y0eLk-BryepQmofuyzO4UKwdzF8b0EcAYCFKBUME_K2z7MKWFhzlaLk` |
| Secret Key | `EGwwzDtq7eK1UAaYa6P_WGTFFEMRrLfRxZoX3Eg3V_dUnevNNN8i96q4dyxmAj1KMzxkh1eVqbUxN3Wg` |
| Primary Email | alvin.he888@gmail.com |
| API Endpoint | https://api.paypal.com |

---

## 后端配置（Medusa）

配置文件：`deploy/gce/.env.prod`

### Sandbox 模式

```bash
# PayPal Payment (Sandbox)
PAYPAL_CLIENT_ID=AYjf6N1hZ7-LJbUfAQ7ckjaGGjEwAGWnpMBC2mkTlmLe78eMEuUC-fTG4kUUNxGftFFUNQ4owaLlQv63
PAYPAL_CLIENT_SECRET=EHzdWyUuyQ0Zw1PMzc8yEZMcUoXXpVUaWNBzPpDb5unwNqZsvQcAEqWzJi_CATOT9r6WCRF3oHbHiE0f
PAYPAL_IS_SANDBOX=true
```

### Live 模式

```bash
# PayPal Payment (Live)
PAYPAL_CLIENT_ID=Adb44FjOiZLEJHqv-eO9L1dO8y0eLk-BryepQmofuyzO4UKwdzF8b0EcAYCFKBUME_K2z7MKWFhzlaLk
PAYPAL_CLIENT_SECRET=EGwwzDtq7eK1UAaYa6P_WGTFFEMRrLfRxZoX3Eg3V_dUnevNNN8i96q4dyxmAj1KMzxkh1eVqbUxN3Wg
PAYPAL_IS_SANDBOX=false
```

### 配置说明

| 变量 | 必需 | 说明 |
|------|------|------|
| `PAYPAL_CLIENT_ID` | 是 | PayPal 应用 Client ID |
| `PAYPAL_CLIENT_SECRET` | 是 | PayPal 应用 Secret Key |
| `PAYPAL_IS_SANDBOX` | 否 | 是否使用沙箱环境，默认 `false` |

**重要：凭证必须与环境匹配**
- `PAYPAL_IS_SANDBOX=true` → 必须使用 Sandbox 凭证
- `PAYPAL_IS_SANDBOX=false` → 必须使用 Live 凭证

---

## 前端配置（Next.js / Vercel）

### 环境变量

在 Vercel 项目设置中配置：

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | PayPal Client ID（与后端相同） |

### Sandbox 模式

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AYjf6N1hZ7-LJbUfAQ7ckjaGGjEwAGWnpMBC2mkTlmLe78eMEuUC-fTG4kUUNxGftFFUNQ4owaLlQv63
```

### Live 模式

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=Adb44FjOiZLEJHqv-eO9L1dO8y0eLk-BryepQmofuyzO4UKwdzF8b0EcAYCFKBUME_K2z7MKWFhzlaLk
```

### 前端代码位置

PayPal 按钮组件：`apps/dji-storefront/src/components/checkout/paypal-button.tsx`

---

## 部署检查清单

### 切换到 Live 模式

- [ ] 更新 `deploy/gce/.env.prod` 中的 PayPal 凭证为 Live 值
- [ ] 设置 `PAYPAL_IS_SANDBOX=false`
- [ ] 在 Vercel 更新 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 为 Live Client ID
- [ ] 重启 Medusa 容器：`docker restart cs-prod-medusa-1`
- [ ] 重新部署 Vercel 前端
- [ ] 测试支付流程

### 切换到 Sandbox 模式（测试）

- [ ] 更新 `deploy/gce/.env.prod` 中的 PayPal 凭证为 Sandbox 值
- [ ] 设置 `PAYPAL_IS_SANDBOX=true`
- [ ] 在 Vercel 更新 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 为 Sandbox Client ID
- [ ] 重启 Medusa 容器
- [ ] 重新部署 Vercel 前端
- [ ] 使用测试账号进行支付测试

---

## 使用的插件

- **后端插件**：`@rd1988/medusa-payment-paypal` v2.0.3
- **配置文件**：`apps/medusa/medusa-config.ts`

### 插件配置示例

```typescript
{
  resolve: "@rd1988/medusa-payment-paypal",
  id: "paypal",
  options: {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    isSandbox: process.env.PAYPAL_IS_SANDBOX === "true",
  },
}
```

---

## 常见问题

### Q: 支付时出现认证错误

检查前后端的 Client ID 是否一致，以及是否与 `PAYPAL_IS_SANDBOX` 的环境匹配。

### Q: 如何获取 PayPal 凭证

1. 访问 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. 创建或选择应用
3. 获取 Client ID 和 Secret Key

### Q: 前端需要配置 Secret Key 吗

不需要。前端只需要 `NEXT_PUBLIC_PAYPAL_CLIENT_ID`，Secret Key 仅在后端使用。

---

## 相关文档

- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Orders API](https://developer.paypal.com/docs/api/orders/v2/)
- [Medusa Payment Provider](https://docs.medusajs.com/resources/references/payment/provider)
