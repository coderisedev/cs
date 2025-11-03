import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { collections } from '@/data/products'

export default function CollectionsPage() {
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
            <span className="text-foreground">Collections</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <section className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-12 sm:py-16 md:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="mobile-container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">Curated Collections</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Shop by Aircraft Series
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover authentic cockpit hardware organized by aircraft type. 
              Each collection features professional-grade panels and controls.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Collections Grid */}
      <section className="py-12 sm:py-16 md:py-24">
        <div className="mobile-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.handle}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3] mb-4 shadow-sm group-hover:shadow-lg transition-all duration-300">
                  <img
                    src={collection.image}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-200 transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {collection.description}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-gray-800">
                        {collection.productCount} products
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{collection.productCount} products</span>
                      <span>•</span>
                      <span>Professional Grade</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="mobile-container">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Shop by Collection?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Each collection is carefully curated to provide authentic hardware for specific aircraft types
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Authentic Design</h3>
              <p className="text-sm text-gray-600">
                Exact replicas based on real aircraft specifications
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Complete Systems</h3>
              <p className="text-sm text-gray-600">
                Everything you need for each aircraft type
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Modular Design</h3>
              <p className="text-sm text-gray-600">
                Build your setup piece by piece
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">
                Dedicated customer service for all products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="mobile-container">
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Build Your Cockpit?
            </h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Start with our featured products or browse by aircraft series to find the perfect hardware for your setup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50">
                  View All Products
                </Button>
              </Link>
              <Link href="/collections/featured">
                <Button size="lg" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/20">
                  Featured Collection
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}