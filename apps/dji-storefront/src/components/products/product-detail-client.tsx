"use client"

import { useMemo, useState, useTransition, useRef, useEffect } from "react"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { StorefrontProduct } from "@/lib/data/products"
import type { Review } from "@/lib/data/reviews"
import type { ProductDetailContent } from "@/lib/strapi/product-detail"
import { currencyFormatter } from "@/lib/number"
import { addToCartAction } from "@/app/actions/cart"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { buildWishlistInput, useWishlist } from "@/lib/context/wishlist-context"
import {
  FeatureBullets,
  ContentSection,
  SpecGroups,
  PackageContents,
} from "@/components/product-detail"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"

interface ProductDetailClientProps {
  product: StorefrontProduct
  strapiContent?: ProductDetailContent | null
  reviews: Review[]
  countryCode: string
}

export function ProductDetailClient({ product, strapiContent, reviews, countryCode }: ProductDetailClientProps) {
  const [isPending, startTransition] = useTransition()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id ?? "")
  const [quantity, setQuantity] = useState(1)
  const { toggleItem: toggleWishlistItem, isInWishlist } = useWishlist()
  const resolvedCountryCode = countryCode || DEFAULT_COUNTRY_CODE
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const variant = useMemo(() => product.variants.find((v) => v.id === selectedVariant) ?? product.variants[0], [product, selectedVariant])
  const heroImage = product.images[selectedImage] ?? product.images[0]
  const totalImages = product.images.length
  const isWishlisted = isInWishlist(product.id)

  const totalPrice = (variant?.price ?? product.price) * quantity
  const originalPrice = product.compareAtPrice ? product.compareAtPrice * quantity : undefined
  const discount = originalPrice ? Math.round(((originalPrice - totalPrice) / originalPrice) * 100) : 0

  // Check if thumbnail container can scroll
  const checkThumbnailScroll = () => {
    const container = thumbnailContainerRef.current
    if (!container) return
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 1)
  }

  useEffect(() => {
    checkThumbnailScroll()
    const container = thumbnailContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkThumbnailScroll)
      window.addEventListener("resize", checkThumbnailScroll)
      return () => {
        container.removeEventListener("scroll", checkThumbnailScroll)
        window.removeEventListener("resize", checkThumbnailScroll)
      }
    }
  }, [product.images.length])

  const scrollThumbnails = (direction: "left" | "right") => {
    const container = thumbnailContainerRef.current
    if (!container) return
    const scrollAmount = 200
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    })
  }

  const handleAddToCart = () => {
    if (!variant?.id) return
    startTransition(async () => {
      const result = await addToCartAction({ variantId: variant.id, quantity, countryCode: resolvedCountryCode })
      if (!result.success) {
        console.error("Add to cart failed:", result.error)
        // Could add toast notification here in the future
      }
    })
  }

  const handleWishlistToggle = () => {
    toggleWishlistItem(
      buildWishlistInput(product, variant?.price ?? product.price)
    )
  }

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="container py-4">
        <nav className="text-sm text-foreground-muted flex items-center gap-2">
          <Link href="/" className="hover:text-foreground-primary transition-colors">
            Home
          </Link>
          <span className="text-foreground-muted">/</span>
          <Link href="/products" className="hover:text-foreground-primary transition-colors">
            Products
          </Link>
          <span className="text-foreground-muted">/</span>
          <span className="text-foreground-secondary">{product.title}</span>
        </nav>
      </div>

      {/* Hero Product Section */}
      <div className="sm:container max-w-[1340px] mx-auto py-[var(--fluid-section-py)] sm:px-6">
        <div className="grid gap-[var(--fluid-gap-xl)] lg:grid-cols-2 items-start">
          {/* Image Gallery */}
          <div className="space-y-6 min-w-0">
            <div className="relative aspect-square w-full bg-[#F5F5F7] sm:rounded-2xl overflow-hidden">
              <Image src={heroImage} alt={product.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw" priority />
              {totalImages > 1 && (
                <>
                  <button
                    aria-label="Previous image"
                    onClick={() => setSelectedImage((prev) => (prev - 1 + totalImages) % totalImages)}
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md text-white rounded-full p-2 sm:p-3 hover:bg-black/40 transition-all"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    aria-label="Next image"
                    onClick={() => setSelectedImage((prev) => (prev + 1) % totalImages)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-black/20 backdrop-blur-md text-white rounded-full p-2 sm:p-3 hover:bg-black/40 transition-all"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="relative group/thumbnails">
                {/* Left scroll button */}
                {canScrollLeft && (
                  <button
                    onClick={() => scrollThumbnails("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full p-1.5 text-foreground-secondary hover:text-foreground-primary transition-all opacity-0 group-hover/thumbnails:opacity-100 sm:opacity-100"
                    aria-label="Scroll thumbnails left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}
                {/* Right scroll button */}
                {canScrollRight && (
                  <button
                    onClick={() => scrollThumbnails("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-md rounded-full p-1.5 text-foreground-secondary hover:text-foreground-primary transition-all opacity-0 group-hover/thumbnails:opacity-100 sm:opacity-100"
                    aria-label="Scroll thumbnails right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
                <div
                  ref={thumbnailContainerRef}
                  className="flex gap-[var(--fluid-gap-xs)] overflow-x-auto py-1 scrollbar-hide px-4 sm:px-1"
                >
                  {product.images.map((image, index) => (
                    <button
                      key={image}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-[var(--fluid-thumb-size)] h-[var(--fluid-thumb-size)] rounded-lg overflow-hidden bg-[#F5F5F7] transition-all ${
                        selectedImage === index
                          ? "ring-2 ring-brand-blue-500 ring-offset-1 sm:ring-offset-2"
                          : "hover:ring-2 hover:ring-border-secondary hover:ring-offset-1"
                      }`}
                    >
                      <Image src={image} alt={`${product.title}-${index + 1}`} width={80} height={80} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info Panel */}
          <div className="space-y-[var(--fluid-gap-lg)] lg:sticky lg:top-24 px-4 sm:px-0">
            {/* Title & Rating */}
            <div>
              <h1 className="text-[length:var(--fluid-heading-xl)] font-semibold tracking-tight text-foreground-primary mb-[var(--fluid-gap-sm)]">
                {product.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-semantic-warning text-semantic-warning"
                    />
                  ))}
                </div>
                <span className="text-sm text-foreground-secondary">5.0</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-[var(--fluid-gap-sm)]">
              <div className="flex items-baseline gap-[var(--fluid-gap-xs)] flex-wrap">
                <span className="text-[length:var(--fluid-price)] font-semibold text-foreground-primary">
                  {currencyFormatter(variant?.price ?? product.price)}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-[length:var(--fluid-body-lg)] text-foreground-muted line-through">
                      {currencyFormatter(originalPrice)}
                    </span>
                    <span className="text-[length:var(--fluid-body-sm)] font-medium text-semantic-error">Save {discount}%</span>
                  </>
                )}
              </div>
              <p className="text-[length:var(--fluid-body-md)] leading-relaxed text-foreground-secondary">{product.description}</p>
            </div>

            {/* Variant Selection */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground-primary uppercase tracking-wide">
                  Select Variant
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selectedVariant === v.id
                          ? "bg-foreground-primary text-white"
                          : "bg-[#F5F5F7] text-foreground-primary hover:bg-[#E8E8ED]"
                      }`}
                    >
                      {v.title}
                      {!v.inStock && <span className="ml-1 text-foreground-muted">(Sold Out)</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground-primary uppercase tracking-wide">Quantity</h3>
              <div className="flex items-center gap-6">
                <div className="inline-flex items-center rounded-full border border-border-secondary">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-foreground-secondary hover:text-foreground-primary transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-base font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-foreground-secondary hover:text-foreground-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-foreground-secondary">
                  Total: <span className="font-semibold text-foreground-primary">{currencyFormatter(totalPrice)}</span>
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-[var(--fluid-gap-sm)]">
                <Button
                  className="flex-1 h-[var(--fluid-btn-height)] text-[length:var(--fluid-body-md)] font-medium bg-brand-blue-500 hover:bg-brand-blue-600 text-white rounded-full transition-all"
                  size="lg"
                  disabled={variant?.inStock === false || isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4 sm:hidden mr-2" />
                  {variant?.inStock === false ? "Out of Stock" : isPending ? "Adding…" : "Add to Cart"}
                </Button>
                <button
                  onClick={handleWishlistToggle}
                  className="flex-shrink-0 w-[var(--fluid-btn-height)] h-[var(--fluid-btn-height)] flex items-center justify-center rounded-full border border-border-secondary text-foreground-secondary hover:text-brand-blue-500 hover:border-brand-blue-500 transition-all"
                  aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? "fill-brand-blue-500 text-brand-blue-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between pt-6 border-t border-border-secondary">
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-foreground-secondary text-center sm:text-left">
                <Truck className="h-5 w-5" />
                <span className="text-xs sm:text-sm">Free Shipping</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border-secondary" />
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-foreground-secondary text-center sm:text-left">
                <Shield className="h-5 w-5" />
                <span className="text-xs sm:text-sm">2 Year Warranty</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-border-secondary" />
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-foreground-secondary text-center sm:text-left">
                <Award className="h-5 w-5" />
                <span className="text-xs sm:text-sm">Pro Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-[882px] mx-auto py-[var(--fluid-section-py)] px-4 sm:px-6">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-[var(--fluid-gap-lg)]">
            <section className="max-w-3xl">
              <h3 className="text-[length:var(--fluid-heading-md)] font-semibold text-foreground-primary mb-[var(--fluid-gap-sm)]">Product Description</h3>
              {strapiContent?.tagline && (
                <p className="text-[length:var(--fluid-body-lg)] text-foreground-secondary mb-3">{strapiContent.tagline}</p>
              )}
              <p className="text-[length:var(--fluid-body-md)] leading-relaxed text-foreground-secondary">{product.description}</p>
              {strapiContent?.overview && (
                <div
                  className="mt-[var(--fluid-gap-md)] prose prose-sm sm:prose-base max-w-none text-foreground-secondary"
                  dangerouslySetInnerHTML={{ __html: strapiContent.overview }}
                />
              )}
            </section>
            {/* Strapi feature bullets take precedence */}
            {strapiContent?.featureBullets && strapiContent.featureBullets.length > 0 ? (
              <FeatureBullets features={strapiContent.featureBullets} />
            ) : product.features && product.features.length > 0 ? (
              <section>
                <h4 className="text-xl font-semibold text-foreground-primary mb-4">Features</h4>
                <ul className="space-y-3 max-w-2xl">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-foreground-secondary">
                      <Check className="h-5 w-5 text-semantic-success mt-0.5 flex-shrink-0" />
                      <span className="text-base leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {product.compatibility && product.compatibility.length > 0 && (
              <section>
                <h4 className="text-xl font-semibold text-foreground-primary mb-4">Compatibility</h4>
                <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
                  {product.compatibility.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-foreground-secondary">
                      <Check className="h-4 w-4 text-semantic-success flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="specifications">
            <h3 className="text-2xl font-semibold text-foreground-primary mb-6">Technical Specifications</h3>
            {/* Strapi spec groups take precedence */}
            {strapiContent?.specGroups && strapiContent.specGroups.length > 0 ? (
              <SpecGroups groups={strapiContent.specGroups} />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 max-w-4xl">
                {product.specifications?.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-3 border-b border-border-secondary">
                    <span className="text-foreground-primary">{spec.label}</span>
                    <span className="text-foreground-secondary">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-8">
            <div className="flex items-center justify-between max-w-4xl">
              <h3 className="text-2xl font-semibold text-foreground-primary">Customer Reviews</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-semantic-warning text-semantic-warning"
                    />
                  ))}
                </div>
                <span className="text-foreground-secondary">5.0</span>
              </div>
            </div>
            <div className="space-y-8 max-w-4xl">
              {reviews.map((review) => (
                <div key={review.id} className="pb-8 border-b border-border-secondary last:border-b-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-[#F5F5F7] rounded-full flex items-center justify-center text-foreground-primary font-semibold">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground-primary">{review.author}</p>
                      <div className="flex items-center gap-3 text-sm text-foreground-muted">
                        <span>{review.date}</span>
                        {review.verified && (
                          <span className="text-semantic-success flex items-center gap-1">
                            <Check className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating ? "fill-semantic-warning text-semantic-warning" : "text-foreground-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold text-foreground-primary mb-2">{review.title}</h4>
                  <p className="text-foreground-secondary leading-relaxed">{review.content}</p>
                  <p className="text-sm text-foreground-muted mt-3">{review.helpful} people found this helpful</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Strapi Content Sections */}
      {strapiContent?.contentSections && strapiContent.contentSections.length > 0 && (
        <div className="space-y-0">
          {strapiContent.contentSections.map((section, idx) => (
            <ContentSection key={idx} {...section} />
          ))}
        </div>
      )}

      {/* Package Contents */}
      {strapiContent?.packageContents && strapiContent.packageContents.length > 0 && (
        <PackageContents items={strapiContent.packageContents} />
      )}

      {/* Warranty & OS Requirements */}
      {(strapiContent?.warrantyInfo || strapiContent?.osRequirements) && (
        <div className="bg-[#F5F5F7] py-[var(--fluid-section-py)]">
          <div className="container px-4 sm:px-6">
            <div className="grid gap-[var(--fluid-gap-xl)] md:grid-cols-2 max-w-4xl mx-auto">
              {strapiContent.warrantyInfo && (
                <div>
                  <h3 className="text-[length:var(--fluid-heading-sm)] font-semibold text-foreground-primary mb-[var(--fluid-gap-sm)]">Warranty</h3>
                  <div className="prose prose-sm sm:prose-base max-w-none text-foreground-secondary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-foreground-primary [&_a]:text-primary-500 [&_a:hover]:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {strapiContent.warrantyInfo}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {strapiContent.osRequirements && (
                <div>
                  <h3 className="text-[length:var(--fluid-heading-sm)] font-semibold text-foreground-primary mb-[var(--fluid-gap-sm)]">System Requirements</h3>
                  <div className="prose prose-sm sm:prose-base max-w-none text-foreground-secondary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:text-foreground-primary [&_a]:text-primary-500 [&_a:hover]:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                      {strapiContent.osRequirements}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
