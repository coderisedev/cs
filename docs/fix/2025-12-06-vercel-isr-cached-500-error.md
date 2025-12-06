# Vercel ISR 缓存 500 错误问题复盘

**日期**: 2025-12-06
**影响范围**: 生产环境产品详情页和博客文章页
**严重程度**: P1 - 页面完全不可访问

## 问题现象

生产环境 `https://prd.aidenlux.com/us/products/cs-737m-cdu` 返回 500 Internal Server Error，所有产品详情页和博客文章页均无法访问。

## 排查过程

### 1. 初步诊断

通过创建 `/api/debug` 端点验证环境变量和 API 调用：

```typescript
// apps/dji-storefront/src/app/api/debug/route.ts
export async function GET(request: Request) {
  // 测试 Medusa API
  const product = await getProductDetail(handle, "us")
  // 测试 Strapi API
  const strapiContent = await getProductDetailContent(handle)
  // 返回诊断结果
}
```

**结果**: 所有 API 调用成功，环境变量配置正确。

### 2. 创建测试页面隔离问题

创建简化版测试页面 `/us/products/[handle]/test`：

```typescript
// 不使用 ISR，强制动态渲染
export const dynamic = "force-dynamic"

export default async function ProductTestPage({ params }) {
  // 直接渲染 ProductDetailClient
  return <ProductDetailClient ... />
}
```

**结果**: 测试页面返回 200 OK，说明数据获取和组件渲染均正常。

### 3. 发现 Sentry 错误

Strapi Sentry 监控报错：
```
Cannot destructure property 'kind' of 'strapi1.getModel(...)' as it is undefined.
```

这是 Strapi 启动时 seeder 阶段的错误，因为：
1. Prod Strapi 的 `product-details` 内容类型权限未配置
2. Seeder 代码字段与 schema 定义不匹配

### 4. 修复 Strapi 权限

在 Strapi 管理后台配置 API Token 权限：
- Settings → API Tokens → 编辑 Token
- 添加 `product-details` 的 `find` 和 `findOne` 权限

### 5. 权限修复后仍然 500

验证 Strapi API 可正常返回数据：
```bash
curl -s "https://content.aidenlux.com/api/product-details" \
  -H "Authorization: Bearer $TOKEN"
# 返回正确的 JSON 数据
```

但页面仍然 500，检查 HTTP 响应头发现 `age: 36391`，说明是缓存响应。

### 6. 定位根本原因 - ISR 缓存

产品详情页使用了 ISR：
```typescript
// 15分钟缓存
export const revalidate = 900
```

ISR 在首次请求失败时缓存了 500 错误页面，后续请求继续返回缓存的错误响应。

## 解决方案

### 临时修复：禁用 ISR

```typescript
// apps/dji-storefront/src/app/[countryCode]/products/[handle]/page.tsx
export const dynamic = "force-dynamic"
// export const revalidate = 900
```

### 永久修复建议

1. **Vercel 清除缓存**: 在 Vercel Dashboard → Deployments → 选择部署 → Redeploy (without cache)

2. **触发 On-Demand Revalidation**: 使用 `revalidatePath()` 或 `revalidateTag()` API

3. **添加错误处理**: 在页面级别捕获异常，返回友好的错误页面而非让 Next.js 返回 500

```typescript
export default async function ProductDetailPage({ params }) {
  try {
    const product = await getProductDetail(handle, countryCode)
    if (!product) notFound()
    // 正常渲染
  } catch (error) {
    // 记录错误到 Sentry
    captureException(error)
    // 返回错误 UI 而非抛出异常
    return <ErrorFallback message="Failed to load product" />
  }
}
```

4. **设置 ISR 错误策略**: 使用 `revalidate` 配合 `fetchCache` 策略

## 遗留问题

### Strapi Seeder 字段不匹配

`product-detail-seeder.ts` 使用的字段：
- `hero_excerpt`, `specs`, `features`, `faq`, `downloads`, `shipping_note`

`schema.json` 定义的字段：
- `tagline`, `overview`, `feature_bullets`, `content_sections`, `spec_groups`, `package_contents`

**建议**: 更新 seeder 代码以匹配新的 schema 定义，或删除过时的 seeder。

## 经验教训

1. **ISR 缓存陷阱**: ISR 会缓存错误响应，导致后续请求持续失败。生产环境部署前应确保所有依赖服务正常。

2. **渐进式排查**: 使用调试端点和简化测试页面逐层隔离问题，从环境变量 → API 调用 → 组件渲染 → 页面配置。

3. **Strapi 权限配置**: Strapi 部署到新环境后需要手动配置 API 权限，这不会随代码自动同步。

4. **缓存响应头**: 检查 `age` 响应头可判断是否命中缓存。

5. **Dev 与 Prod 差异**: Dev 环境正常但 Prod 失败时，重点检查：
   - 环境变量差异
   - 数据库/CMS 权限配置
   - 缓存策略

## 相关文件

- `apps/dji-storefront/src/app/[countryCode]/products/[handle]/page.tsx`
- `apps/dji-storefront/src/app/[countryCode]/blog/[slug]/page.tsx`
- `apps/dji-storefront/src/app/api/debug/route.ts`
- `apps/strapi/src/bootstrap/product-detail-seeder.ts`
- `apps/strapi/src/api/product-detail/content-types/product-detail/schema.json`

## 修复提交

- `5ec3247` - chore: temporarily disable ISR for debugging product page 500 error
- `ddee899` - chore: disable ISR on blog pages to clear cached 500 errors
