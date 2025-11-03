import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default function FeaturedCollections({
  collections,
}: {
  collections: HttpTypes.StoreCollection[]
}) {
  // Show first 6 collections
  const featuredCollections = collections.slice(0, 6)

  if (!featuredCollections.length) {
    return null
  }

  return (
    <section className="py-12 sm:py-16 md:py-24">
      <div className="mobile-container">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Shop by Aircraft
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Find authentic cockpit hardware for your favorite aircraft
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredCollections.map((collection) => (
            <LocalizedClientLink
              key={collection.id}
              href={`/collections/${collection.handle}`}
            >
              <div className="group overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-lg border border-gray-200">
                <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
                  {collection.metadata?.image_url ? (
                    <Image
                      src={collection.metadata.image_url as string}
                      alt={collection.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">
                      {collection.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/90 mb-2 sm:mb-3 line-clamp-2">
                      {collection.metadata?.description as string || "Explore our collection"}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium">
                      <span>
                        Explore {collection.products?.length || 0} products
                      </span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
