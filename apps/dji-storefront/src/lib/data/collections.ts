"use server"

import { sdk } from "@/lib/medusa"
import { getCacheOptions } from "@/lib/server/cookies"
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

  const { collections, count } = await sdk.client.fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
    "/store/collections",
    {
      method: "GET",
      query,
      next,
      cache: "force-cache",
    }
  )

  return { collections, count }
}

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions(`collections-${id}`)),
  }

  const { collection } = await sdk.client.fetch<{ collection: HttpTypes.StoreCollection }>(
    `/store/collections/${id}`,
    {
      method: "GET",
      next,
      cache: "force-cache",
    }
  )

  return collection
}

export const getCollectionByHandle = async (handle: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  const { collections } = await sdk.client.fetch<{ collections: HttpTypes.StoreCollection[] }>(
    `/store/collections`,
    {
      method: "GET",
      query: { handle },
      next,
      cache: "force-cache",
    }
  )

  return collections[0] ?? null
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

  if (!includeProducts) {
    return collections.map((collection) => ({ ...collection, products: undefined }))
  }

  return collections
}

export const getCollectionDetail = async (handle: string) => {
  try {
    return await getCollectionByHandle(handle)
  } catch {
    return null
  }
}
