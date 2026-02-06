import type { Metadata } from "next"
import { getProducts, getCollectionsWithProducts } from "@/lib/data/products"
import { ProductsPageClient } from "./products-client"

export const metadata: Metadata = {
  title: "Products · Cockpit Simulator",
}

type ProductsPageProps = {
  params: Promise<{ countryCode: string }>
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { countryCode } = await params
  const [products, collectionsWithProducts] = await Promise.all([
    getProducts({ countryCode, limit: 100 }),
    getCollectionsWithProducts(countryCode),
  ])
  return (
    <ProductsPageClient
      products={products}
      collectionsWithProducts={collectionsWithProducts}
      countryCode={countryCode}
    />
  )
}
