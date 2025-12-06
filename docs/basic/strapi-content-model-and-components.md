# Strapi 内容模型与组件的关系

本文档基于 `product_details` 内容类型的数据导入案例，解释 Strapi 自定义内容模型和组件的关系。

## 核心概念

组件（Component）是 Strapi 中可复用的字段集合，可以被多个内容类型（Content Type）引用。每个组件在数据库中有自己独立的表。

```
┌─────────────────────────────────────────────────────────────────┐
│                    Content Type (内容类型)                        │
│                      product_details                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  基础字段: id, title, handle, overview, tagline...          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  组件字段 (可复用):                                          │ │
│  │  - feature_bullets    → product.feature-bullet (repeatable) │ │
│  │  - content_sections   → product.content-section (repeatable)│ │
│  │  - spec_groups        → product.spec-group (repeatable)     │ │
│  │  - package_contents   → product.package-item (repeatable)   │ │
│  │  - seo                → shared.seo (single)                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 数据库表结构

每个组件有自己独立的表，通过中间关联表（`*_cmps`）连接到内容类型：

```
┌──────────────────────┐
│   product_details    │  ← 主表 (Content Type)
│──────────────────────│
│ id: 22               │
│ title: "CS-320A MCDU"│
│ handle: "cs-320a-mcdu│
│ tagline: "..."       │
│ overview: "..."      │
└──────────┬───────────┘
           │
           │ 通过 product_details_cmps 关联
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    product_details_cmps                       │  ← 关联表
│──────────────────────────────────────────────────────────────│
│ id │ entity_id │ cmp_id │ component_type           │ field   │
│────│───────────│────────│──────────────────────────│─────────│
│519 │    22     │   89   │ product.feature-bullet   │feature_ │
│520 │    22     │   90   │ product.feature-bullet   │bullets  │
│527 │    22     │   31   │ product.content-section  │content_ │
│530 │    22     │   53   │ product.spec-group       │sections │
│535 │    22     │   56   │ product.package-item     │package_ │
│540 │    22     │   58   │ shared.seo               │seo      │
└──────────────────────────────────────────────────────────────┘
           │
           │ cmp_id 指向各组件表
           ▼
┌─────────────────────────────────────┐  ┌─────────────────────────────────┐
│ components_product_feature_bullets  │  │ components_product_spec_groups  │
│─────────────────────────────────────│  │─────────────────────────────────│
│ id: 89                              │  │ id: 53                          │
│ heading: "CNC Aluminum Shell"       │  │ group_name: "Physical"          │
│ body: "Full metal construction..."  │  │                                 │
└─────────────────────────────────────┘  └────────────────┬────────────────┘
                                                          │
┌─────────────────────────────────────┐                   │ 嵌套组件
│ components_product_content_sections │                   ▼
│─────────────────────────────────────│  ┌─────────────────────────────────────┐
│ id: 31                              │  │ components_product_spec_groups_cmps │
│ heading: "Design Philosophy"        │  │─────────────────────────────────────│
│ body: "<p>We designed..."           │  │ entity_id: 53 (spec_group)          │
│ media_position: "left"              │  │ cmp_id: 265   (spec_item)           │
└─────────────────────────────────────┘  └────────────────┬────────────────────┘
                                                          │
┌─────────────────────────────────────┐                   ▼
│ components_shared_seo               │  ┌─────────────────────────────────┐
│─────────────────────────────────────│  │ components_product_spec_items   │
│ id: 58                              │  │─────────────────────────────────│
│ meta_title: "CS-320A MCDU..."       │  │ id: 265                         │
│ meta_description: "..."             │  │ label: "Dimensions"             │
│ canonical_url: "..."                │  │ value: "200 x 150 x 80mm"       │
└─────────────────────────────────────┘  └─────────────────────────────────┘
```

## 数据链路查询示例

以 CS-320A MCDU (id=22) 为例：

```sql
-- Step 1: 查询主表
SELECT id, title, handle FROM product_details WHERE id = 22;
-- → id=22, title="CS-320A MCDU", handle="cs-320a-mcdu"

-- Step 2: 查询关联表 (找到所有关联的组件)
SELECT * FROM product_details_cmps WHERE entity_id = 22;
-- → 22 条记录，指向不同的组件表

-- Step 3: 各组件表数据分布
-- feature_bullets: 8 条
-- content_sections: 3 条
-- spec_groups: 5 条 (每个内部还嵌套 spec_items)
-- package_contents: 5 条
-- seo: 1 条
```

## 组件的复用性

同一个组件可以被多个内容类型使用：

```
                    ┌─────────────────┐
                    │   shared.seo    │  ← 通用 SEO 组件
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│product_details│   │     posts     │   │ homepage_layout│
│   (产品详情)   │   │   (博客文章)   │   │   (首页布局)   │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Schema 定义示例

`apps/strapi/src/api/product-detail/content-types/product-detail/schema.json`:

```json
{
  "kind": "collectionType",
  "collectionName": "product_details",
  "attributes": {
    "title": { "type": "string" },
    "handle": { "type": "uid" },

    // 可重复组件 (一对多)
    "feature_bullets": {
      "type": "component",
      "repeatable": true,           // ← 可以添加多个
      "component": "product.feature-bullet",
      "max": 20
    },

    // 单一组件 (一对一)
    "seo": {
      "type": "component",
      "repeatable": false,          // ← 只能有一个
      "component": "shared.seo"
    }
  }
}
```

## 嵌套组件

Strapi 支持组件内部嵌套其他组件：

```
product.spec-group (规格组)
    │
    └── specs: product.spec-item[] (规格项)
            │
            ├── label: "尺寸"
            └── value: "200 x 150 x 80mm"
```

数据库表现为两层关联：

```
product_details_cmps          → components_product_spec_groups
                                         │
components_product_spec_groups_cmps → components_product_spec_items
```

## 数据导入顺序

因为有外键约束，导入顺序很重要：

```
1. 底层组件表 (无依赖)
   ├── components_product_spec_items
   ├── components_product_feature_bullets
   ├── components_product_content_sections
   ├── components_product_package_items
   └── components_shared_seo

2. 嵌套组件关联表
   └── components_product_spec_groups_cmps  (依赖 spec_items)

3. 中层组件表
   └── components_product_spec_groups       (被 spec_groups_cmps 引用)

4. 主内容表
   └── product_details

5. 主关联表 (最后)
   └── product_details_cmps                 (依赖 product_details 和所有组件)
```

## 概念总结

| 概念 | 数据库表 | 说明 |
|-----|---------|-----|
| Content Type | `product_details` | 主表，存储基础字段 |
| Component | `components_product_*` | 独立表，可被多个内容类型复用 |
| 关联表 | `*_cmps` | 连接主表和组件表 |
| Repeatable | 关联表多条记录 | 一个实体可关联多个同类组件 |
| Single | 关联表一条记录 | 一个实体只关联一个组件 |
| 嵌套组件 | 两层 `*_cmps` | 组件内部再嵌套组件 |

## 设计优势

- **复用性**：`shared.seo` 可以用于产品、文章、页面等多种内容类型
- **灵活性**：组件可以独立修改，不影响主表结构
- **可扩展**：新增字段只需修改组件定义
- **数据隔离**：不同类型的数据存储在不同表中，便于维护

## 相关文件

- Content Type Schema: `apps/strapi/src/api/product-detail/content-types/product-detail/schema.json`
- Component Schemas: `apps/strapi/src/components/product/*.json`
- Shared Components: `apps/strapi/src/components/shared/*.json`
