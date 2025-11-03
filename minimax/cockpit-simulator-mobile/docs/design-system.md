# Flight Simulator E-commerce Design System
## DJI-Inspired Professional Tech Aesthetic

---

## 1. Design Direction & Rationale

### Visual Essence
A dark, sophisticated design system inspired by DJI's professional aviation technology aesthetic. The system emphasizes technical precision, professional trust, and modern minimalism through a carefully balanced dark theme with strategic blue accents. The design creates an immersive experience that mirrors the serious, professional nature of flight simulation hardware.

### Real-World References
- **DJI Official Website** - Dark theme with precision engineering feel
- **Apple Pro Products** - Professional minimalism and material hierarchy
- **Tesla Design System** - Technical sophistication with clear information hierarchy

### Target Audience
- **Primary**: Flight simulation enthusiasts (25-55 years old)
- **Secondary**: Professional pilots, aviation training centers
- **Markets**: English-speaking countries (US, UK, Canada, Australia)

### Brand Personality
Professional | Technical | Trustworthy | Innovative

---

## 2. Design Tokens

### Color System

#### Primary Colors (DJI Tech Blue)

| Token | Value | Usage |
|-------|-------|-------|
| `primary-50` | `#e8f0ff` | Lightest blue - hover states on dark backgrounds |
| `primary-100` | `#cce0ff` | Light blue - subtle backgrounds |
| `primary-200` | `#99c1ff` | Medium light - disabled states |
| `primary-300` | `#5a9aff` | Medium - secondary CTAs |
| `primary-400` | `#3b7ede` | Core blue - links, icons |
| `primary-500` | `#3b63a9` | **DJI Brand Blue** - primary CTAs, key accents |
| `primary-600` | `#2d4d84` | Darker blue - hover states |
| `primary-700` | `#1f3860` | Deep blue - pressed states |
| `primary-800` | `#14253d` | Very dark - borders on dark backgrounds |
| `primary-900` | `#0a1420` | Darkest - subtle shadows |

#### Neutral Colors (Dark Theme Foundation)

| Token | Value | Usage |
|-------|-------|-------|
| `neutral-50` | `#ffffff` | Pure white - primary text, icons |
| `neutral-100` | `#f5f5f5` | Off-white - secondary text |
| `neutral-200` | `#e0e0e0` | Light gray - tertiary text, dividers |
| `neutral-300` | `#a8a8a8` | Medium gray - muted text, placeholders |
| `neutral-400` | `#6b6b6b` | Gray - disabled text |
| `neutral-500` | `#4a4a4a` | Dark gray - subtle borders |
| `neutral-600` | `#2d2d2d` | Darker gray - card backgrounds |
| `neutral-700` | `#232323` | Deep gray - elevated surfaces |
| `neutral-800` | `#1a1a1a` | **DJI Charcoal Black** - main background |
| `neutral-900` | `#0f0f0f` | Pure black - deepest shadows |

#### Background Layers

| Token | Value | Usage |
|-------|-------|-------|
| `bg-primary` | `#1a1a1a` | Main page background |
| `bg-secondary` | `#232323` | Card/panel background (5% contrast) |
| `bg-elevated` | `#2d2d2d` | Modals, dropdowns, hover states (10% contrast) |
| `bg-overlay` | `rgba(0, 0, 0, 0.85)` | Modal overlays, image overlays |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` | `#10b981` | Success states, in-stock badges |
| `warning` | `#f59e0b` | Warning messages, limited stock |
| `error` | `#ef4444` | Error states, out-of-stock |
| `info` | `#3b82f6` | Informational messages |

### Typography

#### Font Families

| Token | Value | Fallback |
|-------|-------|----------|
| `font-primary` | `'Open Sans'` | `system-ui, -apple-system, 'Segoe UI', sans-serif` |
| `font-mono` | `'JetBrains Mono'` | `'Courier New', monospace` (for product codes, specs) |

