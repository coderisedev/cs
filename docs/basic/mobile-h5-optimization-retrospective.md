# 产品详情页 H5 移动端优化复盘

## 项目背景

针对产品详情页 `/us/products/cs-320a-mcdu` 在移动设备（390px 宽度）上的显示问题进行优化，实现流体自适应设计。

## 优化目标

1. 修复 Hero 区域图片未占满屏幕宽度的问题
2. 修复 Header 未占满屏幕宽度的问题
3. 实现流体自适应设计，内容随视口平滑缩放

---

## 问题分析与解决方案

### 问题 1: Header 未占满屏幕宽度

**现象：** 在 390px 宽度下，Header 左右有明显边距

**原因：** 使用了 `container` class，在小屏幕上仍有 padding

**解决方案：**
```tsx
// 修改前
<div className="container ...">

// 修改后
<div className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 lg:px-12">
```

**文件：** `apps/dji-storefront/src/components/layout/site-header.tsx`

---

### 问题 2: Hero 图片未占满屏幕宽度

**现象：** 在 390px 宽度下，产品主图左右有边距，未完全占满屏幕

**根本原因：** CSS Grid 子元素默认 `min-width: auto`，导致图片固有尺寸撑大 grid 列宽

**调试过程：**
```javascript
// 使用 Playwright 检查实际尺寸
{
  grid: { width: 390, gridTemplateColumns: "536px" },  // grid 列宽被撑到 536px
  gallery: { width: 536 },  // 图片容器溢出
  viewport: 390
}
```

**解决方案：**
```tsx
// 修改前
<div className="space-y-4">

// 修改后 - 添加 min-w-0 阻止内容溢出
<div className="space-y-4 min-w-0">
```

**文件：** `apps/dji-storefront/src/components/products/product-detail-client.tsx:97`

---

### 问题 3: 固定断点响应式 vs 流体自适应

**现象：** 使用固定断点 `text-2xl sm:text-3xl lg:text-4xl` 会在断点处产生跳跃

**解决方案：** 使用 CSS `clamp()` 函数实现流体缩放

---

## 流体自适应设计实现

### 1. 添加流体 CSS 变量

**文件：** `apps/dji-storefront/src/styles/design-tokens.css`

```css
:root {
  /* ========== 流体排版 ========== */
  --fluid-heading-xl: clamp(28px, 2.5vw + 1rem, 48px);   /* 产品标题 */
  --fluid-heading-lg: clamp(24px, 2vw + 0.75rem, 40px);  /* 区块标题 */
  --fluid-heading-md: clamp(20px, 1.5vw + 0.5rem, 28px); /* 子标题 */
  --fluid-heading-sm: clamp(18px, 1vw + 0.5rem, 24px);   /* 小标题 */

  --fluid-body-lg: clamp(16px, 0.5vw + 0.875rem, 19px);  /* 大段落 */
  --fluid-body-md: clamp(14px, 0.3vw + 0.8rem, 17px);    /* 正文 */
  --fluid-body-sm: clamp(12px, 0.2vw + 0.7rem, 14px);    /* 辅助文字 */

  --fluid-price: clamp(24px, 2.5vw + 0.5rem, 40px);      /* 价格 */

  /* ========== 流体间距 ========== */
  --fluid-section-py: clamp(32px, 6vw, 96px);            /* 区块垂直间距 */
  --fluid-gap-xl: clamp(24px, 4vw, 64px);                /* 大间隙 */
  --fluid-gap-lg: clamp(20px, 3vw, 48px);                /* 中大间隙 */
  --fluid-gap-md: clamp(16px, 2vw, 32px);                /* 中间隙 */
  --fluid-gap-sm: clamp(12px, 1.5vw, 20px);              /* 小间隙 */
  --fluid-gap-xs: clamp(8px, 1vw, 12px);                 /* 微小间隙 */

  /* ========== 流体组件尺寸 ========== */
  --fluid-btn-height: clamp(44px, 4vw, 56px);            /* 按钮高度 */
  --fluid-thumb-size: clamp(56px, 5vw, 80px);            /* 缩略图尺寸 */
  --fluid-icon-sm: clamp(16px, 1.2vw, 20px);             /* 小图标 */
  --fluid-icon-md: clamp(20px, 1.5vw, 24px);             /* 中图标 */
  --fluid-radius: clamp(12px, 1.5vw, 24px);              /* 圆角 */
}
```

### 2. Tailwind 任意值语法

**关键点：** 使用 `text-[length:var(--fluid-heading-xl)]` 而非 `text-[var(--fluid-heading-xl)]`

