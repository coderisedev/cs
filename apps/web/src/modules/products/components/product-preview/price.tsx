import { Text, cn } from "@/components/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-sm text-foreground-muted"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={cn(
          "text-sm text-foreground-base",
          price.price_type === "sale" && "text-foreground-interactive"
        )}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </>
  )
}
