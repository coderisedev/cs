import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import FeaturedCollections from "@modules/home/components/featured-collections"
import FeaturedProducts from "@modules/home/components/featured-products"
import WhyChooseUs from "@modules/home/components/why-choose-us"
import Testimonials from "@modules/home/components/testimonials"
import Newsletter from "@modules/home/components/newsletter"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

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

  const region = await getRegion(countryCode)

  // TODO: The fields parameter causes issues with the Medusa backend
  // const { collections } = await listCollections({ fields: "id, handle, title" })
  const { collections } = await listCollections()

  if (!collections || !region) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
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
