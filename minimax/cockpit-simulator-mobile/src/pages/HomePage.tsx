import { Link } from 'react-router-dom'
import { ArrowRight, Star, Shield, Zap, Headphones } from 'lucide-react'
import { Button } from '../components/ui/button'
import { products, collections } from '../data/products'
import { ProductCard } from '../components/products/ProductCard'
import { CollectionCard } from '../components/home/CollectionCard'
import { Newsletter } from '../components/home/Newsletter'
import { Testimonials } from '../components/home/Testimonials'
import { useTheme } from '../contexts/ThemeContext'

export function HomePage() {
  const featuredProducts = products.filter((p) => p.collection === 'featured').slice(0, 8)
  const { isDark } = useTheme()

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen Background */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Flight Simulator Cockpit" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a solid color background if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
          {/* Secondary Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-background-elevated/80 backdrop-blur-md border border-primary-500/30 px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Star className="h-4 w-4 text-semantic-warning fill-semantic-warning" />
              <span className={`text-sm font-medium ${isDark ? 'text-foreground-primary' : 'text-white'}`}>Professional Flight Simulator Hardware</span>
            </div>

            {/* Main Heading */}
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in tracking-tight ${isDark ? 'text-foreground-primary' : 'text-white'}`}>
              Build Your
              <span className="block text-gradient">
                Dream Cockpit
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl leading-relaxed animate-fade-in ${isDark ? 'text-foreground-secondary' : 'text-white/90'}`}>
              Authentic aviation control panels and equipment designed for serious flight simulation enthusiasts.
              <span className={`block mt-2 text-base sm:text-lg ${isDark ? 'text-foreground-muted' : 'text-white/80'}`}>
                Compatible with MSFS 2024, X-Plane 12, and Prepar3D
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Link to="/products">
                <Button 
                  size="lg" 
                  className={`w-full sm:w-auto btn-primary ${!isDark ? 'text-white' : ''}`}
                >
                  Browse All Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/collections/featured">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className={`w-full sm:w-auto ${!isDark ? 'text-white border-white hover:bg-white/10' : ''}`}
                >
                  View Featured Products
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className={`flex flex-wrap items-center gap-6 mt-12 ${isDark ? 'text-foreground-muted' : 'text-white/80'}`}>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-semantic-success" />
                <span className="text-sm font-medium">Official Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary-400" />
                <span className="text-sm font-medium">Plug & Play</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-semantic-warning" />
                <span className="text-sm font-medium">Expert Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce transition-colors duration-300 ${isDark ? 'text-foreground-muted' : 'text-white/80'}`}>
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll Down</span>
            <div className={`w-6 h-10 border-2 rounded-full flex justify-center transition-colors duration-300 ${isDark ? 'border-border-primary' : 'border-white/60'}`}>
              <div className={`w-1 h-3 rounded-full mt-2 animate-pulse transition-colors duration-300 ${isDark ? 'bg-foreground-muted' : 'bg-white/80'}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-background-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground-primary transition-colors duration-300">
              Why Choose Our Products?
            </h2>
            <p className="text-foreground-secondary text-lg max-w-2xl mx-auto transition-colors duration-300">
              We provide the most professional flight simulator hardware for an authentic flying experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow-blue">
                <Shield className="h-8 w-8 text-foreground-primary transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground-primary transition-colors duration-300">Professional Quality</h3>
              <p className="text-foreground-secondary transition-colors duration-300">
                Manufactured with aircraft-grade materials for durability and reliability
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-semantic-success rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-foreground-primary transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground-primary transition-colors duration-300">Plug & Play</h3>
              <p className="text-foreground-secondary transition-colors duration-300">
                No complex installation required - simply connect via USB and start flying
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-semantic-warning rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Headphones className="h-8 w-8 text-foreground-primary transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground-primary transition-colors duration-300">Expert Support</h3>
              <p className="text-foreground-secondary transition-colors duration-300">
                Professional technical support and customer service to ensure your experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 sm:py-20 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground-primary transition-colors duration-300">
              Featured Products
            </h2>
            <p className="text-foreground-secondary text-lg max-w-2xl mx-auto transition-colors duration-300">
              Our most popular professional flight simulator hardware
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline" className="touch-target">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-16 sm:py-20 bg-background-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground-primary transition-colors duration-300">
              Product Collections
            </h2>
            <p className="text-foreground-secondary text-lg max-w-2xl mx-auto transition-colors duration-300">
              Browse our professional flight simulator hardware by series
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  )
}