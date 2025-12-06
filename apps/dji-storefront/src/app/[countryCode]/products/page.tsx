import type { Metadata } from "next"
import { getProducts, getProductCategories } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { ProductsPageClient } from "./products-client"

export const metadata: Metadata = {
  title: "Products · Cockpit Simulator",
}

export default async function ProductsPage() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const [products, categories] = await Promise.all([
    getProducts({ countryCode, limit: 100 }),
    getProductCategories(),
  ])
  return <ProductsPageClient products={products} categories={categories} countryCode={countryCode} />
}
