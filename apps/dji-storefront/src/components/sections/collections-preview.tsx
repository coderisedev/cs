import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MockCollectionWithProducts } from "@cs/medusa-client"
import { currencyFormatter } from "@/lib/number"

export function CollectionsPreview({ collections }: { collections: MockCollectionWithProducts[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {collections.map((collection) => (
        <Card key={collection.handle} className="border-border-primary">
          <CardHeader>
            <p className="text-xs uppercase tracking-widest text-foreground-muted">Collection</p>
            <CardTitle>{collection.title}</CardTitle>
            <CardDescription>{collection.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-secondary mb-2">Sample products</p>
            <ul className="space-y-1 text-sm text-foreground-primary">
              {collection.products.slice(0, 3).map((product) => (
                <li key={product.id}>
                  {product.title} · {currencyFormatter(product.price)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
