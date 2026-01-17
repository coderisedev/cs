# 首页 Featured Products 显示不全问题修复复盘

**日期**: 2026-01-15
**影响范围**: 生产环境首页 (prd.aidenlux.com/us)
**严重程度**: 低 (功能正常，数据配置问题)
**修复耗时**: 约 20 分钟

## 问题描述

用户反馈首页的 Featured Products 区域只显示了 3 个产品，但在 Strapi 后台明明添加了 4 个产品。

## 排查过程

### 1. 初步假设 - 前端代码分页限制

首先怀疑是前端代码在获取 Strapi 数据时存在分页限制。

**排查路径**:
- `apps/dji-storefront/src/lib/strapi/homepage.ts` - 数据获取逻辑
- `apps/dji-storefront/src/app/[countryCode]/page.tsx` - 首页组件

**发现**:
- Strapi v5 的 populate 关联查询确实有默认限制
- 尝试添加 `populate[productGrid][limit]` 参数

**结果**: Strapi v5 返回错误 `Invalid key limit at productGrid`，说明语法不正确。

### 2. 直接测试 Strapi API

用户提到 Featured Product id 为 11，直接测试该 API：

```bash
curl -s "https://content.aidenlux.com/api/featured-products/11?populate=*"
```

**结果**: 返回 404 Not Found，说明 id 11 的产品不存在。

### 3. 验证实际数据

查询所有 Featured Products：

```bash
curl -s "https://content.aidenlux.com/api/featured-products" | jq '.data[] | {id, title}'
```

**结果**: 共 5 个产品
| ID | Title |
|----|-------|
| 49 | A320 Series |
| 53 | Accessories |
| 57 | 737 Series |
| 59 | CS737 Fully-Functional Throttle Quadrant |
| 60 | Others |

### 4. 检查 Homepage Layout 关联

查询 Homepage Layout 的 productGrid 关联：

```bash
curl -s "https://content.aidenlux.com/api/homepage-layout?populate=productGrid" | jq '.data.productGrid[] | {id, title}'
```

**结果**: 只有 3 个产品被关联
- A320 Series (id: 49)
- 737 Series (id: 57)
- Accessories (id: 53)

**根本原因确认**: Homepage Layout 的 `productGrid` 关联字段中只配置了 3 个产品，第 4 个产品未被关联。

## 根本原因

**这不是代码问题，而是 Strapi CMS 数据配置问题。**

虽然 Strapi 中存在多个 Featured Products 内容条目，但 Homepage Layout 单一类型的 `productGrid` 关联字段中只选择了 3 个产品。新添加的产品需要手动关联到 Homepage Layout。

## 修复方案

通过 Strapi REST API 将 "Others" 产品关联到 Homepage Layout：

```bash
curl -X PUT "https://content.aidenlux.com/api/homepage-layout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <API_TOKEN>" \
  -d '{
    "data": {
      "productGrid": {
        "connect": [{"documentId": "w2r43tg4466o2bkbbbtuk7bo"}]
      }
    }
  }'
```

**关键点**: Strapi v5 使用 `documentId` 而非数字 `id` 来操作关联关系，使用 `connect` 语法添加关联。

## 修复验证

```bash
curl -s "https://content.aidenlux.com/api/homepage-layout?populate=productGrid" | jq '.data.productGrid | length'
# 输出: 4
```

确认 productGrid 现在包含 4 个产品：
| ID | Title | Priority |
|----|-------|----------|
| 49 | A320 Series | 80 |
| 57 | 737 Series | 75 |
| 53 | Accessories | 70 |
| 60 | Others | 65 |

## 经验教训

### 1. 数据问题 vs 代码问题

遇到"数据显示不全"的问题时，应该优先排查：
- **数据源**: 数据是否真正存在于数据库/CMS 中
- **关联关系**: 内容之间的关联是否正确配置
- **过滤条件**: 是否有 isActive、publishedAt 等状态过滤

而不是一开始就怀疑代码逻辑。

### 2. Strapi v5 关联查询

- Strapi v5 的 populate 语法与 v4 有差异
- 关联操作使用 `documentId` 而非数字 `id`
- 添加关联使用 `connect`，移除使用 `disconnect`

### 3. 直接测试 API

当用户报告特定 ID 的数据问题时，第一步应该直接测试 API 验证数据是否存在，而不是先看代码。

## 相关文件

- `apps/dji-storefront/src/lib/strapi/homepage.ts` - Homepage 数据获取
- `apps/dji-storefront/src/app/[countryCode]/page.tsx` - 首页组件
- `apps/strapi/src/api/homepage-layout/content-types/homepage-layout/schema.json` - Homepage Layout Schema

## 后续建议

1. **CMS 操作文档**: 为内容编辑人员提供 Strapi 操作指南，明确说明添加 Featured Product 后需要关联到 Homepage Layout
2. **管理界面优化**: 考虑在 Strapi Admin 中添加自定义视图，直观显示哪些产品已关联到首页
3. **数据完整性检查**: 可以添加一个简单的健康检查脚本，验证首页配置的完整性
