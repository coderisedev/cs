import Link from "next/link"
import Image from "next/image"
import { getCollections } from "@/lib/data/collections"

export const metadata = {
  title: "Collections · DJI Storefront",
}

export default async function CollectionsPage() {
  const collections = await getCollections({ includeProducts: true })

  return (
    <div className="container py-16 space-y-10">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">All collections</p>
        <h1 className="text-4xl font-semibold">Curated cockpit kits</h1>
        <p className="max-w-2xl mx-auto text-foreground-secondary">
          Explore themed bundles for Airbus, Boeing, and accessory-focused setups.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {collections.map((collection) => (
          <article key={collection.handle} className="rounded-3xl border border-border-primary overflow-hidden bg-background-secondary">
            <div className="relative h-60 w-full">
              <Image src={collection.heroImage} alt={collection.title} fill className="object-cover" />
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs uppercase tracking-widest text-foreground-muted">{collection.highlight}</p>
              <h2 className="text-2xl font-semibold text-foreground-primary">
                <Link href={`/collections/${collection.handle}`}>{collection.title}</Link>
              </h2>
              <p className="text-sm text-foreground-secondary">{collection.description}</p>
              {"products" in collection && collection.products.length > 0 && (
                <p className="text-xs text-foreground-muted">
                  Includes {collection.products.length} featured products
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
