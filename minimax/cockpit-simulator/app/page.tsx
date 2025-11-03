import Link from 'next/link'
import { ArrowRight, Star, Shield, Zap, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { products, collections } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'
import { CollectionCard } from '@/components/home/CollectionCard'
import { Newsletter } from '@/components/home/Newsletter'
import { Testimonials } from '@/components/home/Testimonials'

export default function HomePage() {
  const featuredProducts = products.filter((p) => p.collection === 'featured').slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-12 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="mobile-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 animate-fade-in">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs sm:text-sm font-medium">Professional Flight Simulation Hardware</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent animate-fade-in">
              Build Your Dream Cockpit
            </h1>
            <p className="text-sm sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 animate-fade-in px-4">
              Authentic aircraft controls and panels for serious flight simulation enthusiasts. 
              Compatible with MSFS 2024, X-Plane 12, and Prepar3D.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center animate-fade-in px-4">
              <Link href="/products">
                <Button size="lg" className="w-full xs:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 touch-target">
                  Shop All Products
                  <ArrowRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link href="/collections/featured">
                <Button size="lg" variant="outline" className="w-full xs:w-auto touch-target">
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 border-b">
        <div className="mobile-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Premium Quality</h3>
                <p className="text-xs sm:text-sm text-gray-600">Professional-grade materials</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Plug & Play</h3>
                <p className="text-xs sm:text-sm text-gray-600">Easy setup and configuration</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Expert Support</h3>
                <p className="text-xs sm:text-sm text-gray-600">Dedicated customer service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="mobile-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Shop by Aircraft</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
              Find authentic cockpit hardware for your favorite aircraft
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="mobile-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-gray-600 text-sm sm:text-base">Best-selling cockpit hardware</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto touch-target">
                View All
                <ArrowRight className="ml-1 sm:ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Newsletter */}
      <Newsletter />
    </div>
  )
}
