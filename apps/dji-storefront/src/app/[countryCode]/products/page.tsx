import type { Metadata } from "next"
import { getProducts, getProductCategories } from "@/lib/data/products"
import { ProductsPageClient } from "./products-client"

export const metadata: Metadata = {
  title: "Products · Cockpit Simulator",
}

type ProductsPageProps = {
  params: Promise<{ countryCode: string }>
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { countryCode } = await params
  const [products, categories] = await Promise.all([
    getProducts({ countryCode, limit: 100 }),
    getProductCategories(),
  ])
  return <ProductsPageClient products={products} categories={categories} countryCode={countryCode} />
}
