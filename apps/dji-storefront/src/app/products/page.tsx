import type { Metadata } from "next"
import { getProducts, getProductCategories } from "@/lib/data/products"
import { ProductsPageClient } from "./products-client"

export const metadata: Metadata = {
  title: "Products · DJI Storefront",
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getProductCategories()])
  return <ProductsPageClient products={products} categories={categories} />
}
