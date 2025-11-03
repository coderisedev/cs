# Apps/Web Development Plan - Cockpit Simulator Mobile Migration

> **Base Project**: minimax/cockpit-simulator-mobile  
> **Target**: apps/web (medusa-next)  
> **Start Date**: 2025-11-02  
> **Estimated Duration**: 16-22 working days

## Executive Summary

This plan outlines the migration and enhancement of apps/web based on the proven cockpit-simulator-mobile implementation, prioritizing Cart/Checkout optimization and Collections showcase, while maintaining DJI design system integrity and Medusa commerce integration.

---

## Strategic Decisions

### ✅ Confirmed Approaches

1. **Design System**: DJI Design System Primary + Selective Medusa UI Integration (方案 A)
   - Core design tokens (colors, spacing, shadows, typography) from DJI system
   - Retain Medusa UI functional components (Select, Dialog) with DJI theme overrides
   - Cart/Checkout maintains Medusa logic with DJI visual styling

2. **Responsive Strategy**: Mobile-First, Progressive Desktop Enhancement
   - Phase 1: Mobile-optimized (320px - 768px)
   - Phase 2: Desktop enhancement (769px+)
   - Responsive breakpoints aligned with DJI system

3. **Content Sources**:
   - **Products**: Medusa 2.x backend via @medusajs/js-sdk
   - **Blog**: Static data (JSON/MDX), ready for Strapi migration
   - **Software**: Static content with version management

4. **Priority Order** (Critical → High → Medium):
   - **P0 (Critical)**: Cart/Checkout Optimization
   - **P1 (High)**: Collections Showcase
   - **P2 (High)**: Navigation & Layout
   - **P3 (Medium)**: Blog System
   - **P4 (Medium)**: Account Pages

---

## Development Phases

### **Phase 0: Foundation Setup (2-3 days)**

**Objective**: Establish DJI design system and Next.js App Router architecture

#### Task 0.1: DJI Design Tokens Integration
**Files to Create/Modify**:
```
apps/web/src/styles/design-tokens.css          [NEW]
apps/web/tailwind.config.js                    [MODIFY]
apps/web/src/styles/globals.css                [MODIFY]
```

**Actions**:
- [ ] Extract DJI color palette to CSS variables
  ```css
  :root {
    /* Primary Colors */
    --color-primary-blue: rgb(0, 112, 213);
    --color-text-primary: rgba(0, 0, 0, 0.85);
    --color-text-secondary: rgba(0, 0, 0, 0.65);
    
    /* Spacing (8px grid) */
    --space-1: 8px;
    --space-2: 16px;
    --space-3: 24px;
    --space-4: 32px;
    --space-6: 48px;
    
    /* Shadows */
    --shadow-sm: rgba(0, 0, 0, 0.1) 0px 2px 6px 0px;
    --shadow-md: rgba(0, 0, 0, 0.1) 0px 8px 16px 0px;
    --shadow-lg: rgba(0, 0, 0, 0.1) 0px 16px 16px 0px;
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-pill: 1408px;
  }
  
  [data-mode="dark"] {
    --color-bg-primary: rgb(0, 0, 0);
    --color-text-primary: rgba(255, 255, 255, 0.85);
    /* ... dark theme tokens */
  }
  ```

- [ ] Merge DJI tokens into Tailwind config
  ```js
  theme: {
    extend: {
      colors: {
        'dji-blue': 'var(--color-primary-blue)',
        'text-primary': 'var(--color-text-primary)',
        // ... map all DJI tokens
      },
      spacing: {
        // Align with 8px grid
      },
      boxShadow: {
        'dji-sm': 'var(--shadow-sm)',
        'dji-md': 'var(--shadow-md)',
        'dji-lg': 'var(--shadow-lg)',
      }
    }
  }
  ```

- [ ] Test color contrast in both light/dark modes
- [ ] Verify Medusa UI components render correctly with new tokens

**Deliverables**:
- Unified design token system
- Updated Tailwind configuration
- Theme switching foundation

---

#### Task 0.2: Theme Context & Provider Architecture
**Files to Create**:
```
apps/web/src/lib/context/theme-context.tsx     [NEW]
apps/web/src/app/providers.tsx                 [NEW]
apps/web/src/lib/hooks/use-theme.ts            [NEW]
```

**Actions**:
- [ ] Create ThemeProvider with localStorage persistence
  ```tsx
  // theme-context.tsx
  'use client'
  
  import { createContext, useContext, useEffect, useState } from 'react'
  
  type Theme = 'light' | 'dark'
  
  interface ThemeContextType {
    theme: Theme
    isDark: boolean
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
  }
  
  const ThemeContext = createContext<ThemeContextType | undefined>(undefined)
  
  export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    
    useEffect(() => {
      const stored = localStorage.getItem('theme') as Theme
      if (stored) setTheme(stored)
    }, [])
    
    useEffect(() => {
      document.documentElement.setAttribute('data-mode', theme)
      localStorage.setItem('theme', theme)
    }, [theme])
    
    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')
    
    return (
      <ThemeContext.Provider value={{ 
        theme, 
        isDark: theme === 'dark', 
        toggleTheme, 
        setTheme 
      }}>
        {children}
      </ThemeContext.Provider>
    )
  }
  
  export const useTheme = () => {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
    return ctx
  }
  ```

