"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Minus, Plus, Trash2 } from "lucide-react"
import { updateLineItem } from "@lib/data/cart"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import ErrorMessage from "@modules/checkout/components/error-message"

type DjiCartItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}

export default function DjiCartItem({ item, currencyCode }: DjiCartItemProps) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    if (quantity < 1) return
    
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

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <div className="bg-background-secondary border-0 shadow-sm rounded-md p-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className="w-full sm:w-24 h-24 bg-background-elevated rounded-md overflow-hidden flex-shrink-0"
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className="w-full h-full object-cover"
          />
        </LocalizedClientLink>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <LocalizedClientLink href={`/products/${item.product_handle}`}>
            <h3 className="text-lg font-semibold text-foreground-primary mb-1 line-clamp-2 hover:text-primary-500 transition-colors duration-300">
              {item.product_title}
            </h3>
          </LocalizedClientLink>
          
          <div className="text-foreground-muted text-sm mb-3">
            <LineItemOptions variant={item.variant} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Quantity Controls */}
              <div className="flex items-center border border-border-primary rounded-md transition-colors duration-300">
                <button
                  onClick={() => changeQuantity(item.quantity - 1)}
                  className="p-1.5 hover:bg-background-elevated transition-colors touch-target disabled:opacity-50"
                  disabled={item.quantity <= 1 || updating}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4 text-foreground-primary" />
                </button>
                <span className="px-3 py-1 text-foreground-primary font-medium min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => changeQuantity(item.quantity + 1)}
                  className="p-1.5 hover:bg-background-elevated transition-colors touch-target disabled:opacity-50"
                  disabled={item.quantity >= maxQuantity || updating}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4 text-foreground-primary" />
                </button>
              </div>

              {/* Remove Button */}
              <DeleteButton 
                id={item.id}
                className="p-2 text-foreground-muted hover:text-error transition-colors duration-300 touch-target"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove item</span>
              </DeleteButton>
            </div>

            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-bold text-primary-400">
                <LineItemPrice
                  item={item}
                  style="tight"
                  currencyCode={currencyCode}
                />
              </div>
              {item.quantity > 1 && (
                <div className="text-sm text-foreground-muted">
                  <LineItemUnitPrice
                    item={item}
                    style="tight"
                    currencyCode={currencyCode}
                  />
                  <span className="ml-1">each</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-2">
              <ErrorMessage error={error} />
            </div>
          )}

          {updating && (
            <div className="mt-2 flex items-center text-sm text-foreground-muted">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500 mr-2"></div>
              Updating...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
