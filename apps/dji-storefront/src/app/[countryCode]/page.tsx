import { Metadata } from 'next';
import { getHomepageLayout } from '@/lib/strapi/homepage';
import { HeroSection } from '@/components/homepage/hero-section';
import { SecondaryHero } from '@/components/homepage/secondary-hero';
import { ProductGrid } from '@/components/homepage/product-grid';
import { ServicesCarousel } from '@/components/homepage/services-carousel';
import { TestimonialsCarousel } from "@/components/homepage/testimonials-carousel";
import { ResellerRecruitment } from "@/components/homepage/reseller-recruitment";
import { LatestAnnouncements } from "@/components/homepage/latest-announcements";

export const metadata: Metadata = {
    title: 'Featured Products - DJI Storefront',
    description: 'Discover our featured DJI products',
};

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Homepage() {
    const layout = await getHomepageLayout();

    if (!layout || !layout.isActive) {
        return (
            <>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold mb-4">Homepage Not Configured</h1>
                    <p className="text-gray-600 mb-12">
                        Please configure your homepage layout in Strapi CMS.
                    </p>
                    <LatestAnnouncements />
                    <ResellerRecruitment />
                    <TestimonialsCarousel />
                    <ServicesCarousel />
                </div>
            </>
        );
    }

    return (
        <main className="min-h-screen">
            {/* Primary Hero Section */}
            {layout.primaryHero && (
                <HeroSection product={layout.primaryHero} priority={true} />
            )}

            {/* Secondary Hero Section */}
            {layout.secondaryHero && (
                <SecondaryHero product={layout.secondaryHero} />
            )}

            {/* Product Grid */}
            {layout.productGrid && layout.productGrid.length > 0 && (
                <ProductGrid
                    products={layout.productGrid}
                    columns={layout.gridColumns}
                    layout={layout.gridLayout}
                />
            )}

            {/* Latest Announcements */}
            <LatestAnnouncements />

            {/* Reseller Recruitment */}
            <ResellerRecruitment />

            {/* Testimonials Carousel */}
            <TestimonialsCarousel />

            {/* Services Carousel */}
            <ServicesCarousel />
        </main>
    );
}
