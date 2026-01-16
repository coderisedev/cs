# Multi-Region Storefront Implementation Guide

本文档详细介绍了在 Next.js + Medusa 电商平台中实现多地区支持的完整方案，包括架构设计、核心代码实现和最佳实践。

## 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [核心模块实现](#核心模块实现)
4. [关键流程详解](#关键流程详解)
5. [常见问题与解决方案](#常见问题与解决方案)
6. [最佳实践](#最佳实践)

---

## 概述

### 背景

电商网站通常需要支持多个国家/地区的用户，每个地区可能有不同的：
- 货币（USD、EUR、CNY 等）
- 运费计算规则
- 税率
- 支持的配送地址

### 方案选择

我们选择了 **单语言 + 多地区** 方案：
- 界面语言：英文（单一语言，无需 i18n）
- 货币支持：USD（美洲）、EUR（欧洲）
- 地区检测：IP 地理位置自动检测 + 用户手动切换

### 技术栈

- **前端**: Next.js 15 (App Router)
- **后端**: Medusa 2.x
- **状态管理**: React Server Components + Server Actions
- **地理位置**: Vercel/Cloudflare IP 检测头

---

## 架构设计

### 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户请求                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Middleware                           │
│  1. 检查 cookie (_medusa_country_code)                           │
│  2. 读取 IP 地理位置头 (x-vercel-ip-country)                      │
│  3. 设置地区 cookie（如果是新用户）                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Page/Layout Component                        │
│  1. 读取当前国家代码                                              │
│  2. 获取对应地区的购物车                                          │
│  3. 渲染页面（价格使用正确货币）                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Medusa Backend                               │
│  - Region: Americas (USD) / Europe (EUR)                        │
│  - 购物车绑定到特定 Region                                        │
│  - 价格根据 Region 返回对应货币                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 文件结构

```
apps/dji-storefront/src/
├── lib/
│   ├── config/
│   │   └── regions.ts          # 地区配置（核心）
│   ├── actions/
│   │   ├── region.ts           # 地区切换 Server Action
│   │   └── checkout.ts         # 结账流程（含地区验证）
│   ├── data/
│   │   └── cart.ts             # 购物车数据层
│   └── number.ts               # 多货币格式化
├── components/
│   ├── region/
│   │   └── country-selector.tsx # 国家选择器组件
│   ├── checkout/
│   │   └── checkout-client.tsx  # 结账表单
│   └── layout/
│       └── site-header.tsx      # 头部（含国家选择器）
└── middleware.ts                # 请求中间件
```

---

## 核心模块实现

### 1. 地区配置模块 (`regions.ts`)

这是整个多地区系统的核心配置文件：

```typescript
/**
 * Multi-region configuration for the storefront
 * Supports Americas (USD) and Europe (EUR) regions
 */

export const REGIONS = {
  us: {
    id: 'reg_01K9KE3SV4Q4J745N8T19YTCMH',  // Medusa Region ID
    name: 'Americas',
    currency: 'USD' as const,
    countries: ['us', 'ca'],
  },
  eu: {
    id: 'reg_01K8J5TBMV1EKV404ZG3SZGXEQ',
    name: 'Europe',
    currency: 'EUR' as const,
    countries: [
      'de', 'fr', 'it', 'es', 'nl', 'se', 'dk', 'fi', 'no',
      'ch', 'pt', 'pl', 'gr', 'ie', 'hu', 'lu', 'is', 'lt', 'mc',
    ],
  },
} as const

export type RegionCode = keyof typeof REGIONS
export type CurrencyCode = typeof REGIONS[RegionCode]['currency']

// 国家名称映射
export const COUNTRY_NAMES: Record<string, string> = {
  us: 'United States',
  ca: 'Canada',
  de: 'Germany',
  fr: 'France',
  // ... 其他国家
}

// 构建国家到地区的反向映射
const COUNTRY_TO_REGION: Record<string, RegionCode> = {}
for (const [regionCode, region] of Object.entries(REGIONS)) {
  for (const country of region.countries) {
    COUNTRY_TO_REGION[country] = regionCode as RegionCode
  }
}

export const SUPPORTED_COUNTRIES = Object.keys(COUNTRY_TO_REGION)

/**
 * 根据国家代码获取地区代码
 */
export function getRegionForCountry(countryCode: string): RegionCode {
  const normalized = countryCode.toLowerCase()
  return COUNTRY_TO_REGION[normalized] || 'us'
}

/**
 * 根据国家代码获取完整地区配置
 */
export function getRegionConfig(countryCode: string) {
  const regionCode = getRegionForCountry(countryCode)
  return REGIONS[regionCode]
}

/**
 * 根据 Medusa Region ID 获取地区配置
 */
export function getRegionConfigById(regionId: string | undefined | null) {
  if (!regionId) return REGIONS.us

  for (const region of Object.values(REGIONS)) {
    if (region.id === regionId) {
      return region
    }
  }
  return REGIONS.us
}

/**
 * 类型安全的国家检查辅助函数
 * 避免 TypeScript readonly 数组的 includes() 类型问题
 */
export function isCountryInRegion(
  region: typeof REGIONS[RegionCode],
  countryCode: string
): boolean {
  return (region.countries as readonly string[]).includes(countryCode.toLowerCase())
}
```

**关键点：**
- 使用 `as const` 确保类型推断为字面量类型
- `isCountryInRegion` 函数解决了 TypeScript 对 readonly 数组的 `includes()` 类型推断问题
- Region ID 来自 Medusa 后台配置，需要与后端保持一致

### 2. 多货币格式化 (`number.ts`)

```typescript
import type { CurrencyCode } from '@/lib/config/regions'

// 预创建格式化器，提高性能
const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  EUR: new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
  }),
}

/**
 * 通用货币格式化函数
 * @param value - 金额（单位：分）
 * @param currency - 货币代码，默认 USD
 */
export const currencyFormatter = (
  value: number,
  currency: CurrencyCode = 'USD'
): string => {
  // Medusa 返回的金额单位是分，需要转换为元
  const amount = (value ?? 0) / 100
  const formatter = formatters[currency] || formatters.USD
  return formatter.format(amount)
}

/**
 * 根据购物车自动选择货币的格式化函数
 * @param amount - 金额（单位：分）
 * @param cart - 购物车对象（可选）
 */
export const formatPrice = (
  amount: number,
  cart?: { region?: { currency_code?: string } } | null
): string => {
  const currencyCode = cart?.region?.currency_code?.toUpperCase() as CurrencyCode | undefined
  return currencyFormatter(amount, currencyCode || 'USD')
}
```

**关键点：**
- Medusa 返回的金额单位是 **分**，显示时需要除以 100
- 使用 `Intl.NumberFormat` 确保本地化格式正确
- EUR 使用 `en-GB` locale 以符合欧洲习惯（€1,234.56）

### 3. 中间件 (`middleware.ts`)

```typescript
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SUPPORTED_COUNTRIES } from "@/lib/config/regions"

const COUNTRY_COOKIE_NAME = '_medusa_country_code'

/**
 * 从请求中获取国家代码
 * 优先级：Cookie > IP 地理位置 > 默认值
 */
function getCountryFromRequest(request: NextRequest): string {
  // 1. 检查用户偏好 cookie
  const countryCookie = request.cookies.get(COUNTRY_COOKIE_NAME)?.value?.toLowerCase()
  if (countryCookie && SUPPORTED_COUNTRIES.includes(countryCookie)) {
    return countryCookie
  }

  // 2. 使用 IP 地理位置检测
  // Vercel 自动添加 x-vercel-ip-country 头
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.toLowerCase()
  if (vercelCountry && SUPPORTED_COUNTRIES.includes(vercelCountry)) {
    return vercelCountry
  }

  // Cloudflare 使用 cf-ipcountry 头
  const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase()
  if (cfCountry && SUPPORTED_COUNTRIES.includes(cfCountry)) {
    return cfCountry
  }

  // 3. 默认返回美国
  return 'us'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过静态资源和 API 路由
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const detectedCountry = getCountryFromRequest(request)

  // 如果没有 cookie，设置检测到的国家
  if (!request.cookies.get(COUNTRY_COOKIE_NAME)) {
    response.cookies.set(COUNTRY_COOKIE_NAME, detectedCountry, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 年
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**关键点：**
- 中间件在每个请求上运行，需要高效
- 优先使用用户选择的 cookie，尊重用户偏好
- Vercel 和 Cloudflare 有不同的地理位置头名称

### 4. 地区切换 Server Action (`region.ts`)

```typescript
"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { updateCartRegion } from "@/lib/data/cart"
import { getRegionConfig, isCountrySupported } from "@/lib/config/regions"

const COUNTRY_COOKIE_NAME = '_medusa_country_code'

/**
 * 切换用户所在国家/地区
 * 这会更新 cookie 并更新购物车的 region
 */
export async function switchCountry(newCountryCode: string) {
  const normalizedCode = newCountryCode.toLowerCase()

  // 验证国家代码
  if (!isCountrySupported(normalizedCode)) {
    return { success: false, error: 'Unsupported country' }
  }

  try {
    // 1. 更新 cookie
    const cookieStore = await cookies()
    cookieStore.set(COUNTRY_COOKIE_NAME, normalizedCode, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 年
      sameSite: 'lax',
    })

    // 2. 更新购物车 region（如果有购物车）
    const regionConfig = getRegionConfig(normalizedCode)
    await updateCartRegion(normalizedCode).catch(() => {
      // 购物车可能不存在，忽略错误
    })

    // 3. 重新验证缓存
    revalidatePath('/', 'layout')

    return {
      success: true,
      country: normalizedCode,
      region: regionConfig.name,
      currency: regionConfig.currency,
    }
  } catch (error) {
    console.error('Failed to switch country:', error)
    return { success: false, error: 'Failed to switch country' }
  }
}

/**
 * 获取当前国家代码
 */
export async function getCurrentCountry(): Promise<string> {
  const cookieStore = await cookies()
  const country = cookieStore.get(COUNTRY_COOKIE_NAME)?.value?.toLowerCase()
  return country && isCountrySupported(country) ? country : 'us'
}
```

**关键点：**
- 使用 Server Action 确保 cookie 操作在服务端执行
- 切换地区时需要同时更新购物车的 region
- `revalidatePath` 确保页面缓存被清除

### 5. 购物车数据层 (`cart.ts`)

```typescript
import { getRegionConfig } from "@/lib/config/regions"
import { cookies } from "next/headers"
import { sdk } from "@/lib/config"

const CART_COOKIE_NAME = '_medusa_cart_id'
const COUNTRY_COOKIE_NAME = '_medusa_country_code'

/**
 * 获取当前国家代码
 */
async function getCurrentCountry(): Promise<string> {
  const cookieStore = await cookies()
  return cookieStore.get(COUNTRY_COOKIE_NAME)?.value?.toLowerCase() || 'us'
}

/**
 * 获取或创建购物车
 * 购物车会绑定到用户当前地区
 */
export const getOrSetCart = async (countryCode?: string) => {
  const cookieStore = await cookies()
  let cartId = cookieStore.get(CART_COOKIE_NAME)?.value

  // 确定地区
  const country = countryCode || await getCurrentCountry()
  const regionConfig = getRegionConfig(country)

  if (cartId) {
    // 尝试获取现有购物车
    try {
      const { cart } = await sdk.store.cart.retrieve(cartId, {}, {
        next: { tags: ["cart"] },
      })
      return cart
    } catch {
      // 购物车不存在，继续创建新的
      cartId = undefined
    }
  }

  // 创建新购物车，绑定到正确的 region
  const { cart } = await sdk.store.cart.create({
    region_id: regionConfig.id,
  })

  // 保存 cart ID 到 cookie
  cookieStore.set(CART_COOKIE_NAME, cart.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 天
    sameSite: 'lax',
  })

  return cart
}

/**
 * 更新购物车的 region
 * 当用户切换国家时调用
 */
export const updateCartRegion = async (newCountryCode: string) => {
  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value

  if (!cartId) return null

  const regionConfig = getRegionConfig(newCountryCode)

  try {
    const { cart } = await sdk.store.cart.update(cartId, {
      region_id: regionConfig.id,
    })
    return cart
  } catch (error) {
    console.error('Failed to update cart region:', error)
    return null
  }
}
```

**关键点：**
- 购物车创建时必须指定 `region_id`
- 切换地区时需要更新购物车的 region，这会触发价格重新计算
- 使用 Next.js 的 `cookies()` API 处理服务端 cookie

### 6. 国家选择器组件 (`country-selector.tsx`)

```typescript
"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { switchCountry } from "@/lib/actions/region"
import { REGIONS, COUNTRY_NAMES } from "@/lib/config/regions"

interface CountrySelectorProps {
  currentCountry: string
}

export function CountrySelector({ currentCountry }: CountrySelectorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  // 获取当前国家信息
  const currentCountryName = COUNTRY_NAMES[currentCountry.toLowerCase()] || currentCountry.toUpperCase()
  const currentRegion = Object.values(REGIONS).find(r =>
    r.countries.includes(currentCountry.toLowerCase())
  )

  const handleCountryChange = (countryCode: string) => {
    setOpen(false)
    startTransition(async () => {
      const result = await switchCountry(countryCode)
      if (result.success) {
        router.refresh()
      }
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 h-9 px-2"
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">
            {currentCountry.toUpperCase()}
          </span>
          <span className="hidden lg:inline text-xs text-foreground-muted">
            ({currentRegion?.currency})
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Americas Region */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{REGIONS.us.name}</span>
          <span className="text-xs text-foreground-muted">{REGIONS.us.currency}</span>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {REGIONS.us.countries.map((code) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleCountryChange(code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{COUNTRY_NAMES[code]}</span>
              {currentCountry.toLowerCase() === code && (
                <Check className="h-4 w-4 text-primary-500" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Europe Region */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{REGIONS.eu.name}</span>
          <span className="text-xs text-foreground-muted">{REGIONS.eu.currency}</span>
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {REGIONS.eu.countries.map((code) => (
            <DropdownMenuItem
              key={code}
              onClick={() => handleCountryChange(code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{COUNTRY_NAMES[code]}</span>
              {currentCountry.toLowerCase() === code && (
                <Check className="h-4 w-4 text-primary-500" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**关键点：**
- 使用 `useTransition` 实现非阻塞的 UI 更新
- 切换后调用 `router.refresh()` 刷新页面数据
- 按地区分组显示国家，便于用户理解

---

## 关键流程详解

### 流程 1：首次访问检测

```
用户首次访问 → Middleware 运行
                    │
                    ▼
         检查 _medusa_country_code cookie
                    │
                    ▼ (cookie 不存在)
         读取 x-vercel-ip-country 头
                    │
                    ▼
         IP 在支持列表？
         ├─ 是 → 使用 IP 对应国家
         └─ 否 → 默认 'us'
                    │
                    ▼
         设置 cookie 并继续请求
```

### 流程 2：用户切换地区

```
用户点击国家选择器 → 选择新国家
                        │
                        ▼
              调用 switchCountry() Server Action
                        │
                        ├─→ 更新 _medusa_country_code cookie
                        │
                        ├─→ 更新购物车 region_id
                        │
                        └─→ 调用 revalidatePath() 清除缓存
                        │
                        ▼
              客户端调用 router.refresh()
                        │
                        ▼
              页面重新渲染（新货币、新价格）
```

### 流程 3：结账地址验证

```
用户填写收货地址 → 选择国家
                      │
                      ▼
            获取购物车的 region_id
                      │
                      ▼
            调用 getRegionConfigById(region_id)
                      │
                      ▼
            调用 isCountryInRegion(region, country_code)
                      │
                      ├─ true → 允许结账
                      └─ false → 显示错误提示
```

---

## 常见问题与解决方案

### 问题 1：TypeScript readonly 数组的 includes() 类型错误

**错误信息：**
```
Argument of type 'string' is not assignable to parameter of type 'never'.
```

**原因：** 使用 `as const` 后，数组被推断为 readonly 元组，`includes()` 的参数类型变成了数组元素的字面量联合类型。

**解决方案：** 创建类型安全的辅助函数：
```typescript
export function isCountryInRegion(
  region: typeof REGIONS[RegionCode],
  countryCode: string
): boolean {
  return (region.countries as readonly string[]).includes(countryCode.toLowerCase())
}
```

### 问题 2：购物车价格显示错误货币

**原因：** 购物车创建时未指定正确的 region_id。

**解决方案：** 确保创建购物车时传入正确的 region_id：
```typescript
const { cart } = await sdk.store.cart.create({
  region_id: regionConfig.id,
})
```

### 问题 3：切换地区后价格未更新

**原因：** Next.js 缓存未被清除。

**解决方案：**
1. 在 Server Action 中调用 `revalidatePath('/', 'layout')`
2. 在客户端调用 `router.refresh()`

### 问题 4：IP 检测在本地开发环境不工作

**原因：** 本地环境没有 Vercel/Cloudflare 的地理位置头。

**解决方案：** 在 middleware 中添加本地开发的默认值，或使用环境变量覆盖。

---

## 最佳实践

### 1. 集中化配置

将所有地区相关配置放在 `regions.ts` 中：
- Region ID
- 货币代码
- 支持的国家列表
- 国家名称映射

### 2. 类型安全

- 使用 `as const` 确保配置的类型推断正确
- 导出类型定义供其他模块使用
- 创建辅助函数处理类型问题

### 3. 性能优化

- 预创建 `Intl.NumberFormat` 实例
- 使用 Next.js 缓存策略
- 中间件只处理必要的路由

### 4. 用户体验

- 首次访问自动检测地区
- 提供清晰的地区切换 UI
- 在切换时显示加载状态
- 保持用户偏好（cookie 有效期 1 年）

### 5. 错误处理

- 验证国家代码是否支持
- 处理购物车不存在的情况
- 提供有意义的错误提示

---

## 扩展：添加新地区

如需添加新地区（如亚太区），按以下步骤操作：

1. 在 Medusa 后台创建新 Region（获取 Region ID）

2. 更新 `regions.ts`：
```typescript
export const REGIONS = {
  // ... 现有地区
  apac: {
    id: 'reg_xxxxx',  // Medusa Region ID
    name: 'Asia Pacific',
    currency: 'SGD' as const,
    countries: ['sg', 'au', 'nz', 'jp', 'kr'],
  },
}
```

3. 添加国家名称：
```typescript
export const COUNTRY_NAMES: Record<string, string> = {
  // ... 现有国家
  sg: 'Singapore',
  au: 'Australia',
  // ...
}
```

4. 更新 `number.ts` 添加新货币格式化器：
```typescript
const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  // ... 现有货币
  SGD: new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }),
}
```

5. 更新国家选择器组件显示新地区

---

## 总结

多地区支持是一个涉及前后端的系统性工程，关键要点：

1. **配置集中化**：所有地区配置放在一个文件，便于维护
2. **类型安全**：充分利用 TypeScript 确保代码正确性
3. **数据一致性**：购物车、价格、地址都要与地区配置保持一致
4. **用户体验**：自动检测 + 手动切换，尊重用户选择
5. **可扩展性**：设计时考虑未来添加新地区的便利性

通过本文档的实现方案，你可以为电商网站构建一个灵活、可扩展的多地区支持系统。
