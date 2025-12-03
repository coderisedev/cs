# Next.js 多语言（i18n）实现方案

## 当前项目状态

项目目前**还没有实现多语言支持**，仅支持英文 + USD。

## 方案对比

| 方案 | 路由结构 | 适合场景 | 复杂度 |
|------|----------|----------|--------|
| **A: 子路径** | `/en/products`, `/zh/products` | 单域名多语言 | 中等 |
| **B: 子域名** | `en.example.com`, `zh.example.com` | 独立运营 | 较高 |
| **C: 独立域名** | `example.com`, `example.cn` | 完全隔离 | 最高 |

对于本项目，**方案 A（子路径）** 最合适，因为可以复用现有的 `[countryCode]` 结构。

## 方案 A：子路径实现详解

### 路由结构设计

```
当前：  /us/products              (美国，英文，USD)
扩展后：/us/products              (美国，英文，USD)
       /us/zh/products           (美国，中文，USD) ← 美国华人用户
       /cn/products              (中国，中文，CNY)
       /cn/en/products           (中国，英文，CNY) ← 在华外国人
```

或者更简单的设计：

```
/en/products    → 英文界面，USD
/zh/products    → 中文界面，USD（或 CNY）
```

### 实现步骤

#### Step 1: 创建翻译文件

```
apps/dji-storefront/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   └── products.json
│   └── zh/
│       ├── common.json
│       └── products.json
```

**locales/en/common.json:**

```json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "cart": "Cart",
    "account": "Account"
  },
  "buttons": {
    "addToCart": "Add to Cart",
    "buyNow": "Buy Now",
    "learnMore": "Learn More"
  }
}
```

**locales/zh/common.json:**

```json
{
  "nav": {
    "home": "首页",
    "products": "产品",
    "cart": "购物车",
    "account": "账户"
  },
  "buttons": {
    "addToCart": "加入购物车",
    "buyNow": "立即购买",
    "learnMore": "了解更多"
  }
}
```

#### Step 2: 安装 next-intl（推荐库）

```bash
pnpm add next-intl
```

#### Step 3: 配置 next.config.ts

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // ... 现有配置
};

export default withNextIntl(nextConfig);
```

#### Step 4: 创建 i18n 配置

**src/i18n/config.ts:**

```typescript
export const locales = ['en', 'zh'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];
```

**src/i18n/request.ts:**

```typescript
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // 验证 locale 有效性
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`../../locales/${locale}/common.json`)).default
  };
});
```

#### Step 5: 修改路由结构

**两种选择：**

**选择 A：独立于 countryCode**

```
app/
├── [locale]/              ← 新增语言层
│   ├── [countryCode]/     ← 保留国家层
│   │   ├── products/
│   │   └── cart/
```

**选择 B：合并到 countryCode（推荐）**

```
app/
├── [countryCode]/         ← 既是国家也是语言
│   ├── products/
│   └── cart/

// middleware 处理映射
us → locale: en, currency: USD
cn → locale: zh, currency: CNY
```

#### Step 6: 在组件中使用翻译

```tsx
// Server Component
import { getTranslations } from 'next-intl/server';

export default async function ProductsPage() {
  const t = await getTranslations('products');

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{t('addToCart')}</button>
    </div>
  );
}

// Client Component
'use client';
import { useTranslations } from 'next-intl';

export function AddToCartButton() {
  const t = useTranslations('buttons');

  return <button>{t('addToCart')}</button>;
}
```

#### Step 7: 更新 Middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // 总是显示 /en/ 或 /zh/
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
```

## 与 Medusa 的整合

### countryCode vs locale 的关系

```typescript
// 映射配置
const countryConfig = {
  us: { locale: 'en', currency: 'USD', regionId: 'reg_us_xxx' },
  cn: { locale: 'zh', currency: 'CNY', regionId: 'reg_cn_xxx' },
  hk: { locale: 'zh', currency: 'HKD', regionId: 'reg_hk_xxx' },
  uk: { locale: 'en', currency: 'GBP', regionId: 'reg_uk_xxx' },
};
```

### 产品内容多语言

Medusa 产品的 `title` 和 `description` 默认是单语言的。多语言内容有两种方案：

**方案 1：使用 Strapi CMS 管理多语言**

```
Strapi 产品内容（多语言）  →  展示用
Medusa 产品数据（价格/库存）→  交易用
```

**方案 2：Medusa metadata 存储**

```typescript
// Medusa 产品 metadata
{
  "title_zh": "飞行模拟器控制面板",
  "description_zh": "专业级航空模拟硬件...",
  "title_en": "Flight Simulator Control Panel",
  "description_en": "Professional aviation simulation hardware..."
}
```

## 推荐实现路径

### 阶段 1：保持现状（当前）

- 仅支持英文 + USD
- `[countryCode]` 始终为 `us`

### 阶段 2：添加中文支持

```
/us/products     → 英文，USD
/us/zh/products  → 中文，USD（美国华人）
```

### 阶段 3：添加中国站

```
/us/products     → 英文，USD
/cn/products     → 中文，CNY
```

## 总结

| 问题 | 答案 |
|------|------|
| 多语言和多国家是一回事吗？ | 不是。`locale`（语言）和 `country`（国家/货币）是独立的 |
| 推荐什么库？ | `next-intl`（Server Component 友好，类型安全） |
| 翻译内容存哪？ | 静态文本：JSON 文件；产品内容：Strapi CMS |
| 需要改路由结构吗？ | 可以复用 `[countryCode]`，或新增 `[locale]` 层 |

## 相关文件

- `apps/dji-storefront/next.config.ts` - Next.js 配置
- `apps/dji-storefront/src/middleware.ts` - 路由中间件
- `apps/dji-storefront/src/lib/number.ts` - 货币格式化（当前硬编码 en-US）
