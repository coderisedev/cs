"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/number"
import { updateLineItemAction, deleteLineItemAction, applyPromoCodeAction, removePromoCodeAction } from "@/lib/actions/cart"
import { Trash2, Minus, Plus, Loader2, ShoppingBag, ChevronDown, ChevronUp, X, Tag } from "lucide-react"
import { HttpTypes } from "@medusajs/types"

type CartClientProps = {
  cart: HttpTypes.StoreCart | null
  countryCode: string
}

export function CartClient({ cart, countryCode }: CartClientProps) {
  const [isPending, startTransition] = useTransition()
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null)
  const [promoExpanded, setPromoExpanded] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [removingPromoCode, setRemovingPromoCode] = useState<string | null>(null)

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

  const handleApplyPromoCode = async () => {
    const trimmedCode = promoCode.trim()
    if (!trimmedCode) return

    setPromoError(null)
    setIsApplyingPromo(true)
    try {
      const result = await applyPromoCodeAction(trimmedCode)
      if (result.success) {
        setPromoCode("")
        setPromoExpanded(false)
      } else {
        setPromoError(result.error || "Invalid promo code")
      }
    } catch {
      setPromoError("Failed to apply promo code")
    } finally {
      setIsApplyingPromo(false)
    }
  }

  const handleRemovePromoCode = async (code: string) => {
    setRemovingPromoCode(code)
    try {
      await removePromoCodeAction(code)
    } catch {
      console.error("Failed to remove promo code")
    } finally {
      setRemovingPromoCode(null)
    }
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
  const discountTotal = cart.discount_total || 0
  const total = itemSubtotal + shippingTotal + taxTotal - discountTotal
  const itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  // Check if prices are tax inclusive
  const isTaxInclusive = cart.items?.some(item => item.is_tax_inclusive) ?? false
  // Get applied promotions (codes)
  const appliedPromotions = (cart as { promotions?: Array<{ code?: string; id: string }> }).promotions || []

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
                            {formatPrice((item.unit_price || 0) * (item.quantity || 1), cart)}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {formatPrice(item.unit_price || 0, cart)} each
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
                  <span className="font-medium">{formatPrice(itemSubtotal, cart)}</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(discountTotal, cart)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Shipping</span>
                  <span className="font-medium">
                    {shippingTotal > 0 ? formatPrice(shippingTotal, cart) : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Tax</span>
                  <span className="font-medium">
                    {taxTotal > 0
                      ? formatPrice(taxTotal, cart)
                      : isTaxInclusive
                        ? "Included"
                        : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="py-2">
                {/* Applied Promotions */}
                {appliedPromotions.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {appliedPromotions.map((promo) => (
                      <div
                        key={promo.id}
                        className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-base"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            {promo.code || "Promotion applied"}
                          </span>
                        </div>
                        <button
                          onClick={() => promo.code && handleRemovePromoCode(promo.code)}
                          disabled={removingPromoCode === promo.code || !promo.code}
                          className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          aria-label="Remove promo code"
                        >
                          {removingPromoCode === promo.code ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collapsible Promo Code Input */}
                <button
                  onClick={() => setPromoExpanded(!promoExpanded)}
                  className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 transition-colors"
                >
                  {promoExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  Have a promo code?
                </button>

                {promoExpanded && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value)
                          setPromoError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleApplyPromoCode()
                          }
                        }}
                        disabled={isApplyingPromo}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyPromoCode}
                        disabled={isApplyingPromo || !promoCode.trim()}
                        className="rounded-base"
                      >
                        {isApplyingPromo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    {promoError && (
                      <p className="text-sm text-red-600">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border-primary">
                <span className="text-lg font-semibold text-foreground-primary">Total</span>
                <span className="text-2xl font-bold text-foreground-primary">
                  {formatPrice(total, cart)}
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
