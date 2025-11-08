# Strapi Product Detail Q&A

This note captures the key answers from the recent debugging session so future contributors can quickly understand how product detail content is wired up.

## 1. How does the product detail page link Medusa products with Strapi content?

- Each Strapi entry in `Product Detail` uses the Medusa product `handle` as its UID.
- At runtime the storefront page (`apps/web/.../products/[handle]/page.tsx`) fetches both the Medusa product (`listProducts`) and the Strapi entry (`getProductDetail`) using that handle.
- The resulting CMS payload provides hero media, specs, FAQs, downloads, SEO, etc., which the React components merge with the Medusa pricing/inventory data for a single enriched page.
- Seeder `apps/strapi/src/bootstrap/product-detail-seeder.ts` ensures default entries exist for the four demo handles so the mapping is guaranteed after a fresh bootstrap.

## 2. Why are there 8 rows in `product_details` when we only manage 4 products?

- Strapi 5 enables Draft & Publish for this collection.
- Each logical product detail produces two physical rows: one for the published version (non-null `published_at`) and one for the draft version.
- The rows are tied together through a shared `document_id` in `product_details_documents`.
- Therefore 4 handles × (draft + published) = 8 rows; it’s expected and ensures editors can stage edits without affecting the live entry.

## 3. How are `product_details` entries linked to component tables such as `components_product_qas`?

- Repeatable components are stored in their own tables (e.g., `components_product_qas`, `components_product_features`, `components_product_downloads`).
- Strapi maintains join rows in `product_details_cmps`, which reference the entity/document id, the component id, the component type, and the field name plus position.
- This effectively creates a one-to-many relationship between the product detail entry and each component list while preserving order.
- When the API is queried with `populate`, Strapi resolves those joins automatically, so the frontend sees nested JSON without touching the join table directly.

