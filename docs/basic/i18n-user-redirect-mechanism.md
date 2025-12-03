# 多站点用户跳转机制

## 概述

本文档详细说明如何根据用户地理位置自动跳转到对应的国家站点（如 `/us` 或 `/cn`）。

## 机制对比

| 机制 | 触发方式 | 准确度 | 用户体验 | 实现复杂度 |
|------|----------|--------|----------|------------|
| **IP 地理定位** | 自动 | 中等 (70-90%) | 无感知 | 中等 |
| **浏览器语言** | 自动 | 低 (不可靠) | 无感知 | 简单 |
| **用户手动选择** | 手动 | 100% | 需交互 | 简单 |
| **Cookie 记忆** | 自动 | 100% (回访) | 无感知 | 简单 |
| **Cloudflare 头** | 自动 | 高 (95%+) | 无感知 | 需 CF |

## 推荐方案：组合策略

```
首次访问 → IP 地理定位 → 显示确认弹窗 → 用户确认/更改 → Cookie 记忆
回访用户 → 读取 Cookie → 直接跳转
```

---

## 方案一：IP 地理定位（推荐）

### 1.1 使用 Vercel Edge 的地理信息

Vercel 自动在请求头中注入地理信息：

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { countries, defaultCountry } from './i18n/config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态资源和 API
  if (pathname.includes('.') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 检查是否已有国家偏好 Cookie
  const preferredCountry = request.cookies.get('preferred_country')?.value;

  // 检查是否已在正确的国家路径上
  const pathCountry = pathname.split('/')[1];
  if (countries.includes(pathCountry as any)) {
    // 已经在某个国家路径，设置 Cookie 记忆
    const response = NextResponse.next();
    if (!preferredCountry) {
      response.cookies.set('preferred_country', pathCountry, {
        maxAge: 60 * 60 * 24 * 365, // 1年
        path: '/',
      });
    }
    return response;
  }

  // 确定目标国家
  let targetCountry: string;

  if (preferredCountry && countries.includes(preferredCountry as any)) {
    // 优先使用 Cookie 中的偏好
    targetCountry = preferredCountry;
  } else {
    // 使用 Vercel 提供的地理信息
    const country = request.geo?.country?.toLowerCase() || '';

    // 国家代码映射
    const countryMapping: Record<string, string> = {
      'cn': 'cn',  // 中国
      'hk': 'cn',  // 香港 → 中国站
      'tw': 'cn',  // 台湾 → 中国站
      'mo': 'cn',  // 澳门 → 中国站
      // 其他所有国家 → 美国站
    };

    targetCountry = countryMapping[country] || defaultCountry;
  }

  // 重定向到目标国家
  const url = request.nextUrl.clone();
  url.pathname = `/${targetCountry}${pathname}`;

  const response = NextResponse.redirect(url);
  response.cookies.set('preferred_country', targetCountry, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  return response;
}
```

### 1.2 Vercel 提供的地理信息

```typescript
// request.geo 对象结构
{
  city: 'Shanghai',
  country: 'CN',        // ISO 3166-1 alpha-2 国家代码
  region: 'SH',         // 省份/州代码
  latitude: '31.2222',
  longitude: '121.4581',
}
```

### 1.3 非 Vercel 环境：使用第三方 IP 服务

```typescript
// src/lib/geo.ts

export async function getCountryFromIP(ip: string): Promise<string> {
  try {
    // 方案 A: ip-api.com (免费，限制 45 req/min)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
    const data = await response.json();
    return data.countryCode?.toLowerCase() || 'us';

    // 方案 B: ipinfo.io (免费 50k/月)
    // const response = await fetch(`https://ipinfo.io/${ip}?token=${process.env.IPINFO_TOKEN}`);
    // const data = await response.json();
    // return data.country?.toLowerCase() || 'us';

    // 方案 C: MaxMind GeoIP (需要数据库)
    // 最准确，但需要定期更新数据库
  } catch {
    return 'us'; // 降级到默认
  }
}

// 在 middleware 中使用
const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
         || request.headers.get('x-real-ip')
         || '127.0.0.1';
const country = await getCountryFromIP(ip);
```

---

## 方案二：Cloudflare 地理信息（最准确）

如果使用 Cloudflare，它会自动注入地理信息头：

```typescript
// src/middleware.ts

export async function middleware(request: NextRequest) {
  // Cloudflare 注入的头
  const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase();
  // 可能的值: 'CN', 'US', 'XX'(未知), 'T1'(Tor)

  const targetCountry = cfCountry === 'cn' ? 'cn' : 'us';

  // ... 重定向逻辑
}
```

**Cloudflare 头信息：**

| 头名称 | 说明 | 示例 |
|--------|------|------|
| `cf-ipcountry` | 国家代码 | `CN`, `US` |
| `cf-connecting-ip` | 真实客户端 IP | `1.2.3.4` |
| `cf-ray` | 请求 ID | `xxx-SJC` |

---

## 方案三：用户手动选择 + 确认弹窗

### 3.1 首次访问确认弹窗组件

```typescript
// src/components/country-detection-modal.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { countries, countryConfig, type Country } from '@/i18n/config';
import Cookies from 'js-cookie';

type Props = {
  detectedCountry: Country;
  currentCountry: Country;
};

export function CountryDetectionModal({ detectedCountry, currentCountry }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 检查是否已经确认过
    const hasConfirmed = Cookies.get('country_confirmed');

    // 如果检测到的国家与当前不同，且未确认过，显示弹窗
    if (!hasConfirmed && detectedCountry !== currentCountry) {
      setIsOpen(true);
    }
  }, [detectedCountry, currentCountry]);

  const handleConfirm = (country: Country) => {
    // 设置确认 Cookie
    Cookies.set('country_confirmed', 'true', { expires: 365 });
    Cookies.set('preferred_country', country, { expires: 365 });

    setIsOpen(false);

    // 如果选择了不同的国家，跳转
    if (country !== currentCountry) {
      const newPath = pathname.replace(`/${currentCountry}`, `/${country}`);
      router.push(newPath);
    }
  };

  if (!isOpen) return null;

  const detected = countryConfig[detectedCountry];
  const current = countryConfig[currentCountry];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4">选择您的地区 / Select Your Region</h2>

        <p className="text-gray-600 mb-6">
          我们检测到您可能来自 {detected.name}。
          <br />
          We detected you might be from {detected.name}.
        </p>

        <div className="space-y-3">
          {/* 检测到的国家 */}
          <button
            onClick={() => handleConfirm(detectedCountry)}
            className="w-full p-4 border-2 border-primary rounded-lg hover:bg-primary/5 flex items-center gap-3"
          >
            <span className="text-2xl">{detected.flag}</span>
            <div className="text-left">
              <div className="font-semibold">{detected.name}</div>
              <div className="text-sm text-gray-500">{detected.currency}</div>
            </div>
          </button>

          {/* 当前国家（如果不同） */}
          {detectedCountry !== currentCountry && (
            <button
              onClick={() => handleConfirm(currentCountry)}
              className="w-full p-4 border rounded-lg hover:bg-gray-50 flex items-center gap-3"
            >
              <span className="text-2xl">{current.flag}</span>
              <div className="text-left">
                <div className="font-semibold">{current.name}</div>
                <div className="text-sm text-gray-500">{current.currency}</div>
              </div>
            </button>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400 text-center">
          您可以随时在页脚更改地区设置
          <br />
          You can change this anytime in the footer
        </p>
      </div>
    </div>
  );
}
```

### 3.2 在布局中使用

```typescript
// src/app/[countryCode]/layout.tsx

