# Medusa 2.x 产品特定运费配置教程

本教程详细说明如何在 Medusa 2.x 中为特定产品配置不同区域的运费。

## 目录

1. [运费系统架构概述](#运费系统架构概述)
2. [核心概念解析](#核心概念解析)
3. [实现步骤](#实现步骤)
4. [代码详解](#代码详解)
5. [数据库配置](#数据库配置)
6. [测试验证](#测试验证)
7. [常见问题](#常见问题)

---

## 运费系统架构概述

Medusa 2.x 的运费系统由以下核心组件构成：

```
┌─────────────────────────────────────────────────────────────────┐
│                        Region (区域)                             │
│                    如：US, Europe, Asia                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Zone (服务区)                         │
│              定义区域内的国家/地区范围                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Shipping Option (运费选项)                       │
│           如：Standard Shipping, Express Shipping                │
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │  price_type  │    │  provider_id │    │  price_set   │     │
│   │  flat/calc   │    │  履约提供商   │    │  价格集合     │     │
│   └──────────────┘    └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                Fulfillment Provider (履约提供商)                  │
│         实际计算运费的服务（如 dynamic-shipping）                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 核心概念解析

### 1. 运费选项 (Shipping Option) 的关联关系

**运费选项关联的是「服务区 (Service Zone)」，而不是直接关联产品。**

关联链路：
```
Region (区域) → Service Zone (服务区) → Shipping Option (运费选项)
```

- **Region**: 定义货币、税率等区域设置
- **Service Zone**: 定义该区域覆盖的国家列表
- **Shipping Option**: 定义具体的运费方式和价格

### 2. 价格类型 (price_type)

| 类型 | 说明 | 适用场景 |
|------|------|---------|
| `flat` | 固定价格 | 所有订单统一运费 |
| `calculated` | 动态计算 | 根据重量、产品、地址等动态计算 |

### 3. 履约提供商 (Fulfillment Provider)

当 `price_type = 'calculated'` 时，运费由 **Fulfillment Provider** 的 `calculatePrice()` 方法计算。

这是实现**产品特定运费**的关键所在！

### 4. Shipping Profile（运费配置文件）

Shipping Profile 用于将产品分组，但在 Medusa 2.x 中，它主要用于：
- 限制某些产品只能使用特定运费选项
- 不直接控制价格计算

---

## 实现步骤

### 需求示例

为产品 `cs-737x-tq` 配置区域特定运费：
- US 区域: $1.00 (100 美分)
- Europe 区域: $2.00 (200 美分)

### 步骤 1: 创建/修改 Dynamic Shipping Provider

文件位置: `src/modules/dynamic-shipping/service.ts`

```typescript
import { AbstractFulfillmentProviderService } from "@medusajs/framework/utils"
import { Logger, CreateShippingOptionDTO } from "@medusajs/framework/types"

// ============================================
// 产品特定运费配置
// ============================================
// Key: 产品 handle
// Value: { 区域代码: 价格(美分) }
const PRODUCT_SHIPPING_RATES: Record<string, Record<string, number>> = {
  "cs-737x-tq": {
    us: 100,      // $1.00
    eu: 200,      // $2.00
    default: 200, // 其他区域默认价格
  },
  // 可以添加更多产品...
  // "another-product": {
  //   us: 500,
  //   eu: 800,
  //   default: 600,
  // },
}

// ============================================
// 国家代码到区域的映射
// ============================================
const COUNTRY_TO_REGION: Record<string, string> = {
  // US
  us: "us",

  // Europe
  at: "eu", be: "eu", bg: "eu", hr: "eu", cy: "eu", cz: "eu", dk: "eu",
  ee: "eu", fi: "eu", fr: "eu", de: "eu", gr: "eu", hu: "eu", ie: "eu",
  it: "eu", lv: "eu", lt: "eu", lu: "eu", mt: "eu", nl: "eu", pl: "eu",
  pt: "eu", ro: "eu", sk: "eu", si: "eu", es: "eu", se: "eu", gb: "eu",
  ch: "eu", no: "eu",
}

class DynamicShippingProviderService extends AbstractFulfillmentProviderService {
  static identifier = "dynamic-shipping"

  /**
   * 获取产品特定运费
   */
  private getProductShippingRate(
    items: any[],
    countryCode: string | undefined
  ): number | null {
    if (!countryCode) return null

    // 将国家代码映射到区域
    const regionKey = COUNTRY_TO_REGION[countryCode.toLowerCase()] || "default"

    // 检查购物车中是否有配置了特定运费的产品
    for (const item of items) {
      const handle = item.variant?.product?.handle
      if (handle && PRODUCT_SHIPPING_RATES[handle]) {
        const rates = PRODUCT_SHIPPING_RATES[handle]
        const rate = rates[regionKey] ?? rates.default
        if (rate !== undefined) {
          return rate
        }
      }
    }

    return null
  }

  /**
   * 计算运费 - 核心方法
   */
  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<any> {
    const items = (context?.items || []) as any[]
    const address = context.shipping_address
    const countryCode = address?.country_code

    // 1. 优先检查产品特定运费
    const productRate = this.getProductShippingRate(items, countryCode)
    if (productRate !== null) {
      return {
        calculated_amount: productRate,
        is_calculated_price_tax_inclusive: false
      }
    }

    // 2. 其他产品免运费
    return {
      calculated_amount: 0, // 免运费
      is_calculated_price_tax_inclusive: false
    }
  }
}

export default DynamicShippingProviderService
```

### 步骤 2: 注册 Fulfillment Provider

在 `medusa-config.ts` 中注册：

```typescript
module.exports = defineConfig({
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "./src/modules/dynamic-shipping",
            id: "dynamic-shipping",
          },
        ],
      },
    },
  ],
})
```

### 步骤 3: 配置数据库中的运费选项

将运费选项设置为使用动态计算：

```sql
-- 更新运费选项使用 dynamic-shipping 提供商和 calculated 价格类型
UPDATE shipping_option
SET
  price_type = 'calculated',
  provider_id = 'dynamic-shipping_dynamic-shipping'
WHERE service_zone_id IN (
  SELECT id FROM service_zone WHERE name IN ('US', 'Europe')
);
```

---

## 代码详解

### calculatePrice 方法参数

```typescript
async calculatePrice(
  optionData: Record<string, unknown>,  // 运费选项数据
  data: Record<string, unknown>,        // 运费选项附加数据
  context: any                          // 上下文，包含关键信息
): Promise<any>
```

**context 包含的关键信息：**

```typescript
context = {
  items: [                    // 购物车商品列表
    {
      id: "item_xxx",
      quantity: 1,
      variant: {
        id: "variant_xxx",
        weight: 500,
        product: {
          id: "prod_xxx",
          handle: "cs-737x-tq",  // 产品 handle，用于匹配
          title: "Product Name"
        }
      }
    }
  ],
  shipping_address: {         // 收货地址
    country_code: "us",       // 国家代码，用于确定区域
    city: "New York",
    // ...
  },
  // ...
}
```

### 返回值格式

```typescript
return {
  calculated_amount: 100,              // 运费金额（美分）
  is_calculated_price_tax_inclusive: false  // 是否含税
}
```

---

## 数据库配置

### 运费相关表结构

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      region      │     │   service_zone   │     │ shipping_option  │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ id               │     │ id               │     │ id               │
│ name             │────▶│ name             │────▶│ name             │
│ currency_code    │     │ fulfillment_set_id    │ │ price_type       │
└──────────────────┘     └──────────────────┘     │ provider_id      │
                                                   │ service_zone_id  │
                                                   └──────────────────┘
```

### 查看当前配置

```sql
-- 查看所有运费选项及其关联
SELECT
  so.id,
  so.name,
  so.price_type,
  so.provider_id,
  sz.name as zone,
  sot.label as type
FROM shipping_option so
JOIN service_zone sz ON so.service_zone_id = sz.id
JOIN shipping_option_type sot ON so.shipping_option_type_id = sot.id
WHERE so.deleted_at IS NULL
ORDER BY sz.name, so.name;
```

### 创建新的运费选项

```sql
DO $$
DECLARE
  new_so_id TEXT := 'so_' || UPPER(SUBSTRING(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 26));
  new_pset_id TEXT := 'pset_' || UPPER(SUBSTRING(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 26));
  new_link_id TEXT := 'sops_' || UPPER(SUBSTRING(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 26));
BEGIN
  -- 创建价格集合
  INSERT INTO price_set (id, created_at, updated_at)
  VALUES (new_pset_id, NOW(), NOW());

  -- 创建运费选项
  INSERT INTO shipping_option (
    id, name, price_type, service_zone_id, shipping_profile_id,
    provider_id, data, shipping_option_type_id, created_at, updated_at
  ) VALUES (
    new_so_id,
    'US Standard',
    'calculated',
    'serzo_xxx',  -- 替换为实际的 service_zone_id
    'sp_xxx',     -- 替换为实际的 shipping_profile_id
    'dynamic-shipping_dynamic-shipping',
    '{"id": "manual-fulfillment"}',
    'sotype_xxx', -- 替换为实际的 shipping_option_type_id
    NOW(), NOW()
  );

  -- 关联价格集合
  INSERT INTO shipping_option_price_set (id, shipping_option_id, price_set_id, created_at, updated_at)
  VALUES (new_link_id, new_so_id, new_pset_id, NOW(), NOW());
END $$;
```

---

## 测试验证

### 1. 重启 Medusa 服务

```bash
# 本地开发
pnpm --filter medusa dev

# Docker 环境
docker restart cs-prod-medusa-1
```

### 2. 测试运费计算

1. 将 `cs-737x-tq` 产品添加到购物车
2. 进入结账页面
3. 选择 US 地址 → 运费应显示 $1.00
4. 选择 Europe 地址 → 运费应显示 $2.00

### 3. 查看日志

在 Medusa 日志中可以看到：
```
Product-specific shipping rate for cs-737x-tq: 100 cents (region: us)
```

---

## 常见问题

### Q1: 运费选项是关联产品还是区域？

**答：关联区域（Service Zone）**

运费选项通过 `service_zone_id` 关联到特定的服务区，而不是直接关联产品。
产品特定运费是通过 Fulfillment Provider 的 `calculatePrice()` 方法在计算时实现的。

### Q2: calculated 类型的运费规则在哪里配置？

**答：在 Fulfillment Provider 的代码中**

当 `price_type = 'calculated'` 时：
1. Medusa 调用对应 Provider 的 `calculatePrice()` 方法
2. Provider 根据 context 中的信息（商品、地址等）计算运费
3. 配置规则直接写在 Provider 代码中（如 `PRODUCT_SHIPPING_RATES`）

### Q3: flat 和 calculated 有什么区别？

| 特性 | flat | calculated |
|-----|------|-----------|
| 价格来源 | price_set 中的固定值 | Provider 动态计算 |
| 灵活性 | 低，统一价格 | 高，可根据任意条件计算 |
| 配置方式 | Admin UI / 数据库 | 代码实现 |
| 适用场景 | 简单统一运费 | 复杂运费规则 |

### Q4: 如何添加更多产品的特定运费？

在 `PRODUCT_SHIPPING_RATES` 中添加：

```typescript
const PRODUCT_SHIPPING_RATES = {
  "cs-737x-tq": { us: 100, eu: 200 },
  "another-product": { us: 500, eu: 800, default: 600 },
  "heavy-product": { us: 2000, eu: 3000, default: 2500 },
}
```

### Q5: 如果购物车有多个不同运费的产品怎么办？

当前实现会使用**第一个匹配到特定运费配置的产品**的价格。

如需更复杂的逻辑（如累加），修改 `getProductShippingRate()` 方法：

```typescript
// 累加所有产品的运费
let totalRate = 0
for (const item of items) {
  const handle = item.variant?.product?.handle
  if (handle && PRODUCT_SHIPPING_RATES[handle]) {
    const rate = PRODUCT_SHIPPING_RATES[handle][regionKey] ??
                 PRODUCT_SHIPPING_RATES[handle].default ?? 0
    totalRate += rate * item.quantity
  }
}
return totalRate > 0 ? totalRate : null
```

---

## 当前配置总结

### 运费选项

| 名称 | 区域 | 类型 | 价格计算 |
|-----|------|------|---------|
| US Standard | US | Standard | dynamic-shipping |
| US express | US | Express | dynamic-shipping |
| Standard Shipping | Europe | Standard | dynamic-shipping |
| Express Shipping | Europe | Express | dynamic-shipping |

### 产品运费规则

| 产品 Handle | US 运费 | Europe 运费 | 说明 |
|------------|---------|------------|------|
| cs-737x-tq | $1.00 | $2.00 | 需要收运费 |
| 其他所有产品 | $0.00 | $0.00 | 免运费 |

---

## 相关文件

- Provider 代码: `apps/medusa/src/modules/dynamic-shipping/service.ts`
- 配置文件: `apps/medusa/medusa-config.ts`
- 本文档: `apps/medusa/docs/learning/product-specific-shipping-rates.md`
