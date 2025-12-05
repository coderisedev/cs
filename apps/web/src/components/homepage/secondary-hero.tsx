import Image from 'next/image';
import { FeaturedProduct } from '@/lib/strapi/homepage';
import { resolveStrapiMedia } from '@/lib/strapi/client';
import { CTAButton } from './cta-button';

interface SecondaryHeroProps {
    product: FeaturedProduct;
}

export function SecondaryHero({ product }: SecondaryHeroProps) {
    const imageUrl = product.heroImage?.url
        ? resolveStrapiMedia(product.heroImage.url)
        : null;

    return (
        <section
            className="relative w-full min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden"
            style={{
                backgroundColor: product.backgroundColor,
                color: product.textColor,
            }}
        >
            {/* Background Image */}
            {imageUrl && (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={imageUrl}
                        alt={product.heroImage?.alternativeText || product.title}
                        fill
                        className="object-cover"
                        priority={false}
                        quality={85}
                    />
                </div>
            )}

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 py-12 text-center">
                {/* Product Name */}
                {product.productName && (
                    <p className="text-base md:text-lg font-semibold mb-2 opacity-90">
                        {product.productName}
                    </p>
                )}

                {/* Title */}
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
                    {product.title}
                </h2>

                {/* Subtitle */}
                {product.subtitle && (
                    <p className="text-lg md:text-2xl lg:text-3xl font-medium mb-5 opacity-95">
                        {product.subtitle}
                    </p>
                )}

                {/* Description */}
                {product.description && (
                    <p className="text-sm md:text-base lg:text-lg mb-6 max-w-2xl mx-auto opacity-90">
                        {product.description}
                    </p>
                )}

                {/* CTA Buttons */}
                {product.ctaButtons && product.ctaButtons.length > 0 && (
                    <div className="flex flex-wrap gap-3 justify-center items-center">
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
            </div>

            {/* Gradient Overlay */}
            {imageUrl && (
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: `linear-gradient(to bottom, ${product.backgroundColor}00 0%, ${product.backgroundColor}30 100%)`,
                    }}
                />
            )}
        </section>
    );
}
