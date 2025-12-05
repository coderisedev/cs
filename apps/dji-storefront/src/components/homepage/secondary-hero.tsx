import Image from 'next/image';
import { FeaturedProduct } from '@/lib/strapi/homepage';
import { resolveStrapiMedia } from '@/lib/strapi/client';
import { CTAButton } from './cta-button';

// Rainbow colors for music elements
const rainbowColors = {
    red: '#FF6B6B',
    orange: '#FFA94D',
    yellow: '#FFD93D',
    green: '#6BCB77',
    cyan: '#4ECDC4',
    blue: '#45B7D1',
    purple: '#9B59B6',
};

// Music Note SVG Component with color prop
const MusicNote = ({ className, color }: { className?: string; color?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill={color || 'currentColor'}>
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
);

// Double Music Note SVG Component with color prop
const MusicNoteDouble = ({ className, color }: { className?: string; color?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill={color || 'currentColor'}>
        <path d="M21 3v12.5c0 1.93-1.57 3.5-3.5 3.5S14 17.43 14 15.5s1.57-3.5 3.5-3.5c.54 0 1.05.12 1.5.34V5h-6v10.5c0 1.93-1.57 3.5-3.5 3.5S6 17.43 6 15.5 7.57 12 9.5 12c.54 0 1.05.12 1.5.34V3h10z" />
    </svg>
);

// Vinyl Record SVG Component with gradient
const VinylRecord = ({ className, color }: { className?: string; color?: string }) => (
    <svg className={className} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill={color || 'currentColor'} fillOpacity="0.4" />
        <circle cx="12" cy="12" r="7" fill={color || 'currentColor'} fillOpacity="0.6" />
        <circle cx="12" cy="12" r="3" fill={color || 'currentColor'} />
    </svg>
);

// Sound Wave Bars Component with rainbow colors
const SoundWave = ({ className }: { className?: string }) => (
    <div className={`flex items-end gap-0.5 ${className}`}>
        <div className="w-1 rounded-full music-wave-1" style={{ height: '12px', backgroundColor: rainbowColors.red }} />
        <div className="w-1 rounded-full music-wave-2" style={{ height: '20px', backgroundColor: rainbowColors.orange }} />
        <div className="w-1 rounded-full music-wave-3" style={{ height: '16px', backgroundColor: rainbowColors.yellow }} />
        <div className="w-1 rounded-full music-wave-4" style={{ height: '24px', backgroundColor: rainbowColors.green }} />
        <div className="w-1 rounded-full music-wave-5" style={{ height: '14px', backgroundColor: rainbowColors.cyan }} />
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

            {/* Floating Music Elements - Left Side (Rainbow Colors) */}
            <div className="absolute left-4 md:left-8 lg:left-16 top-1/4 z-[2] opacity-80">
                <MusicNote className="w-6 h-6 md:w-8 md:h-8 music-float-1" color={rainbowColors.red} />
            </div>
            <div className="absolute left-8 md:left-16 lg:left-24 top-1/2 z-[2] opacity-70">
                <MusicNoteDouble className="w-8 h-8 md:w-10 md:h-10 music-float-2" color={rainbowColors.orange} />
            </div>
            <div className="absolute left-4 md:left-12 lg:left-20 bottom-1/4 z-[2] opacity-75">
                <VinylRecord className="w-10 h-10 md:w-14 md:h-14 music-spin" color={rainbowColors.purple} />
            </div>
            <div className="absolute left-12 md:left-24 lg:left-40 top-1/3 z-[2] opacity-65">
                <MusicNote className="w-5 h-5 md:w-6 md:h-6 music-float-3" color={rainbowColors.yellow} />
            </div>

            {/* Floating Music Elements - Right Side (Rainbow Colors) */}
            <div className="absolute right-4 md:right-8 lg:right-16 top-1/3 z-[2] opacity-75">
                <MusicNoteDouble className="w-7 h-7 md:w-9 md:h-9 music-float-3" color={rainbowColors.cyan} />
            </div>
            <div className="absolute right-8 md:right-16 lg:right-24 top-2/3 z-[2] opacity-70">
                <MusicNote className="w-5 h-5 md:w-7 md:h-7 music-float-1" color={rainbowColors.green} />
            </div>
            <div className="absolute right-4 md:right-12 lg:right-20 bottom-1/4 z-[2] opacity-80">
                <VinylRecord className="w-8 h-8 md:w-12 md:h-12 music-spin-slow" color={rainbowColors.blue} />
            </div>
            <div className="absolute right-12 md:right-24 lg:right-40 top-1/5 z-[2] opacity-65">
                <MusicNote className="w-4 h-4 md:w-5 md:h-5 music-float-2" color={rainbowColors.red} />
            </div>

            {/* Sound Wave Decorations (Already Rainbow) */}
            <div className="absolute left-6 md:left-20 lg:left-32 bottom-12 z-[2] opacity-70">
                <SoundWave />
            </div>
            <div className="absolute right-6 md:right-20 lg:right-32 bottom-12 z-[2] opacity-70">
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
