# 多租户前端部署策略：单 Vercel vs 多 Vercel

## 问题

采用 Medusa 多租户架构后，前端为了支持不同模板，应该使用一个 Vercel 部署还是多个 Vercel 部署？

## 方案对比

| | 单 Vercel (推荐) | 多 Vercel |
|---|---|---|
| **路由** | `[tenant_slug]/` 动态路由 | 每个租户独立项目 |
| **模板切换** | 组件级 template system | 完全独立代码库 |
| **自定义域名** | Vercel Domain Mapping | 每个项目绑定域名 |
| **维护成本** | 低，一次部署全部生效 | 高，N 个项目需独立维护 |
| **部署隔离** | 共享，一个 bug 影响所有 | 完全隔离 |
| **费用** | 1 个 Pro plan | N 个 Pro plan |
| **深度定制能力** | 中等（组件/主题级） | 极高（代码级） |

## 推荐：单 Vercel + Template System

与后端 "单实例多租户" 的设计理念一致：

```
apps/lumora-storefront/
├── src/app/[tenant_slug]/         # 动态路由
│   ├── layout.tsx                 # 根据 tenant.settings.template 选择布局
│   ├── page.tsx                   # 首页
│   └── products/[handle]/page.tsx
├── src/templates/
│   ├── default/                   # 默认模板组件集
│   ├── minimal/                   # 极简模板
│   └── premium/                   # 高级模板
└── src/lib/tenant.ts              # 获取 tenant 配置 + 模板映射
```

### 模板选择逻辑

```typescript
// layout.tsx
const tenant = await getTenantBySlug(params.tenant_slug)
const Template = templates[tenant.settings.template || "default"]
return <Template.Layout>{children}</Template.Layout>
```

### 自定义域名支持

通过 Vercel 的 Domain Mapping + Next.js middleware 解析：

```typescript
// middleware.ts
const hostname = req.headers.get("host")
const tenant = await resolveTenantByDomain(hostname)
// 重写到 /[tenant_slug]/... 路径
```

## 什么时候才需要多 Vercel？

只有当租户需要**完全不同的技术栈或页面结构**时才考虑——比如某个租户要 Vue，另一个要 React。如果差异仅在于：

- 颜色/字体/Logo → CSS 变量 / Tailwind theme
- 布局结构 → 组件级模板
- 功能模块开关 → tenant.settings 配置

这些都可以在单应用内用 template system 解决，不需要多个 Vercel 项目。

## 结论

采用**单 Vercel 部署 + 组件级模板系统**，理由：

1. 与后端单实例多租户架构对齐
2. 维护成本低，模板共享基础设施
3. 自定义域名通过 middleware 重写实现
4. 模板差异通过组件组合 + CSS 变量覆盖绝大多数场景