import { headers } from 'next/headers';
import { CountryDetectionModal } from '@/components/country-detection-modal';
import { countries, type Country } from '@/i18n/config';

export default async function CountryLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ countryCode: string }>;
}) {
  const { countryCode } = await params;
  const headersList = await headers();

  // 从 Vercel/Cloudflare 获取检测到的国家
  const detectedGeo = headersList.get('x-vercel-ip-country')?.toLowerCase()
                   || headersList.get('cf-ipcountry')?.toLowerCase()
                   || 'us';

  // 映射到支持的国家
  const detectedCountry: Country = detectedGeo === 'cn' ? 'cn' : 'us';
  const currentCountry = countryCode as Country;

  return (
    <>
      <CountryDetectionModal
        detectedCountry={detectedCountry}
        currentCountry={currentCountry}
      />
      {children}
    </>
  );
}
```

---

## 方案四：浏览器语言检测（辅助）

```typescript
// src/middleware.ts

export async function middleware(request: NextRequest) {
  // Accept-Language 头示例: "zh-CN,zh;q=0.9,en;q=0.8"
  const acceptLanguage = request.headers.get('accept-language') || '';

  // 解析首选语言
  const primaryLanguage = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase();

  // 语言到国家的映射（不太可靠，仅作参考）
  const languageToCountry: Record<string, string> = {
    'zh': 'cn',
    'en': 'us',
  };

  const suggestedCountry = languageToCountry[primaryLanguage] || 'us';

  // 建议结合 IP 地理定位使用
}
```

**注意**：浏览器语言不可靠，因为：

- 用户可能在国外使用中文浏览器
- 用户可能在国内使用英文浏览器
- 很多用户从不更改浏览器语言设置

---

## 完整推荐方案

### 整合后的 Middleware

```typescript
// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { countries, defaultCountry, type Country } from './i18n/config';

