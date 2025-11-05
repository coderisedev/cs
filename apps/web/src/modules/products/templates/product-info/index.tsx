import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-sm text-foreground-muted transition-colors hover:text-foreground-base"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading as="h2" size="lg" data-testid="product-title">
          {product.title}
        </Heading>

        <Text tone="subtle" className="whitespace-pre-line" data-testid="product-description">
          {product.description}
        </Text>
      </div>
    </div>
  )
}

export default ProductInfo
