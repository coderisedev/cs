# Cart Tax and Subtotal Display Fix

**Date**: 2026-01-14
**Issue**: Cart and Checkout pages showing incorrect subtotal (including shipping) and tax not updating after PayPal preparation

## Problem 1: Tax Not Updating After PayPal Preparation

### Symptoms
- Checkout page shows "Tax: Calculated at next step" even after clicking PayPal button
- User can proceed to PayPal payment without seeing the actual tax amount

### Root Cause
When user clicks PayPal button, `preparePayPalCheckoutAction` sets shipping address and method, which triggers tax calculation on the backend. However, the frontend cart state was not refreshed, so the UI still showed the old "Calculated at next step" message.

### Solution
1. Modified `preparePayPalCheckoutAction` to return the updated cart data after setting address/shipping
2. Added cart state management in `checkout-client.tsx` to update UI with refreshed cart

**Files Modified**:
- `src/lib/actions/checkout.ts` - Return updated cart from `preparePayPalCheckoutAction`
- `src/components/checkout/checkout-client.tsx` - Add cart state and update after PayPal preparation

```typescript
// checkout.ts - Return updated cart
export async function preparePayPalCheckoutAction(
  input: PreparePayPalCheckoutInput
): Promise<{ paypalOrderId?: string; cart?: HttpTypes.StoreCart; error?: string }> {
  // ... existing logic ...

  // Retrieve the final cart with all totals calculated (including tax)
  const finalCart = await retrieveCart()
  return { paypalOrderId, cart: finalCart ?? undefined }
}

// checkout-client.tsx - Update cart state
const [cart, setCart] = useState(initialCart)

const handleCreatePayPalOrder = async () => {
  const result = await preparePayPalCheckoutAction({...})
  if (result.cart) {
    setCart(result.cart)  // Update UI with calculated tax
  }
  return result.paypalOrderId || null
}
```

## Problem 2: Subtotal Including Shipping

### Symptoms
- Cart page showing $800 Subtotal for a $799 product
- Shipping shows "Calculated at checkout" but Total already includes shipping

### Root Cause
Medusa 2.x's `cart.subtotal` field includes **both items AND shipping**:

```json
{
  "subtotal": 120,           // = item_subtotal + shipping_subtotal
  "item_subtotal": 20,       // Products only
  "shipping_subtotal": 100,  // Shipping only
  "shipping_total": 100,
  "total": 120
}
```

The frontend was using `cart.subtotal` which caused the display to show items + shipping as "Subtotal".

### Solution
Use `cart.item_subtotal` instead of `cart.subtotal` for displaying product subtotal.

**Files Modified**:
- `src/components/cart/cart-client.tsx`
- `src/components/checkout/checkout-client.tsx`

```typescript
// Before
const subtotal = cart.subtotal || 0

// After
const subtotal = cart.item_subtotal || 0
```

## Problem 3: Shipping/Tax Display Inconsistency

### Symptoms
- Cart page always showed "Calculated at checkout" for shipping/tax even when values were available

### Solution
Display actual values when available, otherwise show "Calculated at checkout":

```typescript
// cart-client.tsx
const shippingTotal = cart.shipping_total || 0
const taxTotal = cart.tax_total || 0

// In JSX
{shippingTotal > 0 ? currencyFormatter(shippingTotal) : "Calculated at checkout"}
{taxTotal > 0 ? currencyFormatter(taxTotal) : "Calculated at checkout"}
```

## Database Reference: Shipping Options

| Shipping Option   | Amount (cents) | Display Price |
|-------------------|----------------|---------------|
| Standard Shipping | 1000           | $10.00        |
| Express Shipping  | 1000           | $10.00        |
| US express        | 100            | $1.00         |

Query to check shipping prices:
```sql
SELECT
  so.name as shipping_option,
  p.amount,
  p.currency_code
FROM shipping_option so
JOIN shipping_option_price_set sops ON sops.shipping_option_id = so.id
JOIN price p ON p.price_set_id = sops.price_set_id
WHERE so.deleted_at IS NULL
ORDER BY so.name;
```

## Medusa Cart Fields Reference

| Field | Description |
|-------|-------------|
| `subtotal` | item_subtotal + shipping_subtotal (NOT just items!) |
| `item_subtotal` | Sum of all item prices (products only) |
| `item_total` | item_subtotal after discounts and taxes |
| `shipping_subtotal` | Shipping cost before tax |
| `shipping_total` | Shipping cost after tax |
| `tax_total` | Total tax amount |
| `total` | Final total (items + shipping + tax - discounts) |

## Problem 4: Tax Shows "Calculated" When Price Is Tax Inclusive

### Symptoms
- Checkout page shows "Tax: Calculated at next step" even after selecting address
- Tax never shows a calculated value because prices are already tax inclusive

### Root Cause
Products have `is_tax_inclusive: true`, meaning tax is already included in the price. In this case, `tax_total = 0` because there's no additional tax to add.

```sql
-- Database shows is_tax_inclusive = true
SELECT title, unit_price, is_tax_inclusive FROM cart_line_item;
-- CS 320A MCDU | 79900 | t
```

```json
// API response
{
  "tax_total": 0,
  "items": [{ "is_tax_inclusive": true }]
}
```

### Solution
Check if items are tax inclusive and display "Included" instead of "Calculated at next step":

**Files Modified**:
- `src/components/cart/cart-client.tsx`
- `src/components/checkout/checkout-client.tsx`

```typescript
// Check if prices are tax inclusive
const isTaxInclusive = cart.items?.some(item => item.is_tax_inclusive) ?? false

// In JSX
{tax > 0
  ? currencyFormatter(tax)
  : isTaxInclusive
    ? "Included"
    : "Calculated at next step"}
```

## Problem 5: Warranty Markdown Not Rendering

### Symptoms
- Product detail page `/us/products/cs-320a-mcdu` shows raw Markdown text in Warranty section
- Markdown lists, bold text, and links not rendered properly

### Root Cause
The `warrantyInfo` field from Strapi contains Markdown, but the code was using `dangerouslySetInnerHTML` expecting HTML:

```tsx
// Before - expected HTML but received Markdown
<div dangerouslySetInnerHTML={{ __html: strapiContent.warrantyInfo }} />
```

### Solution
Use `react-markdown` with `remark-gfm` and `remark-breaks` plugins to properly render Markdown content:

**File Modified**: `src/components/products/product-detail-client.tsx`

```tsx
// Added imports
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

// Changed rendering
<div className="prose prose-sm sm:prose-base max-w-none text-foreground-secondary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-foreground-primary [&_a]:text-primary-500 [&_a:hover]:underline">
  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
    {strapiContent.warrantyInfo}
  </ReactMarkdown>
</div>
```

Also applied same fix to `osRequirements` field.

## Testing Checklist

- [ ] Cart page shows correct Subtotal (products only, not including shipping)
- [ ] Cart page shows Shipping amount when set, otherwise "Calculated at checkout"
- [ ] Cart page shows "Tax: Included" when prices are tax inclusive
- [ ] Cart page shows "Tax: Calculated at checkout" when prices are not tax inclusive
- [ ] Cart page Total = Subtotal + Shipping + Tax
- [ ] Checkout page shows correct Subtotal
- [ ] Checkout page shows "Tax: Included" when prices are tax inclusive
- [ ] Checkout page updates Tax display after clicking PayPal button (for non-inclusive prices)
- [ ] PayPal popup shows correct total amount
- [ ] Product detail Warranty section renders Markdown properly (lists, bold, links)
- [ ] Product detail System Requirements section renders Markdown properly
