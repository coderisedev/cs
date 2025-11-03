import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products, reviews } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, ShoppingCart, Heart, Truck, Shield, ArrowLeft } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { ProductCard } from '@/components/products/ProductCard'

export function ProductDetailPage() {
  const { handle } = useParams()
  const product = products.find((p) => p.handle === handle)
  const { addItem } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">产品未找到</h1>
        <Link to="/products">
          <Button>返回商品列表</Button>
        </Link>
      </div>
    )
  }

  const productReviews = reviews.filter((r) => r.productId === product.id)
  const relatedProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: product.variants[selectedVariant].id,
      title: product.title,
      price: product.variants[selectedVariant].price,
      quantity,
      image: product.images[0],
      variant: {
        size: product.variants[selectedVariant].size,
        color: product.variants[selectedVariant].color,
      },
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/products" className="inline-flex items-center text-sm text-gray-600 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回商品列表
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4 aspect-square">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg p-8">
            <div className="flex items-center gap-2 mb-3">
              {product.isNew && (
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </span>
              )}
              {product.isSale && (
                <span className="bg-error text-white text-xs font-bold px-3 py-1 rounded-full">
                  SALE
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviewCount} 评价)
              </span>
            </div>
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">¥{product.variants[selectedVariant].price.toFixed(2)}</span>
                {product.compareAtPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ¥{product.compareAtPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">选择规格</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      disabled={!variant.inStock}
                      className={`px-4 py-2 border-2 rounded-lg transition-colors ${
                        selectedVariant === index
                          ? 'border-primary bg-primary text-white'
                          : variant.inStock
                          ? 'border-gray-300 hover:border-primary'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {variant.title}
                      {!variant.inStock && ' (缺货)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">数量</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                className="flex-1"
                size="lg"
                disabled={!product.inStock || addedToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {addedToCart ? '已添加到购物车' : product.inStock ? '加入购物车' : '暂时缺货'}
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-primary" />
                <span>免费配送（订单满¥299）</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-primary" />
                <span>7天无理由退换货</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg p-8 mb-16">
          <Tabs defaultValue="description">
            <TabsList className="mb-6">
              <TabsTrigger value="description">产品描述</TabsTrigger>
              <TabsTrigger value="reviews">用户评价 ({productReviews.length})</TabsTrigger>
              <TabsTrigger value="shipping">配送信息</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="prose max-w-none">
              <p>{product.description}</p>
              <h3>产品特点</h3>
              <ul>
                {product.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="reviews">
              <div className="space-y-6">
                {productReviews.map((review) => (
                  <div key={review.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                        {review.author[0]}
                      </div>
                      <div>
                        <div className="font-semibold">{review.author}</div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                          {review.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              已验证购买
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{review.title}</h4>
                    <p className="text-gray-600">{review.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="shipping">
              <div className="prose max-w-none">
                <h3>配送方式</h3>
                <ul>
                  <li>标准配送：3-5个工作日</li>
                  <li>快速配送：1-2个工作日（需额外费用）</li>
                  <li>订单满¥299免运费</li>
                </ul>
                <h3>退换货政策</h3>
                <p>我们提供7天无理由退换货服务。商品需保持原包装完好。</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">相关产品</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
