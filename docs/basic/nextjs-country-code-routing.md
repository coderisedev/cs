# Next.js 动态路由 `[countryCode]` 解释

## 基本概念

`[countryCode]` 是 Next.js 的**动态路由段**（Dynamic Route Segment）。方括号表示这部分 URL 是可变的：

```
/us/products    → countryCode = "us"
/cn/products    → countryCode = "cn"
/de/products    → countryCode = "de"
```

## 项目现状：Plan A（单一美国站）

从代码可以看出，项目目前采用的是 **"Plan A: Global USD site"** 策略：

```typescript
// constants.ts
export const DEFAULT_COUNTRY_CODE = "us"
export const DEFAULT_CURRENCY = "USD"

// layout.tsx 注释
// Plan A: countryCode is always "us" due to middleware
```

**Middleware 的行为：**

```
访问 /products        → 301 重定向到 /us/products
访问 /cn/products     → 301 重定向到 /us/products
访问 /de/products     → 301 重定向到 /us/products
访问 /us/products     → 正常访问
```

所以目前 `[countryCode]` 对你来说**只是一个占位符**，始终是 `us`。

## 为什么还要用 `[countryCode]`？

### 1. 为未来多区域扩展预留架构

如果将来要支持中国站（CNY）、欧洲站（EUR），只需要：

```typescript
// 修改 middleware.ts，根据用户 IP 或选择跳转
if (userCountry === "CN") redirect("/cn/...")
if (userCountry === "DE") redirect("/de/...")
```

**不需要重构整个路由结构**，因为 `[countryCode]` 已经在那里了。

### 2. Medusa 的多区域设计要求

Medusa 电商后端是基于 **Region（区域）** 设计的：

```
Region: US  → 货币 USD, 税率 0%, 运费规则 A
Region: CN  → 货币 CNY, 税率 13%, 运费规则 B
Region: EU  → 货币 EUR, 税率 20%, 运费规则 C
```

`countryCode` 用于获取对应的 Region，从而拿到正确的：

- 产品价格（不同货币）
- 税率计算
- 运费规则
- 库存分配

### 3. URL 语义清晰

```
❌  example.com/products           (哪个国家？什么货币？)
✅  example.com/us/products        (美国站，USD)
✅  example.com/cn/products        (中国站，CNY)
```

对 SEO 和用户体验都更好。

## 实际例子：如果要支持中国站

只需要这些修改：

### Step 1: 在 Medusa 后台创建 CN Region

```
Region ID: reg_cn_xxx
Currency: CNY
Countries: CN
```

### Step 2: 修改 Middleware

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const userCountry = getCountryFromIP(request) // 或用户手动选择

  if (userCountry === "CN") {
    // 允许 /cn 路径
  } else {
    // 默认 /us
  }
}
```

### Step 3: 页面自动适配

```typescript
// /cn/products/page.tsx 和 /us/products/page.tsx 是同一个文件！
export default async function ProductsPage({ params }) {
  const { countryCode } = await params  // "cn" 或 "us"
  const region = await getRegion(countryCode)
  const products = await getProducts({ regionId: region.id })
  // 自动显示 CNY 价格
}
```

## 总结

| 问题 | 答案 |
|------|------|
| 现在有什么用？ | 目前只是占位符，始终是 `/us` |
| 为什么不删掉？ | 保留多区域扩展能力，这是 Medusa 推荐的架构 |
| 什么时候真正有用？ | 当需要支持多货币/多语言时（如 CNY 中国站） |
| 改造成本？ | 已经预埋好了，只需改 middleware + 添加 Region |

项目是**为扩展做好了准备**，但目前以单一美国站（Plan A）运行。这是一个明智的架构决策。

## 相关文件

- `apps/dji-storefront/src/middleware.ts` - 路由重定向逻辑
- `apps/dji-storefront/src/lib/constants.ts` - 默认国家/货币配置
- `apps/dji-storefront/src/app/[countryCode]/layout.tsx` - 国家级布局
- `apps/dji-storefront/src/lib/data/regions.ts` - Region 数据获取
