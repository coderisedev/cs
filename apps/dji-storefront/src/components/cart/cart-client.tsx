"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { currencyFormatter } from "@/lib/number"
import { updateLineItemAction, deleteLineItemAction } from "@/lib/actions/cart"
import { Trash2, Minus, Plus, Loader2, ShoppingBag } from "lucide-react"
import { HttpTypes } from "@medusajs/types"

type CartClientProps = {
  cart: HttpTypes.StoreCart | null
  countryCode: string
}

export function CartClient({ cart, countryCode }: CartClientProps) {
  const [isPending, startTransition] = useTransition()
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null)

  const handleUpdateQuantity = (lineId: string, quantity: number) => {
    if (quantity < 1) return
    setUpdatingLineId(lineId)
    startTransition(async () => {
      try {
        await updateLineItemAction({ lineId, quantity })
      } catch (error) {
        console.error("Failed to update quantity:", error)
      } finally {
        setUpdatingLineId(null)
      }
    })
  }

  const handleRemoveItem = (lineId: string) => {
    setUpdatingLineId(lineId)
    startTransition(async () => {
      try {
        await deleteLineItemAction(lineId)
      } catch (error) {
        console.error("Failed to remove item:", error)
      } finally {
        setUpdatingLineId(null)
      }
    })
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <ShoppingBag className="h-16 w-16 text-foreground-muted" />
            <h2 className="text-2xl font-semibold text-foreground-primary">Your cart is empty</h2>
            <p className="text-foreground-secondary text-center">
              Add some products to get started
            </p>
            <Link href={`/${countryCode}/products`}>
              <Button className="rounded-full">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Use item_subtotal for products only (subtotal includes shipping in Medusa)
  const itemSubtotal = cart.item_subtotal || 0
  const shippingTotal = cart.shipping_total || 0
  const taxTotal = cart.tax_total || 0
  const total = itemSubtotal + shippingTotal + taxTotal
  const itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  // Check if prices are tax inclusive
  const isTaxInclusive = cart.items?.some(item => item.is_tax_inclusive) ?? false

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground-primary">Shopping Cart</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <Link href={`/${countryCode}/products`} className="text-sm text-primary-500 hover:underline">
          Continue shopping →
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        {/* Cart Items */}
        <div className="space-y-4">
          {cart.items.map((item) => {
            const product = item.product
            const variant = item.variant
            const isUpdating = updatingLineId === item.id
            const thumbnail = item.thumbnail || product?.thumbnail

            return (
              <Card key={item.id} className={isUpdating ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="h-24 w-24 rounded-base bg-background-elevated flex items-center justify-center overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={item.title || "Product"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-foreground-muted" />
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-4">
                          <h3 className="font-semibold text-foreground-primary truncate">
                            {item.title}
                          </h3>
                          {variant?.title && variant.title !== "Default" && (
                            <p className="text-sm text-foreground-secondary mt-1">
                              {variant.title}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground-primary">
                            {currencyFormatter((item.unit_price || 0) * (item.quantity || 1))}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {currencyFormatter(item.unit_price || 0)} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={isPending || (item.quantity || 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={isPending}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isPending}
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="ml-2">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <Card className="bg-background-secondary">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold text-foreground-primary">Order Summary</h2>

              <div className="space-y-2 py-4 border-y border-border-primary">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Subtotal</span>
                  <span className="font-medium">{currencyFormatter(itemSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Shipping</span>
                  <span className="font-medium">
                    {shippingTotal > 0 ? currencyFormatter(shippingTotal) : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Tax</span>
                  <span className="font-medium">
                    {taxTotal > 0
                      ? currencyFormatter(taxTotal)
                      : isTaxInclusive
                        ? "Included"
                        : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-foreground-primary">Total</span>
                <span className="text-2xl font-bold text-foreground-primary">
                  {currencyFormatter(total)}
                </span>
              </div>

              <Link href={`/${countryCode}/checkout`} className="block w-full">
                <Button className="w-full rounded-full" size="lg" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>
              </Link>

              <Link href={`/${countryCode}/products`} className="block">
                <Button variant="outline" className="w-full rounded-full" disabled={isPending}>
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
