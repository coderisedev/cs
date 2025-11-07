import { mockMedusaClient } from "@cs/medusa-client"

type MockProductResponse = {
  products: Awaited<ReturnType<typeof mockMedusaClient.listProducts>>
  count: number
}

export const getMockProducts = async ({
  limit = 12,
  offset = 0,
  collection_id,
}: {
  limit?: number
  offset?: number
  collection_id?: string
}): Promise<MockProductResponse> => {
  const results = await mockMedusaClient.listProducts({ collectionHandle: collection_id })
  const products = results.slice(offset, offset + limit)

  return {
    products,
    count: results.length,
  }
}
