/**
 * Import script for featured products sample data
 * Run with: npm run seed:homepage
 *
 * Environment variables:
 * - STRAPI_URL: Base URL of Strapi server (default: http://localhost:1337)
 */

const fs = require('fs');
const path = require('path');

// Use environment variable for Strapi URL with localhost fallback
const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

async function importData() {
    const sampleData = require('./sample-data');

    try {
        console.log('🚀 Starting data import...');
        console.log(`📡 Using Strapi URL: ${STRAPI_URL}\n`);

        // Import Featured Products
        console.log('📦 Importing featured products...');
        const createdProducts = {};

        for (const product of sampleData.featuredProducts) {
            console.log(`  - Creating: ${product.title} (${product.displaySize})`);

            const response = await fetch(`${STRAPI_URL}/api/featured-products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: product }),
            });

            if (response.ok) {
                const result = await response.json();
                createdProducts[product.slug] = result.data.id;
                console.log(`  ✅ Created with ID: ${result.data.id}`);
            } else {
                const error = await response.json();
                console.error(`  ❌ Failed to create ${product.title}:`, error);
            }
        }

        // Import Homepage Layout
        console.log('\n🏠 Configuring homepage layout...');
        const layout = sampleData.homepageLayout;

        const homepageLayoutData = {
            gridColumns: layout.gridColumns,
            gridLayout: layout.gridLayout,
            isActive: layout.isActive,
            primaryHero: createdProducts[layout.primaryHeroSlug],
            secondaryHero: createdProducts[layout.secondaryHeroSlug],
            productGrid: layout.productGridSlugs.map(slug => createdProducts[slug]),
        };

        const layoutResponse = await fetch(`${STRAPI_URL}/api/homepage-layout`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: homepageLayoutData }),
        });

        if (layoutResponse.ok) {
            console.log('  ✅ Homepage layout configured successfully');
        } else {
            const error = await layoutResponse.json();
            console.error('  ❌ Failed to configure homepage layout:', error);
        }

        console.log('\n✨ Data import completed!');
        console.log('\n📊 Summary:');
        console.log(`  - Featured Products: ${Object.keys(createdProducts).length}`);
        console.log(`  - Homepage Layout: Configured`);
        console.log(`\n🌐 View your homepage at: ${STRAPI_URL}/api/homepage-layout?populate=deep`);

    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

// Check if running directly
if (require.main === module) {
    importData();
}

module.exports = { importData };
