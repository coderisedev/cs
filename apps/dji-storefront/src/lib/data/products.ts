"use server"

import { sdk } from "@/lib/medusa"
import { getAuthHeaders, getCacheOptions } from "@/lib/server/cookies"
import { getRegion, retrieveRegion } from "@/lib/data/regions"
import { getMockProducts } from "@/lib/data/mock-data"
import { HttpTypes } from "@medusajs/types"
import type { MockProduct, MockProductVariant } from "@cs/medusa-client"

export type StorefrontProductVariant = {
  id: string
  title: string
  price: number
  inStock: boolean
}

export type StorefrontProduct = {
  id: string
  handle: string
  title: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  rating: number
  reviewCount: number
  inStock: boolean
  isNew: boolean
  tags: string[]
  category?: string
  collection?: string
  variants: StorefrontProductVariant[]
}

export type ProductListOptions = HttpTypes.FindParams & HttpTypes.StoreProductListParams & { countryCode?: string; regionId?: string }

export type ProductCategory = {
  id: string
  title: string
}

const categories: ProductCategory[] = [
  { id: "all", title: "All Categories" },
  { id: "a320-series", title: "Airbus A320 Series" },
  { id: "737-series", title: "Boeing 737 Series" },
  { id: "777-series", title: "Boeing 777 Series" },
  { id: "accessories", title: "Accessories & Mounts" },
]

export const getProductCategories = () => categories

export const getProductSummaries = async (options?: ProductListOptions) => {
  const { response } = await listProducts({ limit: 4, ...options })
  return response.products.slice(0, 4)
}

export const getProducts = async (options?: ProductListOptions) => {
  const { response } = await listProducts({ ...options })
  return response.products
}

export const getProductDetail = async (handle: string, countryCode?: string, regionId?: string) => {
  return retrieveProduct(handle, countryCode, regionId)
}

export const listProducts = async ({
  pageParam = 1,
  countryCode,
  regionId,
  ...queryParams
}: ProductListOptions & { pageParam?: number }) => {
  const limit = queryParams.limit ?? 12
  const offset = pageParam === 1 ? 0 : (pageParam - 1) * limit

  const region = await resolveRegion({ countryCode, regionId })

  if (!region) {
    const fallback = getMockProducts({ limit, offset, collection_id: queryParams.collection_id as string | undefined })
    const nextPage = fallback.count > offset + limit ? pageParam + 1 : null
    return { response: mapMockProducts(fallback.products), nextPage }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions("products")),
  }

  try {
    const { products, count } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
      count: number
    }>(`/store/products`, {
      method: "GET",
      query: {
        limit,
        offset,
        region_id: region.id,
        fields: "+variants.inventory_quantity",
        ...queryParams,
      },
      headers,
      next,
      cache: "force-cache",
    })

    const nextPage = count > offset + limit ? pageParam + 1 : null

    return { response: { products: products.map(mapStoreProduct), count }, nextPage }
  } catch {
    const fallback = getMockProducts({ limit, offset, collection_id: queryParams.collection_id as string | undefined })
    const nextPage = fallback.count > offset + limit ? pageParam + 1 : null
    return { response: { products: mapMockProducts(fallback.products), count: fallback.count }, nextPage }
  }
}

export const retrieveProduct = async (handle: string, countryCode?: string, regionId?: string) => {
  const region = await resolveRegion({ countryCode, regionId })

  const headers = {
    ...(await getAuthHeaders()),
  }
  const next = {
    ...(await getCacheOptions(`product-${handle}`)),
  }

  try {
    return await sdk.client
      .fetch<{ product: HttpTypes.StoreProduct }>(`/store/products/${handle}`, {
        method: "GET",
        query: {
          region_id: region?.id,
          fields: "+variants.inventory_quantity",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ product }) => mapStoreProduct(product))
  } catch {
    const fallback = getMockProducts({ limit: 50, offset: 0 }).products.find((product) => product.handle === handle)
    return fallback ? mapMockProduct(fallback) : null
  }
}

const resolveRegion = async ({ countryCode, regionId }: { countryCode?: string; regionId?: string }) => {
  if (countryCode) {
    return (await getRegion(countryCode))
  }
  if (regionId) {
    return await retrieveRegion(regionId)
  }
  return null
}

const mapStoreProduct = (product: HttpTypes.StoreProduct): StorefrontProduct => {
  const priceInMinor = product.price?.calculated_price ?? product.variants?.[0]?.prices?.[0]?.amount ?? 0
  const price = priceInMinor / 100
  const compareAt = product.price?.original_price ? product.price.original_price / 100 : undefined
  const variants: StorefrontProductVariant[] =
    product.variants?.map((variant) => ({
      id: variant.id,
      title: variant.title ?? "Default",
      price: (variant.calculated_price ?? variant.prices?.[0]?.amount ?? priceInMinor) / 100,
      inStock: (variant.inventory_quantity ?? 0) > 0,
    })) ?? []

  const inStock = variants.length ? variants.some((v) => v.inStock) : true

  return {
    id: product.id,
    handle: product.handle ?? product.id,
    title: product.title ?? "Untitled",
    description: product.description ?? "",
    price,
    compareAtPrice: compareAt,
    images: product.thumbnail ? [product.thumbnail] : product.images ?? [],
    rating: (product.metadata?.rating as number) ?? 4.8,
    reviewCount: (product.metadata?.review_count as number) ?? 32,
    inStock,
    isNew: Boolean(product.metadata?.is_new),
    tags: product.tags?.map((tag) => tag.value ?? tag.id ?? "") ?? [],
    category: product.categories?.[0]?.handle,
    collection: product.collection?.handle,
    variants: variants.length ? variants : [{ id: product.id, title: "Standard", price, inStock }],
  }
}

const mapMockProducts = (products: MockProduct[]) => products.map(mapMockProduct)

const mapMockProduct = (product: MockProduct): StorefrontProduct => ({
  id: product.id,
  handle: product.handle,
  title: product.title,
  description: product.description,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  images: product.images,
  rating: product.rating ?? 4.8,
  reviewCount: product.reviewCount ?? 32,
  inStock: product.inStock ?? true,
  isNew: product.isNew ?? false,
  tags: product.tags ?? [],
  category: product.category,
  collection: product.collection,
  variants: product.variants?.map((variant: MockProductVariant) => ({
    id: variant.id,
    title: variant.title,
    price: variant.price,
    inStock: variant.inStock,
  })) ?? [{ id: product.id, title: "Standard", price: product.price, inStock: product.inStock ?? true }],
})
