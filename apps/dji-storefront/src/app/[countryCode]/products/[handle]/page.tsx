import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductDetail } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { getReviewsByProduct } from "@/lib/data/reviews"
import { getProductDetailContent } from "@/lib/strapi/product-detail"
import { ProductDetailClient } from "@/components/products/product-detail-client"

export async function generateStaticParams() {
  // Prefetch a few handles for static generation; remaining are handled via fallback
  const handles = ["a320-cdu", "737-mcp", "737-efis", "a320-fcu", "cs-320a-mcdu"]
  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params

  // Fetch product and Strapi content in parallel for metadata
  const [product, strapiContent] = await Promise.all([
    getProductDetail(handle, DEFAULT_COUNTRY_CODE),
    getProductDetailContent(handle),
  ])

  if (!product) {
    return { title: "Product · Cockpit Simulator" }
  }

  // Prefer Strapi SEO data if available
  const title = strapiContent?.seo?.metaTitle ?? `${product.title} · Cockpit Simulator`
  const description = strapiContent?.seo?.metaDescription ?? product.description

  return {
    title,
    description,
    openGraph: strapiContent?.seo?.ogImageUrl
      ? { images: [{ url: strapiContent.seo.ogImageUrl }] }
      : undefined,
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const countryCode = DEFAULT_COUNTRY_CODE

  // Fetch Medusa product and Strapi content in parallel
  const [product, strapiContent] = await Promise.all([
    getProductDetail(handle, countryCode),
    getProductDetailContent(handle),
  ])

  if (!product) {
    notFound()
  }

  const reviews = getReviewsByProduct(product.id)

  return (
    <ProductDetailClient
      product={product}
      strapiContent={strapiContent}
      reviews={reviews}
      countryCode={countryCode}
    />
  )
}

// Enable ISR with 15-minute revalidation for marketing content
export const revalidate = 900
