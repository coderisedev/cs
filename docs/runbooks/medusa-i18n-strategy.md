# Medusa Internationalization (i18n) Strategy Runbook

## Overview
This document outlines the recommended strategy for implementing multi-language support in the `cs` project. 

**Current Status (as of Jan 2026):**
- **Medusa Backend:** v2.10.3 (Requires upgrade for native i18n).
- **Storefront:** Next.js 15 (App Router).
- **CMS:** Strapi v5 (Available for rich content).

## 1. Core Commerce Data (Products, Collections)

### Recommendation: Upgrade to Medusa v2.12.3+
Medusa introduced a **Native Translation Module** in version 2.12.3. This is the official and most robust way to handle translations for Products, Product Variants, Collections, and other commerce entities.

**Why:**
- **Native API Support:** APIs like `/store/products` accept a `locale` parameter (or `x-medusa-locale` header) and automatically return translated content.
- **Admin Support:** Medusa Admin (v2.12.3+) has built-in UI for managing translations.
- **Performance:** No need for heavy external plugin logic or metadata hacks.

### Implementation Steps:
1.  **Upgrade Medusa Packages:**
    Update `@medusajs/medusa`, `@medusajs/framework`, and related packages in `apps/medusa/package.json` to the latest version (at least `^2.12.3`).
    ```bash
    cd apps/medusa
    yarn upgrade @medusajs/framework @medusajs/medusa @medusajs/medusa-cli
    ```
    *Note: Check for breaking changes in the [Medusa Changelog](https://docs.medusajs.com/releases).*

2.  **Enable Translation Module:**
    Starting from v2.12.3, the module is often enabled by default, but check `medusa-config.ts` to ensure no conflicting modules are present.

3.  **Add Languages:**
    - Go to Medusa Admin -> Settings -> Languages (or Regions).
    - Add the desired languages (e.g., `fr`, `de`, `zh`).

4.  **Translate Content:**
    - Go to a Product detail page in Admin.
    - Switch the language context or use the "Translations" widget to input localized Titles and Descriptions.

---

## 2. Rich Content (Blogs, Marketing Pages)

### Recommendation: Use Strapi (Existing)
Since `apps/strapi` is present, it should be used for content that is *not* strict commerce data (e.g., "About Us", Blog Posts, specialized Landing Pages).

**Why:**
- Strapi has a mature Internationalization (i18n) plugin enabled by default.
- Allows for complex layout translation which Medusa (focused on commerce entities) might not handle as gracefully.

### Implementation Steps:
1.  **Enable i18n in Strapi:**
    - Settings -> Internationalization.
    - Add Locales (ensure they match the codes used in Medusa, e.g., `en-US`, `fr-FR`).
2.  **Link Strategy:**
    - Use the **slug** or a shared ID to link a Strapi page to a Medusa product/collection if necessary, but keep them loosely coupled.

---

## 3. Storefront Implementation (Next.js)

### Recommendation: `next-intl`
For the Next.js App Router (`apps/dji-storefront`), `next-intl` is the standard library for handling UI translations (e.g., "Add to Cart" buttons, navigation menus) and routing.

### Implementation Steps:

1.  **Install Library:**
    ```bash
    pnpm add next-intl
    ```

2.  **Configure Routing (Middleware):**
    Create `src/middleware.ts` to handle locale detection and routing (e.g., `/en/products/...`, `/fr/products/...`).

    ```typescript
    import createMiddleware from 'next-intl/middleware';
    
    export default createMiddleware({
      locales: ['en', 'fr', 'de'],
      defaultLocale: 'en'
    });
    
    export const config = {
      matcher: ['/((?!api|_next|.*\\..*).*)']
    };
    ```

3.  **Medusa Client Integration:**
    When fetching data from Medusa, pass the current locale header.

    ```typescript
    // Example in a Server Component or Service
    import { headers } from 'next/headers';
    
    export async function getProducts() {
      const locale = headers().get('X-NEXT-INTL-LOCALE') || 'en'; // Or however you retrieve current locale
      
      const { products } = await medusa.products.list({
        // ... filters
      }, {
        headers: {
          'x-medusa-locale': locale // Important: Native Medusa v2 header
        }
      });
      
      return products;
    }
    ```

4.  **Content Fallback:**
    Ensure your UI handles cases where a translation is missing (Medusa v2 usually falls back to the default language if configured, but frontend safety is good).

---

## Summary Checklist

- [ ] **Phase 1: Backend Upgrade**
    - [ ] Upgrade `apps/medusa` to v2.12.3+.
    - [ ] Verify Admin shows Translation options.
- [ ] **Phase 2: Storefront Routing**
    - [ ] Install `next-intl` in `apps/dji-storefront`.
    - [ ] Set up middleware for localized routes (`/[locale]/...`).
- [ ] **Phase 3: Data Fetching**
    - [ ] Update Medusa SDK calls to include `x-medusa-locale` header.
- [ ] **Phase 4: Content Population**
    - [ ] Input translations for top 5 products in Admin to test.
