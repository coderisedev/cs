import { Metadata } from 'next';
import { getHomepageLayout } from '@/lib/strapi/homepage';
import { HeroSection } from '@/components/homepage/hero-section';
import { SecondaryHero } from '@/components/homepage/secondary-hero';
import { ProductGrid } from '@/components/homepage/product-grid';
import { ServicesCarousel } from '@/components/homepage/services-carousel';
import { TestimonialsCarousel } from "@/components/homepage/testimonials-carousel";
import { ResellerRecruitment } from "@/components/homepage/reseller-recruitment";
import { LatestNews } from "@/components/homepage/latest-news";

export const metadata: Metadata = {
    title: 'Featured Products - CS Storefront',
    description: 'Discover our featured CS products',
};

export const revalidate = 0; // Disable ISR during debugging - set back to 60 for production

type HomepageProps = {
    params: Promise<{ countryCode: string }>
}

export default async function Homepage({ params }: HomepageProps) {
    const { countryCode } = await params
    const layout = await getHomepageLayout();

    if (!layout || !layout.isActive) {
        return (
            <>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold mb-4">Homepage Not Configured</h1>
                    <p className="text-gray-600 mb-12">
                        Please configure your homepage layout in Strapi CMS.
                    </p>
                    <LatestNews countryCode={countryCode} />
                    <TestimonialsCarousel />
                    <ServicesCarousel />
                    <ResellerRecruitment countryCode={countryCode} />
                </div>
            </>
        );
    }

    return (
        <main className="min-h-screen">
            {/* Primary Hero Section */}
            {layout.primaryHero && (
                <HeroSection product={layout.primaryHero} priority={true} countryCode={countryCode} />
            )}

            {/* Secondary Hero Section */}
            {layout.secondaryHero && (
                <SecondaryHero product={layout.secondaryHero} countryCode={countryCode} />
            )}

            {/* Latest Announcements */}
            <LatestNews countryCode={countryCode} />

            {/* Product Grid */}
            {layout.productGrid && layout.productGrid.length > 0 && (
                <ProductGrid
                    products={layout.productGrid}
                    columns={layout.gridColumns}
                    layout={layout.gridLayout}
                    countryCode={countryCode}
                />
            )}

            {/* Testimonials Carousel */}
            <TestimonialsCarousel />

            {/* Services Carousel */}
            <ServicesCarousel />

            {/* Reseller Recruitment */}
            <ResellerRecruitment countryCode={countryCode} />
        </main>
    );
}
