import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { useCart } from '../../contexts/CartContext'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addItem } = useCart()
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.variants.length > 0) {
      addItem(product, product.variants[0].id, 1)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="group overflow-hidden bg-background-secondary border-0 shadow-sm card-hover rounded-base">
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <Link to={`/products/${product.handle}`} className="block relative overflow-hidden w-full sm:w-48 h-48 sm:h-32 bg-background-elevated flex-shrink-0">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover image-hover"
            />
            {product.isNew && (
              <span className="absolute top-2 left-2 bg-primary-500 text-foreground-primary text-xs font-bold px-2 py-1 rounded-full transition-colors duration-300">
                NEW
              </span>
            )}
            {product.isSale && (
              <span className="absolute top-2 right-2 bg-semantic-error text-foreground-primary text-xs font-bold px-2 py-1 rounded-full transition-colors duration-300">
                -{discount}%
              </span>
            )}
          </Link>

          {/* Content Section */}
          <div className="flex-1 p-6 sm:p-8">
            <div className="flex flex-col h-full">
              {/* Title and Rating */}
              <div className="mb-4">
                <Link to={`/products/${product.handle}`}>
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-400 transition-colors duration-300 text-foreground-primary">
                    {product.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-semantic-warning text-semantic-warning" />
                  <span className="text-sm font-medium text-foreground-secondary transition-colors duration-300">{product.rating}</span>
                  <span className="text-sm text-foreground-muted transition-colors duration-300">({product.reviewCount})</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4 flex-1">
                <p className="text-foreground-secondary text-sm line-clamp-2 transition-colors duration-300">
                  {product.description}
                </p>
              </div>

              {/* Price and Button */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-primary-400">${product.price.toFixed(2)}</span>
                  {product.compareAtPrice && (
                    <span className="text-lg text-foreground-muted line-through ml-2 transition-colors duration-300">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <Button
                  className="touch-target"
                  size="sm"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  {product.inStock ? (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Grid View (original layout)
  return (
    <Card className="group overflow-hidden bg-background-secondary border-0 shadow-sm card-hover rounded-base">
      <Link to={`/products/${product.handle}`} className="block relative overflow-hidden aspect-square bg-background-elevated">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover image-hover"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-primary-500 text-foreground-primary text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300">
            NEW
          </span>
        )}
        {product.isSale && (
          <span className="absolute top-3 right-3 bg-semantic-error text-foreground-primary text-xs font-bold px-3 py-1 rounded-full transition-colors duration-300">
            -{discount}%
          </span>
        )}
      </Link>
      <div className="p-8">
        <Link to={`/products/${product.handle}`}>
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-primary-400 transition-colors duration-300 text-foreground-primary">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-semantic-warning text-semantic-warning" />
          <span className="text-sm font-medium text-foreground-secondary transition-colors duration-300">{product.rating}</span>
          <span className="text-sm text-foreground-muted transition-colors duration-300">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-primary-400">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-foreground-muted line-through ml-2 transition-colors duration-300">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Button
          className="w-full touch-target"
          size="sm"
          disabled={!product.inStock}
          onClick={handleAddToCart}
        >
          {product.inStock ? (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </Button>
      </div>
    </Card>
  )
}