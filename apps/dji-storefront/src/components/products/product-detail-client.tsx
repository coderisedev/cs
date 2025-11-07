"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Check,
  Truck,
  Shield,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StorefrontProduct } from "@/lib/data/products"
import type { Review } from "@/lib/data/reviews"
import { currencyFormatter } from "@/lib/number"
import { addToCartAction } from "@/app/actions/cart"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

interface ProductDetailClientProps {
  product: StorefrontProduct
  reviews: Review[]
  countryCode: string
}

export function ProductDetailClient({ product, reviews, countryCode }: ProductDetailClientProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id ?? "")
  const [quantity, setQuantity] = useState(1)

  const variant = useMemo(() => product.variants.find((v) => v.id === selectedVariant) ?? product.variants[0], [product, selectedVariant])
  const heroImage = product.images[selectedImage] ?? product.images[0]

  const totalPrice = (variant?.price ?? product.price) * quantity
  const originalPrice = product.compareAtPrice ? product.compareAtPrice * quantity : undefined
  const discount = originalPrice ? Math.round(((originalPrice - totalPrice) / originalPrice) * 100) : 0

  const handleAddToCart = () => {
    if (!variant?.id) return
    startTransition(async () => {
      try {
        // Plan A: Always use US countryCode
        await addToCartAction({ variantId: variant.id, quantity, countryCode: DEFAULT_COUNTRY_CODE })
      } catch (error) {
        console.error("Add to cart failed", error)
      }
    })
  }

  return (
    <div className="container py-8 lg:py-12 space-y-12">
      <nav className="text-sm text-foreground-muted flex items-center gap-2">
        <Link href="/" className="hover:text-primary-400">
          Home
        </Link>
        /
        <Link href="/products" className="hover:text-primary-400">
          Products
        </Link>
        /
        <span className="text-foreground-primary">{product.title}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square bg-background-elevated rounded-xl overflow-hidden">
            <Image src={heroImage} alt={product.title} fill className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary-500" : "border-border-primary hover:border-border-secondary"
                  }`}
                >
                  <Image src={image} alt={`${product.title}-${index + 1}`} width={80} height={80} className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-3">{product.title}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-semantic-warning text-semantic-warning"
                        : "text-foreground-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-foreground-secondary">{product.rating}</span>
              <span className="text-sm text-foreground-muted">({product.reviewCount} reviews)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary-400">{currencyFormatter(variant?.price ?? product.price)}</span>
              {originalPrice && (
                <>
                  <span className="text-2xl text-foreground-muted line-through">{currencyFormatter(originalPrice)}</span>
                  <span className="bg-semantic-error text-white px-2 py-1 rounded-full text-sm font-semibold">-{discount}%</span>
                </>
              )}
            </div>
            <p className="text-foreground-secondary">{product.description}</p>
          </div>

          {product.variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground-primary">Select Variant</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      selectedVariant === v.id ? "border-primary-500 bg-background-elevated" : "border-border-primary"
                    }`}
                  >
                    <div className="font-medium text-foreground-primary">{v.title}</div>
                    <div className="text-primary-400">{currencyFormatter(v.price)}</div>
                    <div className={`text-sm ${v.inStock ? "text-semantic-success" : "text-semantic-error"}`}>
                      {v.inStock ? "In Stock" : "Out of Stock"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground-primary">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border-primary rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2" disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 text-lg font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-foreground-secondary">
                Total: <span className="font-semibold text-primary-400">{currencyFormatter(totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button className="w-full h-12 text-lg" size="lg" disabled={variant?.inStock === false || isPending} onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {variant?.inStock === false ? "Out of Stock" : isPending ? "Adding…" : "Add to Cart"}
            </Button>
            <Button variant="outline" className="w-full">
              <Heart className="mr-2 h-4 w-4" /> Add to Wishlist
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border-primary text-center">
            <div>
              <Truck className="h-8 w-8 text-primary-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground-primary">Free Shipping</p>
              <p className="text-xs text-foreground-muted">Orders over $299</p>
            </div>
            <div>
              <Shield className="h-8 w-8 text-primary-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground-primary">2 Year Warranty</p>
              <p className="text-xs text-foreground-muted">Full hardware coverage</p>
            </div>
            <div>
              <Award className="h-8 w-8 text-primary-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground-primary">Made for Pros</p>
              <p className="text-xs text-foreground-muted">Trusted by real pilots</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border border-border-primary">
        <Tabs defaultValue="description">
          <TabsList className="flex flex-wrap gap-2 p-2 bg-transparent">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="p-6 space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-foreground-primary mb-3">Product Description</h3>
              <p className="text-foreground-secondary leading-relaxed">{product.description}</p>
            </section>
            {product.features && product.features.length > 0 && (
              <section>
                <h4 className="text-lg font-semibold text-foreground-primary mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-foreground-secondary">
                      <Check className="h-5 w-5 text-primary-400 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {product.compatibility && product.compatibility.length > 0 && (
              <section>
                <h4 className="text-lg font-semibold text-foreground-primary mb-3">Compatibility</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {product.compatibility.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-foreground-secondary">
                      <Check className="h-4 w-4 text-primary-400" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="specifications" className="p-6">
            <h3 className="text-xl font-semibold text-foreground-primary mb-4">Technical Specifications</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {product.specifications?.map((spec) => (
                <div key={spec.label} className="flex justify-between border-b border-border-primary pb-2 text-sm">
                  <span className="font-medium text-foreground-primary">{spec.label}</span>
                  <span className="text-foreground-secondary">{spec.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground-primary">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-semantic-warning text-semantic-warning"
                          : "text-foreground-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium text-foreground-secondary">{product.rating}</span>
                <span className="text-foreground-muted">({product.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-border-primary pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground-primary">{review.author}</p>
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                          <span>{review.date}</span>
                          {review.verified && <span className="text-semantic-success">Verified Purchase</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-semantic-warning text-semantic-warning" : "text-foreground-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-medium text-foreground-primary mb-1">{review.title}</h4>
                  <p className="text-foreground-secondary">{review.content}</p>
                  <p className="text-sm text-foreground-muted mt-2">{review.helpful} people found this helpful</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
