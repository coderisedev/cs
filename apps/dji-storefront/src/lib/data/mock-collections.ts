import { mockMedusaClient, type MockCollectionWithProducts, type MockCollection } from "@cs/medusa-client"

const allCollectionsWithProducts = () => {
  const result = mockMedusaClient.listCollections({ includeProducts: true })
  // Handle both array and object responses
  return Array.isArray(result) ? result : ((result as any).collections || []) as MockCollectionWithProducts[]
}

const allCollections = () => {
  const result = mockMedusaClient.listCollections({ includeProducts: false })
  // Handle both array and object responses
  return Array.isArray(result) ? result : ((result as any).collections || []) as MockCollection[]
}

export const getMockCollections = ({ limit, offset = 0 }: { limit?: string; offset?: string }) => {
  const parsedLimit = limit ? parseInt(limit, 10) : undefined
  const parsedOffset = offset ? parseInt(offset, 10) : 0
  const collections = allCollectionsWithProducts()
  const slice = collections.slice(parsedOffset, parsedOffset + (parsedLimit ?? collections.length))
  return {
    collections: slice,
    count: collections.length,
  }
}

export const getMockCollectionByHandle = (handle: string) =>
  allCollectionsWithProducts().find((collection) => collection.handle === handle)

export const getMockCollectionById = (id: string) => allCollections().find((collection) => collection.id === id)
