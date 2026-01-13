# Product Variant Management Guide (Medusa v2)

This guide explains how to configure Product Options and create Variants (SKUs) for a single product in the Medusa Admin.

## Concept
In Medusa:
- **Product**: The general item (e.g., "Cotton T-Shirt").
- **Options**: The attributes that vary (e.g., "Size", "Color", "Material").
- **Variants**: The specific buyable combinations (e.g., "Cotton T-Shirt / Size S / Red").

## Step-by-Step Guide

### 1. Configure Product Options
Before creating variants, you must define what *can* vary.

1.  Log in to the **Medusa Admin**.
2.  Navigate to **Products** and click on the product you want to edit.
3.  Scroll down to the **Options** section.
4.  Click **Add Option** (or Edit if some exist).
    *   **Title**: Enter the name (e.g., `Size`, `Color`).
    *   **Values**: Enter the possible values (e.g., `S`, `M`, `L`, `XL`). Press Enter after each value.
5.  Click **Save**.
    *   *Repeat this for all dimensions (e.g., add a "Color" option with values "Red", "Blue").*

### 2. Create a Variant
Once options exist, you can create the specific combinations.

1.  Scroll to the **Variants** section on the Product details page.
2.  Click **Create Variant** (often a `+` button or "Add Variant" link).
3.  **General Details**:
    *   **Title**: Usually auto-generated based on options (e.g., "S / Red"), but you can override it.
    *   **Options**: Select the specific value for each option (e.g., Size: `S`, Color: `Red`).
4.  **Pricing**:
    *   Enter the price for each currency/region defined in your store.
    *   *Note: Different variants can have different prices (e.g., XL might cost more).*
5.  **Stock & Inventory**:
    *   **SKU**: Enter a unique Stock Keeping Unit identifier (e.g., `TSHIRT-RED-S`). **Highly Recommended**.
    *   **Manage Inventory**: Check this if you want Medusa to track stock counts.
    *   **Quantity**: If managed, enter the current stock level.
    *   **Allow Backorders**: Check if customers can buy even when stock is 0.
6.  **Shipping**:
    *   **Weight/Dimensions**: Important if you are using the **Dynamic Shipping Module** (calculated shipping).
7.  Click **Save**.

### 3. Manage Existing Variants
You can view all variants in the table under the **Variants** section.

*   **Edit**: Click on a variant row to update its Price, Stock, or Metadata.
*   **Delete**: Select a variant and choose delete if it's no longer sold.
*   **Duplicate**: (If available in your Admin version) Use this to quickly create similar variants, changing only the SKU and one Option value.

## Best Practices
1.  **Consistent SKUs**: Use a pattern like `CATEGORY-PRODUCT-COLOR-SIZE` (e.g., `TS-001-BLK-M`). This helps with warehouse management.
2.  **Images**: You can often assign specific images to a variant so the user sees the red shirt when they select "Red".
3.  **Prices**: Ensure you set prices for **all** supported currencies to avoid checkout errors in international markets.

## Troubleshooting
*   **"I can't select 'Red'?"**: Go back to **Options** and ensure "Red" is added as a value under the "Color" option.
*   **"Shipping not calculating?"**: Ensure the variant has a **Weight** set if you are using weight-based shipping rules.
