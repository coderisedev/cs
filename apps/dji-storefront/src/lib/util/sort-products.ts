import { HttpTypes } from "@medusajs/types"

type SortOptions = "price-low" | "price-high" | "name" | "rating" | "newest" | "created_at"

export const sortProducts = (products: HttpTypes.StoreProduct[], sortBy: SortOptions) => {
  switch (sortBy) {
    case "price-low":
      return [...products].sort((a, b) => (a.price?.calculated_price ?? 0) - (b.price?.calculated_price ?? 0))
    case "price-high":
      return [...products].sort((a, b) => (b.price?.calculated_price ?? 0) - (a.price?.calculated_price ?? 0))
    case "name":
      return [...products].sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""))
    case "rating":
      return [...products].sort((a, b) => (b.metadata?.rating ?? 0) - (a.metadata?.rating ?? 0))
    case "newest":
      return [...products].sort((a, b) =>
        new Date(b.created_at ?? b.updated_at ?? 0).valueOf() - new Date(a.created_at ?? a.updated_at ?? 0).valueOf()
      )
    default:
      return products
  }
}
