import { notFound } from "next/navigation"
import { getProductDetail } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { getProductDetailContent } from "@/lib/strapi/product-detail"

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

    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Product Test Page</h1>
        <div className="space-y-4">
          <div>
            <strong>Product ID:</strong> {product.id}
          </div>
          <div>
            <strong>Title:</strong> {product.title}
          </div>
          <div>
            <strong>Price:</strong> ${product.price}
          </div>
          <div>
            <strong>Images:</strong> {product.images.length}
          </div>
          <div>
            <strong>Variants:</strong> {product.variants.length}
          </div>
          <div>
            <strong>Strapi Content:</strong> {strapiContent ? "Found" : "Not Found"}
          </div>
          <div>
            <strong>First Image:</strong>
            {product.images[0] && (
              <img src={product.images[0]} alt={product.title} className="w-64 h-64 object-cover mt-2" />
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {error instanceof Error ? error.stack : String(error)}
        </pre>
      </div>
    )
  }
}
