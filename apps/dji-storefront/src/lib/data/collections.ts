"use server"

import { sdk } from "@/lib/medusa"
import { getCacheOptions } from "@/lib/server/cookies"
import { getMockCollectionByHandle, getMockCollectionById, getMockCollections } from "@/lib/data/mock-collections"
import { HttpTypes } from "@medusajs/types"

export const listCollections = async (queryParams: Record<string, string> = {}) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const query = {
    limit: queryParams.limit ?? "100",
    offset: queryParams.offset ?? "0",
    ...queryParams,
  }

  try {
    return await sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>("/store/collections", {
        method: "GET",
        query,
        next,
        cache: "force-cache",
      })
      .then(({ collections, count }) => ({ collections, count }))
  } catch {
    return getMockCollections(query)
  }
}

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions(`collections-${id}`)),
  }

  try {
    return await sdk.client
      .fetch<{ collection: HttpTypes.StoreCollection }>(`/store/collections/${id}`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ collection }) => collection)
  } catch {
    return getMockCollectionById(id)
  }
}

export const getCollectionByHandle = async (handle: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  try {
    return await sdk.client
      .fetch<{ collections: HttpTypes.StoreCollection[] }>(`/store/collections`, {
        method: "GET",
        query: { handle },
        next,
        cache: "force-cache",
      })
      .then(({ collections }) => collections[0] ?? null)
  } catch {
    return getMockCollectionByHandle(handle) ?? null
  }
}

export const getCollections = async ({
  limit,
  includeProducts,
}: {
  limit?: number
  includeProducts?: boolean
} = {}) => {
  const { collections } = await listCollections({
    limit: limit?.toString(),
  })

  if (includeProducts) {
    return collections
  }

  return collections.map((collection) => ({ ...collection, products: undefined }))
}

export const getCollectionDetail = async (handle: string) => {
  try {
    return await getCollectionByHandle(handle)
  } catch {
    return null
  }
}
