# cs UX/UI Specification

_Generated on 2025-10-19 by Aiden Lux_

## Executive Summary

The Cockpit Simulator DTC platform is a Level 4 web application that unifies commerce, content, and community into a single responsive experience. The UX must support deep product research, multi-currency purchasing, and post-sale enablement for a technically savvy flight simulation audience. The storefront integrates Next.js with Medusa commerce services and Strapi content management, enabling rich tutorials, firmware downloads, and community showcases to surface contextually throughout the journey. Key differentiators include authoritative product education, a compliance-ready downloads center, and strong ties to the brand’s Discord community, all delivered with Core Web Vitals targets and WCAG 2.1 AA accessibility as non-negotiable guardrails.

---

## 1. UX Goals and Principles

### 1.1 Target User Personas

**Primary Persona – Flight Simulation Enthusiast**  
- Passionate hobbyist investing in realistic cockpit gear for MSFS/X-Plane.  
- Expects exhaustive technical specs, compatibility guidance, and authoritative tutorials before purchasing.  
- Needs fast access to firmware, manuals, and troubleshooting support post-purchase.

**Secondary Persona – Returning Customer & Maintainer**  
- Existing hardware owner who visits regularly for firmware updates and release notes.  
- Values streamlined authentication, historical order context, and clear instructions that minimize downtime.  
- Looks for community validation and best-practice setups from peers.

**Secondary Persona – Operations & Support Specialist**  
- Internal staff responsible for product merchandising, content publishing, and support escalation.  
- Requires intuitive back-office tooling, visibility into download activity, and mechanisms to channel users into community support.

### 1.2 Usability Goals

1. **Reduce decision friction** by ensuring product discovery, comparison, and educational content sit side-by-side within two clicks from any landing page.  
2. **Accelerate checkout completion** with predictable, low-effort flows that preserve currency selections and eliminate redundant data entry.  
3. **Enable rapid post-purchase activation** through a centralized downloads hub that surfaces the latest firmware and documentation in under three interactions.  
4. **Maintain situational awareness** for operations teams via dashboards and alerts that reveal anomalies in orders, downloads, or community engagement.  
5. **Guarantee accessibility and performance** so that global users on varied devices experience <1.5 s LCP and full WCAG 2.1 AA support.

### 1.3 Design Principles

1. **Authoritative Clarity:** Present complex technical details through structured layouts, progressive disclosure, and contextual explanations that build trust.  
2. **Guided Momentum:** Nudge users toward the next best action—compare, add to cart, download, or join community—using persistent, well-timed prompts.  
3. **Immersive Precision:** Reflect the cockpit aesthetic through disciplined use of typography, contrast, and micro-interactions without sacrificing readability.  
4. **Assisted Autonomy:** Empower self-service while keeping live support one tap away, minimizing frustration during troubleshooting.  
5. **Composed Flexibility:** Design modular components that gracefully adapt to new locales, campaigns, and future product lines without rework.

---

## 2. Information Architecture

### 2.1 Site Map

```
Root
├── Home
│   ├── Featured Campaign
│   ├── Product Highlights
│   ├── Guides Spotlight
│   ├── Community CTA (Discord + Showcases)
│   └── Newsletter Signup
├── Shop
│   ├── Category Landing (Hardware Families)
│   ├── Product Detail Pages
│   │   ├── Specs & Compatibility
│   │   ├── Rich Media Gallery
│   │   ├── Related Guides & Showcases
│   │   └── Accessories & Bundles
│   ├── Compare Products
│   └── Cart
├── Guides & Tutorials
│   ├── Guides Index (filters by simulator/hardware)
│   ├── Individual Guide (step-by-step content)
│   └── FAQ Library
├── Blog
│   ├── Articles Index
│   └── Article Detail
├── Downloads Center
│   ├── Firmware / Drivers
│   ├── Manuals & Documentation
│   ├── Release Notes
│   └── Legacy Access Requests
├── Community
│   ├── Showcase Gallery
│   ├── Discord Hub
│   └── Events & Campaigns
├── Account
│   ├── Dashboard
│   ├── Orders & Receipts
│   ├── Address Book
│   ├── Saved Payment Methods
│   └── Preferences & Privacy
└── Support
    ├── Contact & Ticketing
    ├── Troubleshooting Guides
    └── Policies (Warranty, Returns, Privacy)
```

