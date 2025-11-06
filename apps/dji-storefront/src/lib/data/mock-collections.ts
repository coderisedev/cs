import { mockMedusaClient, type MockCollectionWithProducts, type MockCollection } from "@cs/medusa-client"

const allCollectionsWithProducts = () => mockMedusaClient.listCollections({ includeProducts: true }) as MockCollectionWithProducts[]
const allCollections = () => mockMedusaClient.listCollections({ includeProducts: false }) as MockCollection[]

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
