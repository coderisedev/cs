import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import FeaturedCollections from "@modules/home/components/featured-collections"
import FeaturedProducts from "@modules/home/components/featured-products"
import WhyChooseUs from "@modules/home/components/why-choose-us"
import Testimonials from "@modules/home/components/testimonials"
import Newsletter from "@modules/home/components/newsletter"
import NewReleaseHighlight from "@modules/home/components/new-release-highlight"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { getLatestNewRelease } from "@lib/data/new-release"

export const metadata: Metadata = {
  title: "Home - Premium E-commerce Store",
  description:
    "Discover premium quality products with fast delivery and exceptional service. Shop our curated collections today.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const regionPromise = getRegion(countryCode)
  const [collectionsResult, newReleaseData, region] = await Promise.all([
    listCollections(),
    getLatestNewRelease(),
    regionPromise,
  ])

  const { collections } = collectionsResult

  const normalizedCountry = countryCode?.toLowerCase()
  const releaseForRegion =
    newReleaseData && newReleaseData.regions.length && normalizedCountry
      ? newReleaseData.regions.includes(normalizedCountry)
        ? newReleaseData
        : null
      : newReleaseData

  if (!collections || !region) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* New Release */}
      <NewReleaseHighlight release={releaseForRegion} />
      
      {/* Features Section */}
      <WhyChooseUs />
      
      {/* Collections Grid */}
      <FeaturedCollections collections={collections} />
      
      {/* Featured Products */}
      <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <FeaturedProducts collections={collections} region={region} />
      </section>
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Newsletter */}
      <Newsletter />
    </div>
  )
}
