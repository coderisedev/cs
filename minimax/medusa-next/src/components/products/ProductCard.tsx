import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      variantId: product.variants[0].id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      variant: {
        size: product.variants[0].size,
        color: product.variants[0].color,
      },
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  return (
    <Card className="group overflow-hidden">
      <Link to={`/products/${product.handle}`} className="block relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
            NEW
          </span>
        )}
        {product.isSale && (
          <span className="absolute top-3 right-3 bg-error text-white text-xs font-bold px-3 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsWishlisted(!isWishlisted)
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-gray-50"
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-error text-error' : 'text-gray-600'}`} />
        </button>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.handle}`}>
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold">¥{product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ¥{product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          className="w-full"
          size="sm"
          disabled={!product.inStock || addedToCart}
        >
          {addedToCart ? (
            '已添加'
          ) : product.inStock ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              加入购物车
            </>
          ) : (
            '暂时缺货'
          )}
        </Button>
      </div>
    </Card>
  )
}
