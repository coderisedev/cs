"use client"

import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import { getProductPrice } from "@lib/util/get-product-price"

interface ProductCardProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export default function ProductCard({ product, region }: ProductCardProps) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
  })

  const price = cheapestPrice || variantPrice
  const thumbnail = product.thumbnail || product.images?.[0]?.url

  // Check if product has variants and stock
  const hasStock =
    product.variants && product.variants.some((v) => v.manage_inventory === false || (v.inventory_quantity ?? 0) > 0)

  // Calculate if there's a sale (compare price vs original price if available)
  const isNew = product.created_at
    ? new Date().getTime() - new Date(product.created_at).getTime() <
      30 * 24 * 60 * 60 * 1000
    : false

  return (
    <div className="group overflow-hidden hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-200 bg-white">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block relative overflow-hidden aspect-square bg-gray-100"
      >
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={product.title || "Product"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        )}
        {isNew && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
            NEW
          </span>
        )}
      </LocalizedClientLink>
      <div className="mobile-product-card">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <h3 className="mobile-product-title font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </LocalizedClientLink>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
          <span className="text-xs sm:text-sm font-medium">4.5</span>
          <span className="text-xs sm:text-sm text-gray-500">(12)</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            {price && (
              <span className="mobile-product-price">
                {price.calculated_price}
              </span>
            )}
          </div>
        </div>
        <button
          className="w-full touch-target text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 font-medium transition-colors flex items-center justify-center gap-2"
          disabled={!hasStock}
        >
          {hasStock ? (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden xs:inline">Add to </span>Cart
            </>
          ) : (
            "Out of Stock"
          )}
        </button>
      </div>
    </div>
  )
}
