# CTO Q&A: Strapi 多租户可行性分析

> **Date:** 2026-01-24
> **Context:** 确认 CMS 层在多租户架构中的正确定位

---

## Q: Strapi 可以像 Medusa 一样做多租户共享实例吗？

**结论：不适合。Strapi 缺乏多租户原生支持，租户内容应直接用 Supabase 承载。**

### Medusa vs Strapi 多租户对比

| 维度 | Medusa | Strapi |
|------|--------|--------|
| 多租户支持 | 可通过 middleware 加 tenant_id 过滤 | 无原生支持，无法按租户隔离 |
| Content Types | 按 API 定义，数据层隔离容易 | 全局定义，所有租户共享同一 schema |
| Admin Panel | Headless，前端自己做 | 自带 Admin UI，不支持租户切换 |
| 权限模型 | API-level，可扩展 | Role-based，不支持 tenant-scoped |
| 水平扩展 | 无状态，多实例 + LB | 可以多实例，但 Admin 有状态 |

### 核心问题

Strapi 的 Content Type 是应用级的，不是租户级的。没办法让 Store A 有 "Blog" 类型而 Store B 没有。所有租户共享相同的内容结构定义。

---

## 替代方案：Supabase 直接承载租户内容

### 数据模型

```sql
-- 店铺内容表（和 products 一样用 tenant_id 隔离 + RLS）
CREATE TABLE tenant_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  type text NOT NULL CHECK (type IN ('blog', 'page', 'faq', 'announcement')),
  title text NOT NULL,
  slug text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',  -- 富文本用 TipTap/BlockNote JSON
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, type, slug)
);

-- RLS：和 products 一样的策略
ALTER TABLE tenant_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members manage own pages" ON tenant_pages FOR ALL
  USING (tenant_id IN (
    SELECT tenant_id FROM tenant_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'editor')
  ));
```

### 内容编辑器

在 Next.js 管理后台内嵌富文本编辑器（TipTap 或 BlockNote），不需要独立 CMS：

```
/store/[slug]/admin/content/         # 内容列表
/store/[slug]/admin/content/new      # 新建文章
/store/[slug]/admin/content/[id]     # 编辑文章
```

### AI 内容生成对接

```typescript
// AI 生成博客文章，直接写入 tenant_pages
const blogContent = await generateBlogPost(product, locale)

await supabase.from('tenant_pages').insert({
  tenant_id: tenant.id,
  type: 'blog',
  title: blogContent.title,
  slug: slugify(blogContent.title),
  content: blogContent.blocks,  // TipTap JSON 格式
  status: 'draft',  // AI 生成后人工审核再发布
})
```

---

## Strapi 的正确定位

如果未来需要 Strapi，它只服务于平台级内容，不参与租户数据：

```
Strapi（单实例）→ lumora.shop 官网内容（博客、帮助中心、Changelog）
Supabase      → 租户内容（店铺博客、产品指南、FAQ）
Medusa        → 商品/订单/支付
```

---

## 架构收益

去掉 Strapi 这一层后：

1. **统一隔离模型** — 租户内容与商品数据使用相同的 RLS 策略，无需维护两套权限
2. **AI 管道一致** — 生成文章和生成商品描述走同一条路径（AI → Supabase）
3. **减少服务依赖** — 少一个需要部署、升级、监控的服务
4. **成本降低** — 无需 Strapi 的计算资源和独立数据库
5. **编辑体验可控** — 内嵌编辑器的 UX 可以针对电商场景深度定制
