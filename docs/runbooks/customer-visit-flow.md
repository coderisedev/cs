# Medusa 网站客户访问全流程解析

**最后更新**: 2026-01-13
**核心议题**: 前端如何判定用户区域并与 Medusa 建立关联。

---

## 1. 核心逻辑概览

在 Medusa + Next.js 架构中，**“区域 (Region)”是最高优先级的上下文**。所有的商品价格、运费、税率都必须在一个确定的 Region 下才有意义。

前端主要通过以下两种方式确定用户区域：
1.  **URL 路径 (强强制)**: 如 `/us/products` 明确指定美国，`/de/products` 明确指定德国。
2.  **IP 地理定位 (中间件)**: 如果用户访问根路径 `/`，Next.js 中间件会根据 IP 自动重定向到最合适的国家代码。

---

## 2. 详细访问流程图 (Mermaid)

```mermaid
sequenceDiagram
    participant User as 用户浏览器
    participant Middleware as Next.js Middleware (Edge)
    participant Page as Next.js Page (Server Component)
    participant SDK as Medusa SDK (@medusajs/js-sdk)
    participant API as Medusa Backend API
    participant DB as Postgres Database

    Note over User, Middleware: 场景 1: 首次访问根路径 (dji.com)

    User->>Middleware: GET https://dji.com/
    Middleware->>Middleware: 1. 检查 Cookies ("_medusa_region")
    alt 无 Cookie (新用户)
        Middleware->>Middleware: 2. 解析 IP (GeoIP) -> 判定国家 (e.g. "US")
        Middleware-->>User: 307 Redirect -> /us
    else 有 Cookie
        Middleware-->>User: 307 Redirect -> /{cookie_country_code}
    end

    Note over User, Page: 场景 2: 访问具体页面 (/us/products/mini-4)

    User->>Page: GET /us/products/mini-4
    
    rect rgb(240, 248, 255)
        Note right of Page: 服务端渲染阶段 (SSR)
        
        Page->>SDK: 1. 初始化 SDK (Publishable Key)
        
        Page->>API: 2. listRegions() 获取所有区域配置
        API-->>Page: 返回 Region 列表 (包含各国代码映射)
        
        Page->>Page: 3. 匹配逻辑: 查找哪个 Region 包含 "US"
        Note right of Page: 锁定 Context: Region ID = "reg_01..."
        
        Page->>API: 4. getProduct("mini-4", region_id="reg_01...")
        Note right of API: 后端根据 Region ID 筛选: <br/>1. 取 USD 价格 <br/>2. 计算该 Region 税率
        API-->>Page: 返回带 USD 价格的商品数据
    end
    
    Page-->>User: 返回完整 HTML (含 $759 价格)

    Note over User, SDK: 场景 3: 客户端交互 (加入购物车)

    User->>SDK: 点击 "Add to Cart"
    SDK->>API: POST /store/carts (region_id="reg_01...")
    API->>DB: 创建购物车记录
    API-->>SDK: 返回 Cart ID
    SDK->>User: 写入 Cookie ("_medusa_cart_id")

```

---

## 3. 关键步骤深度解析

### A. 区域判定 (The "Router" Phase)
这是最关键的一步。在 `apps/dji-storefront/src/middleware.ts` 中实现。

*   **逻辑**: 当用户访问 `/` 时，我们**不提供内容**，只做**分流**。
*   **优先级**:
    1.  **Cookie**: 用户上次选过 "Germany" 吗？选过就跳 `/de`。
    2.  **GeoIP**: 用户的 IP 是法国的吗？是就跳 `/fr`。
    3.  **Fallback**: 都不行？跳默认的 `/us`。

### B. 上下文关联 (The "Context" Phase)
一旦 URL 确定为 `/us`，Next.js 的页面组件 (`src/app/[countryCode]/page.tsx`) 就会拿到参数 `params.countryCode = "us"`。

*   **Medusa 关联**:
    *   前端拿着 `"us"` 去问 Medusa：“谁是包含 US 的 Region？”
    *   Medusa 答：“是 `reg_north_america`。”
    *   前端**必须**在后续所有 API 请求（查商品、查运费、建购物车）中带上这个 `region_id`。

### C. 价格透出 (The "Pricing" Phase)
这是为什么“不同区域看不同价格”能生效的原因。

*   **错误做法**: `GET /products/123` (不带参数)。Medusa 会蒙圈，不知道返给你哪个价格（因为它有 USD, EUR, GBP...）。
*   **正确做法**: `GET /products/123?region_id=reg_north_america`。Medusa 明确知道：“哦，你要北美区的价格，给你 $759。”

---

## 4. 总结

前端与 Medusa 后台的关联核心在于 **"Country Code -> Region ID"** 的映射。

1.  **入口**: URL 中的 Country Code (`/us`, `/de`) 是用户意图的直接体现。
2.  **桥梁**: 中间件和页面逻辑将 Country Code 翻译成 Medusa 能听懂的 Region ID。
3.  **结果**: 整个商城的“时空”（货币、价格、物流）随之切换。
