import Image from 'next/image';
import { FeaturedProduct } from '@/lib/strapi/homepage';
import { resolveStrapiMedia } from '@/lib/strapi/client';
import { CTAButton } from './cta-button';

// Music Note SVG Component
const MusicNote = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

// Double Music Note SVG Component
const MusicNoteDouble = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3v12.5c0 1.93-1.57 3.5-3.5 3.5S14 17.43 14 15.5s1.57-3.5 3.5-3.5c.54 0 1.05.12 1.5.34V5h-6v10.5c0 1.93-1.57 3.5-3.5 3.5S6 17.43 6 15.5 7.57 12 9.5 12c.54 0 1.05.12 1.5.34V3h10z" />
    </svg>
);

// Vinyl Record SVG Component
const VinylRecord = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fillOpacity="0.3" />
        <circle cx="12" cy="12" r="7" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

// Sound Wave Bars Component
const SoundWave = ({ className }: { className?: string }) => (
    <div className={`flex items-end gap-0.5 ${className}`}>
        <div className="w-1 bg-current rounded-full music-wave-1" style={{ height: '12px' }} />
        <div className="w-1 bg-current rounded-full music-wave-2" style={{ height: '20px' }} />
        <div className="w-1 bg-current rounded-full music-wave-3" style={{ height: '16px' }} />
        <div className="w-1 bg-current rounded-full music-wave-4" style={{ height: '24px' }} />
        <div className="w-1 bg-current rounded-full music-wave-5" style={{ height: '14px' }} />
    </div>
);

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

            {/* Floating Music Elements - Left Side */}
            <div className="absolute left-4 md:left-8 lg:left-16 top-1/4 z-[2] opacity-60">
                <MusicNote className="w-6 h-6 md:w-8 md:h-8 music-float-1" />
            </div>
            <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 z-[2] opacity-40">
                <MusicNoteDouble className="w-8 h-8 md:w-10 md:h-10 music-float-2" />
            </div>
            <div className="absolute left-4 md:left-12 lg:left-20 bottom-1/4 z-[2] opacity-50">
                <VinylRecord className="w-10 h-10 md:w-14 md:h-14 music-spin" />
            </div>

            {/* Floating Music Elements - Right Side */}
            <div className="absolute right-4 md:right-8 lg:right-16 top-1/3 z-[2] opacity-50">
                <MusicNoteDouble className="w-7 h-7 md:w-9 md:h-9 music-float-3" />
            </div>
            <div className="absolute right-8 md:right-16 lg:right-24 top-2/3 z-[2] opacity-40">
                <MusicNote className="w-5 h-5 md:w-7 md:h-7 music-float-1" />
            </div>
            <div className="absolute right-4 md:right-12 lg:right-20 bottom-1/4 z-[2] opacity-60">
                <VinylRecord className="w-8 h-8 md:w-12 md:h-12 music-spin-slow" />
            </div>

            {/* Sound Wave Decorations */}
            <div className="absolute left-6 md:left-20 lg:left-32 bottom-12 z-[2] opacity-50">
                <SoundWave />
            </div>
            <div className="absolute right-6 md:right-20 lg:right-32 bottom-12 z-[2] opacity-50">
                <SoundWave />
            </div>

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