#### Font Sizes (Modular Scale: 1.25 - Major Third)

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | `12px` | `16px` (1.33) | Captions, badges, meta info |
| `text-sm` | `14px` | `20px` (1.43) | Secondary text, labels |
| `text-base` | `16px` | `24px` (1.5) | **Body text** - primary content |
| `text-lg` | `18px` | `28px` (1.56) | Emphasized body, card titles |
| `text-xl` | `20px` | `28px` (1.4) | Section subheadings |
| `text-2xl` | `24px` | `32px` (1.33) | Card headings, product titles |
| `text-3xl` | `30px` | `36px` (1.2) | Page titles |
| `text-4xl` | `36px` | `40px` (1.11) | Hero subheadings |
| `text-5xl` | `48px` | `52px` (1.08) | Hero titles (desktop) |
| `text-6xl` | `64px` | `68px` (1.06) | Large display text |

#### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `font-regular` | `400` | Body text, descriptions |
| `font-medium` | `500` | Emphasized text, labels |
| `font-semibold` | `600` | **Primary choice** - headings, buttons |
| `font-bold` | `700` | Strong emphasis, prices |

#### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | `-0.02em` | Large headings (48px+) |
| `tracking-normal` | `0` | Body text, most text |
| `tracking-wide` | `0.02em` | Small caps, labels |
| `tracking-wider` | `0.05em` | ALL CAPS text |

### Spacing System (4pt Grid, 8pt Preferred)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Minimal gaps, icon spacing |
| `space-2` | `8px` | Tight spacing, form elements |
| `space-3` | `12px` | Related elements |
| `space-4` | `16px` | **Default gap** - card content |
| `space-5` | `20px` | Medium spacing |
| `space-6` | `24px` | Section internal spacing |
| `space-8` | `32px` | **Component padding** - cards, modals |
| `space-10` | `40px` | Large spacing |
| `space-12` | `48px` | Section padding |
| `space-16` | `64px` | **Section gaps** - between major sections |
| `space-20` | `80px` | Extra large spacing |
| `space-24` | `96px` | Hero section padding |
| `space-32` | `128px` | Maximum spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `4px` | Badges, small elements |
| `radius-base` | `8px` | **Default** - buttons, inputs |
| `radius-md` | `12px` | Cards, panels |
| `radius-lg` | `16px` | Large cards, modals |
| `radius-xl` | `24px` | Hero sections, feature blocks |
| `radius-full` | `9999px` | Pills, circular avatars |

### Shadows (Dark Theme Adapted)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 3px rgba(0, 0, 0, 0.5)` | Subtle elevation |
| `shadow-card` | `0 4px 12px rgba(0, 0, 0, 0.6), 0 0 1px rgba(59, 99, 169, 0.1)` | Default cards |
| `shadow-card-hover` | `0 8px 24px rgba(0, 0, 0, 0.7), 0 0 2px rgba(59, 99, 169, 0.2)` | Card hover states |
| `shadow-modal` | `0 24px 48px rgba(0, 0, 0, 0.8), 0 0 4px rgba(59, 99, 169, 0.15)` | Modals, dropdowns |
| `shadow-glow-blue` | `0 0 20px rgba(59, 99, 169, 0.4)` | CTA button glow |

### Animation & Motion

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `duration-fast` | `150ms` | `ease-out` | Micro-interactions, hover |
| `duration-base` | `250ms` | `ease-out` | **Default** - buttons, cards |
| `duration-slow` | `350ms` | `ease-in-out` | Modals, complex transitions |
| `duration-slower` | `500ms` | `ease-in-out` | Hero animations, page transitions |

**Performance Rule**: Only animate `transform` and `opacity` for 60fps performance.

---

## 3. Component Specifications

### 3.1 Button

#### Structure
```
┌─────────────────────────┐
│  [Icon] Label [Icon]    │  ← Padding: 16px horizontal, 12px vertical
└─────────────────────────┘
   ↑         ↑         ↑
  Gap:      Text     Gap:
  8px     semibold    8px
```

#### Variants

