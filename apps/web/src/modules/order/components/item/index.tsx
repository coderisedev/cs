import { HttpTypes } from "@medusajs/types"
import { TableCell, TableRow, Text } from "@/components/ui"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <TableRow className="w-full" data-testid="product-row">
      <TableCell className="pl-0 pr-4 w-24">
        <div className="flex w-16">
          <Thumbnail thumbnail={item.thumbnail} size="square" />
        </div>
      </TableCell>

      <TableCell className="text-left">
        <Text className="text-base font-semibold" data-testid="product-name">
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </TableCell>

      <TableCell className="pr-0">
        <span className="flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-2 text-sm text-foreground-muted">
            <span>
              <span data-testid="product-quantity">{item.quantity}</span>x{" "}
            </span>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>

          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </TableCell>
    </TableRow>
  )
}

export default Item
