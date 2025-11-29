# Hero 背景图文字可读性优化

## 问题描述

在 Hero Section 中使用全屏背景图时，白色文字可能因背景图片过亮或对比度不足而难以阅读。

## 解决方案

在背景图片上添加黑色半透明遮罩层，增强文字与背景的对比度。

### 实现代码

```tsx
// 背景图片层 (z-0)
{imageUrl && (
    <div className="absolute inset-0 z-0">
        <Image
            src={imageUrl}
            alt={altText}
            fill
            className="object-cover"
            priority={true}
            quality={90}
        />
    </div>
)}

// 内容层 (z-10)
<div className="relative z-10 container mx-auto px-4 py-16 text-center">
    <h1 className="text-4xl md:text-6xl font-bold text-white">
        {title}
    </h1>
    {/* 其他内容 */}
</div>

// 黑色半透明遮罩层 (z-1，位于图片和内容之间)
{imageUrl && (
    <div className="absolute inset-0 z-[1] bg-black/40" />
)}
```

### 层级结构

```
z-10: 文字内容层
z-1:  黑色半透明遮罩层
z-0:  背景图片层
```

### Tailwind 透明度说明

| 类名 | 透明度 | 效果 |
|------|--------|------|
| `bg-black/20` | 20% | 轻微暗化，适合已有对比度的图片 |
| `bg-black/30` | 30% | 较轻暗化 |
| `bg-black/40` | 40% | 推荐值，平衡图片可见性和文字可读性 |
| `bg-black/50` | 50% | 中等暗化 |
| `bg-black/60` | 60% | 较强暗化，适合非常亮的背景图 |

## 其他方案对比

### 方案一：纯色遮罩（推荐）

```tsx
<div className="absolute inset-0 z-[1] bg-black/40" />
```

**优点**：简单、性能好、效果一致
**缺点**：整体暗化，可能影响图片细节展示

### 方案二：渐变遮罩

```tsx
<div
    className="absolute inset-0 z-[1]"
    style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)'
    }}
/>
```

**优点**：顶部保留更多图片细节，底部文字区域更易读
**缺点**：如果文字位置变化，效果可能不理想

### 方案三：文字阴影

```tsx
<h1 className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
    {title}
</h1>
```

**优点**：不影响背景图片展示
**缺点**：阴影可能显得不够精致，大段文字效果不佳

### 方案四：文字背景模糊

```tsx
<div className="backdrop-blur-sm bg-black/20 rounded-lg p-4">
    <h1 className="text-white">{title}</h1>
</div>
```

**优点**：现代感强，局部处理
**缺点**：改变了布局结构，可能不符合全屏 Hero 的设计意图

## 最佳实践

1. **首选方案**：40% 黑色遮罩 (`bg-black/40`)，适用于大多数场景
2. **亮色背景图**：可提高到 50-60% (`bg-black/50` 或 `bg-black/60`)
3. **暗色背景图**：可降低到 20-30% (`bg-black/20` 或 `bg-black/30`)
4. **品牌色遮罩**：如需保持品牌调性，可使用品牌色的半透明版本

## 相关文件

- `apps/dji-storefront/src/components/homepage/hero-section.tsx`

## 参考

- [Tailwind CSS Background Color Opacity](https://tailwindcss.com/docs/background-color#changing-the-opacity)
- [Web Content Accessibility Guidelines (WCAG) - Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
