import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getCollectionDetail } from "@/lib/data/collections"
import { listProducts } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { resolveCollectionHeroImage } from "@/lib/util/collections"
import { CollectionProductsClient } from "./collection-products-client"

// Force dynamic rendering to avoid ISR/SSG build-time errors
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; countryCode: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionDetail(handle)
  if (!collection) {
    return {
      title: "Collection · Cockpit Simulator",
    }
  }
  const description = (collection.metadata?.description as string) ?? `Explore ${collection.title} products`
  return {
    title: `${collection.title} · Cockpit Simulator`,
    description,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string; countryCode: string }>
}) {
  const { handle, countryCode } = await params
  const collection = await getCollectionDetail(handle)

  if (!collection) {
    notFound()
  }

  const resolvedCountryCode = countryCode || DEFAULT_COUNTRY_CODE

  let products: Awaited<ReturnType<typeof listProducts>>["response"]["products"] = []
  try {
    const { response } = await listProducts({ countryCode: resolvedCountryCode, collection_id: collection.id, limit: 100 })
    products = response.products
  } catch (error) {
    console.error("Failed to fetch products for collection:", error)
    // Continue with empty products array - page will still render
  }

  const description = (collection.metadata?.description as string) ?? ""
  const heroImage = resolveCollectionHeroImage(collection)

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Hero Section */}
      <div className="relative bg-gray-950 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${heroImage}')` }}
          >
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </div>
        <div className="container relative z-10 text-center space-y-6">
          {/* Breadcrumb */}
          <Link
            href={`/${resolvedCountryCode}/collections`}
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            All Collections
          </Link>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            {collection.title}
          </h1>
          {description && (
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Products */}
      <CollectionProductsClient
        products={products}
        collectionTitle={collection.title ?? "Collection"}
        countryCode={resolvedCountryCode}
      />
    </div>
  )
}
