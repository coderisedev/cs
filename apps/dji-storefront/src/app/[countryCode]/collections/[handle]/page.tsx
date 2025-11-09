import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionDetail, getCollections } from "@/lib/data/collections"
import { listProducts } from "@/lib/data/products"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"
import { ProductGrid } from "@/components/products/product-grid"

export async function generateStaticParams() {
  const collections = await getCollections()
  return collections.map((collection) => ({ handle: collection.handle }))
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionDetail(handle)
  if (!collection) {
    return {
      title: "Collection · DJI Storefront",
    }
  }
  const description = (collection.metadata?.description as string) ?? ""
  return {
    title: `${collection.title} · DJI Storefront`,
    description,
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  const collection = await getCollectionDetail(handle)

  if (!collection) {
    notFound()
  }

  const countryCode = DEFAULT_COUNTRY_CODE
  const { response } = await listProducts({ countryCode, collection_id: collection.id })
  const products = response.products

  const description = (collection.metadata?.description as string) ?? ""

  return (
    <div className="container py-16 space-y-10">
      <section className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-widest text-foreground-muted">Collection</p>
        <h1 className="text-4xl font-semibold">{collection.title}</h1>
        {description && <p className="max-w-2xl mx-auto text-foreground-secondary">{description}</p>}
      </section>

      <ProductGrid products={products} countryCode={countryCode} />
    </div>
  )
}
