# Lumora Marketplace: 超级智能卖场架构规划

> **战略升级：**
> 从 "Shopify Killer" (SaaS) 升级为 **"AI-Native Amazon" (Marketplace)**。
> 核心差异：我们不仅提供开店工具，更提供一个**上帝视角的 Super Agent**，连接全平台商品与消费者。

## 1. 核心能力：双模式并存 (Dual Mode)

我们的架构将同时支持两种形态，共享底层数据：

1.  **独立站模式 (Direct Mode):**
    *   `nike.lumora.com`
    *   商家拥有完全独立的品牌调性、域名和客户数据。
    *   适合品牌建设。
2.  **大卖场模式 (Marketplace Mode):**
    *   `www.lumora.com` (或 App)
    *   **Super Agent** 作为核心入口。用户不逛店铺，只跟 Agent 聊天。
    *   适合流量获取和长尾商品销售。

## 2. 架构增量：实现“全知全能”

为了实现“一个 Agent 卖全平台的货”，我们需要在原有的 Cell-Based 架构上增加聚合层。

### A. 全局索引层 (The Universal Index)
*   **技术：** **MeiliSearch** 或 **ElasticSearch**。
*   **机制：**
    *   每当任意商家 (Cell) 新增/修改商品，通过 Event Bus 触发同步事件。
    *   数据被清洗、标准化后，推入全局索引。
    *   **向量化：** 同时将商品描述转化为 Vector (向量)，存入 Pinecone，供 Agent 进行语义搜索（如搜“适合送给男朋友的礼物”，而不是搜关键词）。

### B. Super Agent (全知导购)
*   **定位：** 它是 Marketpace 的“灵魂”。
*   **工作流：**
    1.  **意图识别：** 用户说“我要去露营”。
    2.  **跨店检索：** Agent 在全局索引中检索“帐篷”、“睡袋”、“烧烤架”。
    3.  **智能组合：** 发现商家 A 的帐篷最好，商家 B 的睡袋最便宜。
    4.  **推荐生成：** “为您搭配了 A 店帐篷 + B 店睡袋的露营套餐，总价 $500。”

### C. 统一交易中心 (Universal Transaction)
*   **挑战：** 跨店结算。
*   **解决方案：** **父子订单系统 (Parent-Child Order System)**。
    *   **购物车：** 这是一个虚拟的“超级购物车”，里面装着来自不同 Schema (店铺) 的商品。
    *   **支付：** 用户向平台支付一笔总款项。
    *   **拆单引擎：** 支付成功后，系统瞬间将订单拆解，分别向商家 A 和 B 的 Medusa 实例写入订单。
    *   **分账系统：** 利用 Stripe Connect 或 Adyen for Platforms，自动计算平台佣金，剩余款项打入商家账户。

## 3. 架构图示：Marketplace Layer

```mermaid
graph TD
    subgraph Consumer_Interface [客户端]
        AgentUI[🤖 Super Agent / Lumora Mall]
    end

    subgraph Marketplace_Layer [聚合层]
        UniversalIndex[(🔍 全局商品索引)]
        VectorBrain[(🧠 AI 向量大脑)]
        OrderSplitter[⚡ 拆单与分账引擎]
    end

    subgraph Store_Cells [商家层 (Serverless Cells)]
        StoreA[Shop A (Medusa)]
        StoreB[Shop B (Medusa)]
        StoreC[Shop C (Medusa)]
    end

    %% 数据上行：聚合
    StoreA & StoreB & StoreC -.->|Sync Product| UniversalIndex
    StoreA & StoreB & StoreC -.->|Sync Vector| VectorBrain

    %% 交易下行：分发
    AgentUI <-->|Search/Chat| VectorBrain
    AgentUI -->|Place Order| OrderSplitter
    
    OrderSplitter -->|Sub-Order A| StoreA
    OrderSplitter -->|Sub-Order B| StoreB
    OrderSplitter -->|Sub-Order C| StoreC
```

## 4. 商业价值 (The Why)

1.  **对商家：** 不仅给工具，还给流量。小商家哪怕没有品牌力，只要货好，就能被 Super Agent 推荐给用户。
2.  **对用户：** 极其极致的购物体验。不再需要这就逛那家逛，只要跟 Agent 说需求，全网好货自动送到面前。
3.  **对平台：** 掌握了核心流量入口和数据资产，估值逻辑从 SaaS 变成了 Marketplace (GMV 抽成)，天花板高了 100 倍。

**结论：** 这是一个完美的架构闭环。由于底层采用了中心化数据库与 Schema 隔离的设计，这种“分久必合”的聚合能力是我们架构天然自带的优势，而 Shopify 要做这件事则面临巨大的架构重构包袱。
