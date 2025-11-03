import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, Heart, Minus, Plus, Check, Truck, Shield, Award } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { products, reviews } from '../data/products'
import { useCart } from '../contexts/CartContext'

export function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>()
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState('')
  const [quantity, setQuantity] = useState(1)

  const product = products.find(p => p.handle === handle)
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground-primary transition-colors duration-300">Product Not Found</h1>
          <p className="text-foreground-secondary mb-8 transition-colors duration-300">The product you're looking for doesn't exist.</p>
          <Link to="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  const productReviews = reviews.filter(r => r.productId === product.id)
  const selectedVariantData = product.variants.find(v => v.id === selectedVariant) || product.variants[0]
  
  if (!selectedVariant && product.variants.length > 0) {
    setSelectedVariant(product.variants[0].id)
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      addItem(product, selectedVariant, quantity)
    }
  }

  const totalPrice = selectedVariantData?.price ? selectedVariantData.price * quantity : product.price * quantity
  const originalPrice = product.compareAtPrice ? product.compareAtPrice * quantity : null
  const discount = originalPrice ? Math.round(((originalPrice - totalPrice) / originalPrice) * 100) : 0

  return (
    <div className="container mx-auto px-4 lg:px-12 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-foreground-muted transition-colors duration-300">
          <li><Link to="/" className="hover:text-primary-400">Home</Link></li>
          <li>/</li>
          <li><Link to="/products" className="hover:text-primary-400">Products</Link></li>
          <li>/</li>
          <li className="text-foreground-primary transition-colors duration-300">{product.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-background-elevated rounded-md overflow-hidden">
            <img
              src={product.images[selectedImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors duration-300 ${
                    selectedImage === index ? 'border-primary-500' : 'border-border-primary'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Title and Rating */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-3 transition-colors duration-300">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-semantic-warning text-semantic-warning'
                        : 'text-foreground-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-foreground-secondary transition-colors duration-300">{product.rating}</span>
              <span className="text-foreground-muted transition-colors duration-300">({product.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary-400">
                ${selectedVariantData?.price.toFixed(2) || product.price.toFixed(2)}
              </span>
              {originalPrice && (
                <>
                  <span className="text-2xl text-foreground-muted line-through transition-colors duration-300">
                    ${originalPrice.toFixed(2)}
                  </span>
                  <span className="bg-semantic-error text-foreground-primary px-2 py-1 rounded-full text-sm font-bold transition-colors duration-300">
                    -{discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-foreground-secondary transition-colors duration-300">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground-primary transition-colors duration-300">Select Variant</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`p-3 rounded-md border-2 text-left transition-colors ${
                      selectedVariant === variant.id
                        ? 'border-primary-500 bg-background-elevated'
                        : 'border-border-primary hover:border-border-secondary'
                    }`}
                  >
                    <div className="font-medium text-foreground-primary transition-colors duration-300">{variant.title}</div>
                    <div className="text-primary-400">${variant.price.toFixed(2)}</div>
                    <div className={`text-sm ${variant.inStock ? 'text-semantic-success' : 'text-semantic-error'}`}>
                      {variant.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground-primary transition-colors duration-300">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-border-primary rounded-md transition-colors duration-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-background-elevated transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4 text-foreground-primary transition-colors duration-300" />
                </button>
                <span className="px-4 py-2 text-foreground-primary font-medium transition-colors duration-300">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-background-elevated transition-colors"
                >
                  <Plus className="h-4 w-4 text-foreground-primary transition-colors duration-300" />
                </button>
              </div>
              <div className="text-foreground-secondary transition-colors duration-300">
                Total: <span className="font-bold text-primary-400">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4">
            <Button
              className="w-full h-12 text-lg"
              size="lg"
              disabled={!selectedVariantData?.inStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {selectedVariantData?.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1">
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border-primary transition-colors duration-300">
            <div className="text-center">
              <Truck className="h-8 w-8 text-primary-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground-primary transition-colors duration-300">Free Shipping</div>
              <div className="text-xs text-foreground-muted transition-colors duration-300">Orders over $299</div>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-primary-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground-primary transition-colors duration-300">2 Year Warranty</div>
              <div className="text-xs text-foreground-muted transition-colors duration-300">Full coverage</div>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-primary-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-foreground-primary transition-colors duration-300">Expert Support</div>
              <div className="text-xs text-foreground-muted transition-colors duration-300">24/7 assistance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Card className="bg-background-secondary border-0 shadow-card">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-background-elevated border-b border-border-primary rounded-none transition-colors duration-300">
            <TabsTrigger value="description" className="data-[state=active]:bg-background-secondary">
              Description
            </TabsTrigger>
            <TabsTrigger value="specifications" className="data-[state=active]:bg-background-secondary">
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-background-secondary">
              Reviews ({product.reviewCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-foreground-primary mb-3 transition-colors duration-300">Product Description</h3>
                <p className="text-foreground-secondary leading-relaxed transition-colors duration-300">{product.description}</p>
              </div>
              
              {product.features && product.features.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-foreground-primary mb-3 transition-colors duration-300">Key Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-foreground-secondary transition-colors duration-300">
                        <Check className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {product.compatibility && product.compatibility.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-foreground-primary mb-3 transition-colors duration-300">Compatibility</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.compatibility.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2 text-foreground-secondary transition-colors duration-300">
                        <Check className="h-4 w-4 text-primary-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="p-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground-primary mb-4 transition-colors duration-300">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border-primary transition-colors duration-300">
                    <span className="font-medium text-foreground-primary transition-colors duration-300">{spec.label}</span>
                    <span className="text-foreground-secondary transition-colors duration-300">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-foreground-primary transition-colors duration-300">Customer Reviews</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? 'fill-semantic-warning text-semantic-warning'
                            : 'text-foreground-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium text-foreground-secondary transition-colors duration-300">{product.rating}</span>
                  <span className="text-foreground-muted transition-colors duration-300">({product.reviewCount} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {productReviews.map((review) => (
                  <div key={review.id} className="border-b border-border-primary pb-6 last:border-b-0 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-foreground-primary font-bold transition-colors duration-300">
                          {review.author.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground-primary transition-colors duration-300">{review.author}</div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-semantic-warning text-semantic-warning'
                                      : 'text-foreground-muted'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-foreground-muted transition-colors duration-300">{review.date}</span>
                            {review.verified && (
                              <span className="bg-semantic-success text-foreground-primary text-xs px-2 py-1 rounded-full transition-colors duration-300">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-medium text-foreground-primary mb-2 transition-colors duration-300">{review.title}</h4>
                    <p className="text-foreground-secondary transition-colors duration-300">{review.content}</p>
                    <div className="mt-3 text-sm text-foreground-muted transition-colors duration-300">
                      {review.helpful} people found this helpful
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
