const COLLECTION_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"

type CollectionMetadata = Record<string, unknown> | null | undefined

type CollectionLike = {
  metadata?: CollectionMetadata
  heroImage?: string
  thumbnail?: string | null
  highlight?: string
}

const getMetadataString = (metadata: CollectionMetadata, key: string) => {
  if (!metadata || typeof metadata !== "object") {
    return undefined
  }

  const value = (metadata as Record<string, unknown>)[key]

  return typeof value === "string" && value.trim().length > 0 ? value : undefined
}

const getStringValue = (value?: string | null) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value
  }

  return undefined
}

export const resolveCollectionHeroImage = (collection: CollectionLike) => {
  return (
    getMetadataString(collection.metadata, "hero_image") ||
    getMetadataString(collection.metadata, "image_url") ||
    getStringValue(collection.heroImage) ||
    getStringValue(collection.thumbnail ?? undefined) ||
    COLLECTION_IMAGE_FALLBACK
  )
}

export const resolveCollectionHighlight = (collection: CollectionLike) => {
  return (
    getStringValue(collection.highlight) ||
    getMetadataString(collection.metadata, "highlight") ||
    getMetadataString(collection.metadata, "tagline") ||
    "Featured Collection"
  )
}
