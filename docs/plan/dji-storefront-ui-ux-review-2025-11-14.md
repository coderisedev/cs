# DJI Storefront – UI/UX Review (2025-11-14)

## Summary
Ahead of production launch, a quick audit surfaced several UX blockers and polish opportunities. This doc lists each item with the impacted file and recommended follow-up.

## Findings

1. **Navigation loses country context**
   - `SiteHeader` links (NAV_ITEMS) go to `/products`, `/blog`, etc. Because the app lives under `[countryCode]`, these links redirect to 404 when you’re on `/us`.
   - _Files_: `apps/dji-storefront/src/components/layout/site-header.tsx:13-85`
   - _Fix_: Prepend the active `countryCode` to each href (e.g., `/${countryCode}${item.href}`) or generate nav items server-side.

2. **Top search has no behavior**
   - The header search toggle exposes only an input field with no submit button or navigation; typing text does nothing.
   - _Files_: `site-header.tsx:132-141`
   - _Fix_: Hook the input to a search results page (`/us/search?q=`) or integrate live suggestions.

3. **Theme toggle not persistent**
   - Dark/light switching only toggles a class in memory; refreshes revert to default and cause FOUC.
   - _Files_: `site-header.tsx:27-44`
   - _Fix_: use `next-themes` or persist the preference in `localStorage` and hydrate `<html>` before paint.

4. **Blog search/filter is client-only**
   - Search input filters only the currently loaded posts (client-side). Navigating or refreshing resets state, and there’s no full-site search.
   - _Files_: `apps/dji-storefront/src/app/[countryCode]/blog/blog-client.tsx:20-100`
   - _Fix_: push search term into the URL (`?q=`) and fetch from Strapi with `filters` so all pages participate; add `aria-label` for accessibility.

5. **Products “Load More” does nothing**
   - `ProductsPageClient` renders a “Load More Products” button without handlers; clicking it yields no UX.
   - _Files_: `apps/dji-storefront/src/app/[countryCode]/products/products-client.tsx:137-158`
   - _Fix_: implement pagination/infinite-scroll or remove the button until it’s functional.

6. **Featured Products empty state**
   - Home section blindly maps `featuredProducts`; if the collection is empty or request fails, the section becomes an empty gap with no fallback.
   - _Files_: `apps/dji-storefront/src/app/[countryCode]/page.tsx:140-170`
   - _Fix_: add skeletons or a message (“Featured hardware coming soon”) so the layout remains intentional.

7. **Dark mode card backgrounds**
   - (Addressed subsequently) Product cards originally stayed white in dark mode, making text unreadable. Resolved by updating `Card` component backgrounds.

## Next Steps
- Prioritize #1, #2, #5 for immediate launch readiness.
- Plan for richer search (blog + catalog) and nav localization shortly after go-live.
- Track caching/webhook work in `docs/plan/next-cache-refresh-plan.md`.
