# Favicon Conflict Resolution Post-Mortem

**Date**: 2025-11-28
**Issue**: User requested to enforce usage of `apps/dji-storefront/public/favicon.ico` as the browser icon.

## Problem Analysis
Upon investigation, two `favicon.ico` files were found in the project:
1.  `apps/dji-storefront/public/favicon.ico` (15KB) - The desired icon.
2.  `apps/dji-storefront/src/app/favicon.ico` (25KB) - A conflicting icon (likely a Next.js default or placeholder).

In Next.js App Router, special files like `favicon.ico` placed directly in `src/app/` can take precedence or cause confusion with files served statically from `public/`.

## Solution
1.  **Configuration Check**: Verified `src/app/layout.tsx` metadata configuration:
    ```typescript
    export const metadata: Metadata = {
      // ...
      icons: {
        icon: "/favicon.ico",
      },
    }
    ```
    This points to the root `/favicon.ico`.

2.  **Action**: Deleted the conflicting file `apps/dji-storefront/src/app/favicon.ico`.

## Result
By removing the file in `src/app/`, Next.js now correctly serves the `favicon.ico` from the `public/` directory when `/favicon.ico` is requested. This ensures the correct branding is displayed in the browser tab.
