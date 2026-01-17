# Medusa 动态运费计算实现指南

**最后更新**: 2026-01-15
**适用版本**: Medusa v2.x
**目标**: 实现基于产品的动态运费计算，支持按区域差异化定价

---

## 1. 概述

### 问题背景

在电商场景中，不同产品可能有不同的运费策略：
- 某些产品需要收取运费（如大件商品、特殊物品）
- 某些产品可以免运费（如数字产品、促销商品）
- 同一产品在不同区域的运费可能不同（如美国 vs 欧洲）

### 解决方案

创建一个 **Dynamic Shipping Provider**（动态运费提供者），通过配置实现：
- 按 **产品 handle** 设置运费
- 按 **区域** 差异化定价
- 未配置的产品默认 **免运费**

### 架构图

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Storefront    │────▶│  Medusa Backend      │────▶│  Shipping       │
│   (Checkout)    │     │  calculatePrice()    │     │  Provider       │
└─────────────────┘     └──────────────────────┘     └─────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  PRODUCT_SHIPPING_   │
                        │  RATES 配置          │
                        │  (按 handle 查找)    │
                        └──────────────────────┘
```

---

## 2. 目录结构

```bash
apps/medusa/src/modules/
└── dynamic-shipping/
    ├── index.ts           # 模块入口
    └── service.ts         # 核心服务实现
```

---

## 3. 核心实现

### 3.1 模块入口 (`index.ts`)

```typescript
import { Module } from "@medusajs/framework/utils"
import DynamicShippingProviderService from "./service"

export default Module("dynamic-shipping", {
  service: DynamicShippingProviderService,
})
```

### 3.2 服务实现 (`service.ts`)

```typescript
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import {
  Logger,
  CreateShippingOptionDTO
} from "@medusajs/framework/types"

