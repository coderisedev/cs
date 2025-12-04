"use client"

import Image from "next/image"
import Link from "next/link"
import { useTransition } from "react"
import { ShoppingCart, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currencyFormatter } from "@/lib/number"
import type { StorefrontProduct } from "@/lib/data/products"
import { addToCartAction } from "@/app/actions/cart"

type ViewMode = "grid" | "list"

import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

export function ProductCard({ product, viewMode = "grid", countryCode }: { product: StorefrontProduct; viewMode?: ViewMode; countryCode: string }) {
  const [isPending, startTransition] = useTransition()
  const resolvedCountryCode = countryCode || DEFAULT_COUNTRY_CODE
  const image = product.images[0]
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const variantId = product.variants[0]?.id
    if (!variantId) return
    startTransition(async () => {
      try {
        // Plan A: Always use US countryCode
        await addToCartAction({ variantId, quantity: 1, countryCode: resolvedCountryCode })
      } catch (error) {
        console.error("Add to cart failed", error)
      }
    })
  }

  const getButtonLabel = () => {
    if (!product.inStock) return "Out of Stock"
    return "Add to Cart"
  }

  if (viewMode === "list") {
    return (
      <Card tone="elevated" className="group overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <Link
            href={`/products/${product.handle}`}
            className="relative block w-full sm:w-48 h-48 sm:h-32 overflow-hidden bg-background-elevated flex-shrink-0"
          >
            {image && (
              <Image
                src={image}
                alt={product.title}
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-[0.3deg]"
              />
            )}
            {product.isNew && <Badge label="NEW" />}
            {product.compareAtPrice && product.compareAtPrice > product.price && <Badge label={`-${discount}%`} position="right" />}
          </Link>
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <Link href={`/products/${product.handle}`}>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-400 text-foreground-primary">
                    {product.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-semantic-warning text-semantic-warning" />
                  ))}
                  <span className="text-sm font-medium text-foreground-secondary ml-1">5.0</span>
                </div>
              </div>
              <p className="text-sm text-foreground-secondary mb-4 flex-1 line-clamp-2">{product.description}</p>
              <div className="mt-6 border-t border-border-secondary pt-4 space-y-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary-400">{currencyFormatter(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-foreground-muted line-through">
                      {currencyFormatter(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="w-full justify-center touch-target bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-pill"
                  disabled={!product.inStock || isPending}
                  onClick={handleAddToCart}
                >
                  {product.inStock && <ShoppingCart className="mr-2 h-4 w-4" />}
                  {isPending ? "Adding…" : getButtonLabel()}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card tone="elevated" className="group overflow-hidden">
      <Link href={`/products/${product.handle}`} className="block relative overflow-hidden aspect-square bg-background-elevated">
        {image && (
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-contain object-center transition-transform duration-500 group-hover:scale-105 group-hover:rotate-[0.3deg]"
          />
        )}
        {product.isNew && <Badge label="NEW" />}
        {product.compareAtPrice && product.compareAtPrice > product.price && <Badge label={`-${discount}%`} position="right" />}
      </Link>
      <div className="p-6">
        <Link href={`/products/${product.handle}`}>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-400 text-foreground-primary">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-semantic-warning text-semantic-warning" />
          ))}
          <span className="text-sm font-medium text-foreground-secondary ml-1">5.0</span>
        </div>
        <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">{product.description}</p>
        <div className="mt-6 border-t border-border-secondary pt-4 space-y-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-primary-400">{currencyFormatter(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-foreground-muted line-through">
                {currencyFormatter(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button className="w-full justify-center touch-target bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-pill h-12 text-lg" disabled={!product.inStock || isPending} onClick={handleAddToCart}>
            {product.inStock && <ShoppingCart className="mr-2 h-5 w-5" />}
            {isPending ? "Adding…" : getButtonLabel()}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function Badge({ label, position = "left" }: { label: string; position?: "left" | "right" }) {
  return (
    <span
      className={`absolute top-3 ${position === "left" ? "left-3" : "right-3"} bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full`}
    >
      {label}
    </span>
  )
}
