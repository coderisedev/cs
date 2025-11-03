import { useState, useMemo } from 'react'
import { Search, Filter, Grid, List, ChevronDown } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ProductCard } from '../components/products/ProductCard'
import { products, categories } from '../data/products'
import type { Product } from '../types'

type SortOption = 'featured' | 'price-low' | 'price-high' | 'name' | 'rating' | 'newest'
type ViewMode = 'grid' | 'list'

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('featured')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered = [...filtered].sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered = [...filtered].sort((a, b) => b.price - a.price)
        break
      case 'name':
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rating':
        filtered = [...filtered].sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered = [...filtered].sort((a, b) => {
          if (a.isNew && !b.isNew) return -1
          if (!a.isNew && b.isNew) return 1
          return 0
        })
        break
      default: // featured
        filtered = [...filtered].sort((a, b) => {
          // Featured products first, then by rating
          if (a.collection === 'featured' && b.collection !== 'featured') return -1
          if (a.collection !== 'featured' && b.collection === 'featured') return 1
          return b.rating - a.rating
        })
    }

    return filtered
  }, [searchQuery, selectedCategory, sortBy])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSortBy('featured')
  }

  return (
    <div className="container mx-auto px-4 lg:px-12 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground-primary transition-colors duration-300">All Products</h1>
        <p className="text-foreground-secondary text-base transition-colors duration-300">
          Discover our professional flight simulator hardware collection
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-background-secondary rounded-md shadow-card p-6 mb-6">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full touch-target"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters & Sort
            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Search and Controls */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
          {/* Search */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-muted h-4 w-4 transition-colors duration-300" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 touch-target bg-background-elevated border-border-primary text-foreground-primary placeholder:text-foreground-muted focus:border-primary-500 focus:ring-primary-500 transition-colors duration-300"
            />
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="touch-target bg-background-elevated border-border-primary text-foreground-primary transition-colors duration-300">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-background-elevated border-border-primary transition-colors duration-300">
                <SelectItem value="all" className="text-foreground-primary focus:bg-background-primary transition-colors duration-300">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-foreground-primary focus:bg-background-primary transition-colors duration-300">
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-3">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="touch-target bg-background-elevated border-border-primary text-foreground-primary transition-colors duration-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-background-elevated border-border-primary transition-colors duration-300">
                <SelectItem value="featured" className="text-neutral-50 focus:bg-background-primary">Featured</SelectItem>
                <SelectItem value="price-low" className="text-neutral-50 focus:bg-background-primary">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="text-neutral-50 focus:bg-background-primary">Price: High to Low</SelectItem>
                <SelectItem value="name" className="text-neutral-50 focus:bg-background-primary">Name</SelectItem>
                <SelectItem value="rating" className="text-neutral-50 focus:bg-background-primary">Rating</SelectItem>
                <SelectItem value="newest" className="text-neutral-50 focus:bg-background-primary">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode and Clear */}
          <div className="lg:col-span-2 flex gap-2">
            <div className="flex border border-border-primary rounded-base transition-colors duration-300">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none touch-target"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none touch-target"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="touch-target"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-foreground-muted transition-colors duration-300">
          Showing {filteredAndSortedProducts.length} products
          {selectedCategory !== 'all' && (
            <span className="ml-1">
              · {categories.find(c => c.id === selectedCategory)?.title}
            </span>
          )}
        </p>
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} viewMode={viewMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-foreground-muted mb-4 transition-colors duration-300">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-foreground-primary mb-2 transition-colors duration-300">No Products Found</h3>
          <p className="text-foreground-muted mb-4 transition-colors duration-300">
            Try adjusting your search criteria or clear the filters
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {filteredAndSortedProducts.length > 0 && filteredAndSortedProducts.length >= 12 && (
        <div className="text-center mt-8">
          <Button variant="outline" className="touch-target">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  )
}