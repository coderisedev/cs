# Strapi Homepage Data Model

## Featured Product 与 Homepage Layout 关联关系

### 数据模型架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    Homepage Layout (Single Type)                 │
│                    只有一条记录，控制首页布局                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    oneToOne     ┌─────────────────────────┐   │
│  │ primaryHero  │ ───────────────►│  Featured Product #1    │   │
│  └──────────────┘                 │  (displaySize: hero)    │   │
│                                   └─────────────────────────┘   │
│                                                                  │
│  ┌──────────────┐    oneToOne     ┌─────────────────────────┐   │
│  │ secondaryHero│ ───────────────►│  Featured Product #2    │   │
│  └──────────────┘                 │  (displaySize: secondary)│   │
│                                   └─────────────────────────┘   │
│                                                                  │
│  ┌──────────────┐    oneToMany    ┌─────────────────────────┐   │
│  │ productGrid  │ ───────────────►│  Featured Product #3    │   │
│  └──────────────┘        │        │  (displaySize: tile)    │   │
│                          │        └─────────────────────────┘   │
│                          │        ┌─────────────────────────┐   │
│                          └───────►│  Featured Product #4    │   │
│                                   │  (displaySize: tile)    │   │
│                                   └─────────────────────────┘   │
│                                                                  │
│  gridColumns: cols_2 | cols_3 | cols_4                          │
│  gridLayout: grid | masonry | carousel                          │
│  isActive: boolean                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 关系类型说明

| 字段 | 关系类型 | 说明 |
|------|----------|------|
| `primaryHero` | `oneToOne` | 关联**一个** Featured Product 作为主 Hero |
| `secondaryHero` | `oneToOne` | 关联**一个** Featured Product 作为副 Hero |
| `productGrid` | `oneToMany` | 关联**多个** Featured Product 作为网格展示 |

---

## Featured Product (Collection Type)

这是一个**可复用的内容块**，包含：

```
Featured Product
├── 基础信息
│   ├── title: 标题
│   ├── subtitle: 副标题
│   ├── description: 描述
│   └── productName: 产品名称
├── 媒体资源
│   ├── heroImage: 主图
│   ├── heroVideo: 视频
│   └── mobileImage: 移动端图片
├── 样式配置
│   ├── theme: light | dark
│   ├── backgroundColor: 背景色
│   └── textColor: 文字颜色
├── 交互元素
│   ├── ctaButtons[]: 行动按钮组（最多3个）
│   └── highlights[]: 产品亮点（最多5个）
├── 展示配置
│   ├── displaySize: hero | secondary | tile（决定展示大小）
│   ├── priority: 优先级排序
│   └── isActive: 是否启用
└── 调度配置
    ├── startDate: 开始展示时间
    ├── endDate: 结束展示时间
    └── abTestVariant: A/B测试变体
```

### Schema 定义

文件位置: `apps/strapi/src/api/featured-product/content-types/featured-product/schema.json`

```json
{
    "kind": "collectionType",
    "collectionName": "featured_products",
    "info": {
        "singularName": "featured-product",
        "pluralName": "featured-products",
        "displayName": "Featured Product",
        "description": "可重用的产品展示内容，支持多种展示尺寸"
    },
    "attributes": {
        "title": { "type": "string", "required": true },
        "subtitle": { "type": "string" },
        "description": { "type": "text" },
        "productName": { "type": "string", "required": true },
        "heroImage": { "type": "media", "allowedTypes": ["images"] },
        "heroVideo": { "type": "media", "allowedTypes": ["videos"] },
        "mobileImage": { "type": "media", "allowedTypes": ["images"] },
        "theme": { "type": "enumeration", "enum": ["light", "dark"] },
        "backgroundColor": { "type": "string", "default": "#ffffff" },
        "textColor": { "type": "string", "default": "#000000" },
        "ctaButtons": { "type": "component", "component": "homepage.cta-button", "max": 3 },
        "highlights": { "type": "component", "component": "homepage.product-highlight", "max": 5 },
        "displaySize": { "type": "enumeration", "enum": ["hero", "secondary", "tile"] },
        "slug": { "type": "uid", "targetField": "title" },
        "priority": { "type": "integer", "min": 0, "max": 100, "default": 50 },
        "isActive": { "type": "boolean", "default": true },
        "startDate": { "type": "datetime" },
        "endDate": { "type": "datetime" },
        "abTestVariant": { "type": "string" },
        "seo": { "type": "component", "component": "shared.seo" }
    }
}
```

