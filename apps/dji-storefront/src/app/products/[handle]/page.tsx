import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProductDetail } from "@/lib/data/products"
import { getReviewsByProduct } from "@/lib/data/reviews"
import { ProductDetailClient } from "@/components/products/product-detail-client"

export async function generateStaticParams() {
  // Prefetch a few handles for static generation; remaining are handled via fallback
  const handles = ["a320-cdu", "737-mcp", "737-efis", "a320-fcu"]
  return handles.map((handle) => ({ handle }))
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const product = await getProductDetail(params.handle)
  if (!product) {
    return { title: "Product · DJI Storefront" }
  }
  return {
    title: `${product.title} · DJI Storefront`,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }: { params: { handle: string } }) {
  const product = await getProductDetail(params.handle)
  if (!product) {
    notFound()
  }

  const reviews = getReviewsByProduct(product.id)

  return <ProductDetailClient product={product} reviews={reviews} />
}
