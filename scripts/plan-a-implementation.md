# 方案 A 详细实施规划

## 项目概述
将 DJI Storefront 从多区域架构转换为全球统一站点（US/USD），保留 `/us` URL 前缀。

---

## 实施阶段

### 阶段 1: 数据库信息获取与分析 ✅

**目标**: 获取现有 Region 配置信息

**执行步骤**:
1. 运行 SQL 查询脚本获取所有 region 信息
2. 确认 US region 的 ID 和配置
3. 分析现有 region 和 country 映射关系

**SQL 脚本**: `/Users/luokai/code/cs/scripts/query-regions.sql`

**预期输出**:
- Region ID (例如: `reg_01XXXXX`)
- Region 名称和货币代码
- 关联的国家列表
- Sales Channel 配置

---

### 阶段 2: 后端 Medusa 配置

**目标**: 确保后端只使用 US Region

#### 2.1 验证/创建 US Region
- [ ] 确认 US Region 存在且配置正确
  - 名称: United States
  - 货币: USD
  - 国家: 至少包含 US
  - 可选: 添加全球可发货国家

#### 2.2 Sales Channel 配置
- [ ] 确认 Sales Channel 关联到 US Region
- [ ] 验证 Publishable Key 关联正确

#### 2.3 数据清理（可选）
- [ ] 标记非 US Region 为 inactive（不删除，保留数据）

**SQL 操作脚本**: `/Users/luokai/code/cs/scripts/configure-us-region.sql`

---

### 阶段 3: 前端环境变量配置

**文件**: `apps/dji-storefront/.env.local`

**修改内容**:
```bash
# 现有配置
MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_ab8917b5ecbb4869057bf86d46fb9cca735cba0a8339e1619fbfec1c412a6cb2
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us

# 新增配置 - 从数据库查询获取
NEXT_PUBLIC_REGION_ID=<从数据库获取的 US region ID>

# 其他保持不变
NEXT_PUBLIC_STRIPE_KEY=
NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY=
NEXT_PUBLIC_MEDUSA_PAYMENTS_ACCOUNT_ID=
REVALIDATE_SECRET=supersecret
MEDUSA_CLOUD_S3_HOSTNAME=
MEDUSA_CLOUD_S3_PATHNAME=
```

**检查点**:
- [ ] `NEXT_PUBLIC_REGION_ID` 设置为正确的 US region ID
- [ ] `NEXT_PUBLIC_DEFAULT_REGION=us` 确认存在

---

### 阶段 4: Middleware 重构

**文件**: `apps/dji-storefront/src/middleware.ts`

**修改策略**: 强制所有流量到 `/us` 路由

**关键变更**:
1. 禁用地理位置检测 (`x-vercel-ip-country`)
2. 所有非 `/us` 路径重定向到 `/us`
3. 简化 region 查询逻辑

**实施检查**:
- [ ] 删除 Vercel 地理检测逻辑
- [ ] 添加强制 301 重定向到 /us
- [ ] 保留静态资源处理
- [ ] 测试根路径 `/` → `/us`
- [ ] 测试其他国家码 `/cn` → `/us`

---

### 阶段 5: Cart 创建逻辑固化

**文件**: `apps/dji-storefront/src/lib/data/cart.ts`

**当前逻辑分析**:
- ✅ 已通过 `countryCode` 动态获取 region
- ❌ 需要固化为单一 US region

**修改要点**:
```typescript
// 当前: 动态获取 region
const region = await getRegion(countryCode)

// 修改为: 使用环境变量固定 region
const US_REGION_ID = process.env.NEXT_PUBLIC_REGION_ID!
```

**涉及函数**:
- [ ] `getOrSetCart()` - 固化 region_id
- [ ] `addToCart()` - 移除 countryCode 依赖（内部调用）
- [ ] 验证 cart update 逻辑不会切换 region

---

### 阶段 6: Region 查询优化

**文件**: `apps/dji-storefront/src/lib/data/regions.ts`

**优化策略**:
1. 保留 `listRegions()` 用于向后兼容
2. 修改 `getRegion()` 始终返回 US region
3. 添加缓存优化

**检查点**:
- [ ] `getRegion()` 无论传入什么 countryCode 都返回 US region
- [ ] Mock regions 仅保留 US region
- [ ] 删除 EU region mock 数据

---

### 阶段 7: UI 组件修改

#### 7.1 移除国家/货币选择器

**潜在位置**:
- Header 导航栏
- Footer 区域
- Account 设置页面

**搜索关键词**: `country`, `region`, `currency`, `language`

**检查文件**:
- [ ] `components/layout/site-header.tsx` - 无国家选择器
- [ ] `components/account/account-client.tsx` - Currency/Language 偏好设置
- [ ] Footer 组件（如存在）

#### 7.2 Account 页面处理

**文件**: `components/account/account-client.tsx`

**选项 1**: 固定显示
```tsx
<PreferenceRow 
  title="Currency" 
  description="Preferred storefront currency" 
  value="USD (US Dollar)" 
/>
```

**选项 2**: 完全移除
- 删除 Currency 和 Language 偏好设置行

---

### 阶段 8: 常量和配置文件更新

#### 8.1 Constants 文件
**文件**: `lib/constants.ts`

```typescript
// 当前
export const DEFAULT_COUNTRY_CODE = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "us"

// 新增
export const US_REGION_ID = process.env.NEXT_PUBLIC_REGION_ID!
export const DEFAULT_CURRENCY = "USD"
```

#### 8.2 Mock Data 清理
**文件**: `lib/data/mock-regions.ts`

