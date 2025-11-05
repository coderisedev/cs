import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/components/ui"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  return (
    <div className="flex flex-col text-foreground-base gap-1">
      <span
        className={cn(
          "text-2xl font-semibold",
          selectedPrice.price_type === "sale" && "text-foreground-interactive"
        )}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {selectedPrice.price_type === "sale" && (
        <>
          <div className="text-sm text-foreground-muted">
            <span className="mr-1">Original:</span>
            <span
              className="line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
          </div>
          <span className="text-foreground-interactive text-sm font-medium">
            -{selectedPrice.percentage_diff}%
          </span>
        </>
      )}
    </div>
  )
}
