# DJI 官网设计系统分析报告

> 分析来源: https://www.dji.com/cn  
> 分析日期: 2025-11-02  
> 分析工具: Chrome DevTools MCP

## 目录

- [色彩系统](#色彩系统)
- [排版系统](#排版系统)
- [间距系统](#间距系统)
- [按钮系统](#按钮系统)
- [圆角系统](#圆角系统)
- [阴影系统](#阴影系统)
- [响应式断点](#响应式断点)
- [动画系统](#动画系统)
- [组件统计](#组件统计)
- [图像系统](#图像系统)
- [导航系统](#导航系统)
- [布局系统](#布局系统)
- [图标系统](#图标系统)
- [设计原则总结](#设计原则总结)

---

## 色彩系统

### 主色调 (Primary Colors)

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| DJI 蓝 | `rgb(0, 112, 213)` | 品牌主色，主要CTA按钮 |
| 深灰/黑 | `rgb(0, 0, 0)` | 主要文本色 |
| 主文本色 | `rgba(0, 0, 0, 0.85)` | 标题和重要文本 |
| 纯白 | `rgb(255, 255, 255)` | 背景和反转文本 |

### 次要色 (Secondary Colors)

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| 浅灰背景 | `rgb(250, 250, 250)` | 页面背景 |
| 浅灰背景 2 | `rgb(247, 249, 250)` | 卡片背景 |
| 次要文本 | `rgba(0, 0, 0, 0.65)` | 辅助信息文本 |
| 禁用文本 | `rgba(0, 0, 0, 0.45)` | 禁用状态文本 |
| 深色按钮 | `rgb(60, 62, 64)` | 次要CTA按钮 |
| 强调色 | `rgb(211, 32, 41)` | 错误/警告状态 |

### 透明度层级 (Opacity Levels)

```css
/* 标准透明度值 */
opacity: 0.04;  /* 极浅背景 */
opacity: 0.15;  /* 浅背景 */
opacity: 0.25;  /* 浅边框 */
opacity: 0.30;  /* 遮罩 */
opacity: 0.45;  /* 禁用状态 */
opacity: 0.50;  /* 半透明 */
opacity: 0.65;  /* 次要文本 */
opacity: 0.85;  /* 主要文本 */
```

### 完整色板

```css
/* 主色系 */
--primary-blue: rgb(0, 112, 213);
--primary-black: rgb(0, 0, 0);
--primary-white: rgb(255, 255, 255);

/* 灰度系 */
--gray-50: rgb(250, 250, 250);
--gray-100: rgb(247, 249, 250);
--gray-200: rgb(242, 242, 242);
--gray-300: rgb(238, 238, 237);
--gray-400: rgb(237, 237, 237);
--gray-500: rgb(145, 150, 153);
--gray-600: rgb(108, 112, 115);
--gray-700: rgb(97, 100, 102);
--gray-800: rgb(60, 62, 64);
--gray-900: rgb(48, 50, 51);

/* 语义色 */
--error: rgb(211, 32, 41);
--success: rgb(24, 144, 255);
--link: rgb(0, 0, 238);
```

---

## 排版系统

### 字体家族 (Font Family)

```css
font-family: "Open Sans", 
             "PingFang SC", 
             "Microsoft YaHei", 
             "Helvetica Neue", 
             "Hiragino Sans GB", 
             "WenQuanYi Micro Hei", 
             Arial, 
             sans-serif;
```

### 字重 (Font Weights)

| 名称 | 数值 | 用途 |
|------|------|------|
| Light | 300 | 装饰性文本 |
| Regular | 400 | 正文、段落 |
| Medium | 500 | 强调文本 |
| Semibold | 600 | 标题、重要信息 |

### 字体文件

- **Regular**: `OpenSans-Regular.woff2`
- **Semibold**: `OpenSans-Semibold.woff2`
- **Light**: `OpenSans-Light.woff2`
- **Italic**: `OpenSans-Italic.woff2`

### 标题层级 (Heading Hierarchy)

```css
/* H1 - 页面主标题 */
h1 {
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  letter-spacing: normal;
  color: rgb(0, 0, 0);
}

/* H2 - 区块标题 */
h2 {
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  letter-spacing: normal;
  color: rgb(0, 0, 0);
}

/* H3 - 大标题 */
h3 {
  font-size: 32px;
  font-weight: 600;
  line-height: 36px;
  letter-spacing: -0.96px;
  color: rgba(0, 0, 0, 0.85);
}

/* H4 - 小标题 */
h4 {
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  letter-spacing: normal;
  color: rgb(0, 0, 0);
}

/* H5 - 次级标题 */
h5 {
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: normal;
  color: rgba(0, 0, 0, 0.85);
}
```

### 正文样式 (Body Text)

```css
body {
  font-size: 16px;
  font-weight: 400;
  line-height: normal;
  color: rgb(0, 0, 0);
}
```

### 链接样式 (Links)

```css
a {
  color: rgb(0, 112, 213);
  text-decoration: none;
  font-size: 14px;
}

a:hover {
  /* 动画过渡效果 */
  transition: color 0.3s ease;
}
```

---

## 间距系统

### 标准间距值 (8px Grid System)

```css
/* 基础间距 - 8px 网格系统 */
--space-1: 8px;   /* 0.5rem */
--space-2: 16px;  /* 1rem */
--space-3: 24px;  /* 1.5rem */
--space-4: 32px;  /* 2rem */
--space-6: 48px;  /* 3rem */

/* 特殊间距 */
--space-xs: 4px;
--space-sm: 10px;
--space-md: 14px;
--space-lg: 19px;
```

### 内边距模式 (Padding Patterns)

```css
/* 小按钮 */
.btn-small {
  padding: 8px 16px;
}

/* 标准按钮 */
.btn-medium {
  padding: 15px 32px;
}

/* 大按钮 */
.btn-large {
  padding: 16px 32px;
}

/* 胶囊按钮 */
.btn-capsule {
  padding: 8px 16px 8px 34px;
}

/* 边框按钮 */
.btn-outlined {
  padding: 5px 16px;
}
```

### 外边距模式 (Margin Patterns)

```css
/* 常用外边距组合 */
margin: 48px 0 0;
margin: 32px 0 0;
margin: 16px 0 0;
margin: 14px 16px;
margin: 0 16px;
margin: 0 8px;
```

---

## 按钮系统

### 主要按钮 (Primary Button)

```css
.btn-primary {
  background-color: rgb(0, 112, 213); /* DJI蓝 */
  color: rgb(255, 255, 255);
  border-radius: 1408px; /* 胶囊型 */
  padding: 8px 16px 8px 34px;
  font-size: 14px;
  font-weight: 400;
  border: 0;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: rgb(0, 96, 231);
}
```

### 次要按钮 (Secondary Button)

```css
.btn-secondary {
  background-color: rgb(60, 62, 64); /* 深灰 */
  color: rgb(255, 255, 255);
  border-radius: 2px;
  padding: 15px 32px;
  font-size: 16px;
  font-weight: 400;
  border: 0;
  transition: background-color 0.3s;
}
```

### 边框按钮 (Outlined Button)

```css
.btn-outlined {
  background-color: transparent;
  color: rgb(0, 0, 238);
  border: 1px solid rgb(255, 255, 255);
  border-radius: 64px;
  padding: 5px 16px;
  font-size: 16px;
  font-weight: 400;
  transition: all 0.3s;
}
```

### 控制按钮 (Control Button)

```css
.control-btn {
  background-color: transparent;
  color: rgb(0, 0, 0);
  border-radius: 0 8px 8px 0;
  padding: 1px 6px;
  border: 0;
}
```

### 按钮状态

```css
/* 悬停状态 */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.1) 0px 8px 16px 0px;
}

/* 激活状态 */
.btn:active {
  transform: translateY(0);
}

/* 禁用状态 */
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

---

## 圆角系统

### 标准圆角值

```css
/* 小圆角 */
--radius-xs: 2px;  /* 小卡片/按钮 */
--radius-sm: 4px;  /* 中等元素 */
--radius-md: 6px;  /* 大卡片 */
--radius-lg: 8px;  /* 容器/导航 */

/* 圆形 */
--radius-circle: 50%; /* 圆形头像/图标 */

/* 胶囊型 */
--radius-pill-sm: 60px;
--radius-pill-md: 64px;
--radius-pill-lg: 99px;
--radius-pill-xl: 999px;
--radius-pill-xxl: 1408px;

/* 特殊圆角 */
--radius-top-right: 0 8px 8px 0;
--radius-bottom: 0 0 8px 8px;
--radius-asymmetric: 4px 0 0 4px;
```

### 使用场景

| 圆角值 | 使用场景 |
|--------|----------|
| 2px | 小按钮、标签 |
| 4px | 输入框、卡片 |
| 6px | 大卡片、容器 |
| 8px | 导航、模态框 |
| 50% | 头像、圆形图标 |
| 64px+ | 胶囊型按钮 |

---

## 阴影系统

### 阴影层级

```css
/* 微阴影 - 悬停提示 */
--shadow-xs: rgba(0, 0, 0, 0.05) 0px 2px 4px 0px;

/* 小阴影 - 卡片、按钮 */
--shadow-sm: rgba(0, 0, 0, 0.1) 0px 2px 6px 0px;

/* 中阴影 - 下拉菜单 */
--shadow-md: rgba(0, 0, 0, 0.1) 0px 8px 16px 0px;

/* 大阴影 - 模态框 */
--shadow-lg: rgba(0, 0, 0, 0.1) 0px 16px 16px 0px;

/* 超大阴影 - 弹出层 */
--shadow-xl: rgba(0, 0, 0, 0.1) 0px 16px 32px 0px;

/* 方向阴影 */
--shadow-directional: rgba(0, 0, 0, 0.1) 4px 4px 8px 0px;

/* 特殊阴影 */
--shadow-elevated: rgba(0, 0, 0, 0.2) 0px 2px 8px 0px;
```

### 使用示例

```css
/* 卡片悬停效果 */
.card {
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.3s;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

/* 模态框 */
.modal {
  box-shadow: var(--shadow-xl);
}

/* 下拉菜单 */
.dropdown {
  box-shadow: var(--shadow-md);
}
```

---

## 响应式断点

### 断点定义

```css
/* 移动端优先 */
/* 默认样式: 0-456px */

/* 小屏移动设备 */
@media screen and (max-width: 456px) {
  /* 超小屏幕样式 */
}

/* 平板设备 */
@media screen and (max-width: 768px) {
  /* 移动端和平板样式 */
}

/* 桌面端 */
@media screen and (min-width: 769px) {
  /* 桌面端样式 */
}
```

### 推荐断点值

```css
/* 标准断点系统 */
--breakpoint-xs: 456px;   /* 超小屏 */
--breakpoint-sm: 768px;   /* 小屏 */
--breakpoint-md: 1024px;  /* 中屏 */
--breakpoint-lg: 1440px;  /* 大屏 */
--breakpoint-xl: 1920px;  /* 超大屏 */
```

### 当前测试视口

- **宽度**: 1438px
- **高度**: 851px

---

## 动画系统

### 过渡时长 (Duration)

```css
/* 快速过渡 */
--duration-fast: 0.1s;
--duration-quick: 0.3s;

/* 标准过渡 */
--duration-normal: 0.4s;
--duration-medium: 0.5s;
--duration-slow: 0.6s;

/* 长过渡 */
--duration-slower: 0.7s;
```

### 缓动函数 (Easing)

```css
/* 标准缓动 */
--ease-default: ease;
--ease-in-out: ease-in-out;
--ease-linear: linear;

/* 自定义贝塞尔曲线 */
--ease-smooth: cubic-bezier(0.215, 0.61, 0.355, 1);
--ease-material: cubic-bezier(0.25, 0.39, 0.25, 1);
```

### 关键帧动画

```css
/* 进场动画 */
@keyframes shutter-in-top {
  /* 3s ease 动画 */
}

/* 旋转加载动画 */
@keyframes fa-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading {
  animation: fa-spin 2s linear infinite;
}
```

### 过渡效果配置

```css
/* 通用过渡 */
.transition-all {
  transition: all 0.3s ease;
}

/* 透明度过渡 */
.fade {
  transition: opacity 0.6s ease-in-out;
}

/* 变换过渡 */
.transform {
  transition: transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

/* 背景色过渡 */
.bg-transition {
  transition: background-color 0.3s ease;
}

/* 高度过渡 */
.height-transition {
  transition: max-height 0.7s ease;
}

/* 复杂过渡组合 */
.complex-transition {
  transition: 
    opacity 0.6s linear,
    transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}
```

### 悬停效果示例

```css
/* 按钮悬停 */
.btn {
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 链接悬停 */
a {
  transition: color 0.3s ease;
}

a:hover {
  color: var(--primary-blue);
}

/* 卡片悬停 */
.card {
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-xl);
}
```

---

## 组件统计

### 组件数量分布

| 组件类型 | 数量 | 说明 |
|---------|------|------|
| 卡片 (Cards) | 5 | 产品卡片、内容卡片 |
| 按钮 (Buttons) | 31 | 各类CTA和操作按钮 |
| 表单元素 (Inputs) | 6 | 输入框、选择器 |
| 模态框 (Modals) | 9 | 对话框、弹窗 |
| 导航项 (Nav Items) | 89 | 导航链接和菜单项 |
| 容器 (Containers) | 13 | 布局容器 |
| 网格布局 (Grids) | 43 | 网格系统元素 |

### 组件复用率

基于8px网格系统和统一的设计规范，组件具有高度的可复用性和一致性。

---

## 图像系统

### 图片格式策略

| 格式 | 用途 | 优势 |
|------|------|------|
| **JPG** | 背景大图、产品摄影 | 文件小、色彩丰富 |
| **SVG** | Logo、图标、产品标识 | 矢量无损、可缩放 |
| **WebP** | 优化后的产品图 | 更小的文件体积 |
| **GIF** | Loading动画 | 动画支持 |

### 图像加载策略

```html
<!-- 懒加载 -->
<img loading="auto" />

<!-- CDN加速 -->
<!-- 使用 www-cdn.djiits.com -->
```

### 图像资源统计

- **SVG元素**: 8个
- **IMG标签**: 35个
- **背景图片**: 多个通过CSS加载

### 图标使用

```html
<!-- Base64 内联SVG -->
<img src="data:image/svg+xml;base64,..." />

<!-- 外部SVG文件 -->
<img src="https://www-cdn.djiits.com/cms/uploads/xxx.svg" />
```

### 响应式图片

```html
<!-- 不同分辨率加载 -->
<img 
  src="image.jpg" 
  srcset="image-2x.jpg 2x, image-3x.jpg 3x"
  alt="产品图"
/>
```

---

## 导航系统

### 导航栏规格

```css
.navbar {
  height: 64px;
  position: absolute;
  z-index: 900;
  background-color: rgba(0, 0, 0, 0); /* 透明背景 */
  padding: 0;
}

.nav-item {
  color: rgb(255, 255, 255);
  font-size: 14px;
  text-decoration: none;
  transition: all 0.3s ease;
}
```

### 导航结构

**主导航分类**:
1. 航拍无人机
2. 手持摄影设备
3. 储能及家居科技
4. 商用产品及方案
5. 探索精彩

**辅助导航**:
- 搜索
- 用户中心
- 登录/注册
- 商城

### 导航状态

```css
/* 默认状态 */
.nav-item {
  color: rgb(255, 255, 255);
  opacity: 1;
}

/* 悬停状态 */
.nav-item:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

/* 激活状态 */
.nav-item.active {
  font-weight: 600;
}
```

---

## 布局系统

### 布局方式

```css
/* Flexbox - 主要布局方式 */
.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

/* Grid - 网格布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
```

### 容器宽度

```css
/* 全宽容器 */
.container-fluid {
  width: 100%;
  max-width: 100%;
}

/* 限定宽度容器 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 响应式容器 */
.container-responsive {
  max-width: 1200px;
  margin: 0 auto;
}

@media screen and (max-width: 768px) {
  .container-responsive {
    padding: 0 16px;
  }
}
```

### 栅格系统

基于 Flexbox 的 12 列栅格系统，支持响应式布局。

```css
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8px;
}

.col {
  flex: 1;
  padding: 0 8px;
}
```

---

## 图标系统

### 图标库

**使用的图标资源**:
1. **Font Awesome 4.4.0** - Web字体图标
2. **自定义SVG图标** - 品牌定制图标
3. **Base64内联SVG** - 小型图标优化

### 图标文件

```html
<!-- Font Awesome -->
<link href="fontawesome-webfont.woff2?v=4.4.0" />

<!-- SVG图标示例 -->
<svg width="16" height="16" viewBox="0 0 16 16">
  <path fill="#FFF" d="..."/>
</svg>
```

### 常用图标类型

- **导航图标**: 搜索、用户、购物车
- **箭头图标**: 左/右箭头、下拉箭头
- **状态图标**: 关闭、选中、警告
- **社交图标**: 微信、微博、抖音、B站、小红书

### 图标尺寸

```css
/* 小图标 */
.icon-sm {
  width: 12px;
  height: 12px;
}

/* 标准图标 */
.icon-md {
  width: 16px;
  height: 16px;
}

/* 大图标 */
.icon-lg {
  width: 24px;
  height: 24px;
}
```

---

## 设计原则总结

### 1. 简洁现代 (Minimalist & Modern)

- 大量留白，突出产品
- 清晰的视觉层级
- 干净的界面设计

### 2. 品牌一致性 (Brand Consistency)

- 蓝黑白主色调贯穿全站
- 统一的字体系统
- 一致的图标风格

### 3. 响应式优先 (Responsive First)

- 移动端和桌面端完美适配
- 流式布局设计
- 触摸友好的交互

### 4. 性能优化 (Performance Optimized)

- CDN加速
- SVG矢量图标
- WebFont优化
- 图片懒加载

### 5. 微交互 (Micro-interactions)

- 丰富的过渡动画
- 平滑的悬停效果
- 细腻的状态反馈

### 6. 模块化设计 (Modular Design)

- 可复用的组件系统
- 统一的设计规范
- 标准化的接口

### 7. 网格系统 (Grid System)

- 基于8px的间距系统
- 统一的布局规范
- 响应式栅格

### 8. 可访问性 (Accessibility)

- 合理的色彩对比度
- 清晰的视觉层级
- 语义化的HTML结构

---

## 技术实现建议

### CSS变量定义

```css
:root {
  /* 颜色 */
  --color-primary: rgb(0, 112, 213);
  --color-text: rgba(0, 0, 0, 0.85);
  --color-bg: rgb(255, 255, 255);
  
  /* 间距 */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-pill: 1408px;
  
  /* 阴影 */
  --shadow-sm: rgba(0, 0, 0, 0.1) 0px 2px 6px 0px;
  --shadow-lg: rgba(0, 0, 0, 0.1) 0px 16px 16px 0px;
  
  /* 过渡 */
  --transition-fast: 0.3s ease;
  --transition-normal: 0.5s ease;
}
```

### 组件化开发

推荐使用 React/Vue 组件化开发，将设计系统封装为可复用组件库。

```jsx
// Button组件示例
<Button variant="primary" size="medium">
  了解更多
</Button>

<Button variant="secondary" size="large">
  立即购买
</Button>
```

---

## 总结

DJI官网的设计系统展现出高度的专业性和品牌一致性，通过精细的排版、克制的配色、流畅的动画和严谨的规范，创造出优秀的用户体验。该设计系统具有以下特点：

✅ **系统化**: 完整的设计规范体系  
✅ **模块化**: 可复用的组件设计  
✅ **响应式**: 全设备适配  
✅ **高性能**: 优化的资源加载  
✅ **可维护**: 清晰的代码组织  

这套设计系统可作为企业级产品设计的优秀参考案例。
