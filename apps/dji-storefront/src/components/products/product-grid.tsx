import type { StorefrontProduct } from "@/lib/data/products"
import { ProductCard } from "./product-card"

export function ProductGrid({ products, countryCode }: { products: StorefrontProduct[]; countryCode: string }) {
  if (!products.length) {
    return <p className="text-foreground-secondary">No products found.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode="grid" countryCode={countryCode} />
      ))}
    </div>
  )
}
