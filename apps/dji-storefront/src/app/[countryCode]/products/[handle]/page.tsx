import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductDetail, type StorefrontProduct } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { getReviewsByProduct } from "@/lib/data/reviews"
import { getProductDetailContent, type ProductDetailContent } from "@/lib/strapi/product-detail"
import { ProductDetailClient } from "@/components/products/product-detail-client"

const BASE_URL = process.env.STOREFRONT_BASE_URL || "https://dev.aidenlux.com"
const DEFAULT_COUNTRY = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export async function generateStaticParams() {
  // Prefetch a few handles for static generation; remaining are handled via fallback
  const handles = ["a320-cdu", "737-mcp", "737-efis", "a320-fcu", "cs-320a-mcdu"]
  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string; countryCode: string }> }): Promise<Metadata> {
  const { handle, countryCode } = await params

  // Fetch product and Strapi content in parallel for metadata
  const [product, strapiContent] = await Promise.all([
    getProductDetail(handle, countryCode || DEFAULT_COUNTRY_CODE),
    getProductDetailContent(handle),
  ])

  if (!product) {
    return { title: "Product · Cockpit Simulator" }
  }

  // Prefer Strapi SEO data if available
  const title = strapiContent?.seo?.metaTitle ?? `${product.title} · Cockpit Simulator`
  const description = strapiContent?.seo?.metaDescription ?? product.description
  const canonicalUrl = `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/products/${handle}`
  const ogImageUrl = strapiContent?.seo?.ogImageUrl ?? product.images[0]

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: "Cockpit Simulator",
      images: ogImageUrl ? [{ url: ogImageUrl, alt: product.title, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}

function generateProductJsonLd(product: StorefrontProduct, strapiContent: ProductDetailContent | null, countryCode: string) {
  const url = `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/products/${product.handle}`

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: strapiContent?.seo?.metaDescription ?? product.description,
    image: strapiContent?.seo?.ogImageUrl ?? product.images[0],
    url,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Cockpit Simulator",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Cockpit Simulator",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  }
}

function generateBreadcrumbJsonLd(product: StorefrontProduct, countryCode: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: `${BASE_URL}/${countryCode || DEFAULT_COUNTRY}/products/${product.handle}`,
      },
    ],
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ handle: string; countryCode: string }> }) {
  const { handle, countryCode: paramCountryCode } = await params
  const countryCode = paramCountryCode || DEFAULT_COUNTRY_CODE

  // Fetch Medusa product and Strapi content in parallel
  const [product, strapiContent] = await Promise.all([
    getProductDetail(handle, countryCode),
    getProductDetailContent(handle),
  ])

  if (!product) {
    notFound()
  }

  const reviews = getReviewsByProduct(product.id)
  const productJsonLd = generateProductJsonLd(product, strapiContent, countryCode)
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(product, countryCode)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        strapiContent={strapiContent}
        reviews={reviews}
        countryCode={countryCode}
      />
    </>
  )
}

// Enable ISR with 15-minute revalidation for marketing content
export const revalidate = 900
