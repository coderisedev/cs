"use client"

import { TableCell, TableRow, Text, cn } from "@/components/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <TableRow className="w-full" data-testid="product-row">
      <TableCell className="pl-0 pr-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={cn("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </TableCell>

      <TableCell className="text-left align-top">
        <Text className="text-base font-semibold" data-testid="product-title">
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </TableCell>

      {type === "full" && (
        <TableCell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) => changeQuantity(parseInt(value.target.value))}
              className="w-14 h-10 p-4"
              data-testid="product-select-button"
            >
              {/* TODO: Update this with the v2 way of managing inventory */}
              {Array.from(
                {
                  length: Math.min(maxQuantity, 10),
                },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}

              <option value={1} key={1}>
                1
              </option>
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </TableCell>
      )}

      {type === "full" && (
        <TableCell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </TableCell>
      )}

      <TableCell className="pr-0">
        <span
          className={cn({
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-2 text-sm text-foreground-muted">
              <span>{item.quantity}x</span>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
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
