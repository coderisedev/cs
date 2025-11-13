# CS 320A MCDU Product Visibility Check

## Summary
- Confirmed the CS 320A MCDU product is configured correctly inside Medusa (published, in `featured` collection, priced in USD/EUR).
- It is assigned to the Default Sales Channel — the same channel exposed through the storefront’s publishable key — so Medusa’s `/store/products` should include it and the frontend should render the card.
- The only blocker for checkout is stock attribution: available inventory sits exclusively in the Dongguan warehouse, which is not linked to the sales channel that powers the storefront, so Medusa reports zero sellable quantity.

## Environment & Commands
- Used `deploy/gce/.env` credentials to access the live Medusa Postgres on `localhost:5432`.
- Verified product data via `psql postgres://cs:n6DYeq3H9uOJudpligATbfYYmjJtUaoV@localhost:5432/medusa_production -c "<query>"`.
- Inspected storefront sourcing logic in `apps/dji-storefront/src/lib/data/products.ts` and homepage filtering in `apps/dji-storefront/src/app/[countryCode]/page.tsx`.

## Key Findings
1. `product` row `prod_01K9Y5FYB3NPJHKWMMRDZXF93A`
   - Title/handle `CS 320A MCDU` / `cs-320a-mcdu`
   - `status = published`, `collection_id = pcol_01K9Y8P4R0K9ZZ960DEQ9E2NS0 (featured)`
   - Thumbnail + six gallery images present; metadata empty (no hidden flags).
2. Sales-channel wiring
   - `product_sales_channel` ties the product to `sc_01K8FGPPGMEQKS6DSP9J59FM2S` (Default Sales Channel, enabled).
   - Publishable key `apk_01K8J5TBSMAFAGWEV1M6KP650C` — the one shipped with the storefront — is linked to the same channel via `publishable_api_key_sales_channel`.
   - Therefore `/store/products` already returns this SKU when queried with the live key.
3. Pricing and variants
   - Variant `variant_01K9Y5FYCDQW51FWMV3SKZT5WG` (SKU `CS320A-MCDU`) priced at USD 799 / EUR 699, `discountable = true`, not deleted.
4. Inventory mismatch
   - Variant reserves inventory item `iitem_01K9Y8D8AV6F9ATTMH2P71GPNE`.
   - Only inventory level is `location_id = sloc_01K9KE82F5JHEACPWXF8P39QAV` (“中国东莞”) with 100 units.
   - Default Sales Channel exposes only `sloc_01K8J5TBP753MHXX90PTNACTR6` (“European Warehouse”), so store API reports `inventory_quantity = 0`, keeping the button disabled even though the product card shows up.

## Recommended Fix
1. In Medusa Admin → Channels, add stock location `sloc_01K9KE82F5JHEACPWXF8P39QAV` to the Default Sales Channel (or move the inventory for `iitem_01K9Y8D8AV6F9ATTMH2P71GPNE` into an already linked warehouse).
2. Re-run `psql` check on `inventory_level` and confirm Medusa’s storefront API now surfaces a positive `variants.inventory_quantity`.
3. Optional: if the storefront should hide unsalable featured products, add a filter on `product.inStock` before rendering (currently `apps/dji-storefront/src/app/[countryCode]/page.tsx:43` simply checks `product.collection === "featured"`).