- [ ] Create root Providers wrapper
  ```tsx
  // app/providers.tsx
  'use client'
  
  import { ThemeProvider } from '@lib/context/theme-context'
  import { CartProvider } from '@lib/context/cart-context' // from existing
  
  export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    )
  }
  ```

- [ ] Update root layout to use Providers
  ```tsx
  // app/layout.tsx
  import { Providers } from './providers'
  
  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    )
  }
  ```

- [ ] Test theme persistence across page navigations
- [ ] Verify Server/Client boundary separation

**Deliverables**:
- Working theme context with toggle functionality
- Provider architecture compatible with Next.js App Router
- Client component boundaries properly defined

---

### **Phase 1: P0 - Cart & Checkout Optimization (3-4 days)**

**Objective**: Apply DJI design system to critical commerce flow while preserving Medusa logic

#### Task 1.1: Cart Component UI Refresh
**Files to Modify**:
```
apps/web/src/modules/cart/components/cart-preview/index.tsx
apps/web/src/modules/cart/components/item/index.tsx
apps/web/src/modules/cart/templates/index.tsx
```

**Actions**:
- [ ] Apply DJI button styles to "Add to Cart" / "Remove" buttons
  - Use `--radius-pill` for primary CTAs
  - Apply `--shadow-md` on hover
  - Color: `--color-primary-blue` for primary actions

- [ ] Mobile-first cart drawer
  - Full-screen overlay on mobile (< 768px)
  - Slide-in animation from right
  - 44x44px minimum touch targets for +/- quantity buttons
  
- [ ] Update cart item cards
  - Product thumbnail: rounded corners (8px)
  - Price typography: DJI font sizes
  - Quantity selector: DJI-styled input

- [ ] Subtotal/Total section
  - Clear visual hierarchy with DJI spacing (16px/24px/32px)
  - Prominent "Proceed to Checkout" button

- [ ] Empty cart state
  - DJI-styled illustration placeholder
  - "Continue Shopping" CTA button

**Testing**:
- [ ] Add/remove items on mobile (320px, 375px, 414px widths)
- [ ] Verify quantity updates trigger Medusa API correctly
- [ ] Test cart persistence across sessions

**Deliverables**:
- Mobile-optimized cart drawer
- DJI-styled cart components
- Preserved Medusa cart logic

---

#### Task 1.2: Checkout Flow Visual Enhancement
**Files to Modify**:
```
apps/web/src/app/[countryCode]/(checkout)/checkout/page.tsx
apps/web/src/modules/checkout/components/*/
apps/web/src/modules/checkout/templates/checkout-form/index.tsx
```

**Actions**:
- [ ] Multi-step progress indicator (mobile-friendly)
  - Steps: Shipping → Payment → Review
  - Active step: DJI blue accent
  - Completed: checkmark icon
  - Mobile: horizontal scrollable dots

