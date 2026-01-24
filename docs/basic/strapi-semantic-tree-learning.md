# 用马斯克“语义树”学习法掌握 Strapi：以本项目为例

> **核心理念 (First Principles)：**
> 为什么我们已经在用 Medusa（电商引擎）了，还需要 Strapi（内容管理系统）？
> **Medusa 擅长管“货”**（价格、库存、SKU）。
> **Strapi 擅长管“文”**（博客、关于我们、法律条款）。
> 它们是互补的。

本文将以你的 `cs` 项目为例，拆解 Strapi 的知识树。

---

## 第一层：树根 (The Root) - 为什么我们需要 Strapi？

在 Web 开发中，永远存在一组矛盾：
1.  **开发者的痛：** 不想为了改一个标题、换一张 Banner 图就去改代码、重新部署。
2.  **运营者的痛：** 想发一篇博客，不想求着程序员写 HTML。

**Strapi 的本质 (First Principle)：**
它是一个**无头 CMS (Content Management System)**。
*   **无头：** 它不负责展示（没有前端网页），只负责提供 API。
*   **管理：** 它提供一个漂亮的后台，让运营人员像填表一样输入内容。
*   **结果：** 运营填好的内容，变成 JSON 数据，供你的 Next.js 前端调用。

---

## 第二层：树干 (The Trunk) - 核心机制：类型系统

Strapi 的世界极其简单，只有两种“树干”：

### 1. Collection Types (集合类型)
*   **原理：** 这是一张**列表**。可以有无数条记录。
*   **现实映射：** 博客文章、客户评价、团队成员。
*   **特点：** API 返回的是数组 `[{ id: 1, title: ... }, { id: 2, title: ... }]`。

### 2. Single Types (单体类型)
*   **原理：** 这是一个**唯一的页面**。全站只有一份。
*   **现实映射：** 首页 Banner 配置、关于我们页面、全局 SEO 设置。
*   **特点：** API 返回的是对象 `{ title: ..., hero_image: ... }`。

---

## 第三层：树枝 (The Branches) - 本项目的关键模块

看看你的 `apps/strapi`，它在项目中扮演了什么角色？

### 树枝 1：内容结构设计 (Content Modeling)
这是使用 Strapi 的第一步。你必须先定义“数据长什么样”。
*   **Components (组件):** 这是 Strapi 最强大的功能。
    *   你可以定义一个 `Hero` 组件（包含标题、副标题、背景图）。
    *   你可以定义一个 `Feature` 组件（包含图标、描述）。
    *   然后在创建页面时，像拼乐高一样把这些组件拼起来。这叫 **Dynamic Zones**。

### 树枝 2：API 权限控制 (Roles & Permissions)
*   **原理：** 不是谁都能看所有数据的。
*   **Public Role:** 游客能看什么？（博客列表、首页配置）。
*   **Authenticated Role:** 登录用户能看什么？
*   **项目细节：** 你在 CI 里配置 `NEXT_PUBLIC_STRAPI_URL`，就是为了让前端能找到这个 API 大门。

### 树枝 3：媒体库 (Media Library)
*   **原理：** 图片、视频存在哪？
*   **功能：** Strapi 自动帮你处理图片上传、裁剪、压缩。
*   **项目细节：** 当你在 Next.js 里用 `<Image />` 组件时，图片的 `src` 往往是指向 Strapi 的地址。

---

## 第四层：树叶 (The Leaves) - 代码与集成细节

现在看具体的代码（树叶），理解它如何与 Medusa 和 Next.js 协作。

### 🍂 案例一：混合数据源 (Hybrid Data Fetching)
在你的 `dji-storefront` 首页 (`page.tsx`) 中，数据其实来自两个地方：
1.  **商品数据** -> 来自 **Medusa**。
2.  **Banner 图、营销文案** -> 来自 **Strapi**。

```typescript
// page.tsx 伪代码
export default async function Homepage() {
  // 树叶 A：从 Medusa 拿货
  const products = await medusa.products.list();
  
  // 树叶 B：从 Strapi 拿文案
  const heroContent = await strapi.find('homepage-hero');

  return (
    <div>
      <Hero data={heroContent} /> {/* 展示文案 */}
      <ProductGrid data={products} /> {/* 展示商品 */}
    </div>
  )
}
```

### 🍂 案例二：环境变量的重要性
*   还记得刚才 CI 报错吗？
*   **现象：** `next.config.js` 里有 `STRAPI_URL` 的检查。
*   **原因：** Next.js 的 `<Image />` 组件出于安全考虑，必须在 `next.config.js` 的 `images.remotePatterns` 里把 Strapi 的域名加进白名单。如果没配置这个环境变量，Next.js 就不知道该信任哪个图片服务器，所以构建会挂。

### 🍂 案例三：Rich Text (富文本)
*   **场景：** “法律条款”页面 (`terms/page.tsx`)。
*   **实现：** 这种全是文字、还带格式的页面，最适合放在 Strapi。
    *   运营在 Strapi 后台写 Markdown。
    *   Next.js 拿到 Markdown，用 `react-markdown` 渲染成 HTML。
    *   这样运营随时能改条款，不用还要发版。

---

## 总结：如何用这棵树思考架构？

当你需要添加一个新功能时，问自己：

1.  **这是结构化的业务数据吗？**（如：价格、订单状态）
    *   是 -> 放 **Medusa**。
2.  **这是展示型的内容吗？**（如：文章、广告语、图片）
    *   是 -> 放 **Strapi**。
3.  **这是个列表还是单页？**
    *   列表 -> 建 **Collection Type**。
    *   单页 -> 建 **Single Type**。

这就是 **Best of Breed（最佳组合）** 架构策略：让专业的工具做专业的事。
