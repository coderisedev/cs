import type { MockProduct } from "@cs/medusa-client"
import { ProductCard } from "./product-card"

export function ProductGrid({ products }: { products: MockProduct[] }) {
  if (!products.length) {
    return <p className="text-foreground-secondary">No products found.</p>
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
