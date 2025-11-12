# Medusa Region/Cart Failure – 2025-11-12

## Incident Summary
- **Symptom**: Vercel storefront “Add to Cart” returned 500; browser console logged “Add to cart failed …”. Admin login also unavailable earlier.
- **Impact**: Customers could not create carts or add products; storefront unusable for checkout.
- **Duration**: ~2025-11-11 12:00 UTC until 2025-11-12 02:30 UTC.

## Timeline
1. **11/11 11:58 UTC**: Medusa container rebuilt; admin login user missing and `MEDUSA_ADMIN_DISABLE=true` kept UI hidden.
2. **11/11 12:30 UTC**: Admin login restored (account `admin@aidenlux.com`, password `BsoFf!472Z`). Google OAuth features added to storefront.
3. **11/12 01:50 UTC**: User reports Add-to-Cart still failing despite deploy.
4. **11/12 02:00 UTC**: Playwright reproduces 500 response; Medusa logs show repeated `/store/carts` 404 with “No regions found”. Investigation reveals storefront still sending legacy region id `reg_01K917...`.
5. **11/12 02:20 UTC**: Updated `apps/dji-storefront/src/lib/constants.ts` to default to the live US region id `reg_01K9KE3SV4Q4J745N8T19YTCMH`; reminded to set `NEXT_PUBLIC_REGION_ID` + redeploy.
6. **11/12 02:30 UTC**: After redeploy, Add-to-Cart succeeds; storefront confirmed healthy.

## Root Cause
- The Medusa database now uses region `reg_01K9KE3SV4Q4J745N8T19YTCMH`, but the storefront still hard-coded/used env `reg_01K917GBJZ2ZJMV6A4PARVCE1K`. Any `/store/carts` call without a valid region is rejected, hence the “No regions found” 404.
- Secondary issue: admin user was deleted during earlier rebuild, so Admin UI couldn’t be accessed until a new user was created.

## Fixes Implemented
1. **Admin access**: Recreated admin account via `pnpm medusa user -e admin@aidenlux.com -p BsoFf!472Z` after ensuring `@medusajs/auth-emailpass` provider is registered. Enabled `MEDUSA_ADMIN_DISABLE=false`.
2. **Region alignment**:
   - Set default `US_REGION_ID` constant to the live region id.
   - Documented configuration in `docs/basic/medusa-region-setup.md`.
   - Action item for ops: ensure `NEXT_PUBLIC_REGION_ID` matches DB ID before deploy.
3. **Validated**: Playwright run now shows `/store/carts` 200 and cart count increments; Medusa logs no longer show “No regions found”.

## Lessons / Follow-ups
- Whenever a region is recreated (new ID), frontends must be updated and redeployed; add this to deployment checklist.
- Consider retrieving region ids dynamically (e.g., hitting `/store/regions` at build time) instead of hard-coding.
- Keep a dedicated “production admin” user stored in secrets vault; scripts should detect existing admin instead of blindly deleting.
