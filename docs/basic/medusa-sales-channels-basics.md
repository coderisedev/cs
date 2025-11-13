# Medusa Sales Channels Basics

Use this note as the quick reference for how we use sales channels to control product exposure across storefronts and regions.

## 1. What is a Sales Channel?
- A sales channel is a logical grouping of products that a publishable API key (and therefore a frontend) can access.
- Every product must belong to at least one channel; otherwise it is invisible to all storefronts.
- Our default Next.js storefront uses key `apk_01K8J5TBSMAFAGWEV1M6KP650C`, which is linked to **Default Sales Channel** (`sc_01K8FGPPGMEQKS6DSP9J59FM2S`).

## 2. Controlling Visibility
- Add/remove products from a channel to batch-show or hide them for the storefronts that share that channel.
- For multi-market deployments, create one channel per site (e.g., `Japan Store`, `EU Wholesale`) and issue a publishable key per channel.
- Example: Removing CS 320A MCDU from the Default channel hides it from the main storefront without touching its draft/published status.

## 3. Region vs. Channel vs. Inventory
| Concept | Purpose | Common mistakes |
| --- | --- | --- |
| **Region** | Defines currency, tax settings, allowed countries. Prices are configured per region. | Forgetting to add a price for each active region → `calculated_price` = 0. |
| **Sales Channel** | Defines which products a publishable key/front-end can see. | Product not linked to channel → invisible even if published. |
| **Stock Location** | Warehouse that holds inventory. Must be linked to the channel for sellable stock. | Location not attached → storefront shows “Out of Stock” despite inventory. |

Use all three together to target “where” and “how” we sell:
1. Channel decides “which storefronts.”
2. Region decides “with what currency/tax.”
3. Stock location decides “from which warehouse.”

## 4. Practical Workflow
1. **Create Channel** (Catalog → Sales Channels) for each storefront or distribution strategy.
2. **Link Products**: bulk-select SKUs and assign them to the channel to control visibility.
3. **Attach Stock Locations**: ensure every channel has the warehouses that can fulfill its orders.
4. **Ensure Pricing Coverage**: products must have prices for every region your storefront uses.

## 5. Use Cases
- **Regional Launch**: create a `Japan Store` channel, issue a dedicated publishable key, only add products approved for JP market, and attach the JP warehouse.
- **Wholesale vs. Retail**: separate channels with different catalogs, price lists, or fulfillment logic.
- **Feature flags**: temporarily hide upcoming products by removing them from the live channel while keeping them published for internal testing via a staging channel/key.

Keep this doc in sync with `docs/runbooks/medusa-admin-playbook.md` whenever we add new channels or change how storefronts map to them.
