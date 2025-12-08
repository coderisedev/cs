# Collection Hero Image Not Displaying

**Date**: 2024-12-08
**Status**: Resolved
**Affected**: Collection detail pages (`/us/collections/[handle]`)

## Problem Description

用户在 Medusa Admin 后台设置了 Collection 的 `hero_image` metadata 字段，但前端集合详情页始终显示 fallback 图片（Unsplash 图片），而不是用户设置的图片。

**用户设置**:
- Key: `hero_image`
- Value: `https://img.aidenlux.com/collections/737.jpg`

**实际表现**:
- 页面显示 fallback 图片: `https://images.unsplash.com/photo-1436491865332-7a61a109cc05`

## Root Cause Analysis

### 根本原因

**Medusa 2.x Store API 默认不返回 `metadata` 字段**。

在 Medusa 2.x 中，Store API 的响应默认只包含核心字段。如果需要获取 `metadata` 等扩展字段，必须在请求中显式指定 `fields` 参数。

### 问题代码

```typescript
// apps/dji-storefront/src/lib/data/collections.ts

// 原代码 - 没有请求 metadata 字段
export const getCollectionByHandle = async (handle: string) => {
  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[] }>(`/store/collections`, {
      method: "GET",
      query: { handle },  // ❌ 缺少 fields 参数
      // ...
    })
}
```

### API 响应对比

**修复前** (不包含 metadata):
```json
{
  "collections": [{
    "id": "pcol_xxx",
    "title": "Airbus320",
    "handle": "airbus320"
    // metadata 字段不存在
  }]
}
```

**修复后** (包含 metadata):
```json
{
  "collections": [{
    "id": "pcol_xxx",
    "title": "Airbus320",
    "handle": "airbus320",
    "metadata": {
      "hero_image": "https://img.aidenlux.com/collections/737.jpg"
    }
  }]
}
```

## Solution

在所有集合相关的 API 请求中添加 `fields: "+metadata"` 参数：

```typescript
// 修复后的代码
export const getCollectionByHandle = async (handle: string) => {
  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[] }>(`/store/collections`, {
      method: "GET",
      query: {
        handle,
        fields: "+metadata",  // ✅ 显式请求 metadata 字段
      },
      // ...
    })
}
```

### 修改的文件

1. **`apps/dji-storefront/src/lib/data/collections.ts`**
   - `listCollections()` - 添加 `fields: "+metadata"`
   - `retrieveCollection()` - 添加 `fields: "+metadata"`
   - `getCollectionByHandle()` - 添加 `fields: "+metadata"`

2. **`apps/dji-storefront/src/lib/util/collections.ts`**
   - 更新 fallback 图片为品牌图片

3. **新增调试端点**
   - `apps/dji-storefront/src/app/api/debug/collection/route.ts`
   - 用于检查集合的 metadata 是否正确返回

## Verification

部署后访问调试端点验证:
```bash
curl "https://prd.aidenlux.com/api/debug/collection?handle=airbus320"
```

预期响应包含 metadata:
```json
{
  "collection": {
    "found": true,
    "metadata": {
      "hero_image": "https://img.aidenlux.com/collections/737.jpg"
    }
  }
}
```

## Prevention

### 1. Medusa 2.x API 字段选择规则

| 前缀 | 含义 | 示例 |
|------|------|------|
| `+field` | 在默认字段基础上追加 | `fields: "+metadata"` |
| `-field` | 从默认字段中排除 | `fields: "-created_at"` |
| `field` | 仅返回指定字段 | `fields: "id,title"` |

### 2. 常见需要显式请求的字段

- `metadata` - 自定义元数据
- `products` - 关联产品
- `created_at`, `updated_at` - 时间戳

### 3. 建议的开发实践

1. **文档查阅**: 开发前查阅 [Medusa 2.x Store API 文档](https://docs.medusajs.com/api/store)
2. **添加调试端点**: 为关键数据添加调试端点，便于快速排查
3. **API 响应验证**: 在开发环境验证 API 响应是否包含预期字段

## Related Commits

- `239d459` - fix(storefront): enable collection metadata in Store API requests

## References

- [Medusa 2.x Store API - Collections](https://docs.medusajs.com/api/store#collections)
- [Medusa Field Selection](https://docs.medusajs.com/development/fundamentals/entity-selections)
