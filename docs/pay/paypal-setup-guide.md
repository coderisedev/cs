# PayPal 生产环境集成与配置指南

本文档旨在为当前项目（Medusa Backend + Next.js Storefront）提供一份详尽的 PayPal 生产环境配置指南。

## 1. 核心问题确认：是否需要配置 Webhook？

**结论：**
*   **基础支付流程（Happy Path）：不需要**。当前项目的支付捕获（Capture）逻辑在前端完成支付授权后，通过 API 同步调用 Medusa 后端完成。只要用户不关闭页面，订单就能正常生成。
*   **生产环境稳定性：强烈建议配置**。配置 Webhook 可以处理以下关键场景：
    1.  **异步状态同步**：如果用户支付后立即关闭页面，导致前端无法触发后端捕获，Webhook 可以作为兜底机制（依赖于插件实现）。
    2.  **退款与争议**：如果您在 PayPal 商家后台直接发起退款或收到争议，Webhook 会通知 Medusa 更新订单状态。
    3.  **安全性**：虽然当前流程是同步的，但 Webhook 提供了额外的状态确认渠道。

---

## 2. 生产环境配置步骤

### 第一步：准备 PayPal 账号与应用

1.  **登录账号**：使用您的 PayPal 商家账号登录 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)。
2.  **切换环境**：在右上角确保切换到 **"Live"**（生产环境）。
3.  **创建应用**：
    *   点击 "Apps & Credentials"。
    *   点击 "Create App"。
    *   输入 App 名称（例如 "DJI Storefront Live"）。
    *   创建后，您将获得 **Client ID** 和 **Secret**。

### 第二步：关键设置（防止订单失败）

**非常重要：** 如果您的 PayPal 账号曾经用于旧网站，或者您在测试中使用了重复的订单号，必须调整以下设置，否则会报错 `DUPLICATE_INVOICE_ID`。

1.  登录主账号后台（非开发者后台），或者在开发者后台找到相关设置。
2.  进入 **Payment Preferences** (支付首选项)。
3.  找到 **"Block accidental payments"** (阻止意外付款) 选项。
4.  **选择 "No, allow multiple payments per invoice ID"** (允许每个账单 ID 多次付款)。
    *   *原因：Medusa 生成的订单号可能与您旧系统的规则冲突，或者在重试支付时使用相同的 ID。*

### 第三步：配置环境变量

您需要分别配置后端（Medusa）和前端（Next.js）的环境变量。

#### 1. 后端配置 (`apps/medusa/.env`)

在生产环境服务器（如 Railway, VPS）上设置以下变量：

```bash
# 必填：生产环境凭证
PAYPAL_CLIENT_ID=您的_Live_Client_ID
PAYPAL_CLIENT_SECRET=您的_Live_Secret_Key

# 必填：强制指定为生产环境
PAYPAL_IS_SANDBOX=false
PAYPAL_ENVIRONMENT=live
```

#### 2. 前端配置 (`apps/dji-storefront/.env.local`)

在前端部署平台（如 Vercel, Railway）上设置：

```bash
# 必填：必须与后端的 Client ID 一致
NEXT_PUBLIC_PAYPAL_CLIENT_ID=您的_Live_Client_ID

# 可选：明确指定环境（根据您的代码逻辑）
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=live
```

### 第四步：配置 Webhook（推荐）

虽然不是强制，但建议配置以确保数据一致性。

1.  回到 [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) 的 App 详情页。
2.  找到 **"Webhooks"** 部分，点击 **"Add Webhook"**。
3.  **Webhook URL**: 输入您的 Medusa 后端地址加上 `/hooks/payment/paypal`。
    *   格式：`https://您的后端域名.com/hooks/payment/paypal`
    *   注意：是后端 API 的域名，不是前端商城的域名。
4.  **Event types** (订阅事件)：建议勾选以下核心事件：
    *   `Payment capture completed`
    *   `Payment capture denied`
    *   `Payment capture refunded`
    *   `Checkout order approved`
    *   `Checkout order completed`
5.  保存。

### 第五步：验证与测试

1.  **小额真实支付测试**：
    *   上线后，建议使用真实的信用卡或另一个 PayPal 账号进行一笔小额交易（如 $1.00）。
    *   **验证点**：
        1.  前端是否成功跳转到“订单确认”页面。
        2.  Medusa 后台是否生成了订单。
        3.  Medusa 后台的 Payment 状态是否为 `captured`。
        4.  PayPal 商家后台是否收到了款项。
2.  **退款测试**（验证 Webhook）：
    *   在 PayPal 商家后台对刚才的测试订单发起退款。
    *   观察 Medusa 后台该订单的状态是否自动更新（需要 Webhook 生效）。

## 3. 常见问题排查

*   **报错 `422 Unprocessable Entity`**: 通常是因为 `DUPLICATE_INVOICE_ID`。请参考第二步关闭“阻止意外付款”设置。
*   **按钮未显示**: 检查前端 `NEXT_PUBLIC_PAYPAL_CLIENT_ID` 是否正确加载，且与当前环境（Live/Sandbox）匹配。
*   **支付后订单未生成**: 检查 Medusa 后端日志。通常是 `capture` 阶段失败。确保后端能正常访问 PayPal API。

---

**文档维护者**: DevOps Team
**更新日期**: 2026-01-13
