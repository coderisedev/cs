# CTO Q&A: Super AI Agent 与多模板支持

> **Date:** 2026-01-24
> **Context:** 确认 Row-Level Tenancy 架构的长期扩展能力

---

## Q1: 统一数据库做 Super AI 购物 Agent 是否容易？

**结论：极其容易。统一数据库是实现跨店 AI Agent 的最大架构优势。**

### 实现方式

跨店搜索在这个架构下就是一条 SQL：

```sql
-- 普通租户查询（RLS 自动加 WHERE tenant_id = X）
SELECT * FROM products WHERE status = 'published'
-- 实际执行：... AND tenant_id = '当前用户的店铺'

-- Super Agent 查询（使用 service_role key 绕过 RLS）
SELECT * FROM products WHERE status = 'published'
-- 实际执行：全量扫描所有店铺的商品
```

### 架构对比

| 操作 | Row-Level (当前方案) | Schema/DB 隔离 |
|------|---------------------|---------------|
| "搜适合露营的椅子" | 1 次向量查询 | N 次查询 + 结果合并 |
| 全局热销排行 | `GROUP BY tenant_id ORDER BY sales` | 跨库聚合，极复杂 |
| 训练推荐模型 | 直接读同一张表 | ETL 抽取 N 个源 |

pgvector 的语义搜索也是同理——所有商品的 embedding 在同一张表里，一次 `ORDER BY embedding <=> query_vector` 就能跨全平台检索。

---

## Q2: 不同店铺能否使用不同的前端模板？

**结论：完全支持。通过 `tenants.settings` 存储主题配置，前端动态选择模板组件渲染。**

### 数据模型

```sql
-- tenants.settings 中存储主题选择
{
  "theme": {
    "template": "minimal",        -- 模板 ID
    "primaryColor": "#1a1a1a",
    "fontFamily": "Inter",
    "logoUrl": "https://...",
    "bannerUrl": "https://...",
    "layout": "grid"              -- grid | list | magazine
  }
}
```

### 模板系统目录结构

```
components/
└── templates/
    ├── minimal/          # 极简风（适合设计师品牌）
    │   ├── StorePage.tsx
    │   ├── ProductCard.tsx
    │   └── ProductDetail.tsx
    ├── luxury/           # 高端风（适合珠宝/时装）
    │   ├── StorePage.tsx
    │   ├── ProductCard.tsx
    │   └── ProductDetail.tsx
    ├── industrial/       # 工业风（适合机械/户外）
    │   ├── StorePage.tsx
    │   ├── ProductCard.tsx
    │   └── ProductDetail.tsx
    └── types.ts          # 统一的 Props 接口
```

### 路由层动态加载

```typescript
// app/store/[slug]/page.tsx
import { getTenant } from '@/lib/tenants'

export default async function StorePage({ params }: { params: { slug: string } }) {
  const tenant = await getTenant(params.slug)
  const template = tenant.settings.theme?.template ?? 'minimal'

  // 动态加载对应模板组件
  const { StorePage } = await import(`@/components/templates/${template}/StorePage`)

  return <StorePage tenant={tenant} />
}
```

### 统一接口约束

```typescript
// components/templates/types.ts
export interface TemplateProps {
  tenant: Tenant
  products: Product[]
  categories: Category[]
}

// 所有模板必须实现相同的 Props 接口
// 数据获取逻辑统一，只有渲染层不同
```

### 商业化分层

| Plan | 模板权限 |
|------|---------|
| Free | 1 个默认模板 (minimal) |
| Pro | 全部官方模板 + 颜色/字体自定义 |
| Enterprise | 自定义模板上传（React 组件包） |

---

## 总结：架构三大长期优势

1. **Medusa 升级免费享** — 不 fork，站在主干上
2. **Super Agent 零成本** — 统一数据库，跨店检索就是去掉 WHERE 条件
3. **模板差异化** — 同一套数据，不同渲染层，模板本身还能作为付费点

这三个加在一起，就是 Shopify 的 "Themes + App Store + 数据孤岛" 模式的降维替代。