type DynamicShippingOptions = {
  base_price?: number
  weight_multiplier?: number
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * 产品运费配置表
 * Key: 产品 handle
 * Value: { 区域代码: 运费(分) }
 *
 * 添加新产品运费：
 * 1. 在 Medusa Admin 找到产品 handle
 * 2. 在此配置表添加条目
 * 3. 重新构建并重启 Medusa
 *
 * 未列出的产品默认免运费
 */
const PRODUCT_SHIPPING_RATES: Record<string, Record<string, number>> = {
  "cs-737x-tq": {
    us: 100,      // $1.00 for US
    eu: 200,      // $2.00 for Europe
    default: 200, // 其他区域默认值
  },
  // 添加更多产品示例:
  // "heavy-product-handle": {
  //   us: 1500,     // $15.00 for US
  //   eu: 2000,     // $20.00 for Europe
  //   default: 2500,
  // },
}

// 国家代码到区域的映射
const COUNTRY_TO_REGION: Record<string, string> = {
  // US
  us: "us",
  // Europe
  at: "eu", be: "eu", bg: "eu", hr: "eu", cy: "eu", cz: "eu", dk: "eu",
  ee: "eu", fi: "eu", fr: "eu", de: "eu", gr: "eu", hu: "eu", ie: "eu",
  it: "eu", lv: "eu", lt: "eu", lu: "eu", mt: "eu", nl: "eu", pl: "eu",
  pt: "eu", ro: "eu", sk: "eu", si: "eu", es: "eu", se: "eu", gb: "eu",
  ch: "eu", no: "eu",
  // 可扩展更多区域: asia, oceania, etc.
}

class DynamicShippingProviderService extends AbstractFulfillmentProviderService {
  static identifier = "dynamic-shipping"
  static DISPLAY_NAME = "Dynamic Shipping Provider"

  protected logger: Logger
  protected options: DynamicShippingOptions

  constructor({ logger }: InjectedDependencies, options: DynamicShippingOptions) {
    super()
    this.logger = logger
    this.options = options
  }

  /**
   * 根据产品 handle 获取运费
   */
  private getProductShippingRate(
    items: any[],
    countryCode: string | undefined
  ): number | null {
    if (!countryCode) return null

    const regionKey = COUNTRY_TO_REGION[countryCode.toLowerCase()] || "default"

    this.logger.info(`Shipping calculation - items: ${items.length}, country: ${countryCode}, region: ${regionKey}`)

    for (const item of items) {
      // 从多个可能的路径获取 product handle
      const handle = item.variant?.product?.handle || item.product?.handle || item.product_handle

      this.logger.info(`Checking item - handle: ${handle || 'NOT FOUND'}`)

      if (handle && PRODUCT_SHIPPING_RATES[handle]) {
        const rates = PRODUCT_SHIPPING_RATES[handle]
        const rate = rates[regionKey] ?? rates.default

        if (rate !== undefined) {
          this.logger.info(`Found shipping rate for "${handle}": ${rate} cents (region: ${regionKey})`)
          return rate
        }
      }
    }

    return null
  }

  async getFulfillmentOptions(): Promise<any[]> {
    return [
      { id: "dynamic-standard", name: "Standard Shipping (Calculated)" },
      { id: "dynamic-express", name: "Express Shipping (Calculated)" }
    ]
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return data
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    return true
  }

  async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
    return true
  }

  /**
   * 核心方法：计算运费
   * Medusa 在 checkout 流程中调用此方法
   */
  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<any> {
    this.logger.info("Calculating dynamic shipping price...")

    const items = (context?.items || []) as any[]
    const address = context.shipping_address
    const countryCode = address?.country_code

    // 查找产品运费配置
    const productRate = this.getProductShippingRate(items, countryCode)

    if (productRate !== null) {
      return {
        calculated_amount: productRate,
        is_calculated_price_tax_inclusive: false
      }
    }

    // 未配置的产品免运费
    this.logger.info("Free shipping applied (no product-specific rate configured)")
    return {
      calculated_amount: 0,
      is_calculated_price_tax_inclusive: false
    }
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: any[],
    order: any,
    fulfillment: any
  ): Promise<any> {
    return {
      data: {
        tracking_number: `DYN-${Date.now()}`,
        provider_id: "dynamic-shipping",
      },
      labels: []
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<any> {
    return {}
  }

  async retrieveDocuments(data: Record<string, unknown>, documentType: string): Promise<any> {
    return []
  }

  async getReturnItems(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async getSaveReturnItems(data: Record<string, unknown>): Promise<any> {
    return []
  }

  async validateReturnReason(reason: Record<string, unknown>): Promise<any> {
    return true
  }
}

export default DynamicShippingProviderService
```

---

## 4. 配置步骤

### 4.1 注册模块

在 `medusa-config.ts` 中注册 dynamic-shipping 模块：

```typescript
module.exports = defineConfig({
  // ...其他配置
  modules: [
    {
      resolve: "./src/modules/dynamic-shipping",
      options: {
        // 可选配置参数
      },
    },
  ],
})
```

### 4.2 创建 Shipping Option

在 Medusa Admin 中创建使用此 provider 的配送选项：

1. 进入 **Settings** → **Regions** → 选择区域
2. 在 **Fulfillment** 部分添加新的 Shipping Option
3. 选择 **dynamic-shipping** 作为 Provider
4. 设置 **Price Type** 为 `calculated`

或通过数据库直接查看/修改：

```sql
-- 查看现有配送选项
SELECT
  so.name,
  so.provider_id,
  so.price_type,
  sz.name as zone_name
FROM shipping_option so
JOIN service_zone sz ON so.service_zone_id = sz.id
WHERE so.deleted_at IS NULL;
```

### 4.3 添加新产品运费

编辑 `service.ts` 中的 `PRODUCT_SHIPPING_RATES` 配置：

```typescript
const PRODUCT_SHIPPING_RATES: Record<string, Record<string, number>> = {
  // 已有产品
  "cs-737x-tq": {
    us: 100,      // $1.00
    eu: 200,      // $2.00
    default: 200,
  },
  // 添加新产品
  "new-product-handle": {
    us: 500,      // $5.00
    eu: 800,      // $8.00
    default: 800,
  },
}
```

然后重新构建并重启：

```bash
cd apps/medusa
pnpm build
# 重启 Medusa 服务
```

---

## 5. 前端集成

### 5.1 实时运费计算

为了在用户填写地址后实时显示运费，需要在 checkout 组件中调用运费计算：

```typescript
// lib/actions/checkout.ts
export async function calculateShippingAction(input: {
  email?: string
  shippingAddress: {
    first_name: string
    last_name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
  }
}): Promise<{ cart?: StoreCart; error?: string }> {
  const { email, shippingAddress } = input

  // 验证地址完整性
  if (!shippingAddress.address_1 || !shippingAddress.city ||
      !shippingAddress.postal_code || !shippingAddress.country_code) {
    return { error: "Incomplete address" }
  }

  try {
    const cart = await retrieveCart()
    if (!cart) return { error: "No cart found" }

    // 更新购物车地址
    await updateCart({
      shipping_address: shippingAddress,
      email: email || undefined,
    })

    // 获取配送选项
    const shippingOptions = await listCartOptions()
    if (!shippingOptions?.shipping_options?.length) {
      return { error: "No shipping options available" }
    }

    // 设置配送方式以触发运费计算
    await setShippingMethod({
      cartId: cart.id,
      shippingMethodId: shippingOptions.shipping_options[0].id,
    })

    // 返回更新后的购物车（包含运费）
    const updatedCart = await retrieveCart()
    return { cart: updatedCart ?? undefined }
  } catch (error) {
    return { error: "Failed to calculate shipping" }
  }
}
```

### 5.2 Checkout 组件中使用

```tsx
// 在地址变化时计算运费
useEffect(() => {
  if (!isAddressComplete) return

  const calculateShipping = async () => {
    setIsCalculatingShipping(true)
    try {
      const result = await calculateShippingAction({
        email,
        shippingAddress,
      })
      if (result.cart) {
        setCart(result.cart)
      }
    } finally {
      setIsCalculatingShipping(false)
    }
  }

  // 防抖处理
  const timeoutId = setTimeout(calculateShipping, 500)
  return () => clearTimeout(timeoutId)
}, [shippingAddress, email])
```

### 5.3 运费显示逻辑

```tsx
<span className="font-medium">
  {isCalculatingShipping
    ? "Calculating..."
    : shipping > 0
      ? currencyFormatter(shipping)
      : isAddressComplete
        ? "Free"
        : "Calculated at next step"}
</span>
```

---

## 6. 调试与故障排查

### 6.1 查看运费计算日志

```bash
# 实时监控日志
tail -f ~/.pm2/logs/medusa-backend-out-*.log | grep -E "Shipping|handle|rate"

# 查看最近的运费计算日志
grep -E "Shipping calculation|Found shipping rate|Free shipping" ~/.pm2/logs/medusa-backend-out-*.log | tail -20
```

### 6.2 常见问题

#### 问题 1: 运费始终显示 Free

**可能原因**:
1. 产品 handle 未在 `PRODUCT_SHIPPING_RATES` 中配置
2. 代码未重新构建或服务未重启

**排查步骤**:
```bash
# 1. 确认产品 handle
psql -d medusa_production -c "SELECT handle FROM product WHERE id = 'prod_xxx';"

# 2. 检查配置是否包含该 handle
grep "product-handle" apps/medusa/src/modules/dynamic-shipping/service.ts

# 3. 检查日志中的 handle 是否正确
grep "Checking item" ~/.pm2/logs/medusa-backend-out-*.log | tail -5
```

#### 问题 2: 运费计算未触发

**可能原因**:
1. Shipping Option 未设置为 `calculated` 类型
2. Shipping Option 未使用 `dynamic-shipping` provider

**排查步骤**:
```sql
-- 检查配送选项配置
SELECT name, provider_id, price_type
FROM shipping_option
WHERE deleted_at IS NULL;
```

#### 问题 3: Medusa context 中没有 product handle

这是 Medusa 2.x 的已知行为 - `calculatePrice` 的 context 中 product 对象不包含完整数据。

**解决方案**: 使用产品 handle 硬编码配置（本指南采用的方案），而不是依赖 product.metadata。

---

## 7. 扩展方案

### 7.1 基于重量计算运费

```typescript
async calculatePrice(optionData, data, context): Promise<any> {
  const items = context?.items || []

  // 计算总重量
  const totalWeight = items.reduce((sum, item) => {
    const weight = item.variant?.weight || 0
    return sum + weight * item.quantity
  }, 0)

  // 基于重量计算运费
  const baseRate = 500 // $5.00 基础费
  const perKgRate = 100 // $1.00 每公斤
  const calculatedAmount = baseRate + Math.ceil(totalWeight / 1000) * perKgRate

  return {
    calculated_amount: calculatedAmount,
    is_calculated_price_tax_inclusive: false
  }
}
```

### 7.2 调用第三方运费 API

```typescript
async calculatePrice(optionData, data, context): Promise<any> {
  const address = context.shipping_address
  const items = context?.items || []

  // 调用外部 API（如 EasyPost, Shippo 等）
  const response = await fetch('https://api.shipping-provider.com/rates', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.SHIPPING_API_KEY}` },
    body: JSON.stringify({
      destination: {
        country: address.country_code,
        postal_code: address.postal_code,
      },
      weight: this.calculateTotalWeight(items),
    })
  })

  const { rate } = await response.json()

  return {
    calculated_amount: Math.round(rate * 100), // 转换为分
    is_calculated_price_tax_inclusive: false
  }
}
```

---

## 8. 最佳实践 Checklist

- [x] **日志记录**: 在关键步骤添加日志，便于调试
- [x] **默认值处理**: 未配置的产品/区域有合理的默认值（免运费）
- [x] **区域映射**: 支持多国家到统一区域的映射
- [x] **前端防抖**: 地址变化时防抖调用运费计算 API
- [x] **用户体验**: 计算中显示 "Calculating..."，免运费显示 "Free"
- [ ] **配置外部化**: 考虑将运费配置移到数据库或环境变量（高级需求）
- [ ] **缓存**: 对相同地址的运费计算结果进行缓存（高流量场景）

---

## 9. 参考资料

- [Medusa Fulfillment Provider 文档](https://docs.medusajs.com/resources/commerce-modules/fulfillment/module-options)
- [Medusa v2 Module 开发指南](https://docs.medusajs.com/learn/fundamentals/modules)
- [本项目 Fulfillment 插件规范](./medusa-fulfillment-plugin-guide.md)
