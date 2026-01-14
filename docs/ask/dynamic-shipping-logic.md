# 特定商品动态运费实现方案 (代码优先)

## 1. 需求背景
- 某款售价 $2999 的特定商品需要根据特定规则（如重量、地区）动态计算运费。
- 其他所有商品均免运费。
- **限制条件**：不希望后端管理人员在 Admin UI 中维护复杂的运费规则，逻辑需直接实现在代码中。

## 2. 技术方案
利用 Medusa v2 现有的自定义履约模块 `dynamic-shipping`。

### 关键文件
- `apps/medusa/src/modules/dynamic-shipping/service.ts`

### 核心实现逻辑 (calculatePrice)
在 `calculatePrice` 方法中，我们将根据购物车内容直接硬编码逻辑：

```typescript
async calculatePrice(
  optionData: Record<string, unknown>,
  data: Record<string, unknown>,
  context: any 
): Promise<any> {
  const items = (context?.items || []) as any[]
  
  // 1. 检查购物车中是否存在需要计算运费的特定商品
  const hasSpecialProduct = items.some(item => 
    item.variant?.product?.handle === "your-special-product-handle" || // 通过 handle 识别
    item.variant_id === "variant_xxx"                                  // 或通过 variant_id 识别
  )

  // 2. 如果不包含特定商品，运费直接为 0 (免邮)
  if (!hasSpecialProduct) {
    return {
      calculated_amount: 0,
      is_calculated_price_tax_inclusive: false
    }
  }

  // 3. 如果包含特定商品，执行动态计算逻辑
  // 这里将替换为你最终确定的运费规则
  let calcPrice = this.options.base_price || 0
  // ... 动态计算代码 ...

  return {
    calculated_amount: calcPrice,
    is_calculated_price_tax_inclusive: false
  }
}
```

## 3. 下一步计划
1. **确定规则**：请提供该 $2999 商品的具体运费计算公式（例如：按国家区分的固定费用、按重量阶梯计费、或是调用第三方 API）。
2. **确定标识符**：提供该商品的 `handle` 或 `variant_id`。
3. **代码更新**：我将根据你提供的规则更新 `service.ts` 中的计算逻辑。
