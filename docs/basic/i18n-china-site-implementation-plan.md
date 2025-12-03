# 中国站多语言实现方案（next-intl）

## 概述

本方案将 `locale`（语言）和 `countryCode`（国家/货币）合并为统一的路由参数，使用 `next-intl` 库实现。

### 目标路由结构

```
/us/products     → 英文界面，USD 货币，美国区域
/cn/products     → 中文界面，CNY 货币，中国区域
```

### 映射关系

| 路由前缀 | 语言 (locale) | 货币 (currency) | Medusa Region |
|----------|---------------|-----------------|---------------|
| `/us`    | `en`          | `USD`           | `reg_us_xxx`  |
| `/cn`    | `zh`          | `CNY`           | `reg_cn_xxx`  |

---

## 第一部分：项目结构变更

### 1.1 新增目录结构

```
apps/dji-storefront/
├── src/
│   ├── i18n/
│   │   ├── config.ts              # 国家/语言配置
│   │   ├── request.ts             # next-intl 服务端配置
│   │   └── navigation.ts          # 导航工具函数
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json        # 通用文本（导航、按钮等）
│   │   │   ├── products.json      # 产品页面
│   │   │   ├── cart.json          # 购物车
│   │   │   ├── checkout.json      # 结账
│   │   │   └── account.json       # 账户
│   │   └── zh/
│   │       ├── common.json
│   │       ├── products.json
│   │       ├── cart.json
│   │       ├── checkout.json
│   │       └── account.json
```

### 1.2 需要修改的现有文件

| 文件路径 | 修改类型 | 说明 |
|----------|----------|------|
| `next.config.ts` | 修改 | 添加 next-intl 插件 |
| `src/middleware.ts` | 重写 | 集成 next-intl 中间件 |
| `src/lib/constants.ts` | 修改 | 添加多国家配置 |
| `src/lib/number.ts` | 修改 | 支持多货币格式化 |
| `src/app/layout.tsx` | 修改 | 添加 NextIntlClientProvider |
| `src/app/[countryCode]/layout.tsx` | 修改 | 传递 locale 到子组件 |
| `src/components/site-header.tsx` | 修改 | 导航文本国际化 |
| `src/components/site-footer.tsx` | 修改 | 页脚文本国际化 |
| `src/components/products/*.tsx` | 修改 | 产品相关文本国际化 |
| `src/components/cart/*.tsx` | 修改 | 购物车文本国际化 |
| `src/components/checkout/*.tsx` | 修改 | 结账文本国际化 |

---

## 第二部分：核心配置文件

### 2.1 安装依赖

```bash
pnpm add next-intl
```

### 2.2 i18n/config.ts - 国家/语言配置

```typescript
// src/i18n/config.ts

export const countries = ['us', 'cn'] as const;
export const defaultCountry = 'us' as const;

export type Country = (typeof countries)[number];

// 国家到配置的映射
export const countryConfig: Record<Country, {
  locale: string;
  currency: string;
  regionId: string;
  name: string;
  flag: string;
}> = {
  us: {
    locale: 'en',
    currency: 'USD',
    regionId: process.env.NEXT_PUBLIC_US_REGION_ID || 'reg_01K9KE3SV4Q4J745N8T19YTCMH',
    name: 'United States',
    flag: '🇺🇸',
  },
  cn: {
    locale: 'zh',
    currency: 'CNY',
    regionId: process.env.NEXT_PUBLIC_CN_REGION_ID || 'reg_cn_xxx', // 需要在 Medusa 创建
    name: '中国',
    flag: '🇨🇳',
  },
};

// 获取国家配置
export const getCountryConfig = (country: string) => {
  return countryConfig[country as Country] || countryConfig[defaultCountry];
};

// 获取 locale
export const getLocaleFromCountry = (country: string): string => {
  return getCountryConfig(country).locale;
};

// 获取货币
export const getCurrencyFromCountry = (country: string): string => {
  return getCountryConfig(country).currency;
};

// 获取 Medusa Region ID
export const getRegionIdFromCountry = (country: string): string => {
  return getCountryConfig(country).regionId;
};
```

### 2.3 i18n/request.ts - next-intl 服务端配置

