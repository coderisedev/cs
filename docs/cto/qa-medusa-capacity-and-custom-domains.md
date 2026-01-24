# CTO Q&A: Medusa 单实例容量与自定义域名

> **Date:** 2026-01-24
> **Context:** 确认 ADR-001 架构决策的可行性

---

## Q1: Medusa 单实例理论可以支持的最多租户是多少？

**结论：单实例轻松支撑 1000-3000 个中小租户。超过后水平加实例即可线性扩展。**

### 瓶颈分析

理论上限取决于并发活跃用户数，而非租户总数。租户数本身对系统没有压力——数据库里多 10 万行 `WHERE tenant_id = X` 的数据，有索引的情况下查询时间几乎不变。

真正的瓶颈是：

| 瓶颈层 | 限制因素 | 典型值 |
|--------|---------|--------|
| Node.js 进程 | 并发请求处理能力 | ~1000-3000 req/s (单核) |
| DB 连接池 | PgBouncer 最大连接数 | Supabase Pro: 200 pooled connections |
| 数据库 I/O | 查询复杂度 × 并发量 | 取决于索引质量 |

### 实际估算

```
假设每个店铺平均 5 个并发访客（浏览商品、下单）
每个访客每秒产生 0.5 个 API 请求

1000 租户 × 5 并发 × 0.5 req/s = 2500 req/s
→ 单个 2-core Cloud Run 实例可承载

5000 租户 × 5 并发 × 0.5 req/s = 12500 req/s
→ 需要 4-5 个 Medusa 实例（水平扩展，无状态，共享 DB）
```

### 扩展策略

- Medusa 是无状态的，加一个 Load Balancer 就能线性扩展
- 租户总数的真正上限在数据库侧——单个 Postgres 集群支撑百万级店铺数据没有问题
- 水平扩展时，多个 Medusa 实例共享同一个 Postgres + Redis，无需数据分片

---

## Q2: 这个方案允许用户绑定自己的域名，像独立 Medusa 站一样的体验对吧？

**结论：完全可以。用户绑定自有域名后，访客体验与独立部署的 Medusa 站完全一致。**

### 技术实现

```
访客访问 nike.com
  → DNS CNAME → cname.vercel-dns.com
  → Vercel Edge Middleware 识别 hostname
  → 查询 tenants 表: SELECT * FROM tenants WHERE custom_domain = 'nike.com'
  → 获得 tenant_id
  → 渲染该租户的店铺页面（商品、样式、品牌元素全部隔离）
```

### 域名绑定流程

1. 用户在店铺设置中输入自己的域名 `mystore.com`
2. 系统提示用户去 DNS 服务商添加 CNAME 记录：`mystore.com → cname.vercel-dns.com`
3. 系统通过 Vercel Domains API 注册该域名
4. Vercel 自动签发 SSL 证书（Let's Encrypt）
5. 验证通过后，`tenants.custom_domain` 写入 `'mystore.com'`

### Middleware 路由逻辑

```typescript
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')

  // 平台自身域名，走正常路由
  if (hostname === 'app.lumora.shop') return next()

  // 子域名模式: xxx.lumora.shop
  if (hostname?.endsWith('.lumora.shop')) {
    const slug = hostname.replace('.lumora.shop', '')
    return rewrite(`/store/${slug}${pathname}`)
  }

  // 自定义域名模式: mystore.com
  const tenant = await getTenantByDomain(hostname)
  if (tenant) {
    return rewrite(`/store/${tenant.slug}${pathname}`)
  }

  return notFound()
}
```

### 用户感知对比

| 维度 | 独立部署 Medusa | Lumora 绑定域名 |
|------|----------------|----------------|
| 访问地址 | mystore.com | mystore.com |
| SSL 证书 | 自己管理 | 自动签发 |
| 页面速度 | 取决于服务器 | Vercel Edge CDN（更快） |
| 品牌定制 | 完全自定义 | 主题系统定制（logo/颜色/字体） |
| 后台地址 | mystore.com/admin | app.lumora.shop/store/mystore |
| SEO 独立性 | 完全独立 | 完全独立（独立域名 = 独立 SEO） |

### 关键结论

- 面向消费者的页面完全运行在用户自己的域名下，SEO 和品牌完全独立
- 唯一的区别是管理后台统一在 `app.lumora.shop`，但这对终端消费者不可见
- Vercel Pro 单项目支持 50 个自定义域名，超出后切换到 Cloudflare for SaaS（支持 10 万+）
