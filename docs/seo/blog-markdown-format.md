# Blog Markdown 文件格式规范

本文档定义了用于导入 Strapi CMS 的 Blog 文章 Markdown 文件格式。

---

## 文件命名

```
blog-{序号}-{slug}.md
```

示例：
- `blog-01-msfs-2024-hardware-setup.md`
- `blog-02-xplane-vs-msfs-hardware.md`
- `blog-03-building-737-home-cockpit.md`

> 注意：只有以 `blog-` 开头的 `.md` 文件会被导入脚本扫描。

---

## 完整模板

```markdown
---
title: "文章标题"
slug: "article-slug"
excerpt: "文章摘要，用于列表页展示（最多 500 字符）"
author: "作者名"
category: "分类标识"
seo:
  meta_title: "SEO 标题（建议 50-60 字符）"
  meta_description: "SEO 描述（建议 150-160 字符）"
---

# 文章标题

*文章导语或简介（斜体，可选）*

---

## 第一章节

正文内容...

### 子章节

更多内容...

---

## 第二章节

...
```

---

## Frontmatter 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | 推荐 | 文章标题，最多 255 字符。缺失时从正文 H1 提取 |
| `slug` | string | 推荐 | URL 标识符，用于生成文章链接。缺失时从文件名生成 |
| `excerpt` | string | 推荐 | 摘要，用于列表页和社交分享，最多 500 字符。缺失时从正文首段提取 |
| `author` | string | 可选 | 作者名。默认值：`Cockpit Simulator Team` |
| `category` | string | 可选 | 分类标识。默认值：`guides` |
| `seo` | object | 可选 | SEO 元数据对象 |
| `seo.meta_title` | string | 可选 | SEO 标题，用于搜索结果。缺失时使用 `title` |
| `seo.meta_description` | string | 可选 | SEO 描述，用于搜索结果。缺失时使用 `excerpt` |

### 分类标识参考

| category | 说明 |
|----------|------|
| `guides` | 教程指南 |
| `news` | 新闻资讯 |
| `reviews` | 产品评测 |
| `tutorials` | 操作教程 |
| `buyer-guides` | 选购指南 |
| `user-stories` | 用户故事 |

---

## 自动回退规则

当 Frontmatter 字段缺失时，导入脚本会自动提取：

### title
从正文第一个 H1 标题提取：
```markdown
# This Will Be The Title
```

### slug
从文件名生成，移除 `blog-XX-` 前缀：
```
blog-03-building-737-home-cockpit.md → building-737-home-cockpit
```

### excerpt
按优先级提取：
1. 斜体导语：`*This is the intro text*`
2. 正文首段（跳过标题、列表、代码块）

---

## 正文 Markdown 语法

### 支持的语法

```markdown
# H1 标题（仅用于文章主标题）
## H2 标题
### H3 标题

**粗体文本**
*斜体文本*
~~删除线~~

- 无序列表项
- 无序列表项

1. 有序列表项
2. 有序列表项

> 引用块

`行内代码`

​```javascript
// 代码块
const example = true;
​```

[链接文本](https://example.com)
![图片描述](https://example.com/image.jpg)

| 表头1 | 表头2 |
|-------|-------|
| 单元格 | 单元格 |

---（分隔线）
```

### 内部链接格式

链接到其他页面时使用相对路径：

```markdown
[查看产品](/us/products)
[737 系列](/us/collections/boeing737)
[相关文章](/blog/related-article-slug)
```

---

## 示例文件

### 最小化示例

```markdown
---
title: "Quick Start Guide"
slug: "quick-start"
---

# Quick Start Guide

This is the article content...
```

### 完整示例

```markdown
---
title: "Building a Realistic 737 Home Cockpit: Complete Hardware Guide"
slug: "building-737-home-cockpit-guide"
excerpt: "Transform your flight simulation experience from a desktop setup to a professional-grade Boeing 737 cockpit. Complete guide covering hardware selection, upgrade paths, and space planning."
author: "Cockpit Simulator Team"
category: "guides"
seo:
  meta_title: "737 Home Cockpit Build Guide | MCP, EFIS, CDU Setup"
  meta_description: "Complete guide to building a Boeing 737 home cockpit. Learn hardware priorities, budget configurations from $1,500 to $8,000+, and setup tips for MSFS & X-Plane."
---

# Building a Realistic 737 Home Cockpit: Complete Hardware Guide

*Transform your flight simulation experience from a desktop setup to a professional-grade Boeing 737 cockpit with our comprehensive hardware guide.*

---

## Introduction

For flight simulation enthusiasts, there's a moment when screen-based flying just isn't enough anymore...

## Hardware Recommendations

### Tier 1: Essential Components

**MCP (Mode Control Panel)**

The MCP is where you'll spend 80% of your hands-on time during flight...

| Component | Price | Priority |
|-----------|-------|----------|
| CS 737X MCP | $999 | Essential |
| CS 737X EFIS | $459 | Essential |

---

## Conclusion

Ready to start your cockpit journey? Explore our [737 Series collection](/us/collections/boeing737).
```

---

## 导入命令

```bash
# 进入 strapi 目录
cd apps/strapi

# 预览（不实际导入）
pnpm import:md <path> --preview

# 导入单个文件
pnpm import:md ../../../docs/seo/blog-03-building-737-home-cockpit.md

# 导入目录下所有 blog-*.md 文件
pnpm import:md ../../../docs/seo
```

---

## 注意事项

1. **编码**: 文件必须使用 UTF-8 编码
2. **换行**: 使用 Unix 风格换行符 (LF)
3. **Frontmatter 格式**: YAML 语法，注意缩进使用 2 空格
4. **引号**: Frontmatter 中包含特殊字符的值需用引号包裹
5. **Slug 唯一性**: 每篇文章的 slug 必须唯一，重复 slug 会更新已有文章