```typescript
// src/i18n/request.ts

import { getRequestConfig } from 'next-intl/server';
import { countries, defaultCountry, getLocaleFromCountry } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale 在这里实际上是 countryCode（us/cn）
  let country = await requestLocale;

  // 验证 country 有效性
  if (!country || !countries.includes(country as any)) {
    country = defaultCountry;
  }

  // 根据 country 获取对应的 locale
  const locale = getLocaleFromCountry(country);

  return {
    locale,
    messages: {
      ...(await import(`../locales/${locale}/common.json`)).default,
      ...(await import(`../locales/${locale}/products.json`)).default,
      ...(await import(`../locales/${locale}/cart.json`)).default,
      ...(await import(`../locales/${locale}/checkout.json`)).default,
      ...(await import(`../locales/${locale}/account.json`)).default,
    },
  };
});
```

### 2.4 i18n/navigation.ts - 导航工具

```typescript
// src/i18n/navigation.ts

import { createNavigation } from 'next-intl/navigation';
import { countries, defaultCountry } from './config';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: countries,
  defaultLocale: defaultCountry,
  localePrefix: 'always',
});
```

### 2.5 next.config.ts 修改

```typescript
// next.config.ts

import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const strapiRemotePattern = (() => {
  // ... 现有代码保持不变
})();

const distDir = process.env.VERCEL ? "apps/dji-storefront/.next" : ".next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@cs/medusa-client"],
  distDir,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // ... 现有配置保持不变
    ],
  },
};

export default withNextIntl(nextConfig);
```

### 2.6 middleware.ts 重写

```typescript
// src/middleware.ts

import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { countries, defaultCountry } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales: countries,
  defaultLocale: defaultCountry,
  localePrefix: 'always',
});

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态资源
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  // 允许 auth 路由不带前缀
  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    return NextResponse.next();
  }

  // 使用 next-intl 中间件处理路由
  const response = intlMiddleware(request);

  // 设置 Medusa cache ID cookie
  if (response && !request.cookies.get('_medusa_cache_id')) {
    response.cookies.set('_medusa_cache_id', crypto.randomUUID(), {
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)',
  ],
};
```

---

## 第三部分：翻译文件

### 3.1 locales/en/common.json

```json
{
  "nav": {
    "home": "Home",
    "products": "All Products",
    "post": "Post",
    "software": "Software",
    "blog": "Blog",
    "community": "Community",
    "faq": "FAQ",
    "account": "Account",
    "cart": "Cart",
    "search": "Search products...",
    "toggleNav": "Toggle navigation"
  },
  "footer": {
    "products": "Products",
    "support": "Support",
    "contact": "Contact",
    "a320Series": "A320 Series",
    "737Series": "737 Series",
    "accessories": "Accessories",
    "allProducts": "All Products",
    "privacy": "Privacy",
    "terms": "Terms",
    "shipping": "Shipping",
    "description": "Professional flight simulation hardware inspired by the Cockpit Simulator system.",
    "copyright": "© {year} Cockpit Simulator. All rights reserved."
  },
  "buttons": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "learnMore": "Learn More",
    "viewAll": "View All",
    "backToHome": "Back to Home",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "noResults": "No results found",
    "currency": "Currency",
    "language": "Language",
    "country": "Country"
  },
  "countrySwitcher": {
    "title": "Select Region",
    "us": "United States (USD)",
    "cn": "中国 (CNY)"
  }
}
```

### 3.2 locales/zh/common.json

```json
{
  "nav": {
    "home": "首页",
    "products": "全部产品",
    "post": "公告",
    "software": "软件",
    "blog": "博客",
    "community": "社区",
    "faq": "常见问题",
    "account": "账户",
    "cart": "购物车",
    "search": "搜索产品...",
    "toggleNav": "切换导航"
  },
  "footer": {
    "products": "产品系列",
    "support": "支持",
    "contact": "联系我们",
    "a320Series": "A320 系列",
    "737Series": "737 系列",
    "accessories": "配件",
    "allProducts": "全部产品",
    "privacy": "隐私政策",
    "terms": "服务条款",
    "shipping": "配送说明",
    "description": "专业飞行模拟硬件，灵感源自驾驶舱模拟器系统。",
    "copyright": "© {year} Cockpit Simulator. 保留所有权利。"
  },
  "buttons": {
    "addToCart": "加入购物车",
    "buyNow": "立即购买",
    "learnMore": "了解更多",
    "viewAll": "查看全部",
    "backToHome": "返回首页",
    "submit": "提交",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑"
  },
  "common": {
    "loading": "加载中...",
    "error": "发生错误",
    "noResults": "未找到结果",
    "currency": "货币",
    "language": "语言",
    "country": "国家/地区"
  },
  "countrySwitcher": {
    "title": "选择地区",
    "us": "美国 (USD)",
    "cn": "中国 (CNY)"
  }
}
```

