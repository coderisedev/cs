# Header Icon Hydration Error Post-Mortem

**Date**: 2025-11-28  
**Issue**: Hydration error occurring after increasing header icon sizes

## Problem

After increasing the header icon sizes from `h-5 w-5` to `h-8 w-8` and button sizes to `h-12 w-12`, a hydration mismatch error occurred:

```
Hydration failed because the server rendered HTML didn't match the client.
```

The browser console showed that lucide icons (moon, search, user, shopping-cart) had different `className` values between server and client renders.

## Root Cause

The `Button` component's `size="icon"` prop was conflicting with the manually applied sizing classes (`h-12 w-12`). The `size="icon"` prop applies default sizing styles that were being inconsistently applied between server-side and client-side rendering, causing the hydration mismatch.

## Solution

1. **Removed `size="icon"` prop** from all header icon buttons (Theme Toggle, Search, User, Shopping Cart)
2. **Added explicit flex classes** (`inline-flex items-center justify-center`) to ensure proper icon centering
3. **Kept manual sizing** (`h-12 w-12` for buttons, `h-8 w-8` for icons)

### Changed Code

```diff
- <Button variant="ghost" size="icon" className="h-12 w-12">
+ <Button variant="ghost" className="h-12 w-12 inline-flex items-center justify-center">
```

## Verification

- Navigated to `http://localhost:3000`
- Checked browser console: **No hydration errors**
- Confirmed header icons display correctly at larger size
- Screenshot: `no_hydration_error_1764338121997.png`

## Key Learnings

1. **Avoid mixing prop-based and class-based sizing**: When using manual Tailwind classes for sizing, remove conflicting component props like `size`
2. **Hydration errors from style conflicts**: Even minor className differences between server and client can trigger hydration errors
3. **Explicit layout classes**: When removing `size="icon"`, manually add layout classes (`inline-flex items-center justify-center`) to maintain proper alignment

## Files Modified

- `apps/dji-storefront/src/components/layout/site-header.tsx`

## Related Issues

- Previous hydration warning was resolved by adding `suppressHydrationWarning` to `<body>` tag (see `favicon-conflict.md`)
- This was a new, distinct hydration error specifically related to icon sizing conflicts
