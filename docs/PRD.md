# Cockpit Simulator Product Requirements Document (PRD)

### 1. Goals and Background Context

#### Goals
* Launch a branded direct-to-consumer storefront that takes customers from browse to PayPal checkout with multi-currency support and measurable revenue lift.  
* Position Cockpit Simulator as the authoritative source for setup education by pairing every SKU with tutorials, firmware, and downloadable resources.  
* Build a sustainable organic acquisition engine reaching 10,000+ monthly visitors via SEO-optimized, schema-rich content.  
* Create an integrated community hub that connects the storefront with Discord touchpoints to deepen engagement and reduce support burden.  
* Deliver a responsive, WCAG 2.1 AA-compliant experience with industry-leading Core Web Vitals across desktop, tablet, and mobile.  
* Maintain a composable architecture that cleanly separates Next.js, Medusa, and Strapi while leaving space for future localization and feature growth.

#### Background Context
Cockpit Simulator currently depends on third-party retailers, eroding margins and preventing the brand from owning critical knowledge or customer relationships. Enthusiasts must stitch together information from forums, YouTube, and unofficial guides to make purchasing decisions, leading to long sales cycles and eroded trust. The absence of a centralized downloads hub or community touchpoint heightens post-sale support costs and leaves no canonical channel for brand storytelling.  

This initiative consolidates commerce, content, and community into a high-performance Next.js experience underpinned by Medusa and Strapi v5. Product pages will surface authoritative guides, the downloads center will centralize software distribution, and Discord integration will cultivate an engaged ecosystem. The architecture is intentionally SEO-first and performance-obsessed, positioning the site as both a revenue driver and the definitive digital home for the Cockpit Simulator audience.

#### Change Log
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-10-19 | 1.1 | Updated goals, requirements, journeys, UX vision, and epic plan | Aiden Lux (PM) |
| 2025-10-18 | 1.0 | Initial PRD draft | John (PM) |

### 2. Requirements

#### Functional Requirements (FR)
1. **FR001:** Provide a storefront homepage that highlights featured hardware, hero campaigns, and clear navigation into shop, guides, blog, and community sections.  
2. **FR002:** Allow users to browse product catalogs with filtering by category, compatibility (e.g., MSFS, X-Plane), availability, and price range.  
3. **FR003:** Deliver localized product detail pages with rich media, detailed specifications, compatibility notes, and surfaced related guides from Strapi.  
4. **FR004:** Enable registered users to add items to a persistent shopping cart that syncs across devices.  
5. **FR005:** Support checkout using PayPal with multi-currency pricing (USD, EUR) and show currency-converted totals throughout the flow.  
6. **FR006:** Calculate taxes and shipping dynamically based on customer location and configured business rules.  
7. **FR007:** Provide email/password registration and login, plus Google OAuth, with account verification and password recovery flows.  
8. **FR008:** Expose a customer dashboard showing order history, order status, and downloadable purchase documents.  
9. **FR009:** Maintain an open-access downloads hub listing firmware, drivers, and manuals by product for all logged-in users.  
10. **FR010:** Track download events and capture user consent where required for compliance.  
11. **FR011:** Integrate Strapi-managed content types (Guides, Blog Articles, FAQs, Showcases) and publish them automatically to the frontend.  
12. **FR012:** Let content editors relate Strapi entries to Medusa products so linked guides appear on the corresponding product pages.  
13. **FR013:** Surface curated “User Showcase” entries featuring community builds alongside Discord call-to-action links.  
14. **FR014:** Sync inventory, pricing, and product metadata from Medusa into the frontend via scheduled jobs or webhooks.  
15. **FR015:** Provide search across products and content with relevance-ranked results and facets.  
16. **FR016:** Offer newsletter signup via integrated email provider (e.g., SendGrid/Mailchimp) with double opt-in.  
17. **FR017:** Display key community metrics (Discord member count, latest blog posts) on the homepage using API integration.  
18. **FR018:** Allow admins to configure promotional banners or announcements that appear site-wide with start/end dates.  
19. **FR019:** Implement role-based access for operations staff to manage orders, refunds, and support tickets.  
20. **FR020:** Provide analytics instrumentation to measure conversions from content to commerce.  
21. **FR021:** Generate structured data (Schema.org) for products, articles, and breadcrumbs on every relevant page.  
22. **FR022:** Expose a contact/support form that routes to the appropriate ticketing system with anti-spam protections.  
23. **FR023:** Offer “compare products” capability to evaluate specs side by side.  
24. **FR024:** Maintain a release notes section for software and firmware updates tied to download assets.  
25. **FR025:** Ensure marketing can manage campaign landing pages and hero placements without engineering support.

#### Non-Functional Requirements (NFR)
1. **NFR001:** Achieve Core Web Vitals of LCP < 1.5 s, FID < 50 ms, CLS < 0.05 for 80th percentile traffic.  
2. **NFR002:** Deliver 99.5% uptime monthly with automated failover for storefront and CMS APIs.  
3. **NFR003:** Ensure PCI-DSS compliance for payment flows and encrypt all data in transit (TLS 1.2+) and at rest.  
4. **NFR004:** Support 5,000 concurrent users with response times under 300 ms for product and content pages.  
5. **NFR005:** Provide WCAG 2.1 AA accessibility compliance across all user-facing pages.  
6. **NFR006:** Implement observability (centralized logging, tracing, alerting) across all services.  
7. **NFR007:** Enable zero-downtime deployments with automated rollbacks for frontend and backend services.

