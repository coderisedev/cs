import Image from 'next/image';
import { FeaturedProduct } from '@/lib/strapi/homepage';
import { resolveStrapiMedia } from '@/lib/strapi/client';
import { CTAButton } from './cta-button';

interface ProductTileProps {
    product: FeaturedProduct;
    countryCode: string;
}

export function ProductTile({ product, countryCode }: ProductTileProps) {
    const imageUrl = product.heroImage?.url
        ? resolveStrapiMedia(product.heroImage.url)
        : null;

    // Force light background for all cards
    // Use product's background if it's explicitly white, otherwise default to #F5F5F7
    const backgroundColor =
        product.backgroundColor?.toLowerCase() === '#ffffff' ||
            product.backgroundColor?.toLowerCase() === '#fff'
            ? '#ffffff'
            : '#F5F5F7';

    const textColor = '#1D1D1F';

    return (
        <div
            className="relative w-full h-[280px] sm:h-[350px] md:h-[500px] overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-card border-b border-black/5 sm:border sm:rounded-none"
            style={{
                backgroundColor: backgroundColor,
                color: textColor,
            }}
        >
            {/* Background Image */}
            {imageUrl && (
                <div className="absolute inset-0 z-0 h-full">
                    <Image
                        src={imageUrl}
                        alt={product.heroImage?.alternativeText || product.title}
                        fill
                        className="object-cover object-center transition-transform duration-500"
                        quality={80}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col p-4 sm:p-6 md:p-8 justify-start pt-6 sm:pt-8 md:pt-10 items-center text-center">
                {/* Title */}
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                    {product.title}
                </h3>

                {/* Subtitle */}
                {product.subtitle && (
                    <p className="text-xs sm:text-base md:text-lg font-medium mb-2 sm:mb-4 opacity-95 line-clamp-2">
                        {product.subtitle}
                    </p>
                )}

                {product.ctaButtons && product.ctaButtons.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                        {product.ctaButtons.slice(0, 2).map((cta, index) => (
                            <CTAButton
                                key={index}
                                label={cta.label}
                                url={cta.url}
                                style={index === 0 ? 'primary' : 'secondary'}
                                openInNewTab={cta.openInNewTab}
                                countryCode={countryCode}
                                className="text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1.5 sm:py-2"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProductGridProps {
    products: FeaturedProduct[];
    columns?: 'cols_2' | 'cols_3' | 'cols_4';
    layout?: 'grid' | 'masonry' | 'carousel';
    countryCode: string;
}

export function ProductGrid({
    products,
    columns = 'cols_2',
    layout = 'grid',
    countryCode,
}: ProductGridProps) {
    const gridColsClass = {
        'cols_2': 'md:grid-cols-2',
        'cols_3': 'md:grid-cols-3',
        'cols_4': 'md:grid-cols-4',
    };

    if (layout === 'carousel') {
        return (
            <div className="overflow-x-auto pb-8">
                <div className="flex gap-4 px-4 container mx-auto">
                    {products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-[90vw] md:w-[45vw] lg:w-[30vw]">
                            <ProductTile product={product} countryCode={countryCode} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full sm:px-4 py-0 sm:py-4">
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridColsClass[columns]} gap-0 sm:gap-3 md:gap-4`}>
                {products.map((product) => (
                    <ProductTile key={product.id} product={product} countryCode={countryCode} />
                ))}
            </div>
        </div>
    );
}
