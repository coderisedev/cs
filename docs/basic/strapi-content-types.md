# Strapi 中的 Collection Type / Single Type / Component 简述

在 Strapi 里，每种内容模型对应不同的使用场景，可以想象成数据库中的“表 + 模块”：

## 1. Collection Type（集合类型）
- **理解**：适合“可以有多条记录”的内容，类似数据库表/Excel 多条数据。
- **特点**：可以无限新增条目、分页管理、支持 relation、多语言。
- **本项目示例**：
  - `Post`（博客文章）：每篇文章是一条记录。
  - `Product Detail`（商品富内容）：每个商品（按 handle）一条记录。
  - 将来可以用来维护 FAQ 列表、活动案例库等。
- **数据库落地**：每个 collection type 会生成对应表（如 `posts`），字段包含内容字段 + Strapi 内部字段（`id`, `created_at`, `updated_at`, `published_at` 等）。relation 会通过外键或联结表落地。

## 2. Single Type（单例类型）
- **理解**：适合“全站只有一条”的内容，例如“首页英雄区”“关于我们页面”。
- **特点**：只有一条记录，Admin 中显示为“编辑”而不是“列表”。
- **本项目潜在用法**：
  - `Homepage Settings`：存放首页 Hero 文案、主视觉图片。
  - `Global SEO`：站点级别的 meta title/description。
  - `Header/Footer 配置`：集中管理导航、联系信息。
- **数据库落地**：Single type 仍会生成表（如 `homepage`），只是 Strapi Admin 限制只能存在一条记录。

## 3. Component（组件）
- **理解**：可重复使用的字段集合，类似 UI 组件或结构化片段。
- **特点**：可以放在 Collection/Single Type 中，实现组合式内容；支持 repeatable（可重复）或单个。
- **本项目示例**：
  - `SEO` 组件：meta title、meta description、OG 图等字段。
  - `Rich Block` 组件：图文模块、FAQ 列、CTA 区块等，在 `Product Detail` 的 `rich_blocks` 中 repeat 使用。
  - `Author` 组件：包含名字、头像、职位，用于 Post 的作者字段。
- **数据库落地**：component 会生成 `components_<category>_<name>` 表，被引用时通过联结表记录“某条内容用了哪个 component + 顺序”。Repeatable component 会额外存储顺序字段。

## 小结
- 当内容会有很多条，且每条独立管理 → 用 **Collection Type**。
- 当内容全站只需一条配置 → 用 **Single Type**。
- 当多个内容类型需要复用一组字段 → 抽象出 **Component**，再嵌入 Collection/Single Type。

通过这三种类型组合，就能覆盖 CMS 中绝大多数数据模型需求。我们现在的博客、产品、SEO 等都是这么搭出来的，后续新增其它内容（活动、FAQ、全局设置）也可以沿用这个思路。
