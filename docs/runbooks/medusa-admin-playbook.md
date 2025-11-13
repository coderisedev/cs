# Medusa Admin Playbook

This playbook walks a first-time operator through the Medusa Admin (v2) console we deploy on GCE. Follow it end-to-end whenever you need to add or audit catalog items, sales channels, or stock routing. Each section includes a case-driven example using our **CS 320A MCDU** product so you can mirror the same pattern for new hardware.

---

## 0. Prerequisites
| Item | Notes |
| --- | --- |
| Admin URL | `https://medusa-preview.cs.com` (or the Cloudflare hostname wired to port 9000). |
| Credentials | Request a Medusa admin invite from platform ops. Admins can invite others under **Settings → Users**. |
| Publishable Key | `apk_01K8J5TBSMAFAGWEV1M6KP650C` (“Webshop”) is the key wired to the storefront. |
| Regions | `reg_01K9KE3SV4Q4J745N8T19YTCMH (US / USD)` and `reg_01K8J5TBMV1EKV404ZG3SZGXEQ (Europe / EUR)` must stay enabled. |
| Stock Locations | “European Warehouse” (`sloc_01K8J5TBP753MHXX90PTNACTR6`) and “中国东莞” (`sloc_01K9KE82F5JHEACPWXF8P39QAV`). |

> ☑️ **Before you start:** confirm Redis, Postgres, and the Medusa API are healthy (`curl https://api.aidenlux.com/store/health`). If the API is down, fix infra first (see `docs/runbooks/gce-backend-playbook.md`).

---

## 1. Sign In & Verify Permissions
1. Open the Admin URL and log in with your email + password (or create a password using the invite link).
2. In the left rail, expand **Settings**:
   - **Users**: verify your account shows `Role: Admin`.
   - **API Keys**: ensure “Webshop” (publishable) and deployment keys exist; do not rotate them without updating the storefront envs.
3. Bookmark **Settings → Publishable API Keys**. Any new storefront or integration must share a sales channel with the key it uses.

---

## 2. Understand Regions & Currencies
1. Go to **Settings → Regions**.
2. Review each region:
   - `US Region` → currency `USD`.
   - `Europe Region` → currency `EUR`.
   - Inspect **Countries** tab to keep permitted shipping countries in sync with legal/commercial decisions.
3. Case: For CS 320A MCDU we sell in both regions, so confirm both appear under the product’s price set (Step 5).

> 🧠 Tip: Storefront API calls pass `region_id`. If you forget to price a region, the product will respond without `calculated_price` and show as `0` on the frontend.

---

## 3. Sales Channels & Stock Locations
Sales channels gate what the storefront can query. Each channel must be connected to at least one stock location so Medusa can surface inventory.

1. Navigate to **Catalog → Sales Channels**.
2. Open **Default Sales Channel** (`sc_01K8FGPPGMEQKS6DSP9J59FM2S`).
   - Confirm the **Linked products** list includes your target SKU (e.g., CS 320A MCDU).
   - Under **Stock Locations**, add any warehouse that should fulfill storefront orders.
3. Case: CS 320A MCDU initially only had stock in “中国东莞,” but that warehouse was not linked to the default channel. Result: the storefront saw `inventory_quantity = 0`. To fix it:
   - Click **Add Stock Location** → select “中国东莞” → Save.
   - Alternatively, move inventory into “European Warehouse,” which was already attached.

| Checklist | Why it matters |
| --- | --- |
| ✅ Product assigned to sales channel | Controls which publishable keys can fetch it |
| ✅ Stock location linked to channel | Enables sellable inventory calculations |
| ✅ Publishable key linked to channel | Already true for “Webshop”; keep in sync |

---

## 4. Create or Audit Catalog Entries
1. **Products → New Product**
   - Fill **General Info**: Title, Handle, Description, Metadata (e.g., `is_new=true`, `features=[...]`).
   - Assign **Collection** (“featured”) and **Categories** (e.g., `merch` or `a320-series`).
   - Upload gallery images (stored in Cloudflare R2).