### 2.2 Navigation Structure

**Primary Navigation (Desktop):** Home, Shop, Guides, Blog, Downloads, Community, Support, Account/Login  
**Secondary Navigation:** Utility bar with currency selector, cart icon, search, and language placeholder for future localization.  
**Mobile Navigation:** Hamburger menu revealing primary items with accordions for Shop and Guides sub-categories; persistent bottom tab for Cart and Account.  
**Breadcrumb Strategy:** Visible on Shop, Guides, Blog, and Support pages to reinforce hierarchy (e.g., Home › Shop › Throttle Quadrants › CS-200 Pro).  
**Cross-Linking Patterns:**  
- PDPs link to associated guides, downloads, and showcases.  
- Guides include inline product CTA blocks and community prompts.  
- Downloads center links back to relevant product and release notes.  
- Account dashboard shortcuts to Orders, Downloads, Preferences.

---

## 3. User Flows

#### Flow 1: Research-Driven Purchase

- **Goal:** Evaluate throttle hardware and complete purchase with confidence.  
- **Entry Points:** Home hero campaign, paid media landing page, organic navigation to Shop.  
- **Steps:**  
  1. Arrive on Home; absorb featured campaign and click “Explore Hardware.”  
  2. Filter catalog by simulator compatibility and price band.  
  3. Open PDP; review specs, media, and related guides.  
  4. Launch linked guide in overlay/new tab for installation overview.  
  5. Return to PDP; add item to cart and review mini-cart summary.  
  6. Proceed to checkout; authenticate via Google OAuth prompt.  
  7. Confirm address, shipping, currency, and PayPal payment.  
- **Decision Points:** Filter adjustments (compatibility vs. price), add recommended accessory, continue browsing vs. checkout.  
- **Success Criteria:** Order confirmation displayed; user joins downloads prompt and receives follow-up email.

#### Flow 2: Post-Purchase Firmware Update

- **Goal:** Download and install latest firmware quickly after notification.  
- **Entry Points:** Newsletter email CTA, Account dashboard alert, Downloads banner.  
- **Steps:**  
  1. Click firmware update notification; route to Downloads login screen.  
  2. Authenticate; land on personalized downloads dashboard filtered to owned products.  
  3. Review release notes; acknowledge compatibility warnings.  
  4. Accept consent message and initiate download.  
  5. Follow linked setup guide; optionally open support contact if issues arise.  
  6. Provide quick feedback (“Was this helpful?”).  
- **Decision Points:** Prioritize download vs. defer, request support, join Discord for assistance.  
- **Success Criteria:** File downloaded, guide viewed, telemetry records successful acquisition.

#### Flow 3: Content-Led Discovery to Purchase

- **Goal:** Transition from SEO tutorial to buying recommended hardware.  
- **Entry Points:** Google search result linking to Strapi guide or blog post.  
- **Steps:**  
  1. Arrive on guide article; read step-by-step instructions with sticky CTA.  
  2. Engage with embedded showcase carousel demonstrating real builds.  
  3. Activate inline product card; navigate to PDP with preselected variant.  
  4. Skim PDP and add recommended bundle.  
  5. Open cart; apply promotional code from article.  
  6. Checkout with PayPal using saved address; opt into newsletter on confirmation screen.  
- **Decision Points:** Click CTA vs. continue reading, choose bundle vs. base SKU, subscribe to newsletter.  
- **Success Criteria:** Completed order with marketing opt-in recorded.

#### Flow 4: Enterprise / Flight School Bulk Purchase

- **Goal:** Secure multi-unit order with VAT considerations and logistics coordination.  
- **Entry Points:** Support contact form, live chat widget, commerce call-to-action.  
- **Steps:**  
  1. Initiate chat; operations staff verifies inventory and enables VAT-exempt toggle.  
  2. Customer logs in or creates account; uploads VAT documentation.  
  3. Shop experience tailored with bulk quantity inputs and freight shipping estimates.  
  4. Add items to cart; system flags high-value order for review.  
  5. Checkout via PayPal; confirm business contact info.  
  6. Receive confirmation with logistics follow-up schedule.  