### 3.3 locales/en/products.json

```json
{
  "products": {
    "title": "All Products",
    "subtitle": "Professional flight simulation hardware",
    "filters": {
      "category": "Category",
      "allCategories": "All Categories",
      "sortBy": "Sort by",
      "priceRange": "Price Range"
    },
    "sort": {
      "newest": "Newest",
      "priceLowToHigh": "Price: Low to High",
      "priceHighToLow": "Price: High to Low",
      "bestSelling": "Best Selling"
    },
    "card": {
      "new": "New",
      "outOfStock": "Out of Stock",
      "addToCart": "Add to Cart",
      "quickView": "Quick View"
    },
    "detail": {
      "description": "Description",
      "specifications": "Specifications",
      "reviews": "Reviews",
      "keyFeatures": "Key Features",
      "productDescription": "Product Description",
      "selectVariant": "Select Variant",
      "quantity": "Quantity",
      "addToCart": "Add to Cart",
      "adding": "Adding...",
      "outOfStock": "Out of Stock",
      "addToWishlist": "Add to Wishlist",
      "removeFromWishlist": "Remove from Wishlist",
      "freeShipping": "Free Shipping",
      "freeShippingDesc": "Orders over {amount}",
      "warranty": "2 Year Warranty",
      "warrantyDesc": "Full hardware coverage",
      "madeForPros": "Made for Pros",
      "madeForProsDesc": "Trusted by real pilots",
      "previousImage": "Previous image",
      "nextImage": "Next image"
    },
    "empty": {
      "title": "No products found",
      "description": "Try adjusting your filters or search terms"
    }
  }
}
```

### 3.4 locales/zh/products.json

```json
{
  "products": {
    "title": "全部产品",
    "subtitle": "专业飞行模拟硬件",
    "filters": {
      "category": "分类",
      "allCategories": "全部分类",
      "sortBy": "排序方式",
      "priceRange": "价格区间"
    },
    "sort": {
      "newest": "最新上架",
      "priceLowToHigh": "价格从低到高",
      "priceHighToLow": "价格从高到低",
      "bestSelling": "销量最高"
    },
    "card": {
      "new": "新品",
      "outOfStock": "缺货",
      "addToCart": "加入购物车",
      "quickView": "快速查看"
    },
    "detail": {
      "description": "描述",
      "specifications": "规格参数",
      "reviews": "评价",
      "keyFeatures": "主要特点",
      "productDescription": "产品描述",
      "selectVariant": "选择规格",
      "quantity": "数量",
      "addToCart": "加入购物车",
      "adding": "添加中...",
      "outOfStock": "缺货",
      "addToWishlist": "加入心愿单",
      "removeFromWishlist": "从心愿单移除",
      "freeShipping": "免运费",
      "freeShippingDesc": "订单满 {amount} 免运费",
      "warranty": "2 年质保",
      "warrantyDesc": "全面硬件保修",
      "madeForPros": "专业之选",
      "madeForProsDesc": "真实飞行员信赖之选",
      "previousImage": "上一张图片",
      "nextImage": "下一张图片"
    },
    "empty": {
      "title": "未找到产品",
      "description": "请尝试调整筛选条件或搜索词"
    }
  }
}
```

### 3.5 locales/en/cart.json 和 locales/zh/cart.json