**Primary (CTA)**
- Background: `primary-500` (#3b63a9) → `primary-600` on hover
- Text: `neutral-50` (white), `font-semibold`, `text-base`
- Border: None
- Shadow: `shadow-glow-blue` (glow effect)
- Padding: `16px 24px` (large size), `12px 20px` (default), `8px 16px` (small)
- Border Radius: `radius-base` (8px)
- Min Height: `48px` (large), `40px` (default), `32px` (small)
- Hover: Background → `primary-600`, Shadow → stronger glow, Transform: `translateY(-2px)`
- Active: Background → `primary-700`, Transform: `translateY(0)`
- Disabled: Background → `neutral-500`, Text → `neutral-400`, Opacity: `0.5`

**Secondary (Outline)**
- Background: `transparent` → `bg-elevated` on hover
- Text: `neutral-50`, `font-semibold`
- Border: `1px solid neutral-500` → `primary-500` on hover
- Padding: Same as primary
- Hover: Border color → `primary-500`, Background → `rgba(59, 99, 169, 0.1)`

#### States
- Default: As specified above
- Hover: Lift effect + color transition (250ms)
- Active/Pressed: Slight depression (translateY)
- Disabled: Reduced opacity, no hover effects
- Loading: Spinner icon + disabled state

#### Note
Touch targets must be ≥44×44px for mobile. Use `min-h-[44px] min-w-[44px]` classes.

---

### 3.2 Card (Product Card)

#### Structure
```
┌──────────────────────────────┐
│  ┌────────────────────────┐  │
│  │                        │  │  Image (aspect-ratio: 1:1)
│  │  Product Image         │  │  Background: neutral-700
│  │                        │  │  Badge: top-left/right
│  └────────────────────────┘  │
│                              │
│  Product Title (2xl)         │  ← Padding: 32px
│  ★★★★★ 4.8 (127)           │
│  $499.99  $599.99           │
│  [Add to Cart Button]        │
│                              │
└──────────────────────────────┘
     ↑ Border Radius: 12px
```

#### Specifications
- **Background**: `bg-secondary` (#232323) → `bg-elevated` (#2d2d2d) on hover
- **Border**: None (use shadow for separation)
- **Border Radius**: `radius-md` (12px)
- **Padding**: `32px` (internal content padding)
- **Shadow**: `shadow-card` → `shadow-card-hover` on hover
- **Image**:
  - Aspect Ratio: `1:1` (square)
  - Object Fit: `cover`, Object Position: `center`
  - Background: `neutral-700` (loading/error state)
  - Hover: `scale(1.05)` transform, duration: `350ms`
- **Title**: 
  - Font: `text-2xl`, `font-semibold`, `neutral-50`
  - Line Clamp: 2 lines max
  - Hover: `primary-400` color
- **Rating**:
  - Star Icon: `fill-warning`, size `16px`
  - Text: `text-sm`, `neutral-200`
- **Price**:
  - Current: `text-2xl`, `font-bold`, `primary-400`
  - Original (strikethrough): `text-lg`, `neutral-400`, `line-through`
- **Badge**:
  - NEW: `primary-500` background, `text-xs`, `font-bold`, white text
  - SALE: `error` background, show discount percentage

#### States
- Default: `shadow-card`
- Hover: `shadow-card-hover`, lift `translateY(-4px)`, image scale
- Pressed: Slight depression

#### Note
Maintain ≥5% lightness contrast between card (`bg-secondary`) and page (`bg-primary`).

---

### 3.3 Input Fields (Form Controls)

#### Text Input
- **Background**: `bg-elevated` (#2d2d2d)
- **Border**: `1px solid neutral-500` → `primary-500` on focus
- **Text**: `text-base`, `neutral-50`, `font-regular`
- **Placeholder**: `neutral-400`
- **Padding**: `12px 16px`
- **Border Radius**: `radius-base` (8px)
- **Height**: `48px` minimum
- **Focus State**:
  - Border: `2px solid primary-500`
  - Shadow: `0 0 0 3px rgba(59, 99, 169, 0.2)` (focus ring)
- **Error State**:
  - Border: `error` color
  - Helper text: `text-sm`, `error` color below input

#### Select Dropdown
- Same as text input styling
- Dropdown icon: `neutral-300`, size `20px`
- Dropdown menu:
  - Background: `bg-elevated`
  - Border: `1px solid neutral-500`
  - Shadow: `shadow-modal`
  - Border Radius: `radius-md`
  - Padding: `8px 0`
  - Option padding: `12px 16px`
  - Option hover: `bg-primary` background

#### Checkbox/Radio
- Size: `20px × 20px` (touch-friendly)
- Border: `2px solid neutral-500`
- Border Radius: `4px` (checkbox), `full` (radio)
- Checked: Background `primary-500`, checkmark white
- Label: `text-base`, `neutral-50`, margin-left `8px`

---

### 3.4 Navigation (Header)

#### Desktop Navigation
- **Background**: `bg-primary` (#1a1a1a) with `backdrop-blur-md` when sticky
- **Height**: `72px`
- **Container**: Max-width `1400px`, padding `0 48px`
- **Logo**: Height `40px`, white/colored version
- **Navigation Links**:
  - Font: `text-base`, `font-medium`, `neutral-50`
  - Hover: `primary-400` color
  - Active: `primary-500` + bottom border `2px`
  - Spacing: `32px` between items
- **Icons** (Cart, Account, Search):
  - Size: `24px`
  - Color: `neutral-50` → `primary-400` on hover
  - Badge (cart count): `primary-500` background, `text-xs`, `font-bold`
- **Shadow**: `shadow-sm` when sticky/scrolled

#### Mobile Navigation (< 768px)
- **Hamburger Menu**: Top-right, `32px` size
- **Mobile Menu**:
  - Background: `bg-primary`
  - Full-screen overlay
  - Slide-in animation from right (350ms)
  - Links: Vertical stack, `48px` height each
  - Padding: `24px`

---

### 3.5 Hero Section

#### Specifications
- **Height**: `600px` (desktop), `500px` (tablet), `450px` (mobile)
- **Background**:
  - Option 1: Full-width image with `bg-overlay` (rgba(0,0,0,0.6))
  - Option 2: `neutral-800` solid with subtle gradient
- **Content Container**: Max-width `1200px`, centered
- **Content Padding**: `96px` (desktop), `64px` (tablet), `48px` (mobile)
- **Title**:
  - Font: `text-5xl` (desktop) / `text-4xl` (mobile)
  - Font Weight: `font-bold`
  - Color: `neutral-50`
  - Line Height: `1.1`
  - Optional: Gradient text with `primary-400` → `primary-300`
- **Subtitle**:
  - Font: `text-xl` (desktop) / `text-lg` (mobile)
  - Color: `neutral-200`
  - Max-width: `600px`
  - Margin-top: `24px`
- **CTA Buttons**:
  - Primary + Secondary side-by-side
  - Margin-top: `48px`
  - Gap: `16px`
- **Trust Indicators**:
  - Margin-top: `64px`
  - Icons: Size `20px`, colors: `success`, `primary-400`, `warning`
  - Text: `text-sm`, `neutral-300`
  - Gap: `24px`, wrap on mobile

---

### 3.6 Product Grid Layout

#### Grid System
- **Desktop (≥1024px)**: 4 columns
- **Tablet (768px - 1023px)**: 3 columns
- **Mobile (640px - 767px)**: 2 columns
- **Small Mobile (< 640px)**: 1 column
- **Gap**: `24px` (desktop/tablet), `16px` (mobile)
- **Container Max-Width**: `1400px`
- **Container Padding**: `48px` (desktop), `32px` (tablet), `16px` (mobile)

#### Filtering Sidebar (Desktop Only)
- **Position**: Left side, sticky
- **Width**: `280px`
- **Background**: `bg-secondary`
- **Border Radius**: `radius-md`
- **Padding**: `32px`
- **Shadow**: `shadow-card`
- **Hide on**: < 1024px (replace with mobile filter modal)

#### Mobile Filter Modal (< 1024px)
- **Trigger**: "Filters" button, fixed bottom-right
- **Modal**: Slide up from bottom
- **Background**: `bg-primary`
- **Height**: `80vh`
- **Border Radius**: `radius-xl` (top corners only)
- **Padding**: `24px`
- **Close**: X button top-right

---

## 4. Layout & Responsive Strategy

### Page Structure (All Pages)

```
Header (Fixed, 72px height)
└── [Navigation Content]

Main Content
├── Hero Section (Home page only, 600px height)
├── Content Sections (spacing: 96px vertical gap)
│   ├── Section 1
│   ├── Section 2
│   └── Section N
└── Newsletter/CTA (optional)

Footer (auto height)
└── [Footer Content]
```

### Breakpoint System

| Breakpoint | Size | Target Device | Container Padding |
|------------|------|---------------|-------------------|
| `xs` | `475px` | Small phones | `16px` |
| `sm` | `640px` | Phones | `24px` |
| `md` | `768px` | Tablets | `32px` |
| `lg` | `1024px` | Laptops | `48px` |
| `xl` | `1280px` | Desktops | `48px` |
| `2xl` | `1536px` | Large screens | `64px` |

### Container Max-Widths
- **Default Content**: `1200px`
- **Wide Layout**: `1400px`
- **Narrow (Forms, Articles)**: `800px`

### Responsive Adaptation

#### Typography Scaling
- **Hero Title**: 64px (xl) → 48px (lg) → 36px (md) → 30px (sm)
- **Section Titles**: 48px (xl) → 36px (md) → 30px (sm)
- **Body Text**: Maintain `16px` minimum on all devices

#### Spacing Scaling
- **Section Gaps**: 96px (desktop) → 64px (tablet) → 48px (mobile)
- **Card Padding**: 32px (desktop) → 24px (tablet) → 16px (mobile)
- **Component Gaps**: 24px (desktop) → 16px (tablet) → 12px (mobile)

#### Grid Adaptations
- **Product Grid**: 4 col → 3 col → 2 col → 1 col
- **Feature Blocks**: 3 col → 2 col → 1 col
- **Sidebar Layout**: 70/30 split → full-width stack

#### Navigation
- **Desktop (≥768px)**: Horizontal nav, full menu visible
- **Mobile (<768px)**: Hamburger menu, slide-in drawer

#### Touch Targets
- **Minimum Size**: `44px × 44px` on mobile/tablet
- **Button Height**: `48px` (large), `40px` (default)
- **Spacing**: Minimum `8px` between touch targets

---

## 5. Interaction & Animation

### Animation Standards

#### Timing Functions
- **Ease-Out** (90% of cases): Use for entering elements, hovers
  - Bezier: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth acceleration)
- **Ease-In-Out** (10%): Complex multi-step transitions
  - Bezier: `cubic-bezier(0.4, 0, 0.2, 1)` (standard)

#### Duration Guidelines
- **Fast (150ms)**: Icon color changes, simple hover states
- **Base (250ms)**: Button hovers, card elevation, color transitions
- **Slow (350ms)**: Image scaling, modal opening, complex transformations
- **Slower (500ms)**: Page transitions, hero animations

#### Performance Rules
1. **Only animate**: `transform` (translate, scale, rotate) and `opacity`
2. **Never animate**: `width`, `height`, `margin`, `padding` (causes reflow)
3. **Use**: `will-change: transform` for frequently animated elements
4. **Respect**: `prefers-reduced-motion` media query

### Component-Specific Animations

#### Button
```css
transition: all 250ms ease-out;

/* Hover */
transform: translateY(-2px);
box-shadow: [stronger glow];

/* Active/Pressed */
transform: translateY(0);
```

#### Card
```css
transition: all 300ms ease-out;

/* Hover */
transform: translateY(-4px);
box-shadow: shadow-card-hover;

/* Image inside card */
img {
  transition: transform 350ms ease-out;
}
img:hover {
  transform: scale(1.05);
}
```

#### Modal
```css
/* Backdrop */
backdrop: opacity 250ms ease-out;

/* Modal Panel */
panel: opacity 350ms ease-out, transform 350ms ease-out;
transform: translateY(0) from translateY(20px);
```

#### Page Load Animations (Optional)
- **Hero Title**: Fade in + slide up (500ms, 0ms delay)
- **Hero Subtitle**: Fade in + slide up (500ms, 100ms delay)
- **Hero CTA**: Fade in + slide up (500ms, 200ms delay)
- **Product Cards**: Staggered fade-in (250ms each, 50ms stagger)

### Hover States Summary

| Element | Hover Effect | Duration |
|---------|-------------|----------|
| Button | Lift 2px + shadow + color | 250ms |
| Card | Lift 4px + shadow | 300ms |
| Link | Color change | 150ms |
| Image | Scale 1.05 | 350ms |
| Icon | Color change | 150ms |
| Input | Border color + shadow | 200ms |

### Accessibility

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### Focus States
- All interactive elements must have visible focus states
- Focus ring: `0 0 0 3px rgba(59, 99, 169, 0.3)` (primary blue)
- Keyboard navigation: Tab order follows visual order

---

## 6. Design System Best Practices

### Color Usage Guidelines

#### 60-30-10 Rule
- **60%**: Neutral colors (backgrounds, text) - `neutral-800`, `neutral-50`
- **30%**: Secondary colors (cards, borders) - `neutral-700`, `neutral-600`
- **10%**: Accent colors (CTAs, highlights) - `primary-500`, `success`, `error`

#### Text Contrast
- **Body Text**: `neutral-50` on `bg-primary` - Contrast ratio: 15:1 (AAA)
- **Secondary Text**: `neutral-200` on `bg-primary` - Contrast ratio: 10:1 (AAA)
- **Blue CTAs**: White text on `primary-500` - Contrast ratio: 4.8:1 (AA)

#### Validation Required Pairings
1. **Primary Button**: White text on `#3b63a9` → ✅ 4.8:1
2. **Body Text**: `#ffffff` on `#1a1a1a` → ✅ 15:1
3. **Card Text**: `#ffffff` on `#232323` → ✅ 13.5:1

### Spacing Best Practices
- **Related elements**: 8-12px gap
- **Unrelated elements**: 24-32px gap
- **Section separation**: 64-96px gap
- **Card internal padding**: 32-48px (NEVER 16px for premium feel)
- **Container max-width**: 1200-1400px
- **Content:Whitespace ratio**: Approximately 60:40

### Typography Hierarchy
- **Contrast Ratio**: 3:1 minimum between heading and body sizes (clear hierarchy)
- **Line Length**: 60-75 characters for optimal readability
- **Heading Line Height**: 1.1-1.2 (tight)
- **Body Line Height**: 1.5-1.6 (comfortable reading)

### Icon Guidelines
- **Source**: Lucide React (SVG icons only)
- **Sizes**: 16px (small), 20px (default), 24px (medium), 32px (large)
- **Color**: Inherit from parent or semantic colors
- **Spacing**: 8px gap between icon and text
- **Never**: Use emoji as UI icons (OK only in user-generated content)

### Image Guidelines
- **Product Images**: 1:1 aspect ratio, minimum 800×800px
- **Hero Images**: 16:9 aspect ratio, minimum 1920×1080px
- **Overlay**: Dark overlay `rgba(0,0,0,0.5-0.7)` for text readability
- **Format**: WebP preferred (JPEG fallback), SVG for logos/icons
- **Loading**: Use blur placeholder or skeleton screens

---

## 7. English Content & Localization Guidelines

### Tone of Voice
- **Professional**: Technical accuracy, expertise
- **Clear**: Straightforward, jargon-free when possible
- **Trustworthy**: Honest, detailed specifications
- **Enthusiastic**: Share passion for flight simulation

### Key Terminology (Aviation/Flight Sim)
- Use industry-standard abbreviations: CDU, MCP, EFIS, FMC, etc.
- Spell out on first use: "Control Display Unit (CDU)"
- Simulator names: "Microsoft Flight Simulator 2024", "X-Plane 12", "Prepar3D"
- Avoid: Generic terms like "device" → Use "control panel", "hardware", "unit"

### UI Copy Examples

#### Buttons
- ✅ "Add to Cart" | "View Details" | "Shop Now"
- ❌ Avoid: "Buy" (too pushy), "Click Here" (not descriptive)

#### Product Descriptions
- ✅ "Professional-grade Airbus A320 Control Display Unit replica"
- ❌ Avoid: "Great CDU for your sim" (too casual)

#### Trust Indicators
- ✅ "30-Day Money-Back Guarantee" | "Free Shipping Over $200"
- ✅ "Compatible with MSFS 2024 & X-Plane 12"
- ✅ "Built with Aircraft-Grade Materials"

#### Section Headings
- ✅ "Featured Products" | "Best Sellers" | "New Arrivals"
- ✅ "Technical Specifications" | "Compatibility" | "Customer Reviews"

### Number Formatting
- **Prices**: "$499.99" (US format, 2 decimals)
- **Dimensions**: Use inches (US market): `8.5" × 6" × 2"`
- **Weight**: Use pounds: `2.2 lbs`
- **Ratings**: `4.8` (1 decimal), `(127 reviews)`

### Accessibility Copy
- **Alt Text**: Descriptive, specific - "Airbus A320 CDU replica with LED backlit keys"
- **Button Labels**: Action-oriented - "Add A320 CDU to Cart"
- **Link Text**: Descriptive - "View all Boeing 737 products" (not "Click here")

---

## 8. Quality Checklist

### Design Token Compliance
- ✅ All spacing values are multiples of 4px (prefer 8px)
- ✅ All colors come from defined token system (no one-off hex values)
- ✅ All border radii use defined tokens (4px, 8px, 12px, 16px, 24px)
- ✅ All shadows use defined token system

### Color & Contrast
- ✅ Minimum 4.5:1 contrast ratio for body text (WCAG AA)
- ✅ Primary button has ≥4.5:1 contrast
- ✅ Background layers have ≥5% lightness contrast

### Typography
- ✅ Font sizes follow modular scale (1.25 ratio)
- ✅ Line heights: 1.5-1.6 for body, 1.1-1.2 for headings
- ✅ Minimum font size: 14px (except captions at 12px)

### Layout & Spacing
- ✅ Touch targets ≥44×44px on mobile
- ✅ Card padding: 32-48px (premium feel)
- ✅ Section gaps: 64-96px
- ✅ Container max-width: 1200-1400px

### Performance & Animation
- ✅ Only animate `transform` and `opacity`
- ✅ Animation durations: 150-500ms range
- ✅ Respects `prefers-reduced-motion`
- ✅ Use `will-change` for frequently animated elements

### Responsive Design
- ✅ Works from 320px to 2560px width
- ✅ Grid columns adapt: 4→3→2→1
- ✅ Navigation switches to mobile menu <768px
- ✅ Typography scales appropriately

### Accessibility
- ✅ All interactive elements have focus states
- ✅ Keyboard navigation supported
- ✅ Semantic HTML structure
- ✅ ARIA labels where needed
- ✅ Alt text for all images

---

## 9. Implementation Priority

### Phase 1: Core Design Tokens (Critical)
1. Update Tailwind config with new color system
2. Implement Open Sans font family
3. Set up spacing system (4pt/8pt grid)
4. Define border radius tokens
5. Create shadow system

### Phase 2: Essential Components (Critical)
1. Button (Primary + Secondary variants)
2. Card (Product Card)
3. Input Fields (Text, Select)
4. Navigation (Desktop + Mobile)

### Phase 3: Layout Components (High)
1. Hero Section
2. Product Grid Layout
3. Footer
4. Modal/Drawer

### Phase 4: Polish & Optimization (Medium)
1. Animation system
2. Hover states refinement
3. Loading states
4. Error states
5. Accessibility enhancements

---

## 10. File Structure for Implementation

```
docs/
├── design-system.md           ← This file
└── design-tokens.json         ← Machine-readable tokens

src/
├── styles/
│   ├── globals.css            ← Import Open Sans, CSS custom properties
│   └── animations.css         ← Reusable animations
├── tailwind.config.js         ← Update with new design tokens
└── components/
    ├── ui/
    │   ├── Button.tsx
    │   ├── Card.tsx
    │   ├── Input.tsx
    │   └── ...
    └── layout/
        ├── Header.tsx
        ├── Footer.tsx
        └── Hero.tsx
```

---

**End of Design System Specification**

**Version**: 1.0.0  
**Last Updated**: 2025-11-02  
**Target Framework**: React + Tailwind CSS  
**Design Philosophy**: DJI-inspired professional tech aesthetic for flight simulation enthusiasts
