# Featured Products Missing on Production – 2025-11-14 Retro

## Context
- `/us` shows a “Featured Products” grid sourced from Medusa’s `featured` collection (via `/store/collections?handle=featured` + `/store/products?collection_id=…`).
- Dev/staging (`https://dev.aidenlux.com/us`) rendered the cards correctly, but prod (`https://prd.aidenlux.com/us`) only showed the section heading and CTA.
- Goal: restore the product cards on production and document the root cause so future deploys stay healthy.

## What Happened
1. **Initial symptom**: Prod’s Featured grid had zero cards even though Medusa held real products. Dev showed 4 cards.
2. **Investigated prod DOM** (Playwright) – section exists, grid empty.
3. **Checked storefront code** – `getProductsByCollectionHandle()` uses Medusa SDK + `getCollectionByHandle()`. If the collection lookup fails, the function returns `[]`.
4. **HTTP tracing via CLI**:
   - `curl https://api.aidenlux.com/store/collections?handle=featured` without headers → `401 Publishable API key required`.
   - Dev `.env.local` had `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, so local builds always sent the header. Production env missed it.
5. **First fix**: Introduced `getMedusaPublishableKey()` helper plus optional `MEDUSA_PUBLISHABLE_KEY` fallback. Wired it into the SDK bootstrap, auth headers, and Google OAuth routes. Result: prod builds now include the publishable key.
6. **Remaining issue**: Featured still empty because previous 401 responses were cached – the data helpers were using `cache: "force-cache"` with cookies-based tags, so the stale “empty collection” result persisted.
7. **Final fix**: For collections APIs we switched to `cache: "no-store"` and `next: { revalidate: 0 }`, guaranteeing dynamic fetches that pick up the now-successful responses.
8. Redeployed / invalidated Vercel; prod now matches dev.

## Root Cause
- **Missing publishable API key on production** meant every Medusa `/store/*` call returned 401. Because the collections helper cached the response aggressively, the failure persisted after redeploys.

## Resolution
- Added a shared publishable key helper to read from either `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` or `MEDUSA_PUBLISHABLE_KEY`, warning if neither is set.
- Updated all Medusa calls (SDK init, server cookies, Google auth routes) to always send the resolved key.
- Removed server-side caching for collections (list, retrieve, by-handle) to avoid pinning unauthenticated responses.

## Validation
- Playwright snapshots: prod grid now contains 4 cards identical to dev.
- `curl -I https://prd.aidenlux.com/us` → `x-vercel-cache: MISS`, `/_store/collections?handle=featured` returns 200.
- Manual browser check confirms Featured cards and Product Collections section both render data.

## Lessons Learned
1. Medusa requires the publishable key on **every** `/store/*` request, even server-side. Ensure prod env vars include either `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` or `MEDUSA_PUBLISHABLE_KEY`.
2. Avoid caching vendor responses that depend on runtime credentials unless you have a cache-busting strategy. A 401 cached once will stay 401 forever.
3. Dev vs prod parity: always double-check env templates/documentation after adding required secrets.

## Follow-ups
1. Update ops runbook to set both `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` and `MEDUSA_PUBLISHABLE_KEY` on Vercel so we have belt-and-suspenders coverage.
2. Consider adding an uptime probe for `/store/collections?handle=featured` that alerts when the response size drops to zero.
3. Revisit other data helpers (products, regions, etc.) to ensure their cache modes won’t lock in future credential errors.