```json
// en/cart.json
{
  "cart": {
    "title": "Shopping Cart",
    "empty": {
      "title": "Your cart is empty",
      "description": "Looks like you haven't added anything to your cart yet.",
      "continueShopping": "Continue Shopping"
    },
    "item": "item",
    "items": "items",
    "subtotal": "Subtotal",
    "shipping": "Shipping",
    "shippingCalculated": "Calculated at checkout",
    "tax": "Tax",
    "total": "Total",
    "proceedToCheckout": "Proceed to Checkout",
    "remove": "Remove",
    "updateQuantity": "Update quantity"
  }
}

// zh/cart.json
{
  "cart": {
    "title": "购物车",
    "empty": {
      "title": "购物车为空",
      "description": "您还没有添加任何商品到购物车。",
      "continueShopping": "继续购物"
    },
    "item": "件商品",
    "items": "件商品",
    "subtotal": "小计",
    "shipping": "运费",
    "shippingCalculated": "结账时计算",
    "tax": "税费",
    "total": "合计",
    "proceedToCheckout": "去结账",
    "remove": "删除",
    "updateQuantity": "更新数量"
  }
}
```

### 3.6 locales/en/checkout.json 和 locales/zh/checkout.json

```json
// en/checkout.json
{
  "checkout": {
    "title": "Checkout",
    "backToCart": "Back to Cart",
    "customerInfo": "Customer Information",
    "shippingAddress": "Shipping Address",
    "paymentMethod": "Payment Method",
    "orderSummary": "Order Summary",
    "placeOrder": "Place Order",
    "processing": "Processing...",
    "form": {
      "email": "Email",
      "firstName": "First Name",
      "lastName": "Last Name",
      "address": "Address",
      "city": "City",
      "state": "State/Province",
      "postalCode": "Postal Code",
      "country": "Country",
      "phone": "Phone"
    },
    "success": {
      "title": "Order Confirmed!",
      "description": "Thank you for your order. We'll send you a confirmation email shortly.",
      "orderNumber": "Order Number",
      "continueShopping": "Continue Shopping"
    }
  }
}

// zh/checkout.json
{
  "checkout": {
    "title": "结账",
    "backToCart": "返回购物车",
    "customerInfo": "客户信息",
    "shippingAddress": "收货地址",
    "paymentMethod": "支付方式",
    "orderSummary": "订单摘要",
    "placeOrder": "提交订单",
    "processing": "处理中...",
    "form": {
      "email": "电子邮箱",
      "firstName": "名",
      "lastName": "姓",
      "address": "详细地址",
      "city": "城市",
      "state": "省份",
      "postalCode": "邮政编码",
      "country": "国家/地区",
      "phone": "电话"
    },
    "success": {
      "title": "订单已确认！",
      "description": "感谢您的订单。我们将很快向您发送确认邮件。",
      "orderNumber": "订单号",
      "continueShopping": "继续购物"
    }
  }
}
```

---

## 第四部分：组件修改示例

### 4.1 修改 lib/number.ts - 支持多货币

```typescript
// src/lib/number.ts

import { getCurrencyFromCountry, getLocaleFromCountry } from '@/i18n/config';

// 创建货币格式化器缓存
const formatterCache = new Map<string, Intl.NumberFormat>();

const getFormatter = (country: string): Intl.NumberFormat => {
  const cacheKey = country;

  if (formatterCache.has(cacheKey)) {
    return formatterCache.get(cacheKey)!;
  }

  const locale = getLocaleFromCountry(country);
  const currency = getCurrencyFromCountry(country);

  // locale 到 Intl locale 的映射
  const intlLocale = locale === 'zh' ? 'zh-CN' : 'en-US';

  const formatter = new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency,
  });

  formatterCache.set(cacheKey, formatter);
  return formatter;
};

// 新的货币格式化函数（带 country 参数）
export const formatCurrency = (value: number, country: string = 'us'): string => {
  return getFormatter(country).format(value);
};

// 保留旧函数以兼容（逐步废弃）
export const currencyFormatter = (value: number) => formatCurrency(value, 'us');
```

### 4.2 修改 site-header.tsx - 导航国际化

```typescript
// src/components/site-header.tsx

'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
// ... 其他 imports

export function SiteHeader({ cartItemCount }: { cartItemCount: number }) {
  const t = useTranslations('nav');

  const NAV_ITEMS = [
    { name: t('home'), href: '/' },
    { name: t('products'), href: '/products' },
    { name: t('post'), href: '/announcements/latest' },
    { name: t('software'), href: '/software' },
    { name: t('blog'), href: '/blog' },
    { name: t('community'), href: '/community' },
    { name: t('faq'), href: '/faq' },
  ];

  return (
    <header>
      {/* 使用 next-intl 的 Link 组件，自动处理 locale 前缀 */}
      <nav>
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.name}
          </Link>
        ))}
      </nav>

      {/* 购物车链接 */}
      <Link href="/cart" aria-label={t('cart')}>
        <ShoppingCart />
        {cartItemCount > 0 && <span>{cartItemCount}</span>}
      </Link>

      {/* 国家/语言切换器 */}
      <CountrySwitcher />
    </header>
  );
}
```

