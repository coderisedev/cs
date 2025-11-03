import mockStore from "@/data/mock-store.json"
import { HttpTypes } from "@medusajs/types"

const mockCollections = mockStore.collections as unknown as HttpTypes.StoreCollection[]
const mockProducts = mockStore.products as unknown as HttpTypes.StoreProduct[]
const mockRegions = mockStore.regions as unknown as HttpTypes.StoreRegion[]
const mockCategories = mockStore.categories as unknown as HttpTypes.StoreProductCategory[]

type CollectionQuery = {
  limit?: string
  offset?: string
  handle?: string
}

type ProductQuery = {
  limit: number
  offset: number
  collection_id?: string
}

export const getMockRegions = () => mockRegions

export const getMockRegionById = (id: string) =>
  mockRegions.find((region) => region.id === id) || null

export const getMockRegionByCountry = (countryCode: string) => {
  return (
    mockRegions.find((region) =>
      region.countries?.some((country) => country.iso_2 === countryCode)
    ) || mockRegions[0] || null
  )
}

export const getMockCollections = (
  query: CollectionQuery = {}
): { collections: HttpTypes.StoreCollection[]; count: number } => {
  const limit = Number.parseInt(query.limit || "100", 10)
  const offset = Number.parseInt(query.offset || "0", 10)

  let collections = mockCollections

  if (query.handle) {
    collections = collections.filter((collection) => collection.handle === query.handle)
  }

  const paginated = collections.slice(offset, offset + limit)

  return {
    collections: paginated,
    count: collections.length,
  }
}

export const getMockCollectionByHandle = (
  handle: string
): HttpTypes.StoreCollection | undefined => {
  return mockCollections.find((collection) => collection.handle === handle)
}

export const getMockCollectionById = (
  id: string
): HttpTypes.StoreCollection | undefined => {
  return mockCollections.find((collection) => collection.id === id)
}

export const getMockProducts = (
  query: ProductQuery
): { products: HttpTypes.StoreProduct[]; count: number } => {
  const { limit, offset, collection_id } = query

  let products = mockProducts

  if (collection_id) {
    products = products.filter((product) => product.collection_id === collection_id)
  }

  const paginated = products.slice(offset, offset + limit)

  return {
    products: paginated,
    count: products.length,
  }
}

export const getMockCategories = (
  limit = 100
): HttpTypes.StoreProductCategory[] => {
  return mockCategories.slice(0, limit)
}

export const getMockCategoryByHandle = (
  handle: string
): HttpTypes.StoreProductCategory | undefined => {
  return mockCategories.find((category) => category.handle === handle)
}
