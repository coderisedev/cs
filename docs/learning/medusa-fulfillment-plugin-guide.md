# Medusa 自定义物流插件开发规范

**最后更新**: 2026-01-13
**适用版本**: Medusa v1/v2
**目标**: 规范化开发第三方物流 (3PL) 集成插件，确保稳定性、可维护性与可扩展性。

---

## 1. 插件结构规范

遵循 Medusa 官方插件结构，建议将代码放置在 `src/services` 或独立的 npm 包中（推荐 monorepo 下的 `packages/medusa-fulfillment-xxx`）。

### 推荐目录结构
```bash
src/
├── services/
│   └── yunexpress-fulfillment.ts  # 核心服务逻辑
├── subscribers/
│   └── shipment-created.ts        # 监听发货事件（可选）
├── types/
│   └── yunexpress.ts              # 第三方 API 类型定义
├── utils/
│   ├── client.ts                  # Axios/Fetch 封装
│   └── mapper.ts                  # 数据格式转换工具
└── index.ts                       # 插件入口
```

---

## 2. 核心服务实现 (`FulfillmentService`)

所有物流插件必须继承 `AbstractFulfillmentService` 并实现其抽象方法。

### 基础骨架
```typescript
import { AbstractFulfillmentService, Cart, Fulfillment, LineItem, Order } from "@medusajs/medusa"
import { Logger } from "@medusajs/types"

class YunExpressFulfillmentService extends AbstractFulfillmentService {
  static identifier = "yunexpress" // 数据库中的 provider_id
  protected logger_: Logger
  protected options_: any

  constructor(container, options) {
    super(container)
    this.logger_ = container.logger
    this.options_ = options
  }

  // 1. 获取物流选项 (供 Admin 选择)
  async getFulfillmentOptions(): Promise<any[]> {
    return [
      { id: "standard", name: "YunExpress Standard" },
      { id: "express", name: "YunExpress Priority" },
    ]
  }

  // 2. 验证物流选项 (前端结账时调用)
  async validateFulfillmentData(optionData: any, data: any, cart: Cart): Promise<any> {
    // 校验前端是否篡改了数据，或者地址是否支持该物流
    if (cart.shipping_address.country_code !== "us") {
      throw new Error("This method only supports US shipping")
    }
    return data
  }

  // 3. 验证购物车项 (检查是否有违禁品/超重)
  async validateOption(data: any): Promise<boolean> {
    return true
  }

  // 4. 检查是否可以计算运费
  async canCalculate(data: any): Promise<boolean> {
    return true // 或者根据 data.id 判断是否支持实时计费
  }

  // 5. 核心：计算运费 (Checkout 环节)
  async calculatePrice(optionData: any, data: any, cart: Cart): Promise<number> {
    // 1. 提取重量和体积
    const weight = cart.items.reduce((sum, item) => sum + (item.variant.weight || 0) * item.quantity, 0)
    
    // 2. 调用 3PL API 询价
    const rate = await this.client.getRate({
      country: cart.shipping_address.country_code,
      weight,
      serviceCode: optionData.id
    })

    // 3. 返回金额 (单位: 分/cents)
    // 建议加上利润率或处理费
    return rate.price * 100 
  }

  // 6. 核心：创建发货单 (Admin 点击发货时)
  async createFulfillment(
    data: any,
    items: LineItem[],
    order: Order,
    fulfillment: Fulfillment
  ): Promise<any> {
    // 1. 调用 3PL API 下单
    const shipment = await this.client.createOrder({
      orderNo: order.id,
      recipient: order.shipping_address,
      items: items.map(i => ({ sku: i.variant.sku, qty: i.quantity }))
    })

    // 2. 返回必须包含的数据
    return {
      tracking_number: shipment.trackingNumber,
      metadata: {
        label_url: shipment.labelUrl,
        waybill_no: shipment.waybillNo
      }
    }
  }

  // 7. 取消发货
  async cancelFulfillment(fulfillment: any): Promise<any> {
    // 调用 3PL API 拦截包裹
    await this.client.voidOrder(fulfillment.data.waybill_no)
    return {}
  }
}

export default YunExpressFulfillmentService
```

---

## 3. 错误处理规范

Medusa 的错误处理直接影响用户体验。

1.  **友好的错误信息**: 
    *   ❌ 不要抛出 `AxiosError: 500`。
    *   ✅ 捕获异常并抛出 `MedusaError(MedusaError.Types.INVALID_DATA, "地址校验失败: 邮编格式错误")`。
2.  **日志记录**:
    *   在调用外部 API 前后记录日志 (`this.logger_.info/error`)。
    *   记录关键参数（Tracking Number, Order ID），方便排查。

---

## 4. 数据扩展建议

为了支持跨境物流，需要在现有实体上扩展字段。

### Product Variant 扩展
在 `medusa-config.js` 或自定义 Entity 中，确保能获取以下数据：
*   `hs_code`: 海关编码 (用于报关)
*   `origin_country`: 原产国 (用于报关)
*   `material`: 材质 (部分国家要求)
*   `mid_code`: 生产商代码 (发往美国必备)

### Address 扩展
前端 Checkout 表单需要收集：
*   `province/state`: 必须使用标准二字码 (如 CA, NY)。
*   `phone`: 跨境物流强校验字段。
*   `tax_id` (CPF/IOSS): 发往巴西/欧盟可能需要税号。

---

## 5. 测试策略

由于涉及外部 API 费用，必须严格区分环境。

1.  **沙箱环境 (Sandbox)**: 
    *   插件配置中支持 `sandbox: true` 选项。
    *   根据该选项切换 API Base URL。
2.  **Mock 测试**:
    *   在单元测试中 Mock 掉 `client`，不要真的发请求。
3.  **幂等性**:
    *   确保 `createFulfillment` 是幂等的。如果因为网络超时导致 Medusa 重试，插件应检查“订单号是否已存在”，直接返回已有运单号，而不是重复下单。

---

## 6. 最佳实践 Checklist

*   [ ] **配置化**: API Key、Secret、Endpoint 必须从 `medusa-config.js` 的 `options` 传入，禁止硬编码。
*   [ ] **超时控制**: 外部 API 请求必须设置超时时间（如 10s），防止阻塞 Medusa 主线程。
*   [ ] **面单存储**: 如果物流商返回的是 PDF 文件流，建议先上传到 S3/R2，只在 Database 存 URL。
*   [ ] **多账号支持**: 考虑是否需要支持不同 Sales Channel 使用不同的物流账号。