### 3. User Journeys

#### Journey 1: Research-Driven Purchase (New Enthusiast)
1. Lands on campaign-driven landing showcasing featured hardware.  
2. Navigates to the shop and applies filters for simulator compatibility, price, and availability.  
3. Studies the product detail page, including rich media, specs, and related guides.  
4. Adds the preferred SKU to the cart and reviews upsell prompts.  
5. Signs up via Google OAuth, selects EUR pricing, and completes PayPal checkout.  
6. Receives confirmation with links to downloads, guides, and Discord community.

#### Journey 2: Post-Purchase Support (Existing Customer Downloading Firmware)
1. Receives newsletter alert about a firmware update and logs into the downloads center.  
2. Filters assets by owned product and reviews release notes and compatibility notices.  
3. Accepts consent messaging, downloads the package, and follows linked setup guides.  
4. Shares upgrade experience within the Discord community and updates personal notes in the dashboard.

#### Journey 3: Content-Led Discovery to Purchase (SEO Visitor)
1. Finds an SEO article about throttle setup, explores embedded CTAs, and jumps to the connected product page.  
2. Reviews community showcase gallery and content-side FAQs for social proof.  
3. Adds recommended bundles, creates an account, applies a promo code, and finishes purchase.  
4. Subscribes to the newsletter post-checkout to stay informed about future content.

#### Journey 4: Enterprise Edge Case (High-Value International Order)
1. A flight school representative contacts support via live chat to coordinate a bulk order.  
2. Operations staff reserve inventory and capture VAT details with tax-exemption workflows.  
3. Customer switches to EUR currency, passes fraud safeguards, and pays via PayPal.  
4. Logistics teams receive alerts for freight coordination, and the customer gains access to curated onboarding guides.

### 4. UX and UI Vision

* **UX Principles:**  
  * Deliver an authoritative yet approachable cockpit-themed experience balancing technical depth and clarity.  
  * Embed contextual guidance and resilient recovery paths to keep self-service tasks successful.  
  * Maintain low-friction interactions with fast-loading content, predictable navigation, and obvious affordances.  
  * Design with accessibility first—meet WCAG 2.1 AA, support keyboard navigation, screen readers, and high-contrast modes.
* **Platform & Screens:** Responsive web application across desktop, tablet, and mobile; core surfaces include homepage, catalog, PDPs, guides/blog, downloads center, account dashboard, cart/checkout, and support touchpoints; navigation relies on mega-header, breadcrumbs, contextual cross-links, and community-focused footer.
* **Design Constraints:** Adhere to Cockpit Simulator brand (dark aviation palette, industrial typography); leverage Next.js + Tailwind + Shadcn component patterns; support evergreen browsers with graceful degradation; keep layout modular and copy surfaces translation-ready for future localization.

### 5. Technical Assumptions
* **Repository Structure:** The project will be a **monorepo** to facilitate parallel development.
* **Service Architecture:** The system will use a **headless, composable architecture** with Next.js as the integration layer for Medusa and Strapi v5.
* **Testing:** A comprehensive strategy including **unit, integration, and E2E tests** will be implemented.

### 6. Epic List
1. **Epic 1: Platform Foundation & Deployment Pipeline** — Establish monorepo, environments, CI/CD, infrastructure as code, and shared libraries so teams can deliver safely from day one. *(~10 stories)*  
2. **Epic 2: Commerce Core & Catalog Experience** — Stand up Medusa integration, product catalog browsing, pricing/inventory sync, and cart experiences culminating in a shippable storefront. *(~12 stories)*  
3. **Epic 3: Checkout, Payments & Account Fundamentals** — Implement multi-currency PayPal checkout, tax/shipping calculation, authentication, and order history surfaces. *(~11 stories)*  
4. **Epic 4: Content Platform & SEO Engine** — Deploy Strapi models, editorial workflows, content-to-commerce linking, and technical SEO foundations. *(~11 stories)*  
5. **Epic 5: Downloads Center & Post-Purchase Enablement** — Deliver firmware hub, gated access, release notes, and compliance telemetry. *(~9 stories)*  
6. **Epic 6: Community & Growth Activation** — Integrate Discord touchpoints, showcase galleries, newsletter flows, and campaign tooling. *(~8 stories)*  
7. **Epic 7: Operations, Analytics & Compliance** — Build RBAC consoles, fraud/tax safeguards, observability dashboards, and enterprise governance support. *(~7 stories)*

### 7. Out of Scope
* B2B or educational portals, wholesale price books, and institutional procurement workflows.
* Automated user showcase submission pipelines or advanced moderation tooling.
* Multi-language localization or region-specific regulatory implementations beyond launch locales.
* Native mobile applications, kiosk interfaces, or AR/VR visualization experiences.
* Advanced loyalty programs (points, tiers) and subscription or recurring billing models.
* Deep CRM/ticketing synchronization; launch relies on existing manual processes.
* Real-time ERP inventory integrations; Medusa remains the source of truth at launch.
* Discord single sign-on, chatbots, or automated community management—only call-to-action links.
* Automated content localization or AI-authored documentation; editorial workflow remains manual.
