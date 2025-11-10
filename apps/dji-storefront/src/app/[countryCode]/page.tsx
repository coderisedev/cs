import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star, Shield, Zap, Headphones } from "lucide-react"
import { getProducts } from "@/lib/data/products"
import { getCollections } from "@/lib/data/collections"
import { resolveCollectionHeroImage, resolveCollectionHighlight } from "@/lib/util/collections"
import { ProductCard } from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Reveal } from "@/components/reveal"
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants"

const heroImage = "https://img.aidenlux.com/medusa-uploads/hero.jpg"

const testimonials = [
  {
    quote:
      "The cockpit hardware quality is exceptional. Every interaction feels like the real aircraft, making our training sessions more effective.",
    author: "Captain Sarah Johnson",
    role: "Airbus Training Lead",
  },
  {
    quote:
      "Setup was plug-and-play. We were airborne in minutes and the DJI styling brings a premium polish to every panel.",
    author: "Michael Chen",
    role: "Home Simulator Builder",
  },
  {
    quote:
      "Our students love the tactile realism. The panels integrate perfectly with MSFS and X-Plane with zero scripting.",
    author: "Emily Watson",
    role: "Flight School Director",
  },
]

export default async function HomePage() {
  const countryCode = DEFAULT_COUNTRY_CODE
  const [allProducts, collections] = await Promise.all([
    getProducts({ countryCode }),
    getCollections({ limit: 3, includeProducts: true }),
  ])

  const featuredProducts = allProducts.filter((product) => product.collection === "featured").slice(0, 8)

  return (
    <div className="min-h-screen">
      <section className="relative flex min-h-[620px] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={heroImage} alt="Flight Simulator Cockpit" fill className="object-cover" priority />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        </div>
        <div className="container relative z-10 space-y-8 text-white py-20 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm text-sm font-medium tracking-[0.3em] uppercase">
            <Star className="h-4 w-4 text-semantic-warning fill-semantic-warning" />
            <span className="text-sm font-medium">Professional Flight Simulator Hardware</span>
          </div>
          <div className="space-y-6 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold leading-tight tracking-[-0.02em]">
              Build Your <span className="block text-gradient">Dream Cockpit</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/85">
              Authentic aviation control panels and equipment designed for serious flight simulation enthusiasts.
              <span className="mt-2 block text-base sm:text-lg text-white/70">Compatible with MSFS 2024, X-Plane 12, and Prepar3D.</span>
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/products">
              <Button size="lg" className="btn-primary text-white px-8 py-4 text-base font-semibold">
                Configure Your Cockpit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/collections/featured">
              <Button size="lg" variant="outline" className="border-white/60 text-white hover:bg-white/10 px-8 py-4 text-base font-semibold">
                Explore Pilot Favorites
              </Button>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-semantic-success" />
              <span className="text-sm font-medium">Official Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary-400" />
              <span className="text-sm font-medium">Plug &amp; Play</span>
            </div>
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-semantic-warning" />
              <span className="text-sm font-medium">Expert Support</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80">
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-sm mb-2">Scroll Down</span>
            <div className="h-10 w-6 rounded-full border-2 flex justify-center">
              <div className="mt-2 h-3 w-1 rounded-full bg-white/80" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background-primary py-16 sm:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Our Products?</h2>
            <p className="text-lg text-foreground-secondary">
              We provide the most professional flight simulator hardware for an authentic flying experience.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {["Professional Quality", "Plug & Play", "Expert Support"].map((title, index) => {
              const Icon = [Shield, Zap, Headphones][index]
              const colors = ["bg-primary-500", "bg-semantic-success", "bg-semantic-warning"]
              return (
                <div key={title} className="text-center group">
                  <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${colors[index]} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-foreground-secondary">
                    {
                      [
                        "Manufactured with aircraft-grade materials for durability and reliability",
                        "No complex installation required – simply connect via USB and start flying",
                        "Professional technical support and customer service to ensure your experience",
                      ][index]
                    }
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-background-secondary py-12 md:py-16 lg:py-20">
        <Reveal className="container space-y-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-foreground-secondary">Our most popular professional flight simulator hardware.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} countryCode={countryCode} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/products">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="bg-background-primary py-12 md:py-16 lg:py-20">
        <Reveal className="container space-y-12">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Product Collections</h2>
            <p className="text-lg text-foreground-secondary">Browse our professional flight simulator hardware by series.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {collections.map((collection) => {
              const description = (collection.metadata?.description as string) ?? ""
              return (
                <Card key={collection.handle} tone="elevated" className="overflow-hidden">
                  <div className="relative h-56 w-full">
                    <Image src={resolveCollectionHeroImage(collection)} alt={collection.title} fill className="object-cover" />
                    <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-sm uppercase tracking-widest text-white/70">{resolveCollectionHighlight(collection)}</p>
                      <h3 className="text-2xl font-semibold">{collection.title}</h3>
                      {description && <p className="text-sm text-white/80">{description}</p>}
                    </div>
                  </div>
                  <CardContent className="flex items-center justify-between">
                    <div className="text-sm text-foreground-secondary">{collection.products?.length ?? 0} featured items</div>
                    <Link href={`/collections/${collection.handle}`} className="text-primary-500 text-sm font-medium">
                      View Collection →
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Reveal>
      </section>

      <section className="bg-background-secondary py-12 md:py-16 lg:py-20">
        <Reveal className="container space-y-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Pilots Say</h2>
            <p className="text-lg text-foreground-secondary">Testimonials from professionals using our hardware daily.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} tone="elevated" className="h-full bg-background-primary">
                <CardContent className="space-y-4 p-6">
                  <p className="text-lg text-foreground-secondary">“{testimonial.quote}”</p>
                  <div>
                    <p className="font-semibold text-foreground-primary">{testimonial.author}</p>
                    <p className="text-sm text-foreground-muted">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-background-primary py-12 md:py-16 lg:py-20">
        <Reveal className="container">
          <div className="rounded-3xl bg-background-secondary p-8 md:p-12 shadow-card grid gap-8 md:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-500 mb-2">Newsletter</p>
              <h2 className="text-3xl font-bold text-foreground-primary mb-4">Stay Updated with New Releases</h2>
              <p className="text-foreground-secondary">
                Subscribe for exclusive previews, installation guides, and simulator best practices tailored to DJI&apos;s design system.
              </p>
            </div>
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="rounded-full border border-border-primary px-6 py-3"
              />
              <Button size="lg" className="rounded-full">
                Subscribe
              </Button>
            </form>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
