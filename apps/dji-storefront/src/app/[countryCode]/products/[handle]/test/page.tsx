import { notFound } from "next/navigation"
import { getProductDetail } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { getProductDetailContent } from "@/lib/strapi/product-detail"
import { getReviewsByProduct } from "@/lib/data/reviews"
import { ProductDetailClient } from "@/components/products/product-detail-client"

export const dynamic = "force-dynamic"

export default async function ProductTestPage({ params }: { params: Promise<{ handle: string; countryCode: string }> }) {
  const { handle, countryCode: paramCountryCode } = await params
  const countryCode = paramCountryCode || DEFAULT_COUNTRY_CODE

  try {
    const [product, strapiContent] = await Promise.all([
      getProductDetail(handle, countryCode),
      getProductDetailContent(handle),
    ])

    if (!product) {
      notFound()
    }

    const reviews = getReviewsByProduct(product.id)

    // Test rendering the actual ProductDetailClient
    return (
      <ProductDetailClient
        product={product}
        strapiContent={strapiContent}
        reviews={reviews}
        countryCode={countryCode}
      />
    )
  } catch (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error in ProductDetailClient</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
          {error instanceof Error ? `${error.message}\n\n${error.stack}` : String(error)}
        </pre>
      </div>
    )
  }
}
