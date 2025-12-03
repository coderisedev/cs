# 新旧网站并存迁移方案

## 概述

本方案实现新旧网站并存运行，逐步将流量从旧 WordPress 站点迁移到新 Next.js 站点。

### 站点信息

| 项目 | 旧站点 | 新站点 |
|------|--------|--------|
| 技术栈 | WordPress | Next.js + Medusa + Strapi |
| 当前域名 | `www.cockpit-simulator.com` | `dev.aidenlux.com` (开发) |
| 目标域名 | `old.cockpit-simulator.com` | `cockpit-simulator.com` |
| 托管平台 | (当前主机) | Vercel / Railway |

---

## 第一部分：域名规划

### 1.1 迁移前后的域名结构

```
迁移前：
┌─────────────────────────────────────┐
│  www.cockpit-simulator.com          │ ← WordPress (生产)
│  cockpit-simulator.com              │ ← 重定向到 www
│  dev.aidenlux.com                   │ ← Next.js (开发)
└─────────────────────────────────────┘

迁移后（并存期）：
┌─────────────────────────────────────┐
│  cockpit-simulator.com              │ ← Next.js (新生产)
│  www.cockpit-simulator.com          │ ← 重定向到根域名
│  old.cockpit-simulator.com          │ ← WordPress (保留)
│  dev.aidenlux.com                   │ ← Next.js (开发/测试)
└─────────────────────────────────────┘

迁移完成后：
┌─────────────────────────────────────┐
│  cockpit-simulator.com              │ ← Next.js (生产)
│  www.cockpit-simulator.com          │ ← 重定向到根域名
│  old.cockpit-simulator.com          │ ← 关闭或归档
└─────────────────────────────────────┘
```

### 1.2 DNS 配置计划

**阶段 1：准备（迁移前）**

```
# 当前 DNS 记录
cockpit-simulator.com       A      <WordPress 服务器 IP>
www.cockpit-simulator.com   CNAME  cockpit-simulator.com
```

**阶段 2：并存期**

```
# 新 DNS 记录
cockpit-simulator.com       CNAME  cname.vercel-dns.com       # 新站点
www.cockpit-simulator.com   CNAME  cockpit-simulator.com      # 重定向到根域名
old.cockpit-simulator.com   A      <WordPress 服务器 IP>      # 旧站点保留
```

---

## 第二部分：迁移阶段规划

### 阶段概览

| 阶段 | 时长 | 目标 | 风险等级 |
|------|------|------|----------|
| 阶段 0：准备 | 1-2 周 | 环境准备、测试 | 低 |
| 阶段 1：软启动 | 1-2 周 | 新站上线，旧站保留 | 中 |
| 阶段 2：流量切换 | 2-4 周 | 逐步迁移流量 | 中 |
| 阶段 3：监控稳定 | 2-4 周 | 监控、修复问题 | 低 |
| 阶段 4：完全迁移 | 1 周 | 关闭旧站 | 低 |

---

### 阶段 0：准备工作（迁移前 1-2 周）

#### 0.1 新站点完成清单

- [ ] 所有页面功能完成
- [ ] 产品数据从 WordPress 迁移到 Medusa
- [ ] 内容数据从 WordPress 迁移到 Strapi
- [ ] SEO 元数据配置完成
- [ ] 支付网关配置完成
- [ ] 邮件通知配置完成
- [ ] 性能优化完成
- [ ] 移动端适配完成

#### 0.2 URL 映射表

创建旧站点到新站点的 URL 映射，用于 301 重定向：

```typescript
// src/lib/url-redirects.ts

export const urlRedirects: Record<string, string> = {
  // 产品页面
  '/product/a320-fcu': '/us/products/a320-fcu',
  '/product/737-mcp': '/us/products/737-mcp',
  '/product-category/airbus': '/us/collections/airbus',
  '/product-category/boeing': '/us/collections/boeing',

  // 内容页面
  '/about': '/us/about',
  '/contact': '/us/contact',
  '/blog': '/us/blog',
  '/faq': '/us/faq',

  // WooCommerce 特定
  '/cart': '/us/cart',
  '/checkout': '/us/checkout',
  '/my-account': '/us/account',
  '/shop': '/us/products',

  // WordPress 常见路径
  '/wp-admin': 'https://old.cockpit-simulator.com/wp-admin',
  '/wp-login.php': 'https://old.cockpit-simulator.com/wp-login.php',
};
```

#### 0.3 备份旧站点

```bash
# WordPress 完整备份
# 1. 数据库备份
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# 2. 文件备份
tar -czvf wordpress_backup_$(date +%Y%m%d).tar.gz /var/www/html/

# 3. 上传到安全存储
aws s3 cp backup_*.sql s3://your-backup-bucket/
aws s3 cp wordpress_backup_*.tar.gz s3://your-backup-bucket/
```

