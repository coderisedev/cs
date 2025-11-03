import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Filter, Grid, List, Star } from 'lucide-react'
import { products, collections } from '../data/products'
import { ProductCard } from '../components/products/ProductCard'
import { Button } from '../components/ui/button'

export function CollectionPage() {
  const { handle } = useParams<{ handle: string }>()
  
  // Find the collection by handle
  const collection = collections.find(c => c.handle === handle)
  
  // Filter products based on collection
  const collectionProducts = handle === 'a320-series' 
    ? products.filter(product => product.category === 'a320-series')
    : handle === '737-series'
    ? products.filter(product => product.category === '737-series')
    : products.filter(product => product.collection === handle)

  if (!collection) {
    return (
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 text-foreground-primary">Collection Not Found</h1>
          <p className="text-foreground-secondary mb-8">The collection you're looking for doesn't exist.</p>
          <Link to="/collections">
            <Button>Browse All Collections</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Breadcrumb */}
      <div className="border-b border-border-primary bg-background-secondary">
        <div className="container mx-auto px-4 lg:px-12 py-4">
          <nav className="flex items-center space-x-2 text-sm text-foreground-secondary">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/collections" className="hover:text-primary transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-foreground-primary">{collection.title}</span>
          </nav>
        </div>
      </div>

      {/* Collection Header */}
      <section className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-12 sm:py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              to="/collections" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Collections
            </Link>
            
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full mb-4">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">Professional Grade Hardware</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {collection.title}
            </h1>
            
            <p className="text-lg text-foreground-secondary mb-6 max-w-2xl mx-auto">
              {collection.description}
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-foreground-secondary">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>{collectionProducts.length} Products Available</span>
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
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background-primary to-transparent"></div>
      </section>

      {/* Products Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 lg:px-12">
          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <span className="text-sm text-foreground-secondary">
                Showing {collectionProducts.length} products
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
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {collectionProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-background-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground-primary">No products found</h3>
              <p className="text-foreground-secondary mb-4">
                We're constantly adding new products to our {collection.title.toLowerCase()} collection.
              </p>
              <Link to="/products">
                <Button>View All Products</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-background-elevated">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground-primary">
              Why Choose {collection.title}?
            </h2>
            <p className="text-foreground-secondary max-w-2xl mx-auto">
              Professional-grade hardware designed for serious flight simulation enthusiasts
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground-primary">Authentic Design</h3>
              <p className="text-sm text-foreground-secondary">
                Every panel is designed with exact specifications from real aircraft
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground-primary">Modular System</h3>
              <p className="text-sm text-foreground-secondary">
                Build your setup piece by piece with our modular components
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2 text-foreground-primary">Premium Quality</h3>
              <p className="text-sm text-foreground-secondary">
                Aircraft-grade materials and construction for professional use
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Collections */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground-primary">Explore Other Collections</h2>
            <p className="text-foreground-secondary">
              Discover more aircraft series and accessories
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {collections
              .filter((c) => c.handle !== handle)
              .slice(0, 3)
              .map((relatedCollection) => (
                <Link
                  key={relatedCollection.id}
                  to={`/collections/${relatedCollection.handle}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-lg bg-background-elevated aspect-[4/3] mb-3">
                    <img
                      src={relatedCollection.image}
                      alt={relatedCollection.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  </div>
                  <h3 className="font-semibold mb-1 text-foreground-primary group-hover:text-primary transition-colors">
                    {relatedCollection.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary mb-2">
                    {relatedCollection.description}
                  </p>
                  <span className="text-xs text-foreground-muted">
                    {relatedCollection.productCount} products
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}