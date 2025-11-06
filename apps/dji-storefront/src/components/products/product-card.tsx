"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import type { MockProduct } from "@cs/medusa-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currencyFormatter } from "@/lib/number"

type ViewMode = "grid" | "list"

export function ProductCard({ product, viewMode = "grid" }: { product: MockProduct; viewMode?: ViewMode }) {
  const image = product.images[0]
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    console.info("Add to cart", product.handle)
  }

  if (viewMode === "list") {
    return (
      <Card className="group overflow-hidden bg-background-secondary border-0 shadow-sm rounded-base">
        <div className="flex flex-col sm:flex-row">
          <Link
            href={`/products/${product.handle}`}
            className="relative block w-full sm:w-48 h-48 sm:h-32 overflow-hidden bg-background-elevated flex-shrink-0"
          >
            {image && <Image src={image} alt={product.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />}
            {product.isNew && <Badge label="NEW" />}
            {product.isSale && <Badge label={`-${discount}%`} position="right" />}
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
                  <Star className="h-4 w-4 fill-semantic-warning text-semantic-warning" />
                  <span className="text-sm font-medium text-foreground-secondary">{product.rating}</span>
                  <span className="text-sm text-foreground-muted">({product.reviewCount})</span>
                </div>
              </div>
              <p className="text-sm text-foreground-secondary mb-4 flex-1 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary-400">{currencyFormatter(product.price)}</span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-foreground-muted line-through ml-2">
                      {currencyFormatter(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <Button size="sm" className="touch-target" disabled={!product.inStock} onClick={handleAddToCart}>
                  {product.inStock ? (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </>
                  ) : (
                    "Out of Stock"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden bg-background-secondary border-0 shadow-sm rounded-base">
      <Link href={`/products/${product.handle}`} className="block relative overflow-hidden aspect-square bg-background-elevated">
        {image && <Image src={image} alt={product.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />}
        {product.isNew && <Badge label="NEW" />}
        {product.isSale && <Badge label={`-${discount}%`} position="right" />}
      </Link>
      <div className="p-6">
        <Link href={`/products/${product.handle}`}>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-400 text-foreground-primary">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-semantic-warning text-semantic-warning" />
          <span className="text-sm font-medium text-foreground-secondary">{product.rating}</span>
          <span className="text-sm text-foreground-muted">({product.reviewCount})</span>
        </div>
        <p className="text-sm text-foreground-secondary line-clamp-2 mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary-400">{currencyFormatter(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-foreground-muted line-through ml-2">
                {currencyFormatter(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button size="sm" className="touch-target" disabled={!product.inStock} onClick={handleAddToCart}>
            {product.inStock ? (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </>
            ) : (
              "Out of Stock"
            )}
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