- **Decision Points:** Approve VAT exemption, adjust quantities, escalate to manual invoice if payment fails.  
- **Success Criteria:** Order flagged as approved, operations notified, customer receives next-step timeline.

#### Flow 5: Community Engagement & Feedback Loop

- **Goal:** Encourage ongoing engagement and gather actionable feedback.  
- **Entry Points:** Post-purchase confirmation, downloads center prompts, community landing page.  
- **Steps:**  
  1. On order confirmation, user invited to join Discord and view showcases.  
  2. Visits community landing; reviews event schedule and latest gallery entries.  
  3. Submits own setup via guided form or shares in Discord channel.  
  4. Interacts with feedback widget on guides/downloads to report satisfaction.  
  5. Operations reviews feedback dashboard and responds or iterates content.  
- **Decision Points:** Join Discord vs. skip, submit showcase vs. observe, provide feedback vs. dismiss.  
- **Success Criteria:** Community membership confirmed, feedback captured, showcase submission logged.

---

## 4. Component Library and Design System

### 4.1 Design System Approach

Leverage a composable design system built on Tailwind CSS tokens and Shadcn UI primitives to ensure parity between design and code. Core foundations include:  
- **Design tokens** for color, typography, spacing, elevation, and motion expressed in a shared JSON source to feed Figma libraries and frontend themes.  
- **Component variants** defined in Figma using Auto Layout and Shadcn-compatible anatomy so designers and developers speak the same language.  
- **State documentation** (default, hover, focus, disabled, error, success) captured in the component specs and mapped to Tailwind utility classes.  
- **Dark-forward palette** with high-contrast accessibility checks baked into token definitions to honor the cockpit aesthetic without sacrificing legibility.

### 4.2 Core Components

- Global Shell: header with mega-navigation, currency selector, search, and cart; responsive footer with support links and compliance notices.  
- Product Card & Comparison Tile: supports media thumbnail, price, stock badge, and compatibility tags; toggles between grid and list views.  
- PDP Modules: media carousel, specification accordion, compatibility checklist, related content panel, bundle upsell strip, trust badges.  
- Guide & Blog Modules: hero banner, progress sidebar, callout blocks, code snippet formatting, “next guide” pagination.  
- Downloads Center Widgets: product filter chips, release card with versioning, consent dialog, telemetry confirmation toast.  
- Forms & Inputs: multi-step checkout fields, address forms with validation messaging, feedback widget, legacy access request flow.  
- Notifications System: inline alerts, toast stack, modal confirmations, and chat escalation prompts with consistent tone.  
- Data Visualization: lightweight dashboards for order trends, download telemetry, and community engagement metrics using bar/line cards.

---

## 5. Visual Design Foundation

### 5.1 Color Palette

| Token | Hex | Usage |
| ----- | --- | ----- |
| `primary-900` | #0C111F | Background for navigation, hero banners, immersive cockpit feel |
| `primary-600` | #1F3A74 | CTA backgrounds, active states, accent panels |
| `primary-300` | #4F6CC6 | Hover states, links, focus outlines (paired with `neutral-50`) |
| `neutral-50` | #F5F7FA | Page backgrounds for content areas, card surfaces |
| `neutral-500` | #6B7280 | Body text on light surfaces, secondary labels |
| `neutral-200` | #D1D5DB | Dividers, borders, input outlines |
| `accent-warning` | #FCA311 | Stock alerts, announcement banners |
| `accent-success` | #22C55E | Success toasts, confirmation badges |
| `accent-critical` | #EF4444 | Error states, compliance warnings |
| `highlight` | #54F2F2 | Discord/community emphasis, interactive micro-details |

### 5.2 Typography

**Font Families:**
1. **Headings:** “Space Grotesk” – geometric, technical personality matching aviation heritage.  
2. **Body & UI:** “Inter” – highly legible, pairs well with dense technical information.  
3. **Monospace:** “JetBrains Mono” – used sparingly for firmware commands or code snippets.

