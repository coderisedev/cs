/**
 * Import script for featured products sample data
 * Run with: npm run seed:homepage
 */

const fs = require('fs');
const path = require('path');

async function importData() {
    const sampleData = require('./sample-data');

    try {
        console.log('🚀 Starting data import...\n');

        // Import Featured Products
        console.log('📦 Importing featured products...');
        const createdProducts = {};

        for (const product of sampleData.featuredProducts) {
            console.log(`  - Creating: ${product.title} (${product.displaySize})`);

            const response = await fetch('http://localhost:1337/api/featured-products', {
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

        const layoutResponse = await fetch('http://localhost:1337/api/homepage-layout', {
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
        console.log('\n🌐 View your homepage at: http://localhost:1337/api/homepage-layout?populate=deep');

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
