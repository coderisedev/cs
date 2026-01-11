# Blog 导入指南

本文档说明如何将 Markdown 格式的博客文章导入到 Strapi CMS。

---

## 快速开始

```bash
# 进入 strapi 目录
cd apps/strapi

# 预览（不实际导入）
pnpm import:md:api ../../../docs/seo/blog-03-xxx.md --preview

# 导入单个文件
STRAPI_API_TOKEN=<token> pnpm import:md:api ../../../docs/seo/blog-03-xxx.md

# 导入目录下所有 blog-*.md 文件
STRAPI_API_TOKEN=<token> pnpm import:md:api ../../../docs/seo
```

---

## API Token

### 生产环境 Token

```
c778fdd9101f3ffac1334594bcfce74ec8cc410b988a1a2b07f76fbedce5f25d5587f6c0692352ee021c4b8503a76fe30036487e4d99649f4850013376da9b103eb59eab94be31f4acae9d7fbfd2e71d6e655b54a9a15eb8c134e223c6ccbcc7184889e5e656f2f54c719dd4b0f650bb5feb7b875ba0636b565f688e4b79423d
```

### 创建新 Token

如需创建新的 API Token：

1. 登录 Strapi 管理后台: https://content.aidenlux.com/admin
2. 进入 **Settings > API Tokens**
3. 点击 **Create new API Token**
4. 设置权限：
   - Token name: `Blog Import`
   - Token type: `Custom`
   - Permissions:
     - **Post**: `find`, `create`, `update`
5. 保存并复制 Token

---

## 导入脚本

### 方式一：REST API 导入（推荐）

适用于任何环境，通过 HTTP API 导入。

```bash
# 设置环境变量
export STRAPI_API_TOKEN=<your-token>
export STRAPI_URL=https://content.aidenlux.com  # 可选，默认值

# 导入
cd apps/strapi
pnpm import:md:api <path-to-md>
```

### 方式二：直接数据库导入

需要在能连接数据库的环境运行（如 GCE 服务器）。

```bash
cd apps/strapi
pnpm import:md <path-to-md>
```

---

## 完整导入示例

### 单文件导入

```bash
cd apps/strapi

STRAPI_API_TOKEN=c778fdd9101f3ffac1334594bcfce74ec8cc410b988a1a2b07f76fbedce5f25d5587f6c0692352ee021c4b8503a76fe30036487e4d99649f4850013376da9b103eb59eab94be31f4acae9d7fbfd2e71d6e655b54a9a15eb8c134e223c6ccbcc7184889e5e656f2f54c719dd4b0f650bb5feb7b875ba0636b565f688e4b79423d \
pnpm import:md:api ../../../docs/seo/blog-03-building-737-home-cockpit.md
```

输出示例：
```
Scanning: /home/coderisedev/cs/docs/seo/blog-03-building-737-home-cockpit.md
Found 1 markdown file(s):

  - blog-03-building-737-home-cockpit.md

Parsing: blog-03-building-737-home-cockpit.md

--- Importing to Strapi ---
URL: https://content.aidenlux.com

  Created: building-737-home-cockpit-guide

--- Import Complete ---
  Created: 1
  Updated: 0
  Failed: 0
```

### 批量导入

```bash
cd apps/strapi

STRAPI_API_TOKEN=<token> pnpm import:md:api ../../../docs/seo
```

> 注意：只有文件名以 `blog-` 开头的 `.md` 文件会被导入。

---

## 导入后验证

### Strapi 管理后台

https://content.aidenlux.com/admin/content-manager/collection-types/api::post.post

### 前端页面

`https://prd.aidenlux.com/us/blog/<slug>`

例如：https://prd.aidenlux.com/us/blog/building-737-home-cockpit-guide

---

## 文件格式要求

参考 [blog-markdown-format.md](./blog-markdown-format.md) 了解 Markdown 文件格式规范。

### 最小化示例

```markdown
---
title: "Article Title"
slug: "article-slug"
excerpt: "Short description"
category: "guides"
---

# Article Title

Content here...
```

---

## 常见问题

### Q: 导入失败提示 "Forbidden"

A: API Token 权限不足，确保 Token 有 `posts` 的 `find`, `create`, `update` 权限。

### Q: 导入后文章未发布

A: 脚本默认会自动发布文章（设置 `publishedAt`）。如需草稿模式，修改脚本移除 `publishedAt` 字段。

### Q: 如何更新已存在的文章

A: 脚本会根据 `slug` 判断，如果 slug 已存在则更新，否则创建新文章。

### Q: 预览模式有什么用

A: 使用 `--preview` 参数可以查看解析结果而不实际导入，用于检查 frontmatter 是否正确解析。

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `apps/strapi/scripts/import-md-posts-api.js` | REST API 导入脚本 |
| `apps/strapi/scripts/import-md-posts.js` | 直接数据库导入脚本 |
| `docs/seo/blog-markdown-format.md` | Markdown 格式规范 |
| `docs/seo/seo-blog-topics-plan.md` | SEO 选题规划 |
