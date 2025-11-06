import {
  mockMedusaClient,
  type MockCollection,
  type MockCollectionWithProducts,
  type MockProductSummary,
} from "@cs/medusa-client"

export async function getCollections(options?: { includeProducts?: boolean; limit?: number }) {
  const collections = await mockMedusaClient.listCollections({
    includeProducts: options?.includeProducts,
    limit: options?.limit,
  })
  return collections
}

export async function getCollectionDetail(handle: string, options?: { includeProducts?: boolean }) {
  return mockMedusaClient.retrieveCollection(handle, options)
}

export async function getCollectionProducts(handle: string): Promise<MockProductSummary[]> {
  return mockMedusaClient.listCollectionProducts(handle)
}

export type CollectionWithProducts = MockCollectionWithProducts
export type Collection = MockCollection
