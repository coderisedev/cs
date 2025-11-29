# Medusa Admin 后台管理配置 Playbook

本文档为 Medusa 2.x Admin 后台管理员提供完整的配置指南，涵盖从初始设置到日常运营的所有关键配置项。

## 目录

1. [初始访问与用户管理](#1-初始访问与用户管理)
2. [商店基础设置](#2-商店基础设置)
3. [区域与货币配置](#3-区域与货币配置)
4. [税务设置](#4-税务设置)
5. [销售渠道管理](#5-销售渠道管理)
6. [库存位置与配送](#6-库存位置与配送)
7. [支付提供商配置](#7-支付提供商配置)
8. [API 密钥管理](#8-api-密钥管理)
9. [常见问题与故障排除](#9-常见问题与故障排除)

---

## 1. 初始访问与用户管理

### 1.1 访问 Admin 后台

- **URL**: `http://localhost:9000/app` (开发环境) 或 `https://your-domain.com/app` (生产环境)
- **技术栈**: Vite v5 构建

### 1.2 创建首个管理员用户

通过 Medusa CLI 创建用户：

```bash
# 直接创建用户
pnpm medusa user -e admin@example.com -p YourPassword123

# 或创建邀请链接
pnpm medusa user -e admin@example.com --invite
```

### 1.3 邀请团队成员

**路径**: Settings → Users → Invite

1. 点击 **Invite** 按钮
2. 输入成员邮箱
3. 点击 **Send invite**

**管理邀请**:
- **重发邀请**: 点击待处理邀请旁的 ⋮ → Resend invite
- **复制链接**: ⋮ → Copy invite link (手动发送)
- **撤销邀请**: ⋮ → Delete

### 1.4 用户角色说明

| 角色 | 说明 |
|------|------|
| admin | 管理员 |
| member | 成员 |
| developer | 开发者 |

> **注意**: 当前版本所有角色拥有相同的管理权限。

### 1.5 管理现有用户

**路径**: Settings → Users

- **查看详情**: 点击用户名
- **编辑**: ⋮ → Edit (可修改姓名)
- **删除**: ⋮ → Delete (需输入用户名确认，不可逆)

### 1.6 重置用户密码

通过数据库直接重置（需要容器/服务器访问权限）：

```bash
# 1. 生成新密码哈希
docker exec <medusa-container> node -e "
const scrypt = require('scrypt-kdf');
scrypt.kdf('NewPassword123', { logN: 15, r: 8, p: 1 }).then(h => console.log(h.toString('base64')));
"

# 2. 更新数据库
psql -h <host> -U <user> -d <database> -c "
UPDATE provider_identity
SET provider_metadata = jsonb_set(provider_metadata, '{password}', '\"<hash>\"')
WHERE entity_id = 'user@example.com' AND provider = 'emailpass';
"
```

---

## 2. 商店基础设置

### 2.1 商店信息配置

**路径**: Settings → Store

**可配置项**:
- 商店名称
- 默认货币
- 默认区域
- 默认销售渠道
- 默认库存位置

**操作**: 点击 ⋮ → Edit 修改

### 2.2 货币管理

**添加货币**:
1. Settings → Store
2. 点击 Currencies 区域的 ⋮ → Add
3. 勾选需要的货币
4. 可选：为每个货币启用含税定价
5. 点击 Save

**移除货币**:
1. 勾选要移除的货币
2. 按 R 或点击 Remove
3. 确认删除

> **注意**: 默认货币无法移除。

---

## 3. 区域与货币配置

### 3.1 创建区域

**路径**: Settings → Regions → Create

**配置项**:
| 字段 | 说明 |
|------|------|
| Name | 区域名称 (如 "中国大陆") |
| Currency | 区域货币 (每个区域只能有一种货币) |
| Countries | 包含的国家/地区 |
| Payment Providers | 可用的支付方式 |
| Tax inclusive pricing | 是否含税定价 |
| Automatic Taxes | 是否自动计算税费 |

### 3.2 添加国家到区域

1. 进入区域详情页
2. 在 Countries 区域点击 **Add countries**
3. 勾选要添加的国家
4. 点击 Save

### 3.3 编辑区域

1. 进入区域详情页
2. 点击 ⋮ → Edit
3. 修改名称、货币、支付提供商或税务设置
4. 点击 Save

### 3.4 删除区域

1. 进入区域详情页
2. 点击 ⋮ → Delete
3. 输入区域名称确认 (不可逆)

---

## 4. 税务设置

### 4.1 创建税务区域

**路径**: Settings → Tax Regions → Create

**配置项**:
- Country: 选择国家
- Default tax rate: 默认税率 (%)
- Tax name: 税种名称 (如 "增值税")
- Tax code: 税务代码

### 4.2 创建子级税务区域

适用于美国各州、加拿大各省等：

1. 进入税务区域详情页
2. 在 Sublevels 区域点击 **Create**
3. 选择州/省/区
4. 设置子级税率
5. 启用 **Combinable** 可与父级税率叠加
6. 点击 Save

### 4.3 税率覆盖

为特定产品或产品类型设置不同税率：

1. 进入税务区域详情页
2. 在 Overrides 区域点击 **Create**
3. 配置覆盖规则：
   - Name: 覆盖名称
   - Rate: 税率
   - Code: 税务代码
   - Combinable: 是否与默认税率叠加
   - Targets: 选择产品、产品类型或配送选项
4. 点击 Save

### 4.4 含税定价 vs 不含税定价

| 模式 | 说明 |
|------|------|
| Tax-exclusive | 结账时在商品价格基础上添加税费 |
| Tax-inclusive | 税费已包含在显示价格中 |

在区域设置中启用 **Tax inclusive pricing** 开关。

---

## 5. 销售渠道管理

### 5.1 创建销售渠道

**路径**: Settings → Sales Channels → Create

**配置项**:
- Name: 渠道名称 (如 "官网商城"、"小程序")
- Description: 渠道描述
- Enabled: 是否启用

### 5.2 管理渠道产品

**添加产品**:
1. 进入销售渠道详情页
2. 在 Products 区域点击 **Add**
3. 勾选要添加的产品
4. 点击 Save

**移除产品**:
1. 勾选要移除的产品
2. 按 R 或点击 Remove
3. 确认移除

> **警告**: 从渠道移除产品后，该产品将无法在该渠道购买。

### 5.3 查看渠道订单

在 Orders 页面可查看订单所属的销售渠道。

---

## 6. 库存位置与配送

### 6.1 创建库存位置

**路径**: Settings → Locations & Shipping → Create

**配置项**:
- Location name: 位置名称 (如 "上海仓库")
- Address: 地址信息 (至少需要地址行和国家)

### 6.2 关联销售渠道

1. 进入位置详情页
2. 在 Sales Channels 区域点击 ⋮ → Edit
3. 勾选/取消勾选销售渠道
4. 点击 Save

### 6.3 配置物流提供商

1. 进入位置详情页
2. 在 Fulfillment Providers 区域点击 ⋮ → Edit
3. 选择可用的物流提供商
4. 点击 Save

### 6.4 创建配送服务区域

1. 在位置详情页的 Shipping 区域点击 ⋮
2. 选择 **Enable** 启用配送
3. 点击 **Create service zone**
4. 设置区域名称 (如 "华东地区")
5. 点击 **Manage areas** 选择包含的国家/地区
6. 点击 Save

### 6.5 创建配送选项

1. 在服务区域中点击 **Create option**
2. 配置选项：

| 字段 | 说明 |
|------|------|
| Price type | Fixed (固定价格) 或 Calculated (动态计算) |
| Name | 配送选项名称 (客户可见) |
| Shipping Profile | 适用的配送档案 |
| Shipping Option Type | 配送类型 |
| Fulfillment Provider | 物流提供商 |
| Fulfillment Option | 物流选项 (如 标准/快递) |
| Enable in store | 是否在商店启用 |

3. 如选择 Fixed，在 Bulk Editor 中设置各货币/区域的价格
4. 可设置条件价格 (如满额免运费)
5. 点击 Save

### 6.6 自提选项

1. 在 Pickup 区域启用自提功能
2. 创建服务区域和自提选项
3. 配置方式与配送类似

---

## 7. 支付提供商配置

### 7.1 Stripe 配置示例

**1. 在 medusa-config.ts 中配置**:

```typescript
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_API_KEY,
            },
          },
        ],
      },
    },
  ],
})
```

**2. 设置环境变量**:

```bash
STRIPE_API_KEY=sk_live_xxx  # 或 sk_test_xxx
```

**3. 在 Admin 中启用**:

1. Settings → Regions
2. 选择区域 → ⋮ → Edit
3. 在 Payment Providers 中选择 "Stripe"
4. 点击 Save

**4. 配置 Webhook (生产环境)**:

Webhook URL: `https://your-domain.com/hooks/payment/stripe`

### 7.2 其他支付提供商

配置流程类似，参考各提供商的模块文档。

---

## 8. API 密钥管理

### 8.1 创建 Publishable API Key

**路径**: Settings → Publishable API Keys → Create

1. 输入密钥标题
2. 点击 Save

### 8.2 关联销售渠道

1. 进入 API Key 详情页
2. 在 Sales Channels 区域点击 **Add**
3. 选择要关联的销售渠道
4. 点击 Save

### 8.3 在前端使用

```javascript
// JS SDK
const medusa = new Medusa({
  publishableApiKey: "pk_xxx",
  // ...
})

// 或在请求头中
headers: {
  "x-publishable-api-key": "pk_xxx"
}
```

### 8.4 撤销 API Key

1. 进入 API Key 详情页
2. 点击 ⋮ → Revoke API key
3. 确认撤销

> **警告**: 撤销后无法恢复，使用该密钥的请求将失败。

---

## 9. 常见问题与故障排除

### 9.1 Admin 页面空白或加载失败

**可能原因**:
- `NODE_ENV=development` 但缺少开发依赖
- Vite 开发服务器配置问题

**解决方案**:
1. 确保 Dockerfile 包含完整依赖
2. 检查 `medusa-config.ts` 中的 `admin.vite.server.allowedHosts` 配置

```typescript
admin: {
  vite: () => ({
    server: {
      allowedHosts: [".yourdomain.com"],
    },
  }),
},
```

### 9.2 支付提供商不显示

**检查项**:
1. 确认 `medusa-config.ts` 中已配置支付模块
2. 确认区域已关联该支付提供商
3. 重启 Medusa 服务

### 9.3 配送选项不可用

**检查项**:
1. 确认库存位置已关联正确的销售渠道
2. 确认物流提供商已启用
3. 确认服务区域包含客户所在国家

### 9.4 登录失败 "Invalid key"

**原因**: 密码哈希格式不正确

**解决方案**: 使用 `scrypt-kdf` 库重新生成密码哈希并更新数据库

---

## 参考资源

- [Admin Dashboard Quickstart](https://docs.medusajs.com/admin/quickstart)
- [Medusa Admin User Guide](https://docs.medusajs.com/user-guide)
- [Manage Regions](https://docs.medusajs.com/user-guide/settings/regions)
- [Manage Tax Regions](https://docs.medusajs.com/user-guide/settings/tax-regions)
- [Manage Sales Channels](https://docs.medusajs.com/user-guide/settings/sales-channels)
- [Manage Locations & Shipping](https://docs.medusajs.com/user-guide/settings/locations-and-shipping/locations)
- [Manage Users & Invites](https://docs.medusajs.com/user-guide/settings/users)
- [Publishable API Keys](https://docs.medusajs.com/user-guide/settings/developer/publishable-api-keys)
- [Stripe Payment Provider](https://docs.medusajs.com/resources/commerce-modules/payment/payment-provider/stripe)
- [Multi-Region Store Recipe](https://docs.medusajs.com/resources/recipes/multi-region-store)

---

*文档版本: 2025-11-29*
*适用于 Medusa 2.x*
