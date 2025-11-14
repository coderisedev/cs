# Blog Category List Implementation Plan

## Objective
Show a list of blog categories below the search bar on `/us/blog`, sourcing data from Strapi so new categories appear without code changes.

## Strapi Work (Content Ops)
1. **Confirm Category Source**
   - If Posts already use the `category` text field (single value), standardize the allowed values (e.g., “Guides”, “Product Updates”, “Simulator Tips”).
   - Optionally convert to a proper Strapi collection (e.g., `Category` with `name`, `slug`, `description`) and relate it to `Post`. This gives editors a central place to manage categories.
2. **API Exposure**
   - Ensure `/api/posts` responds with the `category` field when `fields=category` is requested.
   - If using a dedicated Category content type, expose `/api/categories` (or `/api/blog-categories`) with `name` and `slug`. Grant read permissions to the API token in use.
3. **Webhook Update**
   - Add blog-category tag to existing Strapi revalidate webhook (or create a new webhook that calls `/api/revalidate?tag=blog-categories&secret=...`) so category list refreshes on publish.

## Frontend Work (Development)
1. **Data Fetcher**
   - Inside `apps/dji-storefront/src/lib/data/blog.ts`, add `getBlogCategories()`:
     ```ts
     export const getBlogCategories = async () => {
       const response = await fetch(`${STRAPI_API_URL}/api/posts?fields=category`, {
         headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` },
         next: { revalidate: 300, tags: ["blog-categories"] },
       })
       return Array.from(new Set(response.data.map((post) => post.attributes.category))).filter(Boolean)
     }
     ```
   - If leveraging a dedicated Strapi Category API, map `name + slug` accordingly.
2. **UI Component**
   - Create `apps/dji-storefront/src/components/blog/blog-category-pills.tsx` that accepts a category array and renders pill buttons/links (e.g., `Link href={buildCategoryUrl(category)}`) with active state when the query param matches.
3. **Integrate on `/us/blog`**
   - Update the Blog page server component to call `const categories = await getBlogCategories()` and render `<BlogCategoryPills categories={categories} activeCategory={searchParams.category} />` directly beneath the search form.
   - Wire the query param into the existing blog list fetch so `filters.category` applies when a category is selected.
4. **Filtering Logic**
   - Extend the `listPosts` function in `src/lib/data/blog.ts` to accept `category?: string` and append the filter to the Strapi query (e.g., `filters[category][$eq]=category` or `filters[categories][slug][$eq]=slug`).
   - Ensure the category pills update the URL via `<Link />` or form submission so SSR picks up the selection.
5. **Styling**
   - Use design tokens (e.g., `btn-secondary`, `rounded-full`, `hover:bg-primary/10`) for consistent UI. Show up to ~10 categories with a horizontal scroll or wrap.

## Validation
- [ ] `pnpm --filter dji-storefront lint && pnpm --filter dji-storefront build` pass.
- [ ] Manual QA on dev: categories render below search bar, clicking a pill filters the list and highlights the active pill.
- [ ] Strapi webhook triggers cache revalidation; after adding a new category, the dev site shows it without redeploy.

## Deliverables / Assignments
- **Content Team**: finalize category taxonomy in Strapi and configure the webhook secret.
- **Dev**: implement fetcher, component, filtering logic, and route integration per steps above.
- **Ops**: verify the revalidate endpoint secret is stored in Vercel env and Strapi webhooks point to it.
