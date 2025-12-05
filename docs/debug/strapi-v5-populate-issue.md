# Strapi v5 Integration Debug Summary

## Issue Description
When integrating the Strapi-powered homepage into `apps/dji-storefront`, the page renders "Homepage Not Configured" despite data existing in the backend.

## Root Causes Identified

### 1. Strapi v5 Populate Syntax Changes
Strapi v5 deprecated the "deep populate" plugins and changed the native populate behavior.
- **v4 Behavior**: Plugins allowed `populate=deep` to automatically fetch nested relations.
- **v5 Behavior**: 
  - `populate=*` only fetches 1st-level relations.
  - Nested relations require explicit object syntax: `populate: { relation: { populate: '*' } }`.
  - The client-side `qs` library stringifies this into complex bracket notation: `populate[relation][populate]=*`.

### 2. Client-Side Query Construction
The `dji-storefront` application uses a Strapi client that constructs queries differently than `apps/web`.
- **Attempt 1 (`populate: 'deep'`)**: Failed with `400 ValidationError` (Strapi v5 doesn't recognize 'deep').
- **Attempt 2 (Nested Object)**: Failed with `Invalid key [object Object]` because the client might be stringifying the object incorrectly or Strapi validation is rejecting the specific structure.
- **Attempt 3 (Bracket Notation)**: `populate[primaryHero][populate]=*`. This is the correct *raw* query param, but passing it as a key in the `query` object might be resulting in double-encoding or malformed keys.

### 3. Response Structure Mismatch
Strapi v5 flattened the API response structure.
- **v4**: `response.data.attributes.fieldName`
- **v5**: `response.data.fieldName` (attributes wrapper removed)
- **Single Types**: Return the object directly in `data` (e.g., `{ data: { id: 1, title: "..." } }`).

## Current Status
- **Data**: Exists in Strapi (verified via curl).
- **API**: Returns data when queried directly with `curl 'http://localhost:1337/api/homepage-layout?populate[primaryHero][populate]=*'`.
- **Frontend**: Fails to load data because the client-side query construction isn't producing the exact URL parameter format Strapi v5 expects for nested relations, OR the response parsing logic (`...response.data.attributes`) was incorrect for v5 (which we fixed in the last commit, but the query itself is still the blocker).

## Solution Path
1. **Correct Query Syntax**: Use the standard Strapi v5 object syntax for populate, but ensure the HTTP client (`fetchFromStrapi`) handles the object serialization correctly using `qs` (or equivalent).
2. **Verify Response Parsing**: Ensure `homepage.ts` correctly handles the v5 flattened structure (already partially addressed).
3. **Alternative**: Use a plugin like `strapi-plugin-populate-deep` (v5 compatible fork) if manual query construction proves too brittle.

## References
- [Strapi v5 Populate Documentation](https://docs.strapi.io/dev-docs/api/rest/populate-select)
- [Migration Guide: Response Format](https://docs.strapi.io/dev-docs/migration/v4-to-v5/breaking-changes/response-format)
