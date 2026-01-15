import 'server-only';

import { getStrapiClient } from './client';

interface CTAButton {
    label: string;
    url: string;
    style: 'primary' | 'secondary' | 'text';
    openInNewTab: boolean;
    icon?: string;
}

interface ProductHighlight {
    title: string;
    description: string;
    icon?: {
        url: string;
    };
}

interface SEO {
    meta_title: string;
    meta_description: string;
    canonical_url: string;
    og_image?: {
        url: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    schema_json?: any;
}

export interface FeaturedProduct {
    id: number;
    title: string;
    subtitle?: string;
    description?: string;
    productName: string;
    heroImage?: {
        url: string;
        alternativeText?: string;
    };
    heroVideo?: {
        url: string;
    };
    mobileImage?: {
        url: string;
    };
    theme: 'light' | 'dark';
    backgroundColor: string;
    textColor: string;
    ctaButtons: CTAButton[];
    highlights?: ProductHighlight[];
    displaySize: 'hero' | 'secondary' | 'tile';
    slug: string;
    priority: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    abTestVariant?: string;
    seo?: SEO;
}

export interface HomepageLayout {
    id: number;
    primaryHero?: FeaturedProduct;
    secondaryHero?: FeaturedProduct;
    productGrid: FeaturedProduct[];
    gridColumns: 'cols_2' | 'cols_3' | 'cols_4';
    gridLayout: 'grid' | 'masonry' | 'carousel';
    isActive: boolean;
    effectiveDate?: string;
    expiryDate?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
}

/**
 * Fetch homepage layout with all populated data
 */
export async function getHomepageLayout(): Promise<HomepageLayout | null> {
    const strapi = getStrapiClient();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await strapi.fetch<{ data: any }>('/api/homepage-layout', {
            query: {
                'populate[primaryHero][populate]': '*',
                'populate[secondaryHero][populate]': '*',
                'populate[productGrid][populate]': '*',
            },
            tags: ['homepage-layout'],
            revalidate: 0, // Disabled caching for testing - set back to 60 for production
            cache: 'no-store',
        });

        if (!response.data) {
            return null;
        }

        const { id, attributes } = response.data;
        
        return {
            id,
            ...attributes,
            primaryHero: mapRelation(attributes.primaryHero),
            secondaryHero: mapRelation(attributes.secondaryHero),
            productGrid: mapRelationList(attributes.productGrid),
        };
    } catch (error) {
        console.error('Failed to fetch homepage layout:', error);
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRelation(relation: any): FeaturedProduct | undefined {
    if (!relation?.data) return undefined;
    return {
        id: relation.data.id,
        ...relation.data.attributes,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRelationList(relation: any): FeaturedProduct[] {
    if (!relation?.data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return relation.data.map((item: any) => ({
        id: item.id,
        ...item.attributes,
    }));
}

/**
 * Fetch a single featured product by slug
 */
export async function getFeaturedProduct(slug: string): Promise<FeaturedProduct | null> {
    const strapi = getStrapiClient();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await strapi.fetch<{ data: any[] }>('/api/featured-products', {
            query: {
                'filters[slug][$eq]': slug,
                populate: '*',
                'pagination[page]': 1,
                'pagination[pageSize]': 1,
            },
            tags: ['featured-product', slug],
            revalidate: 60,
        });

        if (!response.data || response.data.length === 0) {
            return null;
        }

        const product = response.data[0];
        return {
            id: product.id,
            ...product.attributes,
        };
    } catch (error) {
        console.error(`Failed to fetch featured product ${slug}:`, error);
        return null;
    }
}

/**
 * Fetch featured products by display size
 */
export async function getFeaturedProductsBySize(
    displaySize: 'hero' | 'secondary' | 'tile'
): Promise<FeaturedProduct[]> {
    const strapi = getStrapiClient();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await strapi.fetch<{ data: any[] }>('/api/featured-products', {
            query: {
                'filters[displaySize][$eq]': displaySize,
                'filters[isActive][$eq]': true,
                populate: '*',
                sort: 'priority:desc',
            },
            tags: ['featured-products', displaySize],
            revalidate: 60,
        });

        return response.data.map((item) => ({
            id: item.id,
            ...item.attributes,
        }));
    } catch (error) {
        console.error(`Failed to fetch featured products by size ${displaySize}:`, error);
        return [];
    }
}

/**
 * Fetch all active featured products
 */
export async function getAllFeaturedProducts(): Promise<FeaturedProduct[]> {
    const strapi = getStrapiClient();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await strapi.fetch<{ data: any[] }>('/api/featured-products', {
            query: {
                'filters[isActive][$eq]': true,
                populate: '*',
                sort: 'priority:desc',
            },
            tags: ['featured-products'],
            revalidate: 60,
        });

        return response.data.map((item) => ({
            id: item.id,
            ...item.attributes,
        }));
    } catch (error) {
        console.error('Failed to fetch all featured products:', error);
        return [];
    }
}