**Type Scale:**
| Token | Size | Usage |
| ----- | ---- | ----- |
| `display-xl` | 56px/64px | Campaign hero headlines |
| `display-lg` | 48px/56px | Landing page section headers |
| `heading-1` | 36px/44px | Page titles, PDP top section |
| `heading-2` | 30px/38px | Module headers, downloads center |
| `heading-3` | 24px/32px | Card titles, form step headers |
| `heading-4` | 20px/28px | Inline section titles, accordions |
| `body-lg` | 18px/28px | Long-form guide copy |
| `body-md` | 16px/26px | Standard paragraph text |
| `body-sm` | 14px/22px | Meta info, table labels |
| `caption` | 12px/18px | Helper text, badge labels |

### 5.3 Spacing and Layout

Adopt an 8px base grid with fractional tokens for tighter control where needed:  
- `space-1` 4px, `space-2` 8px, `space-3` 12px, `space-4` 16px, `space-6` 24px, `space-8` 32px, `space-10` 40px, `space-12` 48px.  
- Section padding: 80px desktop, 56px tablet, 32px mobile.  
- Content container max-width of 1240px with 24px gutters on desktop scaling to edge-to-edge on mobile.  
- Auto Layout patterns enforce consistent vertical rhythm: hero (space-10), content stacks (space-6), form fields (space-4), micro-groupings (space-2).

---

## 6. Responsive Design

### 6.1 Breakpoints

| Label | Width | Notes |
| ----- | ----- | ----- |
| `xs` | ≤ 479px | Small mobile – single column, bottom nav quick actions |
| `sm` | 480–767px | Standard mobile – stacked modules, collapsible filters |
| `md` | 768–1023px | Tablet – two-column layouts, sticky utility bar |
| `lg` | 1024–1439px | Desktop – primary breakpoint for grid systems |
| `xl` | ≥ 1440px | Wide desktop – introduce breathing room, multi-column mega menus |

### 6.2 Adaptation Patterns

1. **Navigation:** Collapse mega-menu into hamburger with accordions on `sm` and below; keep currency selector and cart as persistent icons.  
2. **Product Grid:** 4-column on `lg+`, 3-column on `md`, 2-column on `sm`, single column on `xs`.  
3. **Media Galleries:** Swap to swipeable carousel with thumbnail rail hidden behind overflow dots on `sm` and below.  
4. **Checkout:** Multi-step wizard on desktop splits into stacked sections with sticky order summary drawer on tablet/mobile.  
5. **Downloads Center:** Filters collapse into horizontal chips on mobile; tables switch to card list with key metadata surfaces.  
6. **Dashboards:** Chart tiles wrap to 1-per-row on mobile with accordion details to maintain readability.  
7. **Community Showcase:** Carousel introduces snap scrolling and progress dots on touch devices to maintain orientation.

---

## 7. Accessibility

### 7.1 Compliance Target

WCAG 2.1 AA across all surfaces, with AAA targets for key flows (checkout, downloads, support) where feasible.

### 7.2 Key Requirements

1. Minimum contrast ratio 4.5:1 for text/iconography against backgrounds; primary buttons meet 3:1 for large text.  
2. Fully keyboard navigable with visible focus states, respecting logical tab order and skip-to-content on every page.  
3. ARIA labeling for interactive modules (media carousel, accordions, filters) and alternative text for all product imagery.  
4. Motion preferences respected: reduce motion setting removes parallax and dampens animations.  
5. Error handling announces changes via polite ARIA live regions and reinforces with inline messaging.  
6. Downloads and release notes provide accessible file descriptions and include checksum/size for screen reader context.  
7. Forms leverage descriptive labels, helper text, and accessible validation patterns validated with automated tooling (axe) during CI.

---

## 8. Interaction and Motion

### 8.1 Motion Principles

1. **Purposeful Guidance:** Motion reinforces hierarchy (e.g., CTA emphasis, guide progress) with 150–250 ms ease-out transitions.  
2. **Feedback First:** Micro-interactions confirm success/failure instantly (button press ripple, download toast slide-in).  
3. **Calibrated Restraint:** Avoid distracting perpetual animation; motion stops once user focus shifts.  
4. **Preference Respect:** Honor reduced motion system settings by swapping transitions for opacity fades.

### 8.2 Key Animations

