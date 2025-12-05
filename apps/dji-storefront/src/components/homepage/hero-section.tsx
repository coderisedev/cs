import Image from 'next/image';
import { FeaturedProduct } from '@/lib/strapi/homepage';
import { resolveStrapiMedia } from '@/lib/strapi/client';
import { CTAButton } from './cta-button';

interface HeroSectionProps {
    product: FeaturedProduct;
    priority?: boolean;
}

export function HeroSection({ product, priority = true }: HeroSectionProps) {
    const imageUrl = product.heroImage?.url
        ? resolveStrapiMedia(product.heroImage.url)
        : null;

    return (
        <section
            className="relative w-full aspect-video min-h-[500px] max-h-[90vh] flex items-center justify-center overflow-hidden"
            style={{
                backgroundColor: product.backgroundColor,
                color: product.textColor,
            }}
        >
            {/* Background Image/Video with Ken Burns Effect */}
            {imageUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src={imageUrl}
                        alt={product.heroImage?.alternativeText || product.title}
                        fill
                        className="object-cover hero-image-animate"
                        priority={priority}
                        quality={90}
                    />
                </div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 py-16 text-center">
                {/* Product Name (Small Text) */}
                {product.productName && (
                    <p className="text-lg md:text-xl font-semibold mb-2 hero-content-animate">
                        {product.productName}
                    </p>
                )}

                {/* Main Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight hero-title-animate">
                    {product.title}
                </h1>

                {/* Subtitle */}
                {product.subtitle && (
                    <p className="text-xl md:text-3xl lg:text-4xl font-medium mb-6 hero-subtitle-animate">
                        {product.subtitle}
                    </p>
                )}

                {/* Description */}
                {product.description && (
                    <p className="text-base md:text-lg lg:text-xl mb-8 max-w-3xl mx-auto hero-description-animate">
                        {product.description}
                    </p>
                )}

                {/* CTA Buttons */}
                {product.ctaButtons && product.ctaButtons.length > 0 && (
                    <div className="flex flex-wrap gap-4 justify-center items-center hero-cta-animate">
                        {product.ctaButtons.map((cta, index) => (
                            <CTAButton
                                key={index}
                                label={cta.label}
                                url={cta.url}
                                style={cta.style}
                                openInNewTab={cta.openInNewTab}
                            />
                        ))}
                    </div>
                )}

                {/* Product Highlights */}
                {product.highlights && product.highlights.length > 0 && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto hero-highlights-animate">
                        {product.highlights.map((highlight, index) => (
                            <div key={index} className="text-center">
                                {highlight.icon && (
                                    <div className="w-12 h-12 mx-auto mb-3">
                                        <Image
                                            src={resolveStrapiMedia(highlight.icon.url) || ''}
                                            alt={highlight.title}
                                            width={48}
                                            height={48}
                                        />
                                    </div>
                                )}
                                <h3 className="font-semibold text-lg mb-1">{highlight.title}</h3>
                                <p className="text-sm opacity-80">{highlight.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Dark Overlay for Better Text Readability */}
            {imageUrl && (
                <div className="absolute inset-0 z-[1] bg-black/40 hero-overlay-animate" />
            )}

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hero-scroll-indicator">
                <div className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer">
                    {/* Mouse Icon */}
                    <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-current rounded-full scroll-wheel-animate" />
                    </div>
                    {/* Arrow */}
                    <svg
                        className="w-4 h-4 scroll-arrow-animate"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                </div>
            </div>
        </section>
    );
}
