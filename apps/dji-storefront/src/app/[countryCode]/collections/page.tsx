import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { getCollections } from "@/lib/data/collections"
import { resolveCollectionHeroImage } from "@/lib/util/collections"

export const metadata = {
  title: "Collections · Cockpit Simulator",
  description: "Explore our curated cockpit simulator collections for Airbus, Boeing, and accessories.",
}

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await params
  const collections = await getCollections({ includeProducts: true })

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Hero Section */}
      <div className="relative bg-gray-950 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('https://img.aidenlux.com/medusa-uploads/hero.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </div>
        <div className="container relative z-10 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Collections
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Explore our curated cockpit simulator bundles. <br className="hidden sm:block" />
            Find the perfect setup for your flight simulation needs.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="container py-12 lg:py-16">
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-foreground-muted">
            Showing <span className="font-medium text-foreground-primary">{collections.length}</span> collections
          </p>
        </div>

        {collections.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2">
            {collections.map((collection, index) => {
              const description = (collection.metadata?.description as string) ?? ""
              const productCount = "products" in collection && collection.products ? collection.products.length : 0

              return (
                <Link
                  key={collection.handle}
                  href={`/${countryCode}/collections/${collection.handle}`}
                  className="group animate-fade-in opacity-0 fill-mode-forwards"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <article className="rounded-2xl border border-border-primary overflow-hidden bg-background-primary transition-all duration-300 hover:border-brand-blue-500/50 hover:shadow-lg">
                    {/* Image */}
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={resolveCollectionHeroImage(collection)}
                        alt={collection.title ?? "Collection"}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Product count badge */}
                      {productCount > 0 && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full">
                          {productCount} {productCount === 1 ? "Product" : "Products"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-foreground-primary group-hover:text-brand-blue-500 transition-colors">
                          {collection.title}
                        </h2>
                        <ArrowRight className="h-5 w-5 text-foreground-muted group-hover:text-brand-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>

                      {description && (
                        <p className="text-sm text-foreground-secondary line-clamp-2">
                          {description}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-background-secondary/50 rounded-3xl border border-dashed border-border-primary">
            <h3 className="text-xl font-bold text-foreground-primary mb-2">No Collections Found</h3>
            <p className="text-foreground-muted mb-8 max-w-md mx-auto">
              Collections are being prepared. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