| Element | Behavior | Notes |
| ------- | -------- | ----- |
| Media Carousel | Slide/fade between images with thumbnail highlight | 220 ms ease-in-out; pause on hover |
| Add to Cart | Button compress + success toast | 120 ms press feedback, 300 ms toast entry |
| Filter Chips | Expand/contract with staggered fade | 80 ms per chip for responsive feel |
| Discord CTA | Subtle pulsing glow every 6s | Stops on focus to avoid distraction |
| Download Completion | Progress bar fills; check icon morph | 400 ms keyframe tied to telemetry success |

---

## 9. Design Files and Wireframes

### 9.1 Design Files

High-fidelity designs will be produced in **Figma** within the `Cockpit Simulator DTC` team project. File structure:  
- `01_Foundation`: design tokens, typography, grid styles, component library.  
- `02_Screens_Web`: desktop and tablet breakpoints with Auto Layout variants.  
- `03_Screens_Mobile`: dedicated mobile flows for checkout, downloads, and community.  
Shared libraries will sync design tokens to the Tailwind config via a tokens plugin (e.g., Tokens Studio). First design milestone scheduled for post-architecture review.

### 9.2 Key Screen Layouts

**Screen Layout 1 – Home Landing**  
- Hero band with immersive cockpit imagery, primary CTA (“Shop Hardware”), secondary CTA (“Join Community”).  
- Feature grid (three cards) highlighting commerce, guides, and downloads.  
- Dynamic content strip showing latest guides/blog posts.  
- Social proof carousel with community showcases and Discord invite module.  
- Footer with support links, compliance notices, newsletter inline form.

**Screen Layout 2 – Product Detail Page**  
- Left column: media carousel with thumbnail rail; right column: product summary, price, stock badge, CTA stack.  
- Tabs/accordions for Specifications, Compatibility, In the Box, Reviews.  
- Related content rail featuring guides and showcases; bundle upsell strip.  
- Sticky checkout bar on scroll for quick add-to-cart, including currency switcher.  
- Secondary section with comparison table and warranty/support highlights.

**Screen Layout 3 – Downloads Center Dashboard**  
- Personalized welcome banner summarizing owned products and latest firmware releases.  
- Filter chip row for product, OS, release type; search input with shortcuts.  
- Card list with version number, release notes excerpt, consent checkbox, download CTA.  
- Right rail for support escalation, Discord link, and telemetry summary.  
- Legacy access request modal accessible from top-level banner for non-DTC owners.

---

## 10. Next Steps

### 10.1 Immediate Actions

1. Conduct architecture alignment session with Winston (Architect) to validate component boundaries and backend dependencies before solution-architecture kickoff.  
2. Translate design tokens and component specs into the shared Figma library; schedule design sprint for hero, PDP, and downloads flows.  
3. Partner with content team to outline initial guide/blog templates and identify launch-day entries needed for contextual surfacing.  
4. Coordinate with marketing to finalize color/branding assets and gather campaign imagery for hero surfaces.  
5. Define telemetry events with analytics stakeholders to ensure instrumentation requirements are captured ahead of development.

### 10.2 Design Handoff Checklist

- [x] User flows documented for critical purchase, post-purchase, and community journeys  
- [x] Component inventory and states defined for core product, content, and operations surfaces  
- [x] Accessibility requirements established with WCAG 2.1 AA targets and testing plan  
- [x] Responsive strategy specified across five breakpoints with adaptation patterns  
- [x] Brand and visual foundations aligned to cockpit-inspired palette and typography  
- [x] Performance goals articulated (Core Web Vitals targets) and telemetry integration identified  
- [ ] Visual design production scheduled and Figma library scaffolded  
- [ ] Design-to-dev handoff rituals confirmed (design reviews, annotated specs cadence)

---

## Appendix

### Related Documents

- PRD: `docs/PRD.md`
- Epics: `docs/epics.md`
- Tech Spec: _To be generated after solution-architecture workflow_
- Architecture: _Pending solution-architecture deliverable_

### Version History

| Date     | Version | Changes               | Author        |
| -------- | ------- | --------------------- | ------------- |
| 2025-10-19 | 1.0     | Initial specification | Aiden Lux |
