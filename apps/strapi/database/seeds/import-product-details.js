/**
 * Product Detail Seed Import Script
 *
 * Usage:
 *   1. Start Strapi: pnpm --filter strapi develop
 *   2. Create an API token in Strapi Admin > Settings > API Tokens
 *   3. Run: STRAPI_URL=http://localhost:1337 STRAPI_TOKEN=your-token node import-product-details.js
 *
 * Or for Docker deployment:
 *   STRAPI_URL=http://localhost:1338 STRAPI_TOKEN=your-token node import-product-details.js
 */

const fs = require('fs');
const path = require('path');

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('Error: STRAPI_TOKEN environment variable is required');
  console.error('Create an API token in Strapi Admin > Settings > API Tokens');
  process.exit(1);
}

async function importProductDetails() {
  const seedFile = path.join(__dirname, 'product-detail-seeds.json');
  const seedData = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

  console.log(`Importing ${seedData.data.length} product details...`);

  for (const product of seedData.data) {
    try {
      // Check if product already exists
      const searchResponse = await fetch(
        `${STRAPI_URL}/api/product-details?filters[handle][$eq]=${product.handle}`,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
        }
      );

      const searchResult = await searchResponse.json();

      if (searchResult.data && searchResult.data.length > 0) {
        console.log(`  - ${product.handle}: Already exists, skipping`);
        continue;
      }

      // Create new product detail
      const response = await fetch(`${STRAPI_URL}/api/product-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${STRAPI_TOKEN}`,
        },
        body: JSON.stringify({ data: product }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`  - ${product.handle}: Failed`, error.error?.message || error);
        continue;
      }

      const result = await response.json();
      console.log(`  - ${product.handle}: Created (ID: ${result.data.id})`);

      // Publish the product
      const publishResponse = await fetch(
        `${STRAPI_URL}/api/product-details/${result.data.documentId}/actions/publish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
        }
      );

      if (publishResponse.ok) {
        console.log(`  - ${product.handle}: Published`);
      }
    } catch (error) {
      console.error(`  - ${product.handle}: Error`, error.message);
    }
  }

  console.log('\nImport complete!');
}

importProductDetails().catch(console.error);