2. Save as `Draft` first; add variants and prices before publishing.
3. Case: CS 320A MCDU uses:
   - Handle `cs-320a-mcdu` (mirrors storefront slug).
   - Collection `featured` so it shows on the homepage hero grid.
   - Metadata left empty (frontend falls back to defaults).

> 🧠 Tip: Use lower-kebab-case handles; storefront routes (`/products/[handle]`) depend on them.

---

## 5. Variants, Pricing & Regions
1. Inside the product editor, go to **Variants → Add Variant**.
2. Provide SKU (`CS320A-MCDU`), title (“Standard”), and physical dimensions if available.
3. Click the variant → **Prices** tab:
   - Add one price per region currency (USD 799, EUR 699 for CS 320A MCDU).
   - Enable `Manage inventory` unless it is a made-to-order item.
4. For complex promos, use **Price Lists**; otherwise, raw variant prices are enough.

> ✅ Always match price coverage with Step 2 regions to avoid missing `calculated_price` in API responses.

---

## 6. Inventory & Stock Location Routing
1. Still inside the variant drawer, open **Inventory**.
2. Click **Add Inventory Item** (or select an existing one) to bind the variant to `inventory_item`.
3. For each warehouse:
   - Assign stocked quantity (e.g., 100 units in “中国东莞”).
   - If you add a brand-new warehouse, remember to:
     1. Create it under **Fulfillment → Stock Locations**.
     2. Link it to the sales channel (Step 3).
4. Case workflow:
   - Inventory item `iitem_01K9Y8D8AV6F9ATTMH2P71GPNE` holds the CS 320A stock.
   - `inventory_level` rows show quantities per location; we keep them in sync via the Medusa UI or direct Postgres updates (documented separately in `docs/runbooks/medusa-db-analysis.md`).

---

## 7. Publish & Validate
1. Switch product status from `Draft` → `Published`.
2. Hit **Save**. Medusa now surfaces it to any publishable key tied to the same sales channel.
3. Validation steps:
   - **Admin**: Re-open product detail → confirm “Published” badge.
   - **API**: `curl -s https://api.aidenlux.com/store/products?handle=cs-320a-mcdu | jq '.'`
   - **Frontend**: Visit `/products/cs-320a-mcdu` and ensure price, gallery, and stock badge align with the admin data.
4. If the storefront still hides the product, run through the DB checklist:
   - Product status, sales channel, publishable key
   - Collection handle (needed for featured sections)
   - Inventory channel linkage

---

## 8. Routine Operations
| Task | Where | Notes |
| --- | --- | --- |
| Rotate API keys | Settings → API Keys | Update `apps/dji-storefront` env vars after rotation. |
| Manage discounts/promotions | Marketing → Price Lists / Promotions | Promotions can target tags, collections, or customer groups. |
| Sync with Strapi content | N/A | Product descriptions are authored in Medusa; long-form marketing pages stay in Strapi. |
| Monitor orders | Orders module | Ensure fulfillment providers (DHL, manual) remain configured if we resume shipping flows. |

---

## 9. Troubleshooting Cheat Sheet
| Symptom | Checks | Fix |
| --- | --- | --- |
| Product missing from storefront list | `status`, `deleted_at`, sales channel, publishable key | Publish product, ensure channel alignment. |
| “Out of Stock” badge despite warehouse units | Inventory location not linked to channel | Attach warehouse to channel or move stock. |
| Price shows 0 | Region missing price | Add currency entry under variant Prices. |
| API returns 401 | Publishable key revoked or not authorized for channel | Recreate key + reassign channel via Settings → API Keys. |

---

## 10. References
- Deployment & health checks: `docs/runbooks/gce-backend-playbook.md`
- Direct database inspection: `docs/runbooks/medusa-db-analysis.md`
- Frontend data flow: `apps/dji-storefront/src/lib/data/products.ts`
- Inventory troubleshooting cases: `docs/fix/2025-11-13-cs-320a-mcdu-product-visibility.md`

Keep this playbook updated whenever Medusa gains new plugins (payments, fulfillment) or when we extend to new sales channels. Tag documentation updates with `docs: medusa-admin-playbook` in commit messages for easy traceability.
