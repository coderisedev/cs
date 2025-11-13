# Medusa Database Inspection Cheat Sheet

Use this playbook whenever you need to answer “does Medusa already have *X* configured?” without spinning up the full backend stack. It documents the direct Postgres connection method we verified while troubleshooting the CS 320A MCDU listing.

## 1. Source credentials
1. Open `deploy/gce/.env`.
2. Copy `MEDUSA_DATABASE_URL`. Replace the `host.docker.internal` host with `localhost` because the Postgres server runs on the host OS.

Example:
```
export MEDUSA_DATABASE_URL="postgres://cs:password@localhost:5432/medusa_production"
```

## 2. Connect with psql
```bash
psql "$MEDUSA_DATABASE_URL"
```
If `psql` is not installed, `sudo apt install postgresql-client` on Ubuntu, then rerun the command.

Helpful meta commands once connected:
- `\dt` – list tables.
- `\d+ table_name` – describe table schema.
- `\x on` – toggle expanded output for wide rows.

## 3. Common product checks
- Find a product:  
  ```sql
  SELECT id, title, handle, status, collection_id
  FROM product
  WHERE title ILIKE '%CS 320A%';
  ```
- Sales channel linkage:  
  ```sql
  SELECT * FROM product_sales_channel WHERE product_id = '<product_id>';
  ```
- Variant + price:  
  ```sql
  SELECT id, sku FROM product_variant WHERE product_id = '<product_id>';
  SELECT currency_code, amount FROM price WHERE price_set_id = '<price_set_id>';
  ```
- Inventory availability:  
  ```sql
  SELECT inventory_item_id FROM product_variant_inventory_item WHERE variant_id = '<variant_id>';
  SELECT location_id, stocked_quantity
  FROM inventory_level
  WHERE inventory_item_id = '<inventory_item_id>';
  ```

## 4. Frontend correlation tips
- The Next.js storefront fetches `/store/products` with `region_id` set to the US region (`apps/dji-storefront/src/lib/constants.ts:1-4`), so make sure the product has prices for that region/currency.
- Featured sections are keyed by collection handle `"featured"` (`apps/dji-storefront/src/app/[countryCode]/page.tsx:43`). Verify `product.collection_id` maps to `featured` via `product_collection`.
- Inventory must exist in a stock location that is attached to the same sales channel as the publishable API key (`publishable_api_key_sales_channel`). Otherwise Medusa reports zero `inventory_quantity` even if another warehouse holds stock.

## 5. Exit
Type `\q` to leave `psql`. Keep the `.env` file untouched and avoid committing real credentials.
