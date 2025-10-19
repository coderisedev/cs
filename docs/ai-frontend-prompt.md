## AI Frontend Prompt — Cockpit Simulator DTC Platform

Use this prompt with AI frontend tools (Vercel v0, Lovable.ai, etc.). It includes instructions for:
- Full multi-page application shell
- Single-page experience (Product Detail)
- Component set generation
- Design system scaffolding

---

### Project Overview
- **Name:** Cockpit Simulator DTC Platform (`cs`)
- **Stack Target:** Next.js + Tailwind CSS + Shadcn UI + TypeScript
- **Core Integrations:** Medusa (commerce), Strapi (content), PayPal (checkout), Discord (community)
- **Personas:** Flight Simulation Enthusiast (primary), Returning Maintainer, Operations & Support Specialist
- **Accessibility & Performance:** WCAG 2.1 AA, Core Web Vitals targets (LCP < 1.5 s, FID < 50 ms, CLS < 0.05)

---

### Visual & Interaction Foundations
- **Color Tokens:**
  - `primary-900` #0C111F (nav backgrounds, immersive panels)
  - `primary-600` #1F3A74 (primary CTAs)
  - `primary-300` #4F6CC6 (hover/focus accents)
  - `neutral-50` #F5F7FA (content surfaces)
  - `neutral-500` #6B7280 (body text)
  - `neutral-200` #D1D5DB (borders/dividers)
  - `accent-warning` #FCA311, `accent-success` #22C55E, `accent-critical` #EF4444, `highlight` #54F2F2
- **Typography:**
  - Headings: “Space Grotesk”
  - Body/UI: “Inter”
  - Monospace: “JetBrains Mono”
  - Type scale tokens: `display-xl 56/64`, `display-lg 48/56`, `heading-1 36/44`, `heading-2 30/38`, `heading-3 24/32`, `body-md 16/26`, etc.
- **Spacing:** 8px base grid with tokens (`space-2`=8px, `space-4`=16px, `space-6`=24px, `space-8`=32px, `space-12`=48px)
- **Breakpoints:** `xs ≤479`, `sm 480–767`, `md 768–1023`, `lg 1024–1439`, `xl ≥1440`
- **Motion Principles:** purposeful (150–250 ms ease), feedback-first micro-interactions, respect reduced-motion

---

### Core Components to Implement
1. **Global Shell:** mega-navigation header with currency selector, search, cart; responsive footer with support and compliance links.
2. **Home Modules:** hero banner with dual CTAs, value proposition tiles, dynamic guides/blog strip, community showcase carousel, newsletter signup panel.
3. **Product Catalog & Cards:** filterable grid (compatibility, price), product comparison tiles, stock badges, add-to-cart interactions.
4. **Product Detail Page Modules:** media carousel, specs accordion, compatibility checklist, related content rail, bundle upsell strip, sticky checkout bar.
5. **Checkout Flow:** multi-step form (customer info, shipping, review, PayPal handoff) with validation and progress tracker; summary drawer.
6. **Downloads Center Widgets:** user-specific dashboard cards, filter chips, release notes accordion, consent dialog, telemetry confirmation toast.
7. **Content Templates:** guide/blog layouts with progress sidebar, block quotes, callouts, next-guide pagination.
8. **Community Hub:** Discord stats card, showcase gallery, events schedule.
9. **Operations Dashboards:** lightweight KPI tiles (orders, downloads, community engagement) with responsive charts.
10. **Feedback & Support Elements:** inline alert system, toast notifications, support escalation form, feedback widget.

Ensure each component includes default, hover, focus, active, disabled, error, and success states as appropriate.

---

### Full Application Instructions (Option 1)
Generate a multi-page Next.js application with:
- Routing for Home, Shop (catalog, comparison, cart), Guides, Blog, Downloads, Community, Account (dashboard, orders, addresses, preferences), Support.
- Shared layout component wrapping pages with SEO-ready metadata (dynamic titles/descriptions).
- Data fetching placeholders (`async` loaders) with loading and error states for each page.
- Responsive navigation: desktop mega-menu, mobile hamburger + bottom quick actions.
- Accessibility: semantic landmarks, aria attributes for carousels/accordions, skip links, focus management.
- Analytics hooks (`data-analytics` attributes) for key interactions (filter change, add to cart, download click, discord CTA).
- Theme provider consuming design tokens; dark-forward styling with light-surface content areas.

---

### Single Page Instructions (Option 2 — Product Detail)
Produce a fully responsive PDP (`/shop/[slug]`) that includes:
- Hero section with carousel (thumbnails, keyboard controls), price, stock badge, CTA stack (Add to Cart, PayPal Smart Button placeholder).
- Specs & Compatibility accordion with checklists and icons.
- Related Guides & Showcases rail pulling cards with badges.
- Bundle upsell strip (toggleable accessories) with price updates.
- Sticky order summary on scroll for desktop, slide-up bar on mobile.
- Trust signals: warranty, support CTA, community rating snippet.
- Structured data annotation scaffolding (Product schema placeholders).

---

### Component Set Instructions (Option 3)
Generate isolated, reusable components (Storybook-ready) matching the system:
- `MegaNav`, `CurrencySelector`, `SearchOverlay`, `CartDrawer`
- `ProductCard`, `ProductComparisonTable`
- `GuideCallout`, `ShowcaseCarousel`, `DiscordBadge`
- `DownloadCard`, `ReleaseNotesPanel`, `ConsentDialog`
- `CheckoutStepper`, `FormField`, `AddressCard`
- `KpiTile`, `MiniSparkline`, `FeedbackWidget`
Each component should expose props for data binding, support loading/skeleton states, and be themable via tokens.

---

### Design System Setup Instructions (Option 4)
Scaffold a foundations package:
- Export design tokens (colors, typography, spacing, radii, shadows, motion) as TypeScript constants + CSS variables.
- Create Tailwind config extension referencing tokens; include semantic color aliases (e.g., `--color-surface`, `--color-muted`).
- Set up Shadcn UI with customized components that consume tokens (button, card, input, dialog, toast).
- Provide documentation pages for typography scale, color usage, spacing chart, motion guidelines, accessibility checklist.
- Include utility classes/helpers for layout grids, responsive spacing, focus rings, and high-contrast mode.

---

### Implementation Guidelines
- **Code Quality:** Prefer server components where possible, but keep interactive sections as client components. Use TypeScript strict mode.
- **State Management:** Local state via React hooks; persisted data placeholders using context providers as needed (cart, auth).
- **Testing Placeholders:** Add notes for Playwright smoke tests covering hero CTA, PDP add-to-cart, checkout, downloads flow.
- **Internationalization Prep:** Extract copy to translation objects and include TODO comments for future locales.
- **Telemetry Hooks:** Use `data-attr` instrumentation to align with analytics schema (search_query, download_version, discord_cta_click).

---

### Output Expectations
Deliver clean, production-ready code or prototyping markup that:
- Adheres to the design system and component inventory above.
- Handles loading, empty, and error states gracefully.
- Respects accessibility requirements and responsive adaptation patterns.
- Leaves TODO markers where backend integrations will occur.

End the AI output with a summary of generated files/components and any manual follow-up steps.
