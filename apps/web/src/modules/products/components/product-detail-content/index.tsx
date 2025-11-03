"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Star, ShoppingCart, Truck, Shield, RefreshCw, Check } from "lucide-react"
import { getProductPrice } from "@lib/util/get-product-price"
import ProductDetailTabs from "@modules/products/components/product-detail-tabs"

interface ProductDetailContentProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  images: HttpTypes.StoreProductImage[]
}

export default function ProductDetailContent({
  product,
  region,
  images,
}: ProductDetailContentProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
  })

  const price = cheapestPrice || variantPrice
  const displayImages = images && images.length > 0 ? images : product.images || []

  // Check if product has stock
  const hasStock =
    product.variants &&
    product.variants.some(
      (v) =>
        v.manage_inventory === false || (v.inventory_quantity ?? 0) > 0
    )

  // Check if product is new (created within last 30 days)
  const isNew = product.created_at
    ? new Date().getTime() - new Date(product.created_at).getTime() <
      30 * 24 * 60 * 60 * 1000
    : false

  // Check if there's a sale (simplified - in real app would check variant prices)
  const isSale = false // TODO: Implement actual sale logic

  return (
    <>
      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 lg:mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {displayImages[selectedImage] && (
              <img
                src={displayImages[selectedImage].url}
                alt={product.title || "Product image"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {displayImages.slice(0, 4).map((image, index) => (
                <div
                  key={image.id || index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImage === index
                      ? "ring-2 ring-primary"
                      : "hover:ring-2 hover:ring-primary/50"
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-center gap-2 mb-3 sm:mb-2">
            {isNew && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                NEW
              </span>
            )}
            {isSale && (
              <span className="bg-error text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full">
                SALE
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            {product.title}
          </h1>

          <div className="flex items-center gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold text-sm sm:text-base">4.5</span>
              <span className="text-gray-600 text-sm sm:text-base">
                (12 reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
            {price && (
              <span className="text-2xl sm:text-3xl font-bold">
                {price.calculated_price}
              </span>
            )}
          </div>

          <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
            {product.description || "No description available."}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <div className="mb-4 sm:mb-6">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">
                Select Version:
              </h3>
              <div className="space-y-2">
                {product.variants.map((variant) => {
                  // Get variant price - handle both string and object types
                  let displayPrice = "N/A"
                  if (variant.calculated_price) {
                    if (typeof variant.calculated_price === "string") {
                      displayPrice = variant.calculated_price
                    } else if (variant.calculated_price.calculated_amount !== undefined && variant.calculated_price.calculated_amount !== null) {
                      // Format the price if it's an object with calculated_amount
                      const amount = variant.calculated_price.calculated_amount
                      const currencyCode = variant.calculated_price.currency_code || region.currency_code
                      displayPrice = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: currencyCode,
                      }).format(amount / 100)
                    }
                  }
                  
                  return (
                    <div
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedVariant === variant.id
                          ? "border-primary"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm sm:text-base">
                          {variant.title}
                        </span>
                        <span className="font-bold text-sm sm:text-base">
                          {displayPrice}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <button
            className="w-full mb-4 sm:mb-6 px-6 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-lg font-semibold transition-opacity touch-target flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasStock}
          >
            {hasStock ? (
              <>
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                Add to Cart
              </>
            ) : (
              "Out of Stock"
            )}
          </button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 sm:py-6 border-t border-b">
            <div className="text-center">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">2 Year Warranty</p>
            </div>
            <div className="text-center">
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-primary" />
              <p className="text-xs font-medium">30 Day Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <ProductDetailTabs product={product} />
    </>
  )
}