#### 0.4 设置旧站点子域名

在 WordPress 主机上配置 `old.cockpit-simulator.com`：

```apache
# Apache (.htaccess 或 vhost 配置)
<VirtualHost *:443>
    ServerName old.cockpit-simulator.com
    DocumentRoot /var/www/html/wordpress

    # SSL 配置
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem
</VirtualHost>
```

```nginx
# Nginx 配置
server {
    listen 443 ssl;
    server_name old.cockpit-simulator.com;
    root /var/www/html/wordpress;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # WordPress 配置
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
}
```

---

### 阶段 1：软启动（第 1-2 周）

#### 1.1 Vercel 部署配置

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "hkg1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "index, follow"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/product/:slug",
      "destination": "/us/products/:slug",
      "permanent": true
    },
    {
      "source": "/product-category/:slug",
      "destination": "/us/collections/:slug",
      "permanent": true
    },
    {
      "source": "/shop",
      "destination": "/us/products",
      "permanent": true
    },
    {
      "source": "/cart",
      "destination": "/us/cart",
      "permanent": true
    },
    {
      "source": "/checkout",
      "destination": "/us/checkout",
      "permanent": true
    },
    {
      "source": "/my-account",
      "destination": "/us/account",
      "permanent": true
    },
    {
      "source": "/my-account/:path*",
      "destination": "/us/account/:path*",
      "permanent": true
    },
    {
      "source": "/wp-admin",
      "destination": "https://old.cockpit-simulator.com/wp-admin",
      "permanent": false
    },
    {
      "source": "/wp-admin/:path*",
      "destination": "https://old.cockpit-simulator.com/wp-admin/:path*",
      "permanent": false
    },
    {
      "source": "/wp-login.php",
      "destination": "https://old.cockpit-simulator.com/wp-login.php",
      "permanent": false
    }
  ]
}
```

#### 1.2 添加域名到 Vercel

```bash
# Vercel CLI
vercel domains add cockpit-simulator.com
vercel domains add www.cockpit-simulator.com

# 验证域名所有权（按 Vercel 提示添加 DNS 记录）
```

#### 1.3 更新 Next.js 配置

```typescript
// next.config.ts

const nextConfig: NextConfig = {
  // ... 现有配置

  async redirects() {
    return [
      // www 重定向到根域名
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.cockpit-simulator.com' }],
        destination: 'https://cockpit-simulator.com/:path*',
        permanent: true,
      },
      // WordPress 旧路径重定向
      {
        source: '/product/:slug',
        destination: '/us/products/:slug',
        permanent: true,
      },
      {
        source: '/product-category/:slug',
        destination: '/us/collections/:slug',
        permanent: true,
      },
      // 更多重定向...
    ];
  },
};
```

#### 1.4 DNS 切换

**关键步骤 - 需要在低流量时段执行**

```
# 步骤 1：降低 TTL（提前 24-48 小时）
cockpit-simulator.com   A   <旧IP>   TTL: 300  (5分钟)

# 步骤 2：添加新站点子域名验证
_vercel.cockpit-simulator.com  TXT  "vc-domain-verify=xxx"

# 步骤 3：切换主域名
cockpit-simulator.com   CNAME  cname.vercel-dns.com  TTL: 300

# 步骤 4：添加旧站点子域名
old.cockpit-simulator.com  A  <旧WordPress IP>  TTL: 3600
```

#### 1.5 通知横幅（可选）

在新站点添加通知横幅，告知用户正在使用新版网站：

```typescript
// src/components/migration-banner.tsx

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Cookies from 'js-cookie';

export function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    return !Cookies.get('migration_banner_dismissed');
  });

  const handleDismiss = () => {
    Cookies.set('migration_banner_dismissed', 'true', { expires: 30 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-blue-600 text-white py-2 px-4 text-center relative">
      <p className="text-sm">
        🎉 Welcome to our new website!
        <a
          href="https://old.cockpit-simulator.com"
          className="underline ml-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit old site
        </a>
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
```

---

### 阶段 2：流量切换与监控（第 3-6 周）

#### 2.1 监控指标

设置以下监控：

**性能监控**
- 页面加载时间 (Core Web Vitals)
- 服务器响应时间
- 错误率

**业务监控**
- 访问量对比（新站 vs 旧站历史数据）
- 转化率
- 购物车放弃率
- 结账成功率

**SEO 监控**
- Google Search Console 索引状态
- 关键词排名变化
- 404 错误

#### 2.2 Vercel Analytics 配置

```typescript
// src/app/layout.tsx

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### 2.3 Google Analytics 双重跟踪

在迁移期间同时跟踪新旧站点：

```typescript
// src/components/analytics.tsx

'use client';

import Script from 'next/script';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              'dimension1': 'site_version'
            }
          });
          gtag('set', {'site_version': 'new'});
        `}
      </Script>
    </>
  );
}
```

#### 2.4 处理 404 和遗漏的重定向

创建自定义 404 页面，记录缺失的重定向：

```typescript
// src/app/not-found.tsx

