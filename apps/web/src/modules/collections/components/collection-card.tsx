"use client"

import { HttpTypes } from "@medusajs/types"
import Link from "next/link"
import Image from "next/image"

type CollectionCardProps = {
  collection: HttpTypes.StoreCollection
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const { handle, title, metadata } = collection
  const productCount = collection.products?.length || 0

  // Get hero image from metadata or use placeholder
  const heroImage = (metadata?.hero_image as string) || "/placeholder-collection.jpg"
  const description = (metadata?.description as string) || ""

  return (
    <Link href={`/collections/${handle}`} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 bg-background-secondary">
        {/* Hero Image with Gradient Overlay */}
        <div className="relative h-64 w-full overflow-hidden">
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Product Count Badge */}
          {productCount > 0 && (
            <div className="absolute top-4 right-4 z-20 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
              {productCount} {productCount === 1 ? 'Product' : 'Products'}
            </div>
          )}

          {/* Collection Title - Overlayed on Image */}
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
            <h3 className="text-2xl font-bold text-white mb-2">
              {title}
            </h3>
            {description && (
              <p className="text-white/90 text-sm line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="p-6 bg-background-secondary">
          <div className="flex items-center justify-between">
            <span className="text-primary font-medium group-hover:underline">
              View Collection
            </span>
            <svg
              className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