```tsx
// 字体大小需要 length: 前缀
<h1 className="text-[length:var(--fluid-heading-xl)]">

// 间距、尺寸直接使用
<div className="py-[var(--fluid-section-py)]">
<div className="gap-[var(--fluid-gap-xl)]">
<button className="h-[var(--fluid-btn-height)]">
```

### 3. 更新的组件文件

| 组件文件 | 主要更改 |
|---------|---------|
| `product-detail-client.tsx` | Hero 区域、价格、按钮、缩略图、间距 |
| `content-section.tsx` | 区块 padding、标题、间距、圆角 |
| `feature-bullets.tsx` | 标题、列表间距、图标、正文 |
| `spec-groups.tsx` | 组间距、标题、行 padding、文字 |
| `package-contents.tsx` | 区块 padding、标题、网格间距、图标 |

---

## 设计原则

### 保留断点布局切换

流体设计只影响内容缩放，布局切换仍使用断点：

```tsx
// 保留 - 布局切换
lg:grid-cols-2          // 双列布局
flex-col sm:flex-row    // 方向切换
hidden sm:block         // 显示/隐藏

// 替换 - 内容缩放
py-6 sm:py-8 lg:py-16  →  py-[var(--fluid-section-py)]
text-2xl sm:text-3xl   →  text-[length:var(--fluid-heading-xl)]
```

### clamp() 函数公式

```
clamp(最小值, 首选值, 最大值)
clamp(min, preferred, max)
```

**首选值计算：** `vw系数 + rem基础值`

- 标题：`2.5vw + 1rem` — 视口变化影响大
- 正文：`0.3vw + 0.8rem` — 视口变化影响小，保持可读性
- 间距：`4vw` — 纯视口比例

### 可访问性保障

- 最小正文字号：14px（`--fluid-body-md` 最小值）
- 最小触控区域：44px（`--fluid-btn-height` 最小值）
- 图标可辨识：16px（`--fluid-icon-sm` 最小值）

---

## CSS Grid 溢出问题

### 问题机制

```
Grid 容器
├── 子元素 A (min-width: auto) ← 默认值
│   └── 图片 (固有宽度 536px)
│       ↓
│   子元素被撑到 536px
│       ↓
│   Grid 列宽变为 536px
│       ↓
│   内容溢出视口 (390px)
```

### 解决方案

```css
.grid-child {
  min-width: 0;  /* 覆盖默认的 auto */
}
```

**Tailwind 写法：**
```tsx
<div className="min-w-0">
```

**适用场景：**
- Grid 子元素包含图片
- Grid 子元素包含 `white-space: nowrap` 文本
- Grid 子元素包含固定宽度内容

---

## 测试验证

### 测试视口

| 宽度 | 设备 |
|------|------|
| 320px | 最小移动设备 |
| 375px | iPhone SE |
| 390px | iPhone 14 |
| 428px | iPhone 14 Pro Max |
| 768px | iPad 竖屏 |
| 1024px | iPad 横屏 |
| 1440px | 设计最大宽度 |

### 验证项目

- [x] Hero 图片占满屏幕宽度
- [x] 缩略图横向滚动正常
- [x] 产品信息面板正确显示
- [x] 标签页导航正常
- [x] Strapi 内容区域自适应
- [x] "What's in the Box" 网格正确
- [x] Footer 正常显示
- [x] 文字在任何宽度平滑缩放

---

## 经验总结

### 技术要点

1. **CSS Grid 溢出**：子元素需要 `min-w-0` 防止内容撑大列宽
2. **Tailwind 字体大小**：CSS 变量需要 `length:` 前缀
3. **流体 vs 断点**：内容缩放用流体，布局切换用断点
4. **clamp() 参数**：最小值保障可读性，最大值防止过大

### 调试技巧

1. 使用 Playwright 检查实际计算样式
2. 对比 `offsetWidth` 和 `viewport` 定位溢出
3. 检查 `gridTemplateColumns` 确认 grid 列宽

### 后续优化方向

1. 考虑添加更多流体变量（如阴影、边框）
2. 建立流体设计 Storybook 组件库
3. 性能优化：懒加载 Strapi 内容区域图片

---

## 相关文件

```
apps/dji-storefront/
├── src/
│   ├── styles/
│   │   └── design-tokens.css          # 流体 CSS 变量
│   ├── components/
│   │   ├── layout/
│   │   │   └── site-header.tsx        # Header 全宽修复
│   │   ├── products/
│   │   │   └── product-detail-client.tsx  # 主组件
│   │   └── product-detail/
│   │       ├── content-section.tsx
│   │       ├── feature-bullets.tsx
│   │       ├── spec-groups.tsx
│   │       └── package-contents.tsx
```

---

*文档创建日期：2025-12-04*
