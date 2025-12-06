# Medusa 快速配置指南 - 单区域简化版

本指南适用于简单的电商场景：单一区域（US）、美元计价、含税定价、免运费。

## 配置目标

| 配置项 | 设置 |
|--------|------|
| 区域 | US (美国) |
| 货币 | USD (美元) |
| 定价模式 | 含税定价 (Tax Inclusive) |
| 运费 | 免运费 |
| 销售渠道 | 单一渠道 |

---

## 快速配置步骤

### Step 1: 登录 Admin 后台

访问 Admin 后台：
- **Dev**: https://dev-api.aidenlux.com/app
- **Prod**: https://api.aidenlux.com/app

使用管理员账号登录。

---

### Step 2: 配置商店货币

**路径**: Settings → Store

1. 点击 Currencies 区域的 ⋮ → **Add**
2. 搜索并勾选 **USD - US Dollar**
3. 勾选 **Tax inclusive pricing** (含税定价)
4. 点击 **Save**
5. 点击商店信息旁的 ⋮ → **Edit**
6. 设置 **Default currency** 为 USD
7. 点击 **Save**

---

### Step 3: 创建 US 区域

**路径**: Settings → Regions → **Create**

填写以下信息：

| 字段 | 值 |
|------|-----|
| Name | `United States` |
| Currency | `USD` |
| Countries | 选择 `United States` |
| Tax inclusive pricing | ✅ 开启 |
| Automatic Taxes | ✅ 开启 |

点击 **Save**。

---

### Step 4: 配置税务区域

**路径**: Settings → Tax Regions → **Create**

| 字段 | 值 |
|------|-----|
| Country | `United States` |
| Default tax rate | `0` (或根据实际税率填写，如 `8.25`) |
| Tax name | `Sales Tax` |
| Tax code | `sales_tax` |

点击 **Save**。

> **说明**: 因为使用含税定价，税费已包含在商品价格中，这里主要用于税务报表。

---

### Step 5: 确认销售渠道

**路径**: Settings → Sales Channels

系统默认有一个 **Default Sales Channel**，确认其状态为 **Enabled**。

如需重命名：
1. 点击进入渠道详情
2. 点击 ⋮ → **Edit**
3. 修改名称为 `Web Store` 或其他
4. 点击 **Save**

---

### Step 6: 创建库存位置

**路径**: Settings → Locations & Shipping → **Create**

| 字段 | 值 |
|------|-----|
| Location name | `Main Warehouse` |
| Address line | `123 Main Street` |
| City | `Los Angeles` |
| State | `California` |
| Postal code | `90001` |
| Country | `United States` |

点击 **Save**。

---

### Step 7: 关联销售渠道到库存位置

1. 进入刚创建的 **Main Warehouse** 详情页
2. 在 **Sales Channels** 区域点击 ⋮ → **Edit**
3. 勾选 **Default Sales Channel** (或你的渠道名称)
4. 点击 **Save**

---

### Step 8: 启用物流提供商

1. 在位置详情页，找到 **Fulfillment Providers** 区域
2. 点击 ⋮ → **Edit**
3. 勾选 **manual** (手动物流)
4. 点击 **Save**

---

### Step 9: 配置免运费

#### 9.1 启用配送功能

1. 在位置详情页，找到 **Shipping** 区域
2. 点击 ⋮ → **Enable**

#### 9.2 创建服务区域

1. 点击 **Create service zone**
2. 填写：
   - **Name**: `US Shipping`
3. 点击 **Manage areas**
4. 勾选 **United States**
5. 点击 **Save**

#### 9.3 创建免运费选项

1. 在服务区域中点击 **Create option**
2. 填写：

| 字段 | 值 |
|------|-----|
| Price type | `Fixed` |
| Name | `Free Shipping` |
| Shipping Profile | `Default Shipping Profile` |
| Fulfillment Provider | `manual` |
| Fulfillment Option | `Standard` 或任一选项 |
| Enable in store | ✅ 开启 |

3. 点击 **Save**
4. 在弹出的 **Bulk Editor** 中：
   - 找到 USD 对应的行
   - 将价格设置为 `0`
5. 点击 **Save**

---

### Step 10: 设置商店默认值

**路径**: Settings → Store

点击 ⋮ → **Edit**，设置：

| 字段 | 值 |
|------|-----|
| Default region | `United States` |
| Default sales channel | `Default Sales Channel` |
| Default stock location | `Main Warehouse` |

点击 **Save**。

---

### Step 11: 创建 API Key

**路径**: Settings → Publishable API Keys → **Create**

1. 输入标题：`Storefront Key`
2. 点击 **Save**
3. 进入详情页，在 **Sales Channels** 区域点击 **Add**
4. 勾选你的销售渠道
5. 点击 **Save**
6. 复制 API Key 供前端使用

---

## 配置完成检查清单

- [ ] 商店默认货币设置为 USD
- [ ] 创建了 United States 区域，开启含税定价
- [ ] 创建了税务区域
- [ ] 销售渠道已启用
- [ ] 创建了库存位置并关联销售渠道
- [ ] 启用了 manual 物流提供商
- [ ] 创建了免运费配送选项 (价格 $0)
- [ ] 商店默认值已设置
- [ ] 创建了 Publishable API Key

---

## 添加产品后的操作

创建产品后，需要确保：

1. **关联销售渠道**：
   - Products → 选择产品 → Sales Channels 区域 → Add → 勾选渠道

2. **设置库存**：
   - Products → 选择产品 → Inventory 区域 → 设置库存数量

3. **设置价格**：
   - Products → 选择产品 → 编辑变体 → 设置 USD 价格

---

## 前端集成

在 Storefront 中配置：

```env
# .env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.aidenlux.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxx  # 你的 API Key
NEXT_PUBLIC_DEFAULT_REGION=us
```

---

## 常见问题

### Q: 产品在商店不显示？

检查：
1. 产品是否已发布 (Published)
2. 产品是否关联到销售渠道
3. 产品是否有库存
4. 产品是否设置了 USD 价格

### Q: 结账时没有配送选项？

检查：
1. 库存位置是否关联销售渠道
2. 配送服务区域是否包含 United States
3. 配送选项是否启用 (Enable in store)

### Q: 价格显示不含税？

检查：
1. 区域设置中 Tax inclusive pricing 是否开启
2. 商店货币设置中是否勾选了 Tax inclusive pricing

---

*文档版本: 2025-12-06*
*适用于 Medusa 2.x*
