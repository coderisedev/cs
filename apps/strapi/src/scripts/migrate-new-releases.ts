/**
 * Migration script to add hero_media component to existing New Release records
 *
 * Usage:
 * 1. Start Strapi in develop mode
 * 2. Run: pnpm --filter strapi strapi script scripts/migrate-new-releases.ts
 */

export default async ({ strapi }) => {
  strapi.log.info('Starting migration: Adding hero_media to existing New Release records...');

  try {
    // Fetch all New Release entries
    const entries = await strapi.db.query('api::new-release.new-release').findMany({
      where: {},
      populate: ['hero_media'],
    });

    strapi.log.info(`Found ${entries.length} New Release entries`);

    let updated = 0;
    let skipped = 0;

    for (const entry of entries) {
      // Skip if hero_media already exists
      if (entry.hero_media) {
        strapi.log.debug(`Skipping entry "${entry.title}" - hero_media already exists`);
        skipped++;
        continue;
      }

      // Initialize hero_media with default values
      // You can customize this based on your needs
      const defaultHeroMedia = {
        type: 'image', // or 'video', 'embed'
        asset: null,
        embed_url: null,
        thumbnail: null,
        alt_text: entry.title || '',
      };

      await strapi.db.query('api::new-release.new-release').update({
        where: { id: entry.id },
        data: {
          hero_media: defaultHeroMedia,
        },
      });

      strapi.log.info(`Updated entry "${entry.title}" - added default hero_media`);
      updated++;
    }

    strapi.log.info('=== Migration Complete ===');
    strapi.log.info(`Total entries: ${entries.length}`);
    strapi.log.info(`Updated: ${updated}`);
    strapi.log.info(`Skipped: ${skipped}`);
  } catch (error) {
    strapi.log.error('Migration failed:', error);
    throw error;
  }
};