- [ ] Form field styling
  - Input borders: `--color-border-primary`
  - Focus state: DJI blue outline
  - Error state: `--color-error` (#d32029)
  - Label typography: DJI font hierarchy

- [ ] Address form optimization
  - Auto-complete support
  - Country/region selector with DJI dropdown style
  - "Save address" checkbox with DJI styling

- [ ] Payment section
  - Stripe elements with DJI theme injection
  - Card icons with proper spacing
  - Security badges placement

- [ ] Order review
  - Item list with DJI card styling
  - Clear pricing breakdown
  - "Place Order" button (pill-shaped, DJI blue)

- [ ] Mobile responsiveness
  - Single-column layout on mobile
  - Sticky "Continue" button at bottom
  - Form validation with inline error messages

**Testing**:
- [ ] Complete checkout on mobile device
- [ ] Test Stripe payment integration
- [ ] Verify order creation in Medusa backend
- [ ] Test address validation and autocomplete

**Deliverables**:
- DJI-styled checkout flow
- Mobile-optimized form experience
- Functioning payment integration

---

### **Phase 2: P1 - Collections Showcase (2-3 days)**

**Objective**: Create compelling product series pages integrated with Medusa Collections API

#### Task 2.1: Collections List Page
**Files to Create**:
```
apps/web/src/app/[countryCode]/(main)/collections/page.tsx         [NEW]
apps/web/src/modules/collections/components/collection-card.tsx    [NEW]
apps/web/src/modules/collections/templates/collections-list.tsx    [NEW]
```

**Actions**:
- [ ] Fetch collections from Medusa API
  ```tsx
  import { sdk } from '@lib/data/client'
  
  async function getCollections() {
    const { collections } = await sdk.store.collection.list()
    return collections
  }
  ```

- [ ] Design collection cards
  - Hero image with gradient overlay
  - Collection title (DJI H3 typography)
  - Product count badge
  - "View Collection" CTA button
  - Mobile: full-width cards with spacing
  - Desktop (future): 2-3 column grid

- [ ] Mobile layout
  - Vertical scrolling list
  - 16px horizontal padding
  - 24px gap between cards
  - Smooth scroll to top on navigation

**Deliverables**:
- Collections listing page
- Integration with Medusa Collections API
- Mobile-optimized card layout

---

#### Task 2.2: Collection Detail Page (A320 Series Template)
**Files to Create**:
```
apps/web/src/app/[countryCode]/(main)/collections/[handle]/page.tsx    [NEW]
apps/web/src/modules/collections/templates/collection-detail.tsx       [NEW]
apps/web/src/modules/collections/components/spec-section.tsx           [NEW]
```

**Actions**:
- [ ] Dynamic route handler
  ```tsx
  export async function generateStaticParams() {
    const { collections } = await sdk.store.collection.list()
    return collections.map(c => ({ handle: c.handle }))
  }
  
  async function getCollectionByHandle(handle: string) {
    const { collection } = await sdk.store.collection.retrieve(handle, {
      fields: '+products.*'
    })
    return collection
  }
  ```

- [ ] Hero section
  - Collection banner image
  - Title + description (from Medusa metadata)
  - Mobile: full-width hero, text overlay

- [ ] Technical specifications section (inspired by A320 page)
  - Accordion-style expandable specs
  - Icons for key features
  - "Learn More" modals for detailed info
  - Source data from collection metadata JSON

- [ ] Product grid
  - Products filtered by collection
  - DJI product card styling
  - "Add to Cart" quick action
  - Mobile: 1-2 column grid
  - Infinite scroll or pagination

- [ ] Filters & sorting
  - Price range slider (DJI-styled)
  - Availability toggle
  - Sort: Featured, Price (Low/High), Name

**Metadata Structure** (to configure in Medusa Admin):
```json
{
  "specifications": [
    { "label": "Compatibility", "value": "MSFS 2020, X-Plane 12, P3D v5" },
    { "label": "Connectivity", "value": "USB-C, Wireless (optional)" },
    { "label": "Display", "value": "5.7\" LCD, 800x480 resolution" }
  ],
  "features": [
    "Authentic A320 layout",
    "Backlit keys",
    "Premium build quality"
  ]
}
```

**Testing**:
- [ ] Navigate from collections list to detail
- [ ] Verify product data loads correctly
- [ ] Test filters and sorting on mobile
- [ ] Add product to cart from collection page

**Deliverables**:
- Dynamic collection detail pages
- A320-inspired specification display
- Medusa-integrated product grid

---

### **Phase 3: P2 - Navigation & Layout (2-3 days)**

**Objective**: Create mobile-optimized navigation with DJI styling

#### Task 3.1: Header Component Migration
**Files to Create/Modify**:
```
apps/web/src/modules/layout/components/header/index.tsx              [MODIFY]
apps/web/src/modules/layout/components/mobile-menu/index.tsx         [NEW]
apps/web/src/modules/layout/components/theme-toggle/index.tsx        [NEW]
apps/web/src/modules/layout/components/search-modal/index.tsx        [NEW]
```

**Actions**:
- [ ] Mobile header structure
  - Fixed position at top
  - Logo (left), Search, Cart, Menu (right)
  - Height: 64px (matching DJI system)
  - Background: transparent → solid on scroll
  - Z-index: 900

- [ ] Hamburger menu
  - Icon: 24x24px, animated to X on open
  - Full-screen overlay menu
  - Slide-in animation (300ms)
  - Navigation links with DJI typography
  - Theme toggle button
  - Account link (if logged in)

- [ ] Search functionality
  - Modal popup (mobile)
  - Search input with DJI styling
  - Product suggestions (autocomplete)
  - Integration with Medusa product search API

- [ ] Cart icon with badge
  - Badge shows item count
  - DJI blue background for badge
  - Opens cart drawer on tap

- [ ] Theme toggle button
  - Sun/Moon icon (swap on toggle)
  - Smooth 300ms transition
  - Persist preference to localStorage

- [ ] Desktop placeholder (minimal)
  - Horizontal nav layout
  - Will be enhanced in Phase 2 (desktop optimization)

**Navigation Structure**:
```
Home
Products
  ├─ All Products
  └─ Collections
Account (if logged in)
Blog
Software
Cart
```

**Testing**:
- [ ] Menu open/close animation on mobile
- [ ] Theme toggle persists across navigation
- [ ] Search autocomplete works
- [ ] Cart badge updates on add/remove

**Deliverables**:
- Mobile-optimized header
- Working hamburger menu
- Integrated theme toggle
- Search modal

---

#### Task 3.2: Footer Component
**Files to Create/Modify**:
```
apps/web/src/modules/layout/components/footer/index.tsx              [MODIFY]
```

**Actions**:
- [ ] Mobile footer layout
  - Single column stack
  - Sections: About, Shop, Support, Social
  - Accordion-style collapsible sections (optional)
  - DJI spacing between sections

- [ ] Links styling
  - DJI typography (14px, regular)
  - Color: `--color-text-secondary`
  - Hover: `--color-primary-blue`

- [ ] Newsletter signup (if applicable)
  - Email input with DJI styling
  - "Subscribe" button
  - Success/error feedback

- [ ] Social media icons
  - WeChat, Weibo, Douyin, Bilibili, etc.
  - Icon size: 24x24px
  - DJI hover effect

- [ ] Copyright and legal links
  - Small text (12px)
  - Links: Privacy Policy, Terms of Service

**Deliverables**:
- Mobile-optimized footer
- Newsletter integration (optional)
- Social media links

---

### **Phase 4: P3 - Blog System (Static) (2-3 days)**

**Objective**: Create content marketing platform with static data, ready for Strapi migration

#### Task 4.1: Blog Data Structure
**Files to Create**:
```
apps/web/src/data/blog-posts.json                                   [NEW]
apps/web/src/lib/blog/types.ts                                      [NEW]
apps/web/src/lib/blog/utils.ts                                      [NEW]
```

**Actions**:
- [ ] Define blog post schema
  ```typescript
  interface BlogPost {
    id: string
    slug: string
    title: string
    excerpt: string
    content: string // Markdown or HTML
    author: {
      name: string
      avatar?: string
    }
    featuredImage?: string
    category: string
    tags: string[]
    readTime: number // minutes
    publishedAt: string // ISO date
    updatedAt?: string
  }
  ```

- [ ] Create sample posts (from cockpit-simulator)
  - "The Evolution of Flight Simulation Technology" (8 min)
  - "A320 CDU vs Traditional Instruments" (12 min)
  - "Building Your First Home Cockpit Simulator" (15 min)
  - "The Future of Virtual Reality in Flight Training" (10 min)
  - "Boeing 737 Series: Most Popular Platform" (7 min)
  - "Advanced FCU Programming Techniques" (18 min)

- [ ] Utility functions
  ```typescript
  export function getAllPosts(): BlogPost[]
  export function getPostBySlug(slug: string): BlogPost | null
  export function getPostsByCategory(category: string): BlogPost[]
  export function getPostsByTag(tag: string): BlogPost[]
  export function searchPosts(query: string): BlogPost[]
  ```

**Deliverables**:
- Blog data structure
- 6 sample blog posts
- Helper utility functions

---

#### Task 4.2: Blog List Page
**Files to Create**:
```
apps/web/src/app/[countryCode]/(main)/blog/page.tsx                 [NEW]
apps/web/src/modules/blog/components/blog-card.tsx                  [NEW]
apps/web/src/modules/blog/components/search-bar.tsx                 [NEW]
apps/web/src/modules/blog/components/category-filter.tsx            [NEW]
```

**Actions**:
- [ ] Blog listing page
  - Hero section with "Latest Articles" title
  - Featured post (first post, larger card)
  - Grid of remaining posts

- [ ] Blog card design (mobile)
  - Featured image (16:9 aspect ratio)
  - Category badge (top-left overlay)
  - Title (DJI H4 typography)
  - Excerpt (2-3 lines, truncated)
  - Author avatar + name
  - Read time + published date
  - Full-width cards on mobile
  - Tap anywhere to navigate to post

- [ ] Search functionality
  - Search input at top
  - Client-side filtering by title/excerpt
  - Real-time results update

- [ ] Category filter
  - Horizontal scrollable pills
  - Active category highlighted (DJI blue)
  - Categories: All, Technology, Tutorials, Reviews, News

- [ ] Pagination or infinite scroll
  - Show 10 posts per page
  - "Load More" button (DJI-styled)

**Testing**:
- [ ] Search posts on mobile
- [ ] Filter by category
- [ ] Navigate to post detail

**Deliverables**:
- Blog listing page
- Search and filter functionality
- Mobile-optimized card layout

---

#### Task 4.3: Blog Post Detail Page
**Files to Create**:
```
apps/web/src/app/[countryCode]/(main)/blog/[slug]/page.tsx          [NEW]
apps/web/src/modules/blog/components/post-content.tsx               [NEW]
apps/web/src/modules/blog/components/related-posts.tsx              [NEW]
```

**Actions**:
- [ ] Post detail page structure
  - Hero section: Featured image + title overlay
  - Metadata: Author, date, read time, category
  - Main content area
  - Related posts section
  - Share buttons (optional)

- [ ] Content rendering
  - Markdown parsing (use `remark` or `marked`)
  - Code syntax highlighting (if applicable)
  - Image optimization with Next.js Image
  - Typography: DJI font hierarchy
  - Links: DJI blue color
  - Blockquotes: styled with left border

- [ ] Mobile reading experience
  - Optimal line length (60-70 characters)
  - Generous line height (1.6-1.8)
  - Proper spacing between sections
  - Sticky share bar (bottom, optional)

- [ ] Related posts
  - Show 3 related posts (by category or tags)
  - Horizontal scroll on mobile
  - Same card design as list page

**Testing**:
- [ ] Markdown renders correctly
- [ ] Images load and are responsive
- [ ] Navigation to related posts works
- [ ] Readable on mobile devices

**Deliverables**:
- Blog post detail page
- Markdown rendering
- Related posts section

---

### **Phase 5: P4 - Account Pages (3-4 days)**

**Objective**: Integrate account management with Medusa Customer API

#### Task 5.1: Account Layout & Navigation
**Files to Modify**:
```
apps/web/src/app/[countryCode]/(main)/account/layout.tsx            [MODIFY]
apps/web/src/modules/account/components/account-nav/index.tsx       [NEW]
```

**Actions**:
- [ ] Account section layout
  - Mobile: Tab navigation at top (horizontal scroll if needed)
  - Tabs: Profile, Orders, Addresses, Wishlist, Settings
  - Active tab: DJI blue underline
  - Content area below tabs

- [ ] Tab navigation component
  ```tsx
  const tabs = [
    { label: 'Profile', path: '/account' },
    { label: 'Orders', path: '/account/orders' },
    { label: 'Addresses', path: '/account/addresses' },
    { label: 'Wishlist', path: '/account/wishlist' },
    { label: 'Settings', path: '/account/settings' },
  ]
  ```

- [ ] Authentication guard
  - Redirect to login if not authenticated
  - Show loading state while checking auth

**Deliverables**:
- Account layout with tab navigation
- Authentication guard

---

#### Task 5.2: Profile Page
**Files to Modify**:
```
apps/web/src/app/[countryCode]/(main)/account/page.tsx                      [MODIFY]
apps/web/src/modules/account/components/profile-form/index.tsx              [NEW]
```

**Actions**:
- [ ] Fetch customer data from Medusa
  ```tsx
  import { getCustomer } from '@lib/data/customer'
  
  const customer = await getCustomer()
  ```

- [ ] Profile form fields
  - First Name, Last Name
  - Email (read-only or with verification)
  - Phone Number
  - DJI-styled inputs with validation

- [ ] Edit mode
  - "Edit" button → form becomes editable
  - "Save" / "Cancel" buttons appear
  - Validation on submit
  - Success toast notification

- [ ] Update customer API call
  ```tsx
  async function updateProfile(data: ProfileData) {
    await sdk.store.customer.update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
    })
  }
  ```

**Testing**:
- [ ] Load customer data
- [ ] Update profile information
- [ ] Validation errors display correctly

**Deliverables**:
- Working profile management
- Medusa API integration

---

#### Task 5.3: Orders Page
**Files to Modify**:
```
apps/web/src/app/[countryCode]/(main)/account/orders/page.tsx               [MODIFY]
apps/web/src/app/[countryCode]/(main)/account/orders/[id]/page.tsx          [MODIFY]
apps/web/src/modules/account/components/order-card/index.tsx                [NEW]
apps/web/src/modules/account/components/order-details/index.tsx             [NEW]
```

**Actions**:
- [ ] Fetch orders from Medusa
  ```tsx
  const { orders } = await sdk.store.order.list()
  ```

- [ ] Order list view (mobile)
  - Card per order
  - Order number (e.g., #ORD-1234)
  - Status badge (Pending, Processing, Shipped, Delivered)
  - Order date
  - Total amount
  - Product thumbnails (first 3 items)
  - "View Details" link

- [ ] Order status styling
  - Pending: gray
  - Processing: yellow
  - Shipped: blue
  - Delivered: green
  - Cancelled: red

- [ ] Order details page
  - Full order summary
  - Shipping address
  - Billing address
  - Payment method (last 4 digits)
  - Item list with quantities and prices
  - Subtotal, shipping, tax, total breakdown
  - Tracking number (if shipped)
  - "Track Package" button (external link)

**Testing**:
- [ ] Orders load correctly
- [ ] Navigate to order detail
- [ ] Status badges render correctly

**Deliverables**:
- Order history page
- Order detail view

---

#### Task 5.4: Addresses Page
**Files to Modify**:
```
apps/web/src/app/[countryCode]/(main)/account/addresses/page.tsx            [MODIFY]
apps/web/src/modules/account/components/address-card/index.tsx              [NEW]
apps/web/src/modules/account/components/address-form/index.tsx              [NEW]
```

**Actions**:
- [ ] Fetch addresses from Medusa
  ```tsx
  const customer = await getCustomer()
  const addresses = customer.addresses || []
  ```

- [ ] Address list view
  - Card per address
  - Address type badge (Shipping / Billing)
  - "Default" badge if applicable
  - Full address display
  - Edit / Delete buttons

- [ ] Add/Edit address modal
  - Full-screen modal on mobile
  - Form fields: Name, Address Line 1/2, City, State, ZIP, Country
  - Phone number
  - "Set as default" checkboxes (shipping/billing)
  - DJI form styling

- [ ] Address CRUD operations
  ```tsx
  await sdk.store.customer.address.create(addressData)
  await sdk.store.customer.address.update(addressId, addressData)
  await sdk.store.customer.address.delete(addressId)
  ```

**Testing**:
- [ ] Add new address
- [ ] Edit existing address
- [ ] Delete address
- [ ] Set default address

**Deliverables**:
- Address management interface
- Full CRUD functionality

---

#### Task 5.5: Wishlist Page (Lightweight Implementation)
**Files to Create**:
```
apps/web/src/app/[countryCode]/(main)/account/wishlist/page.tsx             [NEW]
apps/web/src/lib/context/wishlist-context.tsx                               [NEW]
apps/web/src/modules/account/components/wishlist-item/index.tsx             [NEW]
```

**Actions**:
- [ ] Client-side wishlist context (localStorage)
  ```tsx
  interface WishlistItem {
    productId: string
    addedAt: string
  }
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  ```

- [ ] Wishlist page
  - Fetch full product details for wishlist items
  - Product cards with "Remove from Wishlist" button
  - "Add to Cart" quick action
  - Empty state: "No items in wishlist"

- [ ] Add to wishlist functionality
  - Heart icon on product cards
  - Toggle wishlist status
  - Visual feedback (heart fill animation)

**Note**: This is a simplified implementation. For production, consider using Medusa's wishlist module or custom backend storage.

**Testing**:
- [ ] Add product to wishlist
- [ ] Remove from wishlist
- [ ] Add wishlist item to cart

**Deliverables**:
- Basic wishlist functionality
- Persistent across sessions

---

### **Phase 6: Software Page (Static) (1-2 days)**

**Objective**: Create software download and documentation page

#### Task 6.1: Software Page Implementation
**Files to Create**:
```
apps/web/src/app/[countryCode]/(main)/software/page.tsx                     [NEW]
apps/web/src/modules/software/components/feature-card.tsx                   [NEW]
apps/web/src/modules/software/components/version-history.tsx                [NEW]
apps/web/src/data/software-data.json                                        [NEW]
```

**Actions**:
- [ ] Create software data structure
  ```json
  {
    "name": "CockpitSimulator Bridge (CS Bridge)",
    "version": "v2025.2.3",
    "releaseDate": "2025-02-15",
    "description": "Universal driver software for all CockpitSimulator hardware...",
    "features": [
      {
        "title": "Plug & Play",
        "description": "Simple connection, auto-run",
        "icon": "plug"
      },
      {
        "title": "Auto Connect",
        "description": "No manual intervention needed",
        "icon": "link"
      }
      // ... 6 total features
    ],
    "compatibility": {
      "platforms": ["MSFS 2020", "X-Plane 12", "P3D v5", "FSX", "DCS", "IL-2"],
      "plugins": ["25+ aircraft plugins supported"]
    },
    "downloads": {
      "windows": "https://example.com/cs-bridge-windows.exe",
      "mac": "https://example.com/cs-bridge-mac.dmg"
    },
    "versionHistory": [
      {
        "version": "v2025.2.3",
        "date": "2025-02-15",
        "changes": ["Bug fixes", "Performance improvements"]
      }
    ]
  }
  ```

- [ ] Software page layout (mobile)
  - Hero section: Software name, version, download button
  - Features section: 6 feature cards (grid, 2 columns on mobile)
  - Compatibility section: Expandable lists
  - Version history: Accordion-style timeline
  - Installation guide: Step-by-step instructions

- [ ] Feature cards
  - Icon (24x24px)
  - Feature title (DJI H5 typography)
  - Description (small text)
  - DJI card styling with shadow

- [ ] Download section
  - Prominent "Download for Windows" button (DJI blue, pill-shaped)
  - Secondary "Download for Mac" button
  - System requirements checklist
  - File size and version info

- [ ] Compatibility lists
  - Flight simulators: Chips/badges for each platform
  - Aircraft plugins: Expandable "Show all 25+" link

- [ ] Version history
  - Timeline with version markers
  - Expandable change notes
  - Download link for previous versions (optional)

**Testing**:
- [ ] Download buttons link correctly
- [ ] Expandable sections work on mobile
- [ ] Page is readable and well-formatted

**Deliverables**:
- Software showcase page
- Static content with DJI styling
- Ready for future CMS integration

---

### **Phase 7: Home Page Enhancement (1-2 days)**

**Objective**: Create compelling landing page with DJI aesthetics

#### Task 7.1: Home Page Sections
**Files to Modify**:
```
apps/web/src/app/[countryCode]/(main)/page.tsx                              [MODIFY]
apps/web/src/modules/home/components/hero/index.tsx                         [NEW]
apps/web/src/modules/home/components/featured-collections/index.tsx         [NEW]
apps/web/src/modules/home/components/featured-products/index.tsx            [NEW]
```

**Actions**:
- [ ] Hero section
  - Full-screen background image or video
  - Headline: "Professional Flight Simulation Hardware"
  - Subheadline: Tagline or value proposition
  - Primary CTA: "Shop Collections"
  - Secondary CTA: "Learn More" (scroll to features)
  - Mobile: Ensure text is readable with overlay gradient

- [ ] Featured collections section
  - 3 collection cards (A320, 737, Accessories)
  - Horizontal scroll on mobile
  - "View All Collections" link

- [ ] Featured products section
  - 4-6 best-selling products
  - DJI product card styling
  - "Add to Cart" quick action
  - Horizontal scroll on mobile

- [ ] Why choose us section
  - 3-4 value propositions (Quality, Support, Community, Innovation)
  - Icon + title + description
  - Grid layout (2 columns on mobile)

- [ ] Latest blog posts
  - 3 recent posts
  - Horizontal scroll on mobile
  - "View All Articles" link

- [ ] Newsletter signup (optional)
  - Email input with CTA
  - Success/error feedback

**Testing**:
- [ ] All CTAs navigate correctly
- [ ] Horizontal scroll works smoothly
- [ ] Page loads quickly (optimize images)

**Deliverables**:
- Engaging home page
- Optimized for mobile
- Connected to Medusa data

---

### **Phase 8: QA & Optimization (2-3 days)**

**Objective**: Ensure production-ready quality

#### Task 8.1: Mobile Testing
**Devices to Test**:
- iPhone SE (320px width)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- iPad Mini (768px)

**Test Cases**:
- [ ] Navigation menu opens/closes smoothly
- [ ] All touch targets are 44x44px minimum
- [ ] Forms are fillable without keyboard overlap issues
- [ ] Horizontal scroll works without vertical scroll interference
- [ ] Images load and are properly sized
- [ ] Theme toggle works correctly
- [ ] Cart updates in real-time
- [ ] Checkout flow completes successfully

---

#### Task 8.2: Performance Optimization
**Actions**:
- [ ] Next.js Image optimization
  - Use `next/image` for all images
  - Set proper `sizes` attribute for responsive images
  - Use `priority` for above-fold images

- [ ] Code splitting
  - Dynamic imports for heavy components
  - Route-based code splitting (automatic with App Router)

- [ ] Bundle analysis
  - Run `pnpm analyze` (if configured)
  - Identify large dependencies
  - Consider lazy-loading non-critical modules

- [ ] Lighthouse audit
  - Performance: Target 90+
  - Accessibility: Target 95+
  - Best Practices: Target 100
  - SEO: Target 95+

- [ ] Mobile performance
  - First Contentful Paint (FCP): < 1.8s
  - Largest Contentful Paint (LCP): < 2.5s
  - Cumulative Layout Shift (CLS): < 0.1
  - Total Blocking Time (TBT): < 200ms

**Deliverables**:
- Optimized asset loading
- Improved Core Web Vitals scores

---

#### Task 8.3: Accessibility (A11y) Compliance
**Actions**:
- [ ] Semantic HTML
  - Proper heading hierarchy (h1 → h2 → h3)
  - Use `<nav>`, `<main>`, `<footer>`, `<article>` tags
  - Form labels associated with inputs

- [ ] Keyboard navigation
  - All interactive elements reachable via Tab
  - Focus indicators visible (DJI blue outline)
  - Modal traps focus, Escape to close
  - Skip to content link (optional)

- [ ] Screen reader support
  - Alt text for all images
  - ARIA labels for icon-only buttons
  - Live regions for dynamic content (cart updates)
  - Proper form error announcements

- [ ] Color contrast
  - WCAG AA compliance (4.5:1 for normal text)
  - Test with Chrome DevTools Accessibility panel
  - Verify in both light and dark themes

- [ ] Tools
  - Run axe DevTools extension
  - Test with NVDA/JAWS (Windows) or VoiceOver (Mac)

**Deliverables**:
- WCAG 2.1 AA compliant
- Fully keyboard accessible
- Screen reader friendly

---

#### Task 8.4: SEO Optimization
**Actions**:
- [ ] Meta tags
  - Dynamic `<title>` per page
  - Meta description (150-160 characters)
  - Open Graph tags (og:title, og:description, og:image)
  - Twitter Card tags

- [ ] Structured data (JSON-LD)
  - Product schema for product pages
  - Breadcrumb schema
  - Organization schema for home page
  - Article schema for blog posts

- [ ] Sitemap
  - Generate `sitemap.xml` with all pages
  - Submit to Google Search Console

- [ ] Robots.txt
  - Allow crawling of public pages
  - Disallow admin/account pages

- [ ] Performance (SEO factor)
  - Mobile-friendly (responsive design)
  - Fast loading (Core Web Vitals)
  - HTTPS enabled

**Deliverables**:
- Complete meta tag implementation
- Structured data for key pages
- Sitemap and robots.txt

---

## Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **React 19 RC compatibility issues** | Medium | Test all Radix UI components early; pin versions if needed |
| **Server/Client boundary confusion** | Medium | Clear "use client" directives; strict provider architecture |
| **Medusa API changes** | Low | Use latest @medusajs/js-sdk; monitor changelog |
| **Performance on low-end devices** | Medium | Test on older devices; optimize images and code splitting |
| **Theme switching edge cases** | Low | Comprehensive testing in both modes; localStorage fallback |

### Schedule Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Scope creep** | High | Strict adherence to priority order; defer non-P0/P1 features |
| **Medusa integration complexity** | Medium | Allocate buffer time; consult Medusa docs/community |
| **Mobile testing delays** | Low | Use browser DevTools mobile simulation; reserve real device testing for final QA |
| **Design iteration** | Medium | Get early stakeholder feedback on Phase 0/1 deliverables |

---

## Success Metrics

### Functional Completeness
- [ ] All P0 (Cart/Checkout) features working on mobile
- [ ] All P1 (Collections) pages live with Medusa data
- [ ] Navigation and layout functional across all pages
- [ ] Blog and Software pages accessible

### Quality Metrics
- [ ] Lighthouse Performance Score: 90+
- [ ] Lighthouse Accessibility Score: 95+
- [ ] Zero console errors in production build
- [ ] < 3s page load on 3G network
- [ ] 100% mobile responsiveness (320px - 768px)

### Business Metrics
- [ ] Checkout completion rate (track in analytics)
- [ ] Product page → Cart → Checkout funnel
- [ ] Blog engagement (time on page, scroll depth)
- [ ] Collection page CTR to product detail

---

## Post-Launch Enhancements (Future Phases)

### Desktop Optimization
- Multi-column layouts for collections and products
- Hover states and desktop-specific interactions
- Mega-menu for navigation
- Sticky sidebar filters

### Strapi CMS Integration
- Blog content managed in Strapi
- Software page managed in Strapi
- Homepage hero content configurable
- Product metadata enrichment

### Advanced Features
- Wishlist backend storage (Medusa module)
- Product reviews and ratings
- Advanced search with Algolia/Meilisearch
- Personalized product recommendations
- Multi-currency support
- Multi-language (i18n)

### Analytics & Marketing
- Google Analytics 4 integration
- Facebook Pixel / TikTok Pixel
- Email marketing integration (Mailchimp/SendGrid)
- Abandoned cart recovery
- Product feed for Google Shopping

---

## Development Workflow

### Daily Routine
1. **Morning**:
   - Pull latest from main branch
   - Review task list for the day
   - Run `pnpm --filter medusa-next dev` to start dev server

2. **Development**:
   - Work on current phase tasks
   - Commit frequently with meaningful messages
   - Test changes on mobile viewport (DevTools)

3. **End of Day**:
   - Push code to feature branch
   - Update task checklist
   - Note any blockers or questions

### Branch Strategy
```
main (production)
  └── develop (integration)
       ├── feature/phase-0-foundation
       ├── feature/phase-1-cart-checkout
       ├── feature/phase-2-collections
       ├── feature/phase-3-navigation
       ├── feature/phase-4-blog
       ├── feature/phase-5-account
       └── feature/phase-6-software
```

### Code Review Checklist
- [ ] TypeScript types defined (no `any`)
- [ ] Components have proper "use client" directive if needed
- [ ] Mobile responsive (tested at 320px, 375px, 414px)
- [ ] DJI design tokens used (no hardcoded colors)
- [ ] Accessible (keyboard nav, ARIA labels)
- [ ] Performance optimized (lazy loading, code splitting)

---

## Appendix

### Key Design Tokens Reference

```css
/* Colors */
--color-primary-blue: rgb(0, 112, 213);
--color-text-primary: rgba(0, 0, 0, 0.85);
--color-text-secondary: rgba(0, 0, 0, 0.65);
--color-bg-primary: rgb(255, 255, 255);
--color-bg-elevated: rgb(250, 250, 250);
--color-border-primary: rgba(0, 0, 0, 0.15);
--color-error: rgb(211, 32, 41);

/* Spacing (8px grid) */
--space-1: 8px;
--space-2: 16px;
--space-3: 24px;
--space-4: 32px;
--space-6: 48px;

/* Shadows */
--shadow-sm: rgba(0, 0, 0, 0.1) 0px 2px 6px 0px;
--shadow-md: rgba(0, 0, 0, 0.1) 0px 8px 16px 0px;
--shadow-lg: rgba(0, 0, 0, 0.1) 0px 16px 16px 0px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-pill: 1408px;

/* Typography */
--font-family: "Open Sans", "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 20px;
--font-size-xl: 32px;

/* Transitions */
--transition-fast: 300ms ease;
--transition-normal: 500ms ease;
```

### Medusa API Endpoints Reference

```typescript
// Products
sdk.store.product.list({ limit: 20, offset: 0 })
sdk.store.product.retrieve(productId)

// Collections
sdk.store.collection.list()
sdk.store.collection.retrieve(handle, { fields: '+products.*' })

// Cart
sdk.store.cart.create()
sdk.store.cart.addLineItem(cartId, { variant_id, quantity })
sdk.store.cart.updateLineItem(cartId, lineItemId, { quantity })
sdk.store.cart.deleteLineItem(cartId, lineItemId)

// Customer
sdk.store.customer.retrieve()
sdk.store.customer.update({ first_name, last_name, phone })
sdk.store.customer.address.create(addressData)
sdk.store.customer.address.update(addressId, addressData)
sdk.store.customer.address.delete(addressId)

// Orders
sdk.store.order.list()
sdk.store.order.retrieve(orderId)
```

### Mobile Breakpoints

```typescript
// Tailwind config
screens: {
  'xs': '320px',   // iPhone SE
  'sm': '375px',   // iPhone 12/13
  'md': '414px',   // iPhone 14 Pro Max
  'lg': '768px',   // iPad
  'xl': '1024px',  // Desktop (future)
  '2xl': '1440px', // Large desktop (future)
}
```

---

## Conclusion

This plan provides a comprehensive roadmap for migrating the cockpit-simulator-mobile work to apps/web with a mobile-first, DJI design system approach. By prioritizing Cart/Checkout and Collections, we ensure critical commerce functionality while showcasing products effectively.

**Key Success Factors**:
1. Strict adherence to DJI design system tokens
2. Mobile-first development with progressive enhancement
3. Seamless Medusa backend integration
4. Clean Server/Client component boundaries
5. Continuous testing and iteration

**Next Steps**:
1. Stakeholder review and approval of this plan
2. Set up development environment
3. Begin Phase 0: Foundation Setup
4. Regular check-ins at end of each phase

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-02  
**Approved By**: [Pending]  
**Estimated Start Date**: [TBD]  
**Target Completion**: [Start Date + 16-22 working days]
