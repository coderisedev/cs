import { ArrowRight, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { products, collections } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'
import { CollectionCard } from '@/components/home/CollectionCard'
import { Newsletter } from '@/components/home/Newsletter'
import { Testimonials } from '@/components/home/Testimonials'

export function HomePage() {
  const featuredProducts = products.filter((p) => p.collection === 'featured').slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">Professional Flight Simulation Hardware</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent animate-fade-in">
              Build Your Dream Cockpit
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in">
              Authentic aircraft controls and panels for serious flight simulation enthusiasts. 
              Compatible with MSFS 2024, X-Plane 12, and Prepar3D.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Shop All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/collections/featured">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Collections Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Aircraft</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find authentic cockpit hardware for your favorite aircraft
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-gray-600">Best-selling cockpit hardware</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
