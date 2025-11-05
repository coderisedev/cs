import { HttpTypes } from "@medusajs/types"
import { Text } from "@/components/ui"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      tone="subtle"
      className="inline-block w-full overflow-hidden text-ellipsis text-sm"
    >
      Variant: {variant?.title}
    </Text>
  )
}

export default LineItemOptions
