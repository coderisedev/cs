import { Heading } from "@/components/ui"
import { listProducts } from "@lib/data/products"
import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      // TODO: The fields parameter causes issues with the Medusa backend
      // fields: "*variants.calculated_price",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="mb-8 flex items-center justify-between">
        <Heading as="h3" size="md">
          {collection.title}
        </Heading>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-24 small:grid-cols-3 small:gap-y-36">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
