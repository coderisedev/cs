'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { Star, ShoppingCart, Check, Truck, Shield, RefreshCw } from 'lucide-react'
import { products } from '@/data/products'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductCard } from '@/components/products/ProductCard'

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const resolvedParams = use(params)
  const product = products.find((p) => p.handle === resolvedParams.handle)

  if (!product) {
    notFound()
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                >
                  <img
                    src={image}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
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

            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{product.rating}</span>
                <span className="text-gray-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.compareAtPrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-error">
                    Save ${(product.compareAtPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Select Version:</h3>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="border-2 border-gray-200 rounded-lg p-3 cursor-pointer hover:border-primary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{variant.title}</span>
                        <span className="font-bold">${variant.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full mb-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              disabled={!product.inStock}
            >
              {product.inStock ? (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </>
              ) : (
                'Out of Stock'
              )}
            </Button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
              <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Free Shipping</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">2 Year Warranty</p>
              </div>
              <div className="text-center">
                <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">30 Day Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="specifications" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4">Technical Specifications</h3>
              {product.specifications && product.specifications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-700">{spec.label}:</span>
                      <span className="text-gray-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No specifications available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compatibility" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4">Compatible Software</h3>
              {product.compatibility && product.compatibility.length > 0 ? (
                <div className="space-y-3">
                  {product.compatibility.map((software, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-success" />
                      <span>{software}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No compatibility information available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4">Key Features</h3>
              {product.features && product.features.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No features listed.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
