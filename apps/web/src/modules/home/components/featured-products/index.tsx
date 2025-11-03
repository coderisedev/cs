import { HttpTypes } from "@medusajs/types"
import { listProducts } from "@lib/data/products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "lucide-react"
import ProductCard from "@modules/products/components/product-card"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  // Try to get products from the first collection, otherwise get all products
  const firstCollection = collections[0]
  
  const queryParams: any = {
    limit: 8,
  }
  
  if (firstCollection?.id) {
    queryParams.collection_id = firstCollection.id
  }

  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams,
  })

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="mobile-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Featured Products
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Best-selling cockpit hardware
          </p>
        </div>
        <LocalizedClientLink href="/store">
          <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all touch-target flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base font-medium">
            View All
            <ArrowRight className="h-4 w-4" />
          </button>
        </LocalizedClientLink>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} region={region} />
        ))}
      </div>
    </div>
  )
}