// 国家映射
const geoToCountry: Record<string, Country> = {
  'cn': 'cn',
  'hk': 'cn',
  'tw': 'cn',
  'mo': 'cn',
  // 其他所有 → 默认 us
};

function detectCountry(request: NextRequest): Country {
  // 1. 优先检查 Cookie（用户之前的选择）
  const preferred = request.cookies.get('preferred_country')?.value;
  if (preferred && countries.includes(preferred as Country)) {
    return preferred as Country;
  }

  // 2. 使用平台提供的地理信息
  // Vercel
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.toLowerCase();
  // Cloudflare
  const cfCountry = request.headers.get('cf-ipcountry')?.toLowerCase();
  // Next.js geo (Vercel)
  const geoCountry = request.geo?.country?.toLowerCase();

  const detectedGeo = vercelCountry || cfCountry || geoCountry || '';

  return geoToCountry[detectedGeo] || defaultCountry;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态资源
  if (
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  // 检查是否已在国家路径上
  const pathSegments = pathname.split('/').filter(Boolean);
  const pathCountry = pathSegments[0];

  if (countries.includes(pathCountry as Country)) {
    // 已在有效国家路径，继续
    const response = NextResponse.next();

    // 如果没有偏好 Cookie，设置当前路径的国家为偏好
    if (!request.cookies.get('preferred_country')) {
      response.cookies.set('preferred_country', pathCountry, {
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return response;
  }

  // 需要重定向到正确的国家
  const targetCountry = detectCountry(request);

  const url = request.nextUrl.clone();
  url.pathname = `/${targetCountry}${pathname === '/' ? '' : pathname}`;

  const response = NextResponse.redirect(url, 307); // 307 临时重定向
  response.cookies.set('preferred_country', targetCountry, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|assets).*)',
  ],
};
```

---

## 流程图

```
用户访问 example.com/products
            │
            ▼
    ┌───────────────────┐
    │ 检查 Cookie       │
    │ preferred_country │
    └───────────────────┘
            │
    ┌───────┴───────┐
    │               │
   有              无
    │               │
    ▼               ▼
  跳转到      ┌─────────────────┐
  Cookie     │ IP 地理定位      │
  指定国家   │ (Vercel/CF/API) │
             └─────────────────┘
                    │
                    ▼
             ┌─────────────────┐
             │ 映射到支持的国家 │
             │ CN → cn         │
             │ 其他 → us       │
             └─────────────────┘
                    │
                    ▼
             ┌─────────────────┐
             │ 显示确认弹窗    │
             │ (可选)          │
             └─────────────────┘
                    │
            ┌───────┴───────┐
            │               │
          确认            更改
            │               │
            ▼               ▼
    ┌───────────────────────────┐
    │ 设置 Cookie 并跳转/继续   │
    │ preferred_country=xx      │
    │ country_confirmed=true    │
    └───────────────────────────┘
```

---

## 第三方 IP 服务对比

| 服务 | 免费额度 | 准确度 | 延迟 | 特点 |
|------|----------|--------|------|------|
| **Vercel Geo** | 无限 (Vercel 部署) | 高 | 0ms | 内置，无需额外请求 |
| **Cloudflare** | 无限 (CF 代理) | 很高 | 0ms | 通过请求头提供 |
| **ipinfo.io** | 50k/月 | 高 | 50-100ms | 简单易用 |
| **ip-api.com** | 45 req/min | 中 | 100-200ms | 完全免费 |
| **MaxMind GeoLite2** | 无限 | 很高 | 0ms | 需本地数据库 |

---

## 总结

| 场景 | 推荐方案 |
|------|----------|
| **Vercel 部署** | 使用 `request.geo` + Cookie 记忆 |
| **Cloudflare 部署** | 使用 `cf-ipcountry` 头 + Cookie 记忆 |
| **其他平台** | 第三方 IP API (ipinfo.io) + Cookie 记忆 |
| **提升体验** | 添加确认弹窗让用户确认/更改 |
| **持久化** | Cookie 保存 1 年，回访用户直接跳转 |

## 相关文件

- `src/middleware.ts` - 路由中间件，处理地理检测和重定向
- `src/i18n/config.ts` - 国家配置和映射
- `src/components/country-detection-modal.tsx` - 国家确认弹窗
- `src/components/country-switcher.tsx` - 国家切换器（页脚/导航）