```typescript
// 仅保留 US region
const mockRegions: HttpTypes.StoreRegion[] = [
  {
    id: process.env.NEXT_PUBLIC_REGION_ID || "reg_mock_us",
    name: "United States",
    currency_code: "usd",
    tax_rate: 0,
    countries: [{ iso_2: "us", name: "United States" }],
  },
]
```

#### 8.3 Currency Formatter
**文件**: `lib/number.ts`

- ✅ 已固定为 USD，无需修改

---

### 阶段 9: 产品和购物车组件更新

#### 9.1 Product Card
**文件**: `components/products/product-card.tsx`

**当前**: 接受 `countryCode` prop
**修改**: 使用固定的 US region ID

```typescript
// 移除 countryCode prop，使用常量
import { US_REGION_ID } from "@/lib/constants"

// 更新 addToCartAction 调用
await addToCartAction({ 
  variantId, 
  quantity: 1, 
  countryCode: "us" // 或直接移除，后端改为使用 region_id
})
```

#### 9.2 Product Detail
**文件**: `components/products/product-detail-client.tsx`

- [ ] 同样固化 `countryCode: "us"`

#### 9.3 Products Page
**文件**: `app/products/products-client.tsx`

- [ ] 检查是否使用 `countryCode`
- [ ] 如使用，固化为 "us"

---

### 阶段 10: Server Actions 更新

#### 10.1 Cart Actions
**可能的文件**: `app/actions/cart.ts`

**检查点**:
- [ ] `addToCartAction` 是否依赖 countryCode
- [ ] 修改为使用固定 region_id 或移除参数

---

### 阶段 11: 路由和页面结构验证

**当前结构**: `app/[countryCode]/...`

**方案 A 保留**: 无需修改目录结构

**验证点**:
- [ ] Dynamic route `[countryCode]` 始终解析为 "us"
- [ ] 所有页面组件正确处理 `params.countryCode = "us"`
- [ ] Breadcrumb 和导航链接使用 `/us` 前缀

---

### 阶段 12: 测试计划

#### 12.1 单元测试（可选）
- [ ] Middleware 重定向逻辑
- [ ] Cart creation 使用正确 region_id
- [ ] Region 查询始终返回 US

#### 12.2 集成测试
- [ ] 访问 `/` 重定向到 `/us`
- [ ] 访问 `/cn/products` 重定向到 `/us/products`
- [ ] 创建购物车，验证 region_id 为 US
- [ ] 添加商品，验证价格为 USD
- [ ] 完整购物流程（checkout）

#### 12.3 手动测试清单
- [ ] 首页加载正常 (`/us`)
- [ ] 产品列表显示 USD 价格
- [ ] 添加到购物车成功
- [ ] 购物车显示正确货币
- [ ] Checkout 流程使用 US region
- [ ] Account 页面不显示国家选择器
- [ ] 直接访问 `/products` 重定向到 `/us/products`
- [ ] 清除浏览器 cookies 后重新测试

---

### 阶段 13: 部署前检查

#### 13.1 环境变量
- [ ] Production `.env` 文件包含 `NEXT_PUBLIC_REGION_ID`
- [ ] Vercel/部署平台设置环境变量

#### 13.2 缓存清理
- [ ] 清除 Next.js build cache
- [ ] 清除 Redis cache（如使用）
- [ ] 部署后触发 revalidation

#### 13.3 SEO 考虑
- [ ] 设置 301 重定向（非 /us 路径）
- [ ] 更新 sitemap（如果有）
- [ ] robots.txt 配置

---

## 风险评估与缓解

### 高风险项
1. **Region ID 错误**: 从数据库获取错误 ID
   - 缓解: 先在开发环境验证 SQL 查询

2. **购物车 region 不匹配**: 现有购物车使用其他 region
   - 缓解: 添加 cart region 更新逻辑

3. **Middleware 重定向循环**: 配置错误导致无限重定向
   - 缓解: 仔细测试边界情况

### 中风险项
1. **现有用户 cookies**: 旧的 country_code cookie
   - 缓解: Middleware 忽略或覆盖

2. **价格显示问题**: 某些组件仍使用动态货币
   - 缓解: 全局搜索 `currency` 关键词

### 低风险项
1. **UI 文案**: 某些地方提及"选择国家"
   - 缓解: 文案审查和更新

---

## 回滚计划

如果方案 A 实施后出现问题：

1. **环境变量回滚**: 移除 `NEXT_PUBLIC_REGION_ID`
2. **Middleware 回滚**: 恢复原始 middleware 逻辑
3. **代码回滚**: Git revert 相关 commits
4. **数据库无需回滚**: 未删除任何 region 数据

---

## 成功指标

- ✅ 所有流量自动重定向到 `/us`
- ✅ 购物车创建使用正确 US region ID
- ✅ 所有价格显示为 USD
- ✅ 无国家/区域选择器显示
- ✅ 完整购物流程测试通过
- ✅ 无控制台错误或警告

---

## 预计工时

- 阶段 1-2 (数据库查询): 30 分钟
- 阶段 3-4 (配置和 Middleware): 1 小时
- 阶段 5-7 (Cart 和 UI): 2 小时
- 阶段 8-11 (组件更新): 2 小时
- 阶段 12 (测试): 2 小时
- 阶段 13 (部署): 1 小时

**总计**: 约 8-9 小时

---

## 下一步行动

1. ✅ 运行 `/scripts/query-regions.sql` 获取 region ID
2. ⏳ 更新 `.env.local` 添加 `NEXT_PUBLIC_REGION_ID`
3. ⏳ 修改 `middleware.ts`
4. ⏳ 修改 `cart.ts` 固化 region
5. ⏳ 运行测试验证
