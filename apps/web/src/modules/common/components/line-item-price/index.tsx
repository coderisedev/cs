import { getPercentageDiff } from "@lib/util/get-percentage-diff"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { cn } from "@/components/ui"

type LineItemPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemPriceProps) => {
  const { total, original_total } = item
  const originalPrice = original_total
  const currentPrice = total
  const hasReducedPrice = currentPrice < originalPrice

  return (
    <div className="flex flex-col items-end text-sm text-foreground-muted">
      <div className="text-right space-y-1">
        {hasReducedPrice && (
          <>
            <p>
              {style === "default" && (
                <span className="text-foreground-muted">Original: </span>
              )}
              <span
                className="line-through"
                data-testid="product-original-price"
              >
                {convertToLocale({
                  amount: originalPrice,
                  currency_code: currencyCode,
                })}
              </span>
            </p>
            {style === "default" && (
              <span className="text-foreground-interactive font-medium">
                -{getPercentageDiff(originalPrice, currentPrice || 0)}%
              </span>
            )}
          </>
        )}
        <span
          className={cn(
            "text-base font-semibold text-foreground-base",
            hasReducedPrice && "text-foreground-interactive"
          )}
          data-testid="product-price"
        >
          {convertToLocale({
            amount: currentPrice,
            currency_code: currencyCode,
          })}
        </span>
      </div>
    </div>
  )
}

export default LineItemPrice
