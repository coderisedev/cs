"use client"

import { HttpTypes } from "@medusajs/types"
import CollectionCard from "../components/collection-card"

type CollectionsListTemplateProps = {
  collections: HttpTypes.StoreCollection[]
}

export default function CollectionsListTemplate({
  collections,
}: CollectionsListTemplateProps) {
  if (!collections || collections.length === 0) {
    return (
      <div className="content-container py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground-primary mb-4">
            No Collections Available
          </h2>
          <p className="text-foreground-secondary">
            Check back soon for new collections
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="content-container py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground-primary mb-2">
          Collections
        </h1>
        <p className="text-lg text-foreground-secondary">
          Explore our curated collections of professional flight simulation hardware
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 gap-6">
        {collections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </div>
  )
}
