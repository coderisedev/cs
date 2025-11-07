import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HttpTypes } from "@medusajs/types"
import { resolveCollectionHeroImage, resolveCollectionHighlight } from "@/lib/util/collections"
import Image from "next/image"

export function CollectionsPreview({ collections }: { collections: HttpTypes.StoreCollection[] }) {
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
            <div className="flex gap-3 items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-base">
                <Image src={resolveCollectionHeroImage(collection)} alt={collection.title} fill className="object-cover" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-foreground-muted">{resolveCollectionHighlight(collection)}</p>
                <p className="text-sm text-foreground-secondary">
                  {collection.products?.length ? `${collection.products.length} products` : "Curated selection"}
                </p>
              </div>
            </div>
            {collection.products && collection.products.length > 0 && (
              <ul className="space-y-1 text-sm text-foreground-primary mt-3">
                {collection.products.slice(0, 3).map((product) => (
                  <li key={product.id}>{product.title}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
