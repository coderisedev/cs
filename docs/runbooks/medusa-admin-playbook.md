# Medusa Admin 后台配置实战指南

**最后更新**: 2026-01-13
**适用版本**: Medusa v1/v2
**目标**: 帮助管理员从零开始配置一个具备跨境销售能力的电商后台。

---

## 1. 核心概念解析 (Mental Model)

在使用 Medusa Admin 之前，必须理解它与 Shopify 等传统电商的区别。Medusa 的设计哲学是 **“区域优先 (Region-First)”**。

*   **Store (店铺)**: 全局配置容器。
*   **Regions (区域)**: 交易的核心单元。**所有商品价格、支付方式、物流方式、税率都绑定在 Region 上**。
    *   *例子*: 你可以卖同一个商品，在美国卖 $100 (免邮)，在欧洲卖 €95 (收 €10 运费)。
*   **Sales Channels (销售渠道)**: 商品的过滤器。
    *   *例子*: 渠道 A (官网) 卖全量商品；渠道 B (TikTok) 只卖爆款。
*   **Product Variants (变体)**: 真正的 SKU。库存是挂在 Variant 上的，不是 Product。

---

## 2. 初始化设置 (Settings)

登录 Admin 后 (默认 `localhost:9000/app` 或 `api.your-domain.com/app`)，按顺序操作：

### 2.1 货币设置 (Currencies)
*路径: Settings -> Currencies*

*   **操作**: 添加你需要支持的所有货币。
*   **建议**: 至少添加 `USD` (美元), `EUR` (欧元), `CNY` (人民币)。
*   *注意*: 添加货币不代表用户能用它支付，必须在 Region 中启用。

### 2.2 区域设置 (Regions) —— **最关键一步**
*路径: Settings -> Regions*

创建 Region 是卖货的第一步。

**实战案例：设置“北美区 (North America)”**
1.  **Title**: North America
2.  **Currency**: USD
3.  **Tax Rate**: 0% (跨境通常填0，由 Avalara 插件算税) 或 10% (固定税率)。
4.  **Countries**: 勾选 United States, Canada。
5.  **Payment Providers**: 勾选 `stripe`, `paypal` (前提是已安装插件)。
6.  **Fulfillment Providers**: 勾选 `manual` 或自定义物流插件 (如 `yunexpress`)。

**实战案例：设置“欧洲区 (Europe)”**
1.  **Title**: Europe
2.  **Currency**: EUR
3.  **Countries**: Germany, France, Italy...
4.  *注意*: 这里的价格和支付方式独立于北美区。

### 2.3 团队成员 (The Team)
*路径: Settings -> The Team*

*   邀请运营人员或客服。
*   权限控制: Member (普通成员), Admin (管理员), Developer (开发者)。

---

## 3. 商品上架流程 (Products)

*路径: Products*

Medusa 的商品结构：`Product` -> `Options` -> `Variants`。

### 步骤 1: 创建基础信息
*   **Title**: DJI Mini 4 Pro
*   **Handle**: `dji-mini-4-pro` (URL 路径，很重要，Strapi 内容关联全靠它)
*   **Sales Channels**: 默认勾选 Default Channel。

### 步骤 2: 定义规格 (Options)
如果商品有多个版本，先定义维度。
*   Option 1: `Color` (Gray, White)
*   Option 2: `Bundle` (Standard, Fly More Combo)

### 步骤 3: 生成变体 (Variants) & 定价
Medusa 会自动生成 SKU 矩阵（如 Gray + Standard）。

*   **SKU**: 必填！这是库存和物流对接的唯一 ID (如 `DJI-MINI4-STD`)。
*   **Pricing**: 点击每个变体，**必须为每个 Region 设置价格**。
    *   *NA Region*: $759
    *   *EU Region*: €799 (含税价)
    *   *Missing Price*: 如果某个 Region 没填价格，该 Region 的用户将无法购买此商品。

### 步骤 4: 补充元数据 (Metadata)
在右侧栏底部的 JSON Metadata 编辑器中：
*   添加物流所需字段（如果我们开发了物流插件）：
    ```json
    {
      "hs_code": "880220",
      "origin_country": "CN",
      "weight_g": 249
    }
    ```

---

## 4. 物流与运费配置 (Shipping)

*路径: Settings -> Regions -> [选择区域] -> Shipping Options*

运费是绑定在 Region 上的。

### 场景 A: 满 $99 包邮
1.  **Name**: Free Shipping
2.  **Price Type**: Calculated (实时) 或 Flat Rate (固定)。选 Flat Rate。
3.  **Amount**: 0
4.  **Requirements**: Min. subtotal: 99

### 场景 B: 标准运费 $10
1.  **Name**: Standard Shipping
2.  **Price Type**: Flat Rate
3.  **Amount**: 10
4.  **Requirements**: Max. subtotal: 98.99

---

## 5. 库存管理 (Inventory)

*路径: Inventory (Medusa v2)*

Medusa v2 引入了多仓概念。

1.  **Locations**: 创建 `Shenzhen Warehouse` 和 `Los Angeles Warehouse`。
2.  **Stock Levels**: 为每个 SKU 在不同仓库设置库存数。
    *   SKU: `DJI-MINI4-STD` -> SZ: 1000, LA: 50.
3.  **Reservations**: 当用户下单未发货时，库存会变为 Reserved。发货后变为 Fulfilled。

---

## 6. 订单处理 (Orders)

*路径: Orders*

运营人员的日常工作台。

### 标准处理流程
1.  **查看订单**: 状态为 `Pending` (已付款，未发货)。
2.  **审核**: 检查是否有欺诈风险 (Stripe Radar 提示)。
3.  **创建发货 (Fulfillment)**:
    *   点击 "Create Fulfillment"。
    *   选择发货仓库。
    *   输入 `Tracking Number` (如果有物流插件则自动生成)。
    *   点击确认 -> 状态变为 `Fulfilled` -> 触发邮件通知用户。
4.  **退款/退货 (Swap/Claim)**:
    *   Medusa 支持极其复杂的换货逻辑（如：退 A 买 B，补差价）。

---

## 7. 常见问题 (FAQ)

**Q: 为什么前端看不到商品？**
A: 检查三点：
1.  商品状态是否为 `Published`？
2.  商品是否关联了当前的 `Sales Channel`？
3.  商品是否设置了当前 Region 的**价格**？(最常见原因)

**Q: 如何修改首页的商品排序？**
A: Medusa 核心只负责卖货。首页排序通常在 **Collection** (集合) 中管理，或者在 Strapi 的 Homepage 模块中配置 Handle 列表。

**Q: 我改了配置，前端没变？**
A: Next.js 有缓存。尝试重新发布或等待 ISR 重新验证 (默认 5 分钟)。