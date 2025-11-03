import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.handle}`} className="block relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.isNew && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-primary text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
            NEW
          </span>
        )}
        {product.isSale && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-error text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="mobile-product-card">
        <Link href={`/products/${product.handle}`}>
          <h3 className="mobile-product-title font-semibold mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-500 text-yellow-500" />
          <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
          <span className="text-xs sm:text-sm text-gray-500">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="mobile-product-price">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through ml-2">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Button
          className="w-full touch-target text-sm sm:text-base"
          size="sm"
          disabled={!product.inStock}
        >
          {product.inStock ? (
            <>
              <ShoppingCart className="mr-1 sm:mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Add to </span>Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </Button>
      </div>
    </Card>
  )
}
