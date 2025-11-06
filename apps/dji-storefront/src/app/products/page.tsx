import type { Metadata } from "next"
import { getProducts } from "@/lib/data/products"
import { getCollections, type CollectionWithProducts } from "@/lib/data/collections"
import { ProductGrid } from "@/components/products/product-grid"
import { CollectionsPreview } from "@/components/sections/collections-preview"

export const metadata: Metadata = {
  title: "Products · DJI Storefront",
}

export default async function ProductsPage() {
  const [products, collections] = await Promise.all([
    getProducts(),
    getCollections({ includeProducts: true, limit: 2 }),
  ])

  const collectionsWithProducts = collections.filter(
    (collection): collection is CollectionWithProducts => "products" in collection
  )

  return (
    <div className="container py-16 space-y-12">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">Full catalogue</p>
        <h1 className="text-4xl font-semibold">Cockpit hardware ready for DJI styling</h1>
        <p className="max-w-2xl mx-auto text-foreground-secondary">
          Browse every simulated panel and accessory from the cockpit simulator reference. Pricing and content are powered
          by the local mock Medusa client until backend integration is ready.
        </p>
      </section>

      <ProductGrid products={products} />

      <section className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">Popular collections</p>
        <CollectionsPreview collections={collectionsWithProducts} />
      </section>
    </div>
  )
}
