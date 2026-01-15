# Medusa 销售渠道 (Sales Channel) 与区域 (Region) 深度解析

本文档结合 `dji-storefront` 项目实例，详细解释 Medusa 架构中 **销售渠道** 和 **区域** 的具体作用、区别以及它们之间的关系。

## 1. 核心概念速览

| 概念 | 核心作用 | 通俗理解 | 本项目中的体现 |
| :--- | :--- | :--- | :--- |
| **Sales Channel (销售渠道)** | **控制商品可见性**与库存 | "货架"或"店铺入口" | `dji-storefront` 前端通过 API Key 绑定特定的渠道，决定用户能看到哪些商品。 |
| **Region (区域)** | **控制交易规则** | "市场"或"结算柜台" | 决定用户是用美元 (USD) 还是欧元 (EUR) 支付，以及税率和运费计算方式。 |

---

## 2. 销售渠道 (Sales Channel)：决定"卖什么"

销售渠道是商品流向客户的通道。它主要控制两个要素：**商品目录 (Product Catalog)** 和 **库存来源 (Inventory)**。

### 在本项目中的具体应用

在你的 `apps/dji-storefront` 项目中，销售渠道是通过 **Publishable API Key** 来连接的。

1.  **配置位置**：
    查看 `apps/dji-storefront/env.production.example` 文件，你会看到：
    ```bash
    # Medusa publishable API key
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_xxxx
    ```
    
2.  **工作原理**：
    *   当用户访问你的前端网站时，前端会将这个 `pk_live_xxxx` 发送给 Medusa 后端。
    *   后端接收到 Key 后，识别出这是关联到（例如）"Default Sales Channel" 的请求。
    *   **结果**：后端只会返回在这个 "Default Sales Channel" 中**上架**的商品。如果某个商品只在 "B2B Channel" 上架，普通用户在官网上是完全搜不到的。

### 举例场景
假设你想拓展业务，给经销商提供批发服务：
1.  在后台创建一个新的销售渠道 "Wholesale Store"。
2.  创建一个新的 Publishable API Key，并绑定到 "Wholesale Store"。
3.  部署一个新的前端（或在现有前端加一个 B2B 登录入口），使用这个新的 Key。
4.  **效果**：批发商登录后能看到特供的 "CS737-Pro 批量包"，而普通访客看不到。

---

## 3. 区域 (Region)：决定"怎么卖"

区域定义了交易的具体规则。它主要包含：**货币 (Currency)**、**税率 (Tax Rate)**、**支付方式 (Payment Providers)** 和 **配送方式 (Shipping Options)**。

### 在本项目中的具体应用

在 `apps/medusa/src/scripts/seed.ts` 初始化脚本中，我们看到创建了不同的区域，例如 "Europe"。

1.  **触发机制**：
    区域通常由用户的**收货地址 (Shipping Country)** 决定。
    *   当用户进入网站，可能默认是 "Global" 区域（显示美元）。
    *   当用户在结账页选择国家为 "Germany" 时，系统会自动切换到 "Europe" 区域。

2.  **具体影响**：
    *   **货币切换**：价格从 USD 自动变为 EUR。
    *   **税务计算**：自动应用德国的 VAT 税率。
    *   **支付方式**：可能显示欧洲特有的支付方式（如 Bancontact），而隐藏仅限美国的支付方式。

---

## 4. 销售渠道与区域的关系

这两者是**交叉 (Orthogonal)** 的关系，共同构成了一次完整的购物体验。

**公式：购物体验 = 销售渠道 (选品) + 区域 (结算)**

### 关系图解

*   **一对多**：一个销售渠道可以卖往多个区域。
    *   *例子*：你的 "Default Sales Channel" (官网) 既可以卖给 "US Region" (美国客户)，也可以卖给 "EU Region" (欧洲客户)。
    
*   **多对一**：多个销售渠道可以共用一个区域的规则。
    *   *例子*：你的 "Default Sales Channel" (官网) 和 "TikTok Shop Channel" (抖音店) 都可以卖给 "US Region" 的客户，它们共享美元结算和美国税率规则。

### 本项目中的具体流程

1.  **进店 (销售渠道作用)**：
    用户打开 `dji-storefront` -> 前端发送 API Key -> 后端确认是 "Default Sales Channel" -> **用户看到了 "CS737-Pro"** (因为该商品在这个渠道上架)。

2.  **购物 (区域作用)**：
    用户下单，地址填写 "California, USA" -> 后端匹配到 "North America" 区域 -> **显示价格 $2999 USD**，并计算加州税费。

3.  **发货 (库存逻辑)**：
    后端检查 "Default Sales Channel" 关联的仓库 (Stock Location) -> 发现 "US Warehouse" 有货 -> 生成发货单。

## 5. 总结

*   如果你想**隐藏某些商品**不让特定人群看到 -> **调整销售渠道**。
*   如果你想**修改特定国家的运费或税率** -> **调整区域设置**。