### 4.3 新增 CountrySwitcher 组件

```typescript
// src/components/country-switcher.tsx

'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { countries, countryConfig, type Country } from '@/i18n/config';

export function CountrySwitcher() {
  const t = useTranslations('countrySwitcher');
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();

  const currentCountry = (params.countryCode as Country) || 'us';

  const handleCountryChange = (newCountry: Country) => {
    // 替换路径中的国家代码
    const newPathname = pathname.replace(`/${currentCountry}`, `/${newCountry}`);
    router.push(newPathname);
  };

  return (
    <div className="relative">
      <select
        value={currentCountry}
        onChange={(e) => handleCountryChange(e.target.value as Country)}
        className="appearance-none bg-transparent border rounded px-3 py-1"
      >
        {countries.map((country) => (
          <option key={country} value={country}>
            {countryConfig[country].flag} {t(country)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### 4.4 修改 product-detail-client.tsx - 产品详情国际化

```typescript
// src/components/products/product-detail-client.tsx

'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/number';
// ... 其他 imports

export function ProductDetailClient({ product }: Props) {
  const t = useTranslations('products.detail');
  const params = useParams();
  const countryCode = params.countryCode as string;

  return (
    <div>
      {/* 价格显示 - 使用对应货币 */}
      <div className="text-2xl font-bold">
        {formatCurrency(product.price, countryCode)}
      </div>

      {/* 添加购物车按钮 */}
      <button disabled={!product.inStock || isAdding}>
        {isAdding ? t('adding') : product.inStock ? t('addToCart') : t('outOfStock')}
      </button>

      {/* 特性标签 */}
      <div className="features">
        <div>
          <span>{t('freeShipping')}</span>
          <span>{t('freeShippingDesc', { amount: formatCurrency(299, countryCode) })}</span>
        </div>
        <div>
          <span>{t('warranty')}</span>
          <span>{t('warrantyDesc')}</span>
        </div>
        <div>
          <span>{t('madeForPros')}</span>
          <span>{t('madeForProsDesc')}</span>
        </div>
      </div>

      {/* Tab 标签 */}
      <Tabs>
        <Tab label={t('description')} />
        <Tab label={t('specifications')} />
        <Tab label={t('reviews')} />
      </Tabs>
    </div>
  );
}
```

### 4.5 修改 app/layout.tsx - 添加 Provider

```typescript
// src/app/layout.tsx

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
// ... 其他 imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const cart = await retrieveCart();

  return (
    <html lang={locale} className="bg-background-primary" suppressHydrationWarning>
      <body className="antialiased bg-background-primary text-foreground-primary">
        <NextIntlClientProvider messages={messages}>
          <SiteHeader cartItemCount={cart?.items?.length ?? 0} />
          <main>{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4.6 修改 [countryCode]/layout.tsx

```typescript
// src/app/[countryCode]/layout.tsx

import { ReactNode } from 'react';
import { WishlistProvider } from '@/lib/context/wishlist-context';
import { notFound } from 'next/navigation';
import { countries } from '@/i18n/config';

type Props = {
  children: ReactNode;
  params: Promise<{ countryCode: string }>;
};

export default async function CountryLayout({ children, params }: Props) {
  const { countryCode } = await params;

  // 验证 countryCode 有效性
  if (!countries.includes(countryCode as any)) {
    notFound();
  }

  return <WishlistProvider>{children}</WishlistProvider>;
}

// 生成静态参数
export function generateStaticParams() {
  return countries.map((country) => ({
    countryCode: country,
  }));
}
```

---

## 第五部分：Medusa 后端配置

### 5.1 创建中国 Region

在 Medusa Admin 中创建新 Region：

```
Region Name: China
Currency: CNY
Countries: CN (China)
Tax Rate: 13% (增值税)
Payment Providers: (根据需要配置)
Fulfillment Providers: (根据需要配置)
```

### 5.2 产品价格配置

为每个产品变体添加 CNY 价格：

1. 进入 Medusa Admin → Products
2. 选择产品 → Variants
3. 为每个变体添加 CNY 价格

### 5.3 修改 lib/data/products.ts

```typescript
// src/lib/data/products.ts

import { getRegionIdFromCountry } from '@/i18n/config';

// 修改 resolveRegion 函数
const resolveRegion = async ({ countryCode }: { countryCode: string }) => {
  const regionId = getRegionIdFromCountry(countryCode);

  try {
    return await retrieveRegion(regionId);
  } catch {
    // 降级到默认 US region
    const defaultRegionId = getRegionIdFromCountry('us');
    return await retrieveRegion(defaultRegionId);
  }
};
```

---

## 第六部分：实施计划

### 阶段 1：基础设施（1-2 天）

1. 安装 next-intl
2. 创建 i18n 配置文件
3. 修改 next.config.ts
4. 重写 middleware.ts
5. 创建翻译文件结构

### 阶段 2：核心组件国际化（2-3 天）

1. 修改 lib/number.ts 支持多货币
2. 国际化 site-header.tsx
3. 国际化 site-footer.tsx
4. 添加 CountrySwitcher 组件

### 阶段 3：页面国际化（3-4 天）

1. 产品列表页 (products-client.tsx)
2. 产品详情页 (product-detail-client.tsx)
3. 购物车页 (cart-client.tsx)
4. 结账页 (checkout-client.tsx)
5. 账户页 (account-client.tsx)
6. 登录页 (login-client.tsx)

### 阶段 4：Medusa 配置（1 天）

1. 创建 CN Region
2. 配置产品 CNY 价格
3. 配置运费规则
4. 测试订单流程

### 阶段 5：测试与优化（2 天）

1. 端到端测试 (US/CN 站点)
2. SEO 检查 (hreflang 标签)
3. 性能优化
4. 边缘情况处理

---

## 第七部分：注意事项

### 7.1 SEO 考虑

在 `app/[countryCode]/layout.tsx` 中添加 hreflang：

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countryCode } = await params;
  const config = getCountryConfig(countryCode);

  return {
    alternates: {
      languages: {
        'en-US': '/us',
        'zh-CN': '/cn',
      },
    },
  };
}
```

### 7.2 产品内容多语言

产品的 title 和 description 来自 Medusa，有两种处理方式：

**方案 A：Medusa metadata 存储**

```typescript
// 产品 metadata
{
  "title_zh": "A320 FCU 控制面板",
  "description_zh": "专业级空客FCU控制面板...",
}
```

**方案 B：Strapi CMS 管理（推荐）**

- Strapi 开启多语言插件
- 产品展示内容从 Strapi 获取
- Medusa 仅管理价格/库存/订单

### 7.3 URL 结构保持一致

确保两个站点的 URL 结构一致：

```
/us/products/a320-fcu
/cn/products/a320-fcu  ← 相同的 handle
```

### 7.4 货币转换

不建议在前端做实时汇率转换，应该：
- 在 Medusa 中为每个 Region 设置固定价格
- 定期更新价格（如每周/每月）

---

## 相关文件清单

### 新增文件

```
src/i18n/config.ts
src/i18n/request.ts
src/i18n/navigation.ts
src/locales/en/common.json
src/locales/en/products.json
src/locales/en/cart.json
src/locales/en/checkout.json
src/locales/en/account.json
src/locales/zh/common.json
src/locales/zh/products.json
src/locales/zh/cart.json
src/locales/zh/checkout.json
src/locales/zh/account.json
src/components/country-switcher.tsx
```

### 修改文件

```
next.config.ts
src/middleware.ts
src/lib/constants.ts
src/lib/number.ts
src/app/layout.tsx
src/app/[countryCode]/layout.tsx
src/components/site-header.tsx
src/components/site-footer.tsx
src/components/products/product-card.tsx
src/components/products/product-detail-client.tsx
src/components/cart/cart-client.tsx
src/components/checkout/checkout-client.tsx
src/components/account/account-client.tsx
src/components/auth/login-client.tsx
src/lib/data/products.ts
src/lib/data/cart.ts
src/lib/data/regions.ts
```
