# Fix Report: New Release Hero Media Regression

## Context
- We upgraded the `new-release` collection type so `hero_media` could accept either uploads or external embeds (YouTube).
- Initial change replaced the scalar `media` field with component `marketing.embed-media`, added demo seeds, and wired the homepage to render images/iframes.
- After schema change, existing Strapi entries lost the `hero_media` value and the Admin UI showed empty fields because the data lived in the old column.

## Problems Observed
1. **Admin regression** – legacy rows had no value for the new component so editors couldn’t see or edit hero media.
2. **Seed failures** – repeated attempts to bootstrap produced errors like `relation "upload_file_morph" does not exist`, `'$null' does not exist`, and TS type errors when accessing newly added fields.
3. **Manual recovery pain** – running the seeds from `strapi console` failed because the modules were referenced via `src/*` (TS) and strict typings rejected the new payload shape.

## Remediation Steps
1. **Component + seed update**
   - Added `marketing.embed-media` component and updated `new-release` schema to use it.
   - Extended seeds to create two demo entries and allowed embed URLs.

2. **Data migration**
   - Introduced `legacy_hero_media` field to temporarily hold the previous media reference.
   - Wrote `migrateLegacyHeroMedia` that populates both `hero_media` and `legacy_hero_media`, then copies old assets into the new component during Strapi bootstrap.
   - Simplified populate syntax to object form, removed unsupported `$null` filters, and avoided direct table access.

3. **Console tooling**
   - Documented how to run seeds manually via `strapi console` by loading `ts-node/register` and requiring `./src/bootstrap/new-release-seeder`.
   - Loosened TypeScript typing (via `as any`) on the migration update to prevent degraded environments from blocking seed execution.

4. **Frontend updates**
   - Updated Next.js `getLatestNewRelease` helper to map embed media vs assets.
   - `NewReleaseHighlight` now renders `<iframe>` when `kind === 'embed'` and continues to use `<Image>` otherwise.

## Outcome
- `hero_media` entries display again in Strapi Admin, and editors can freely choose uploaded images or YouTube embeds.
- Homepage module renders whichever media type is stored and gracefully handles region filtering plus caching.
- Running seeds (either automatically on bootstrap or manually via console) now completes without referencing nonexistent tables.

## Follow-ups
- Once all old data is migrated and verified, consider removing `legacy_hero_media` to keep the schema tidy.
- Add a Strapi webhook to trigger `/api/revalidate?tag=new-release` so content authors can republish without waiting for revalidate timers.
- Monitor future schema changes to ensure similar migrations always ship alongside well-documented manual scripts.
