"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { Suspense, useState } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"

type CollectionDetailTemplateProps = {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}

type Specification = {
  label: string
  value: string
}

type Feature = string

export default function CollectionDetailTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: CollectionDetailTemplateProps) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  // Extract metadata
  const heroImage = (collection.metadata?.hero_image as string) || "/placeholder-collection.jpg"
  const description = (collection.metadata?.description as string) || ""
  const specifications = (collection.metadata?.specifications as Specification[]) || []
  const features = (collection.metadata?.features as Feature[]) || []

  const [specsExpanded, setSpecsExpanded] = useState(false)

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden bg-background-secondary">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background-primary" />
        <Image
          src={heroImage}
          alt={collection.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 content-container pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {collection.title}
          </h1>
          {description && (
            <p className="text-lg text-white/90 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Specifications Section (if available) */}
      {(specifications.length > 0 || features.length > 0) && (
        <div className="content-container py-8 border-b border-border">
          <button
            onClick={() => setSpecsExpanded(!specsExpanded)}
            className="flex items-center justify-between w-full md:w-auto md:inline-flex md:gap-2 text-left group"
          >
            <h2 className="text-2xl font-bold text-foreground-primary">
              Technical Specifications
            </h2>
            <svg
              className={`w-6 h-6 text-foreground-secondary transition-transform duration-300 ${
                specsExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {specsExpanded && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Specifications */}
              {specifications.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground-primary">
                    Specifications
                  </h3>
                  <dl className="space-y-3">
                    {specifications.map((spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-2 border-b border-border/50"
                      >
                        <dt className="text-sm font-medium text-foreground-secondary">
                          {spec.label}
                        </dt>
                        <dd className="text-sm text-foreground-primary text-right max-w-[60%]">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Features */}
              {features.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground-primary">
                    Key Features
                  </h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg
                          className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-sm text-foreground-primary">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Products Grid */}
      <div className="flex flex-col md:flex-row md:items-start py-6 content-container gap-6">
        <div className="hidden md:block md:w-64 flex-shrink-0">
          <RefinementList sortBy={sort} />
        </div>
        
        <div className="w-full flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground-primary">
              Products
            </h2>
            <div className="md:hidden">
              <RefinementList sortBy={sort} />
            </div>
          </div>
          
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
