import { HttpTypes } from "@medusajs/types"

type SortOptions = "price-low" | "price-high" | "name" | "rating" | "newest" | "created_at"

export const sortProducts = (products: HttpTypes.StoreProduct[], sortBy: SortOptions) => {
  const getPrice = (product: HttpTypes.StoreProduct) => {
    const variant = product.variants?.[0] as any
    return variant?.calculated_price?.calculated_amount ?? 0
  }

  switch (sortBy) {
    case "price-low":
      return [...products].sort((a, b) => getPrice(a) - getPrice(b))
    case "price-high":
      return [...products].sort((a, b) => getPrice(b) - getPrice(a))
    case "name":
      return [...products].sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""))
    case "rating":
      return [...products].sort((a, b) => ((b.metadata?.rating as number) ?? 0) - ((a.metadata?.rating as number) ?? 0))
    case "newest":
      return [...products].sort((a, b) =>
        new Date(b.created_at ?? b.updated_at ?? 0).valueOf() - new Date(a.created_at ?? a.updated_at ?? 0).valueOf()
      )
    default:
      return products
  }
}
