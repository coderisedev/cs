# Collection Detail Page 500 Error Fix

**Date**: 2025-12-07
**Affected URL**: `https://prd.aidenlux.com/us/collections/airbus320` (and all collection detail pages)
**Severity**: Critical (all collection pages returning 500)

## Problem Description

All collection detail pages (`/us/collections/[handle]`) were returning HTTP 500 Internal Server Error. The issue affected every collection including:
- `/us/collections/airbus320`
- `/us/collections/boeing737`
- `/us/collections/accessory`
- `/us/collections/other-series`

The collections list page (`/us/collections`) worked fine, but clicking into any individual collection resulted in a server error.

## Root Cause Analysis

### Primary Cause: Unhandled Exception in `listProducts`

The `listProducts` function in `apps/dji-storefront/src/lib/data/products.ts` throws an unhandled error when region resolution fails:

```typescript
// products.ts:121-123 (BEFORE)
if (!region) {
  throw new Error("Unable to resolve region for product listing")
}
```

When `resolveRegion()` returns `null` (due to invalid region ID, API failures, or misconfiguration), this error propagates up and crashes the page.

### Secondary Cause: SSG Build-Time Caching

The collection detail page used Static Site Generation (SSG) via `generateStaticParams`:

```typescript
// page.tsx (BEFORE)
export async function generateStaticParams() {
  const collections = await getCollections()
  return collections.map((collection) => ({ handle: collection.handle }))
}
```

Issues with this approach:
1. Only `handle` was returned, not `countryCode`, causing build-time failures
2. If the page errored during build, the error was cached as static HTML
3. Subsequent deployments served the cached 500 error page

### Error Chain

```
Request → CollectionPage
       → listProducts({ countryCode, collection_id })
       → resolveRegion({ countryCode })
       → returns null (region not found)
       → throws "Unable to resolve region for product listing"
       → Unhandled exception → 500 Error
       → SSG caches the error page
```

## Solution

### Fix 1: Graceful Error Handling in `listProducts`

Changed `listProducts` to return empty results instead of throwing:

```typescript
// products.ts:121-124 (AFTER)
if (!region) {
  console.error("Unable to resolve region for product listing", { countryCode, regionId })
  return { response: { products: [], count: 0 }, nextPage: null }
}
```

### Fix 2: Try-Catch in Collection Page

Added error handling around the `listProducts` call:

```typescript
// page.tsx (AFTER)
let products: Awaited<ReturnType<typeof listProducts>>["response"]["products"] = []
try {
  const { response } = await listProducts({ countryCode: resolvedCountryCode, collection_id: collection.id, limit: 100 })
  products = response.products
} catch (error) {
  console.error("Failed to fetch products for collection:", error)
  // Continue with empty products array - page will still render
}
```

### Fix 3: Force Dynamic Rendering

Removed `generateStaticParams` and added `dynamic = "force-dynamic"`:

```typescript
// page.tsx (AFTER)
// Force dynamic rendering to avoid ISR/SSG build-time errors
export const dynamic = "force-dynamic"
```

This ensures:
- Pages render on each request (no stale cached errors)
- Build-time failures don't affect production
- Real-time data from Medusa API

## Files Changed

| File | Changes |
|------|---------|
| `apps/dji-storefront/src/lib/data/products.ts` | Return empty array instead of throwing on region failure |
| `apps/dji-storefront/src/app/[countryCode]/collections/[handle]/page.tsx` | Add try-catch, remove SSG, add dynamic export |

## Commits

1. `21de7ea` - fix(storefront): handle region resolution failure gracefully in collection pages
2. `da9393d` - fix(storefront): force dynamic rendering for collection detail pages

## Verification

After deployment:
- All collection detail pages load successfully
- Pages display empty product list if API fails (graceful degradation)
- No more cached 500 error pages

## Lessons Learned

1. **Never throw in data fetching functions** - Return sensible defaults (empty arrays, null) and log errors
2. **SSG requires complete static params** - If using `generateStaticParams`, include ALL dynamic segments
3. **ISR can cache errors** - Build-time failures become persistent production errors
4. **Prefer `dynamic = "force-dynamic"` for API-dependent pages** - Ensures fresh data and prevents stale error caching
5. **Add try-catch at page level** - Provides last line of defense for graceful degradation

## Future Improvements

1. Consider adding ISR back with proper configuration:
   ```typescript
   export const revalidate = 60 // Revalidate every 60 seconds
   ```

2. Implement proper error boundary UI for product fetch failures

3. Add monitoring/alerting for region resolution failures

4. Ensure `US_REGION_ID` environment variable is correctly set in all environments