import Link from 'next/link';
import { headers } from 'next/headers';

export default async function NotFound() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // 记录 404 到日志服务（用于分析缺失的重定向）
  if (process.env.NODE_ENV === 'production') {
    // 发送到日志服务
    fetch('/api/log-404', {
      method: 'POST',
      body: JSON.stringify({ pathname, timestamp: new Date().toISOString() }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Link href="/us" className="text-blue-600 underline">
            Go to Homepage
          </Link>
          <a
            href={`https://old.cockpit-simulator.com${pathname}`}
            className="text-gray-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Try old website
          </a>
        </div>
      </div>
    </div>
  );
}
```

#### 2.5 SEO 迁移检查清单

- [ ] 提交新 sitemap 到 Google Search Console
- [ ] 验证 301 重定向正常工作
- [ ] 检查 canonical 标签
- [ ] 更新 robots.txt
- [ ] 监控索引状态

```typescript
// src/app/sitemap.ts

import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cockpit-simulator.com';

  // 静态页面
  const staticPages = [
    '',
    '/us',
    '/us/products',
    '/us/blog',
    '/us/faq',
    '/us/about',
    '/us/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' || route === '/us' ? 1 : 0.8,
  }));

  // 动态产品页面（从 Medusa 获取）
  // const products = await getProducts();
  // const productPages = products.map(...);

  return [...staticPages];
}
```

```
// public/robots.txt

User-agent: *
Allow: /

Sitemap: https://cockpit-simulator.com/sitemap.xml
```

---

### 阶段 3：稳定期（第 7-10 周）

#### 3.1 问题处理流程

```
发现问题
    │
    ▼
┌─────────────┐
│ 问题分类    │
└─────────────┘
    │
    ├── 紧急（影响购买）→ 立即修复 + 考虑临时回退到旧站
    │
    ├── 重要（功能缺失）→ 24小时内修复
    │
    └── 一般（UI/体验）→ 排入迭代
```

#### 3.2 回退方案

如果出现严重问题，可以快速回退：

```bash
# DNS 回退（5分钟生效，因为 TTL=300）
cockpit-simulator.com   A   <旧WordPress IP>

# 或者在 Vercel 配置临时重定向
# vercel.json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://old.cockpit-simulator.com/:path*",
      "permanent": false
    }
  ]
}
```

#### 3.3 用户反馈收集

```typescript
// src/components/feedback-widget.tsx

'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await fetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        type: formData.get('type'),
        message: formData.get('message'),
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    });

    setIsOpen(false);
    alert('Thank you for your feedback!');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl p-4 w-80">
          <h3 className="font-bold mb-2">Send Feedback</h3>
          <form onSubmit={handleSubmit}>
            <select name="type" className="w-full mb-2 p-2 border rounded">
              <option value="bug">Bug Report</option>
              <option value="suggestion">Suggestion</option>
              <option value="missing">Missing Feature</option>
            </select>
            <textarea
              name="message"
              className="w-full p-2 border rounded mb-2"
              rows={3}
              placeholder="Describe your feedback..."
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Send
              </button>
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
          aria-label="Send Feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
```

---

### 阶段 4：完全迁移（第 11-12 周）

#### 4.1 关闭旧站点前检查

- [ ] 新站点运行稳定超过 2 周
- [ ] 无重大 bug 报告
- [ ] SEO 指标恢复或提升
- [ ] 销售数据正常
- [ ] 用户反馈积极

#### 4.2 旧站点处理选项

**选项 A：完全关闭**

```bash
# 关闭 WordPress 服务器
# 保留备份至少 6 个月
```

**选项 B：只读归档**

```nginx
# Nginx 配置 - 只读模式
server {
    listen 443 ssl;
    server_name old.cockpit-simulator.com;

    # 禁用所有写操作
    location ~* (wp-admin|wp-login|wp-comments-post) {
        return 301 https://cockpit-simulator.com;
    }

    # 添加归档提示
    sub_filter '</head>' '<style>.archive-banner{background:yellow;padding:10px;text-align:center;}</style><script>document.body.insertAdjacentHTML("afterbegin","<div class=archive-banner>This is an archived version. <a href=https://cockpit-simulator.com>Visit new site</a></div>");</script></head>';
    sub_filter_once on;
}
```

**选项 C：重定向所有流量**

```nginx
server {
    listen 443 ssl;
    server_name old.cockpit-simulator.com;
    return 301 https://cockpit-simulator.com$request_uri;
}
```

#### 4.3 最终 DNS 配置

```
cockpit-simulator.com       CNAME  cname.vercel-dns.com   TTL: 3600
www.cockpit-simulator.com   CNAME  cockpit-simulator.com  TTL: 3600
old.cockpit-simulator.com   A      <归档服务器IP>         TTL: 3600
```

---

## 第三部分：特殊场景处理

### 3.1 订单数据迁移

**不迁移历史订单到 Medusa**，而是：

1. 旧订单继续在 WordPress/WooCommerce 查看
2. 提供链接让用户访问旧站查看历史订单
3. 新订单在 Medusa 中创建

```typescript
// src/app/[countryCode]/account/orders/page.tsx