---

## Homepage Layout (Single Type)

这是一个**单例配置**，控制首页的整体布局：

文件位置: `apps/strapi/src/api/homepage-layout/content-types/homepage-layout/schema.json`

```json
{
    "kind": "singleType",
    "collectionName": "homepage_layout",
    "info": {
        "singularName": "homepage-layout",
        "pluralName": "homepage-layouts",
        "displayName": "Homepage Layout",
        "description": "管理首页的产品展示顺序和布局配置"
    },
    "attributes": {
        "primaryHero": {
            "type": "relation",
            "relation": "oneToOne",
            "target": "api::featured-product.featured-product"
        },
        "secondaryHero": {
            "type": "relation",
            "relation": "oneToOne",
            "target": "api::featured-product.featured-product"
        },
        "productGrid": {
            "type": "relation",
            "relation": "oneToMany",
            "target": "api::featured-product.featured-product"
        },
        "gridColumns": {
            "type": "enumeration",
            "enum": ["cols_2", "cols_3", "cols_4"],
            "default": "cols_2"
        },
        "gridLayout": {
            "type": "enumeration",
            "enum": ["grid", "masonry", "carousel"],
            "default": "grid"
        },
        "isActive": { "type": "boolean", "default": true },
        "effectiveDate": { "type": "datetime" },
        "expiryDate": { "type": "datetime" },
        "metadata": { "type": "json" }
    }
}
```

---

## 前端渲染流程

### 数据获取

文件位置: `apps/dji-storefront/src/lib/strapi/homepage.ts`

```typescript
export async function getHomepageLayout(): Promise<HomepageLayout | null> {
    const strapi = getStrapiClient();

    const response = await strapi.fetch<{ data: any }>('/api/homepage-layout', {
        query: {
            'populate[primaryHero][populate]': '*',
            'populate[secondaryHero][populate]': '*',
            'populate[productGrid][populate]': '*',
        },
        tags: ['homepage-layout'],
        revalidate: 60,  // ISR: 60秒缓存
    });

    return response.data;
}
```

### 页面渲染

文件位置: `apps/dji-storefront/src/app/[countryCode]/page.tsx`

```typescript
export const revalidate = 60; // ISR: 60秒重新验证

export default async function Homepage() {
    const layout = await getHomepageLayout();

    if (!layout || !layout.isActive) {
        return <FallbackUI />;
    }

    return (
        <main>
            {/* 主 Hero - 全屏展示 */}
            {layout.primaryHero && (
                <HeroSection product={layout.primaryHero} />
            )}

            {/* 副 Hero - 次要展示 */}
            {layout.secondaryHero && (
                <SecondaryHero product={layout.secondaryHero} />
            )}

            {/* 产品网格 - 多产品展示 */}
            {layout.productGrid?.length > 0 && (
                <ProductGrid
                    products={layout.productGrid}
                    columns={layout.gridColumns}
                    layout={layout.gridLayout}
                />
            )}
        </main>
    );
}
```

---

## 缓存策略

| 层级 | 策略 | TTL | 说明 |
|------|------|-----|------|
| **Vercel Edge** | ISR | 60s | 页面级缓存 |
| **Next.js fetch** | Cache + Revalidate | 60s | Strapi API 响应缓存 |
| **Strapi** | 无服务端缓存 | - | 每次请求查数据库 |

---

## 设计优势

1. **内容复用** - 同一个 Featured Product 可以在不同位置使用
2. **灵活布局** - Homepage Layout 控制展示位置和顺序
3. **独立管理** - 内容编辑和布局配置分离
4. **调度支持** - 支持定时上下架和 A/B 测试
5. **国际化** - 支持 i18n 多语言内容
