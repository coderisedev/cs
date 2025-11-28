import Image from 'next/image';
import { FeaturedProduct } from '@/lib/strapi/homepage';
import { resolveStrapiMedia } from '@/lib/strapi/client';
import { CTAButton } from './cta-button';

interface ProductTileProps {
    product: FeaturedProduct;
}

export function ProductTile({ product }: ProductTileProps) {
    const imageUrl = product.heroImage?.url
        ? resolveStrapiMedia(product.heroImage.url)
        : null;

    return (
        <div
            className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
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
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        quality={80}
                    />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
                {/* Product Name */}
                {product.productName && (
                    <p className="text-sm md:text-base font-semibold mb-1 opacity-90">
                        {product.productName}
                    </p>
                )}

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
                    {product.title}
                </h3>

                {/* Subtitle */}
                {product.subtitle && (
                    <p className="text-base md:text-lg font-medium mb-4 opacity-95">
                        {product.subtitle}
                    </p>
                )}

                {/* CTA Buttons - Text Style Only */}
                {product.ctaButtons && product.ctaButtons.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {product.ctaButtons.slice(0, 2).map((cta, index) => (
                            <CTAButton
                                key={index}
                                label={cta.label}
                                url={cta.url}
                                style="text"
                                openInNewTab={cta.openInNewTab}
                                className="text-sm md:text-base"
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Gradient Overlay for Better Text Readability */}
            {imageUrl && (
                <div
                    className="absolute inset-0 z-[1]"
                    style={{
                        background: `linear-gradient(to top, ${product.backgroundColor} 0%, ${product.backgroundColor}80 40%, ${product.backgroundColor}00 100%)`,
                    }}
                />
            )}
        </div>
    );
}

interface ProductGridProps {
    products: FeaturedProduct[];
    columns?: 'cols_2' | 'cols_3' | 'cols_4';
    layout?: 'grid' | 'masonry' | 'carousel';
}

export function ProductGrid({
    products,
    columns = 'cols_2',
    layout = 'grid',
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
                            <ProductTile product={product} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className={`grid grid-cols-1 ${gridColsClass[columns]} gap-4`}>
                {products.map((product) => (
                    <ProductTile key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
