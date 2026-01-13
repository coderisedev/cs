# How to Configure Dynamic Shipping in Medusa v2

In Medusa v2, Shipping Options are tied to **Stock Locations** and **Fulfillment Sets**, not just generic "Regions".

## Prerequisites
Ensure the `dynamic-shipping` module is running (restart your server if you just added it).

## Step-by-Step Configuration

### 1. Enable the Provider in your Stock Location
1.  Open the **Medusa Admin**.
2.  Go to **Settings** > **Locations** (under the "Inventory & Stock" section).
3.  Click on your location (e.g., **Default Location**).
4.  Scroll down to the **Fulfillment Providers** section.
5.  Click **Edit**.
6.  Check the box for **Dynamic Shipping Provider** (it might show as `dynamic-shipping`).
7.  Click **Save**.

### 2. Create a Shipping Option
Now that the location "knows" about the provider, you can create a shipping option using it.

1.  Stay on the **Location Details** page.
2.  Scroll to the **Fulfillment Sets** section.
    *   *If you don't have a Fulfillment Set (e.g., "Main Store Shipping"), create one.*
3.  Click on a **Fulfillment Set**.
4.  You should see **Service Zones** (e.g., "US", "Europe", "Global").
    *   *If you don't have a zone that covers the customer's country, create one.*
5.  Click on a **Service Zone** to expand it or view details.
6.  Click **Create Shipping Option**.
7.  Fill in the form:
    *   **Name**: e.g., "Standard Shipping".
    *   **Price Type**: Select **Calculated**.
    *   **Fulfillment Provider**: Select **Dynamic Shipping Provider**.
8.  Click **Save**.

## Troubleshooting
-   **Can't see "Dynamic Shipping Provider"?**
    -   Ensure `apps/medusa` was rebuilt: `cd apps/medusa && pnpm build`.
    -   Ensure the server was restarted: `pnpm dev`.
    -   Check the console logs for "Dynamic Shipping Provider" registration errors.
