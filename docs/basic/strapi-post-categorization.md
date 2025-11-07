# Strapi Post 分类与标签指南

Strapi 的 `Post` 集合需要分类（Category）和标签（Tag）时，不需要写自定义插件，只要通过 Content-Type Builder 添加 Relation 或 Component 即可。以下模式可自由组合。

## 分类（Categories）
1. **新建 Category collection type**
   - 字段示例：`name` (Text)、`slug` (UID)、`description`、`cover_image`。
2. **在 Post 上添加 Relation 字段** ➜ *Post → Category*
   - **Single category**："Many-to-one"（Post belongs to 1 Category）。字段命名 `category`。
   - **Multiple categories**："Many-to-many"（Post 可属于多个 Category）。字段命名 `categories`。
3. 保存并允许 Strapi 重启；Content Manager 中就能选择分类，API 请求 `/api/posts?populate=category`（或 `categories`）即可拿到分类数据。

## 标签（Tags）
1. **新建 Tag collection type**（字段：`name`, `slug`）。
2. **在 Post 上添加 Relation 字段** ➜ *Post → Tag*
   - 通常使用 "Many-to-many"，方便多标签选择。
3. 另一种做法是创建一个 `tag` Component（含 `name`, `slug`），在 Post 中添加 "Repeatable Component" 字段，这样标签直接嵌在 Post 里。

## API 使用
- REST：`GET /api/posts?populate=categories,tags` 返回关联数据；也可通过 `filters[categories][slug][$eq]=story` 做筛选。
- GraphQL：在 Query 中请求 `posts { data { attributes { categories { data { attributes { name slug } } } } } }`。

## 前端映射（示例）
在 Next.js 数据层 (`StrapiPostAttributes`) 中加入：
```ts
categories?: StrapiRelation<{ name: string; slug: string }>
tags?: StrapiRelation<{ name: string; slug: string }>
```
然后在 `mapStrapiPost` 中展开 `attributes.categories?.data` 和 `attributes.tags?.data`。

这样列表页/详情页就能直接展示 `category.name`、`tag.slug`，并用 slug 做筛选、聚合。
