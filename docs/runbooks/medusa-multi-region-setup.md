# Medusa 多区域定价与差异化运费配置指南

**最后更新**: 2026-01-13
**场景**: 实现“不同国家看到不同价格，享受不同运费策略”的精细化运营。

---

## 1. 核心逻辑回顾
Medusa 的交易逻辑链条如下：
**用户地址 (Country)** -> **匹配区域 (Region)** -> **加载对应价格 (Price)** -> **应用对应运费 (Shipping Option)**。

---

## 2. 第一步：配置 Regions (区域)
*路径: Settings -> Regions*

确保为不同的市场建立独立的 Region。

### 示例配置 A：北美区 (North America)
*   **Currency**: `USD`
*   **Countries**: United States, Canada
*   **Tax inclusive**: 否 (美国通常在结账后计算税)

### 示例配置 B：欧洲区 (Europe)
*   **Currency**: `EUR`
*   **Countries**: Germany, France, Italy...
*   **Tax inclusive**: **是** (建议勾选，符合欧洲用户看含税价的习惯)

---

## 3. 第二步：差异化定价 (Product Pricing)
*路径: Products -> [选择商品] -> Variants -> Edit Prices*

Medusa 允许您为每个 SKU 在不同 Region 手动指定价格。

| 商品变体 | 北美区 (USD) | 欧洲区 (EUR) | 备注 |
| :--- | :--- | :--- | :--- |
| DJI Mini 4 Pro (Standard) | $759.00 | €799.00 | 欧洲区价格已含税 |
| DJI Mini 4 Pro (Combo) | $1,099.00 | €1,159.00 | |

**关键提示**：如果某个变体没有设置该 Region 的价格，该区域的用户将无法购买此商品（显示为 Out of Stock 或无法加入购物车）。

---

## 4. 第三步：差异化运费 (Shipping Options)
*路径: Settings -> Regions -> [选择区域] -> Shipping Options*

运费是强绑定在 Region 上的，可以根据订单金额设置阶梯运费。

### 场景一：北美区 (满 $99 包邮)
1.  **选项一：Free Shipping**
    *   **Price Type**: Flat Rate
    *   **Amount**: 0
    *   **Requirements**: Min. subtotal: **99**
2.  **选项二：Standard Shipping**
    *   **Price Type**: Flat Rate
    *   **Amount**: 15
    *   **Requirements**: Max. subtotal: **98.99**

### 场景二：欧洲区 (固定运费 €10)
1.  **选项一：EU Priority Line**
    *   **Price Type**: Flat Rate
    *   **Amount**: 10
    *   **Requirements**: 无 (None)

---

## 5. 第四步：前端验证逻辑 (Next.js)

在 `apps/dji-storefront` 中，通信逻辑如下：

1.  **URL 驱动**: 访问 `/us/` 时，前端告诉 Medusa SDK `region_id` 或 `country_code` 为 `us`。
2.  **价格获取**: SDK 自动根据当前 `region_id` 返回对应的 `calculated_price`。
3.  **运费获取**: 在 Checkout 页面，系统调用 `GET /store/shipping-options?cart_id=...`，Medusa 仅返回属于当前 Region 的选项。

---

## 6. 常见避坑指南

1.  **含税价开关**: 欧洲区务必在 Region 设置中开启 "Tax inclusive pricing"，否则用户会在结账最后一刻看到价格突然涨了 20%，极大降低转化率。
2.  **库存同步**: 库存是全局的，不分 Region。但您可以将不同的库存地点 (Stock Location) 关联到不同的 Sales Channel 来实现物理隔离。
3.  **多货币陷阱**: 确保您的支付网关 (Stripe/PayPal) 账户已开通对应货币的接收权限，否则支付会报错。
