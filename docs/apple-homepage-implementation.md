# Apple Homepage Implementation - README

## 概述

这是一个基于 Apple 官网首页设计的 Strapi CMS 内容模型实现。包含完整的后端内容类型定义、前端 React 组件和示例数据。

## 项目结构

### Strapi 后端 (`apps/strapi/`)

#### 组件 (Components)
- `src/components/homepage/cta-button.json` - CTA 按钮组件
- `src/components/homepage/product-highlight.json` - 产品亮点组件

#### 内容类型 (Content Types)
- `src/api/featured-product/` - 特色产品集合类型
- `src/api/homepage-layout/` - 首页布局单例类型

#### 示例数据
- `scripts/sample-data.js` - 示例产品数据
- `scripts/import-homepage-seeds.js` - 数据导入脚本

### Next.js 前端 (`apps/web/`)

#### API 客户端
- `src/lib/strapi/client.ts` - Strapi 客户端基础库（已存在）
- `src/lib/strapi/homepage.ts` - 首页数据获取函数

#### React 组件
- `src/components/homepage/cta-button.tsx` - CTA 按钮组件
- `src/components/homepage/hero-section.tsx` - 主推产品区域
- `src/components/homepage/secondary-hero.tsx` - 副推产品区域
- `src/components/homepage/product-grid.tsx` - 产品网格

#### 示例页面
- `src/app/(examples)/apple-homepage/page.tsx` - 首页示例

## 安装和配置

### 1. Strapi 配置

Strapi 内容类型会在首次启动时自动创建。确保 Strapi 服务正在运行：

```bash
cd apps/strapi
npm run dev
```

### 2. 导入示例数据

在 Strapi 启动后，导入示例数据：

```bash
cd apps/strapi
node scripts/import-homepage-seeds.js
```

### 3. 配置 API 权限

在 Strapi 管理面板中：

1. 访问 `http://localhost:1337/admin`
2. 导航到 **Settings → Roles → Public**
3. 为以下内容类型启用权限：
   - `featured-product`: `find`, `findOne`
   - `homepage-layout`: `find`

### 4. 环境变量配置

在 `apps/web/.env.local` 中添加：

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here  # 可选，如果设置了公共权限
```

### 5. 启动前端项目

```bash
cd apps/web
npm run dev
```

访问 `http://localhost:8000/apple-homepage` 查看效果。

## 功能特性

### ✅ 已实现功能

1. **Strapi 后端**
   - ✅ CTA Button 组件
   - ✅ Product Highlight 组件
   - ✅ Featured Product 内容类型（含 i18n 支持）
   - ✅ Homepage Layout 单例类型
   - ✅ 示例数据脚本

2. **前端组件**
   - ✅ HeroSection - 主推产品全屏展示
   - ✅ SecondaryHero - 副推产品展示
   - ✅ ProductGrid - 产品网格布局
   - ✅ CTAButton - 可重用按钮组件

3. **扩展功能**
   - ✅ i18n 国际化支持
   - ✅ SEO 元数据字段
   - ✅ A/B 测试变体支持
   - ✅ 定时发布（startDate/endDate）
   - ✅ 优先级排序
   - ✅ 响应式设计

## API 使用示例

### 获取首页布局

```typescript
import { getHomepageLayout } from '@/lib/strapi/homepage';

const layout = await getHomepageLayout();
```

### 获取特定产品

```typescript
import { getFeaturedProduct } from '@/lib/strapi/homepage';

const product = await getFeaturedProduct('iphone-16-pro');
```

### 按尺寸获取产品

```typescript
import { getFeaturedProductsBySize } from '@/lib/strapi/homepage';

const heroProducts = await getFeaturedProductsBySize('hero');
```

## 自定义和扩展

### 添加新产品

1. 在 Strapi 管理面板中创建新的 Featured Product
2. 设置 `displaySize` 为 `hero`、`secondary` 或 `tile`
3. 在 Homepage Layout 中关联该产品

### 修改网格布局

在 Homepage Layout 中调整：
- `gridColumns`: "2", "3", 或 "4"
- `gridLayout`: "grid", "masonry", 或 "carousel"

### 添加新的 CTA 样式

编辑 `src/components/homepage/cta-button.tsx` 中的 `styleVariants`。

## 样式自定义

所有组件都使用 Tailwind CSS。可以通过传入 `className` prop 来自定义样式。

示例：

```tsx
<CTAButton
  label="购买"
  url="/buy"
  style="primary"
  className="shadow-xl hover:shadow-2xl"
/>
```

## 性能优化

- ✅ Next.js Image 组件自动优化
- ✅ 60 秒缓存重新验证
- ✅ 渐进式图片加载
- ✅ 优先级加载标志

## 故障排查

### Strapi 连接失败
检查环境变量 `NEXT_PUBLIC_STRAPI_URL` 是否正确。

### 图片无法显示
确保 Strapi 媒体库中有上传的图片，并且 `resolveStrapiMedia` 函数正确解析 URL。

### 数据未显示
检查 Strapi API 权限是否已正确设置为公共访问。

## 下一步计划

- [ ] 添加动画效果（Framer Motion）
- [ ] 添加视频背景支持
- [ ] 移动端优化
- [ ] 性能监控和分析
- [ ] 预览模式支持

## 相关文档

- [Implementation Plan](/.gemini/antigravity/brain/15d5b9de-ed12-47fa-994b-84126058c6e4/implementation_plan.md)
- [Walkthrough](/.gemini/antigravity/brain/15d5b9de-ed12-47fa-994b-84126058c6e4/walkthrough.md)
- [Strapi Documentation](https://docs.strapi.io/)
- [Next.js Documentation](https://nextjs.org/docs)

## 许可证

MIT
