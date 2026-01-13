# 跨境物流履约系统架构方案 (Medusa + Next.js)

**最后更新**: 2026-01-13
**目标**: 基于现有架构，打通第三方物流服务商 (3PL) API，实现自动化运费计算、库存管理与发货履约。

---

## 1. 核心架构评估与调整

目前的架构是“读写分离”的，在加入物流后，我们需要引入**“第三方服务集成层”**。

### 架构图

```mermaid
graph TD
    subgraph Frontend [Next.js Storefront]
        Checkout[结账页面]
        Tracking[订单追踪页]
    end

    subgraph Backend [Medusa Server]
        Core[核心交易模块]
        Inventory[库存模块 (Stock Locations)]
        
        subgraph Fulfillment_Layer [自定义履约层]
            Provider[Logistics Provider Plugin]
            Calc[运费计算逻辑]
            Sync[库存同步 Job]
        end
    end

    subgraph External [外部系统]
        LogisticsAPI[物流商 API (e.g. YunExpress/4PX)]
        WMS[仓库系统 (WMS)]
    end

    Checkout -->|1. 请求运费试算| Calc
    Calc -->|2. 查询费率| LogisticsAPI
    Core -->|3. 创建发货单| Provider
    Provider -->|4. 下单/获取面单| LogisticsAPI
    LogisticsAPI -->|5. Webhook 回传轨迹| Provider
    LogisticsAPI -->|6. 库存变更| Sync
```

---

## 2. 关键模块实施方案

要在 Medusa 中实现这一目标，必须遵循 **Medusa Provider 模式**，开发自定义插件（如 `medusa-fulfillment-yunexpress`）。

### A. 运费计算 (Shipping Calculation)
跨境物流运费受实重、体积重、燃油附加费及偏远地区影响。

*   **当前痛点**：简单的“固定运费”无法满足跨境需求，易导致亏损。
*   **实施方案**：
    *   **接口实现**：实现 `FulfillmentService.calculatePrice`。
    *   **流程**：前端传 Cart (含重量 `weight`、尺寸、目的地) -> 后端调 API 试算 -> 返回精准运费。
    *   **数据要求**：Product/Variant 必须完善 `origin_country` (原产国) 和 `hs_code` (海关编码)。

### B. 库存管理 (Inventory Management)
利用 Medusa v2 的 **Inventory Module (Stock Locations)**。

*   **实施方案**：
    1.  **多仓设置**：在 Admin 设置 `CN_WAREHOUSE` (深圳仓) 和 `US_WAREHOUSE` (美西仓)。
    2.  **渠道关联**：将海外仓关联到对应的 Sales Channel，实现“本地发货优先”。
    3.  **WMS 同步**：编写 Cron Job，定时拉取物流商 WMS 的库存快照，通过 `InventoryService` 更新 Medusa 水位。

### C. 物流下单与面单生成 (Fulfillment Creation)
核心业务流程。

*   **流程**：
    1.  运营在 Admin 点击“Create Fulfillment”。
    2.  **Provider 触发**：调用 `createFulfillment` 方法。
    3.  **API 下单**：将 SKU、收件人信息、海关申报信息发送给物流商。
    4.  **面单获取**：物流商返回 `tracking_number` 和 `label_pdf_url`。
    5.  **数据回写**：Medusa 保存追踪号，并将 PDF 面单链接存入 Metadata 供打印。

### D. 轨迹追踪 (Tracking)
*   **Webhook**：配置物流商 Webhook，当包裹状态变更为 `Delivered` 时，自动触发 Medusa 事件发送邮件。
*   **前端展示**：在订单详情页集成 17Track 或物流商查询接口，展示进度条。

---

## 3. 技术落地路线图 (Roadmap)

### 第一阶段：数据基座
扩展 Medusa Product 实体，确保包含物流核心字段：
*   `weight` (g)
*   `length`, `width`, `height` (cm) —— **计算体积重关键**
*   `hs_code`
*   `mid_code` (如发往美国)

### 第二阶段：自定义 Provider 开发
开发 `FulfillmentService` 插件。

**代码骨架示例**：
```typescript
class YunExpressFulfillmentService extends AbstractFulfillmentService {
  static identifier = "yunexpress"

  // 1. 运费试算
  async calculatePrice(optionData, data, cart) {
    // 调用物流商 API 估算运费
    return calculatedPrice;
  }

  // 2. 正式发货（生成面单）
  async createFulfillment(data, items, order, fulfillment) {
    // 组装报文：发件人、收件人、申报信息
    const payload = {
      orderNumber: order.id,
      receiver: { ...order.shipping_address },
      parcels: items.map(item => ({
         weight: item.weight,
         sku: item.variant.sku,
         declaredName: item.product.title
      }))
    };
    
    // 调用 API 下单
    const response = await axios.post('LOGISTICS_API_URL', payload);
    
    return {
      tracking_number: response.trackingNumber,
      metadata: {
        label_url: response.labelUrl, // 面单 PDF
        waybill_no: response.waybillNo
      }
    };
  }
}
```

### 第三阶段：库存自动化
接入 Cron Job 进行 WMS 库存同步。

---

## 4. 总结
本方案将使您的平台从纯粹的交易前端升级为具备**自动化履约能力**的商业闭环系统，极大降低人工打单发货的成本与错误率。
