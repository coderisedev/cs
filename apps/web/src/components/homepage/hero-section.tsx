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
            className="relative w-full min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden"
            style={{
                backgroundColor: product.backgroundColor,
                color: product.textColor,
            }}
        >
            {/* Background Image/Video */}
            {imageUrl && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={imageUrl}
                        alt={product.heroImage?.alternativeText || product.title}
                        fill
                        className="object-cover"
                        priority={priority}
                        quality={90}
                    />
                </div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 py-16 text-center">
                {/* Product Name (Small Text) */}
                {product.productName && (
                    <p className="text-lg md:text-xl font-semibold mb-2 opacity-90">
                        {product.productName}
                    </p>
                )}

                {/* Main Title */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                    {product.title}
                </h1>

                {/* Subtitle */}
                {product.subtitle && (
                    <p className="text-xl md:text-3xl lg:text-4xl font-medium mb-6 opacity-95">
                        {product.subtitle}
                    </p>
                )}

                {/* Description */}
                {product.description && (
                    <p className="text-base md:text-lg lg:text-xl mb-8 max-w-3xl mx-auto opacity-90">
                        {product.description}
                    </p>
                )}

                {/* CTA Buttons */}
                {product.ctaButtons && product.ctaButtons.length > 0 && (
                    <div className="flex flex-wrap gap-4 justify-center items-center">
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
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

            {/* Gradient Overlay for Better Text Readability */}
            {imageUrl && (
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: `linear-gradient(to bottom, ${product.backgroundColor}00 0%, ${product.backgroundColor}40 100%)`,
                    }}
                />
            )}
        </section>
    );
}