export default function OrdersPage() {
  return (
    <div>
      <h1>My Orders</h1>

      {/* 新订单列表 */}
      <OrderList />

      {/* 旧订单提示 */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p>
          Looking for orders placed before January 2025?
          <a
            href="https://old.cockpit-simulator.com/my-account/orders"
            className="text-blue-600 underline ml-1"
            target="_blank"
          >
            View on previous website
          </a>
        </p>
      </div>
    </div>
  );
}
```

### 3.2 用户账户处理

**方案 A：不迁移用户（推荐）**

- 新用户在新站注册
- 旧用户首次访问需重新注册
- 提供"关联旧账户"功能（可选）

**方案 B：批量迁移用户**

```typescript
// scripts/migrate-users.ts
// 从 WordPress 导出用户，导入到 Medusa

import { createMedusaClient } from '@medusajs/js-sdk';

async function migrateUsers(wpUsers: WPUser[]) {
  const medusa = createMedusaClient({ baseUrl: process.env.MEDUSA_URL });

  for (const user of wpUsers) {
    await medusa.admin.customers.create({
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      // 不迁移密码，用户需要重置
    });
  }
}
```

### 3.3 SEO 保护措施

#### 保留 URL 结构

```typescript
// 尽量保持 URL slug 一致
// WordPress: /product/a320-fcu
// Next.js:   /us/products/a320-fcu  (通过 301 重定向)
```

#### 提交变更到 Google

```typescript
// 在 Google Search Console 中：
// 1. 添加新站点属性
// 2. 提交新 sitemap
// 3. 使用"更改地址"工具（如果域名完全不同）
// 4. 监控索引状态
```

#### 保留旧站点 sitemap 重定向

```typescript
// vercel.json
{
  "redirects": [
    {
      "source": "/sitemap.xml",
      "destination": "/sitemap.xml",
      "permanent": true
    },
    {
      "source": "/sitemap_index.xml",
      "destination": "/sitemap.xml",
      "permanent": true
    }
  ]
}
```

---

## 第四部分：时间线总结

```
Week 0-2:  准备阶段
           ├── 完成新站点开发
           ├── 数据迁移
           ├── 创建 URL 重定向映射
           └── 备份旧站点

Week 3-4:  软启动
           ├── 配置 old.cockpit-simulator.com
           ├── 部署新站点到 Vercel
           ├── DNS 切换
           └── 添加迁移提示横幅

Week 5-8:  流量切换
           ├── 监控性能和转化率
           ├── 收集用户反馈
           ├── 修复重定向遗漏
           └── SEO 监控

Week 9-10: 稳定期
           ├── 持续监控
           ├── 处理反馈
           └── 优化体验

Week 11-12: 完全迁移
           ├── 评估是否关闭旧站
           ├── 移除迁移提示
           └── 旧站归档/关闭
```

---

## 第五部分：检查清单

### 迁移前

- [ ] 新站点所有功能测试通过
- [ ] 产品数据完整迁移
- [ ] 支付网关测试通过
- [ ] SSL 证书配置完成
- [ ] URL 重定向列表完成
- [ ] 旧站点完整备份
- [ ] DNS TTL 降低到 5 分钟
- [ ] 团队成员了解回退方案

### 迁移中

- [ ] DNS 切换执行
- [ ] 验证新站点可访问
- [ ] 验证旧站点子域名可访问
- [ ] 验证重定向正常工作
- [ ] 监控错误日志
- [ ] 测试完整购买流程

### 迁移后

- [ ] 24 小时监控无重大问题
- [ ] Google Search Console 无异常
- [ ] 销售数据正常
- [ ] 用户反馈收集
- [ ] 性能指标达标
- [ ] 1 周后恢复 DNS TTL

---

## 相关文件

- `vercel.json` - Vercel 部署配置和重定向规则
- `next.config.ts` - Next.js 重定向配置
- `src/lib/url-redirects.ts` - URL 映射表
- `src/app/not-found.tsx` - 404 页面
- `src/app/sitemap.ts` - 站点地图
- `public/robots.txt` - 搜索引擎爬虫配置
