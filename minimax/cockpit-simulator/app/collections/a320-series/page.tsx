import Link from 'next/link'
import { ArrowLeft, Filter, Grid, List, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/ProductCard'
import { products, collections } from '@/data/products'

export default function A320SeriesPage() {
  const a320Products = products.filter((product) => product.category === 'a320-series')
  const a320Collection = collections.find((collection) => collection.handle === 'a320-series')

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b bg-background">
        <div className="mobile-container py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-primary transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-foreground">Airbus A320 Series</span>
          </nav>
        </div>
      </div>

      {/* Collection Header */}
      <section className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="mobile-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/collections" className="inline-flex items-center gap-2 text-primary hover:text-primary-600 transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Collections
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">Professional Grade Hardware</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Airbus A320 Series
            </h1>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Complete range of authentic Airbus A320 cockpit panels and controls. 
              From CDU to FCU and overhead panels, build your professional A320 simulator setup.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{a320Products.length} Products Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>Professional Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>MSFS 2024 Compatible</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Products Section */}
      <section className="py-8 sm:py-12">
        <div className="mobile-container">
          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <span className="text-sm text-gray-600">
                Showing {a320Products.length} products
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Grid
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {a320Products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {a320Products.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                We're constantly adding new products to our A320 series collection.
              </p>
              <Link href="/products">
                <Button>View All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="mobile-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose A320 Series?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional-grade hardware designed for serious flight simulation enthusiasts
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Authentic Design</h3>
              <p className="text-sm text-gray-600">
                Every panel is designed with exact specifications from real A320 aircraft
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Modular System</h3>
              <p className="text-sm text-gray-600">
                Build your setup piece by piece with our modular A320 components
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">
                Aircraft-grade materials and construction for professional use
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Collections */}
      <section className="py-12 sm:py-16">
        <div className="mobile-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Explore Other Collections</h2>
            <p className="text-gray-600">
              Discover more aircraft series and accessories
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {collections
              .filter((collection) => collection.handle !== 'a320-series')
              .slice(0, 3)
              .map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.handle}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-[4/3] mb-3">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {collection.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {collection.productCount} products
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}