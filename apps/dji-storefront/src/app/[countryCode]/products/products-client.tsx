"use client"

import { useMemo, useState } from "react"
import { Search, Filter, Grid, List, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StorefrontProduct, ProductCategory } from "@/lib/data/products"
import { ProductCard } from "@/components/products/product-card"

const sortOptions = [
  { value: "name", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
] as const

const PRODUCTS_PER_PAGE = 12

type SortOption = (typeof sortOptions)[number]["value"]

type ViewMode = "grid" | "list"

interface ProductsPageClientProps {
  products: StorefrontProduct[]
  categories: ProductCategory[]
  countryCode: string
}

export function ProductsPageClient({ products, categories, countryCode }: ProductsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("price-high")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.collection === selectedCategory)
    }

    switch (sortBy) {
      case "name":
        filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title))
        break
      case "name-desc":
        filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title))
        break
      case "price-low":
        filtered = [...filtered].sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered = [...filtered].sort((a, b) => b.price - a.price)
        break
      case "newest":
        filtered = [...filtered].sort((a, b) => {
          if (a.isNew && !b.isNew) return -1
          if (!a.isNew && b.isNew) return 1
          return 0
        })
        break
    }

    return filtered
  }, [products, searchQuery, selectedCategory, sortBy])

  // Reset display count when filters change
  const resetDisplayCount = () => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("price-high")
    resetDisplayCount()
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      setDisplayCount((prev) => prev + PRODUCTS_PER_PAGE)
      setIsLoadingMore(false)
    }, 300)
  }

  // Products to display (limited by displayCount)
  const displayedProducts = filteredProducts.slice(0, displayCount)
  const hasMoreProducts = displayCount < filteredProducts.length
  const remainingCount = filteredProducts.length - displayCount

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Hero Section */}
      <section className="bg-neutral-900 text-white py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.aidenlux.com/bg/hero2.jpg')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            All Products
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover our professional flight simulator hardware collection. <br className="hidden sm:block" />
            Engineered for precision, built for pilots.
          </p>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 w-full border-b border-white/5 bg-background-primary/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background-primary/60">
        <div className="container py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden w-full">
              <Button variant="outline" className="w-full justify-between" onClick={() => setShowFilters((prev) => !prev)}>
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters & Sort
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* Filters Content */}
            <div className={`w-full lg:flex lg:items-center lg:gap-4 ${showFilters ? "flex flex-col gap-4" : "hidden"}`}>

              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    resetDisplayCount()
                  }}
                  className="pl-10 bg-background-elevated border-transparent focus:border-brand-blue-500 transition-all"
                />
              </div>

              {/* Category Select */}
              <div className="w-full lg:w-[200px]">
                <Select value={selectedCategory} onValueChange={(value) => {
                  setSelectedCategory(value)
                  resetDisplayCount()
                }}>
                  <SelectTrigger className="bg-background-elevated border-transparent">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Select */}
              <div className="w-full lg:w-[200px]">
                <Select value={sortBy} onValueChange={(value: SortOption) => {
                  setSortBy(value)
                  resetDisplayCount()
                }}>
                  <SelectTrigger className="bg-background-elevated border-transparent">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode & Clear */}
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex bg-background-elevated rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-black" : "text-foreground-muted hover:text-foreground-primary"}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-white shadow-sm text-black" : "text-foreground-muted hover:text-foreground-primary"}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
                {/* Clear Filters (Only show if filters are active) */}
                {(searchQuery || selectedCategory !== "all" || sortBy !== "price-high") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-foreground-muted hover:text-semantic-error">
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container py-12 lg:py-16">
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-foreground-muted">
            Showing <span className="font-medium text-foreground-primary">{displayedProducts.length}</span> of{" "}
            <span className="font-medium text-foreground-primary">{filteredProducts.length}</span> products
            {selectedCategory !== "all" && (
              <span> in <span className="font-medium text-foreground-primary">{categories.find((c) => c.id === selectedCategory)?.title}</span></span>
            )}
          </p>
        </div>

        {displayedProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                : "space-y-6"
            }
          >
            {displayedProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in opacity-0 fill-mode-forwards"
                style={{ animationDelay: `${Math.min(index, 11) * 100}ms` }}
              >
                <ProductCard product={product} viewMode={viewMode} countryCode={countryCode} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-background-secondary/50 rounded-3xl border border-dashed border-border-primary">
            <div className="text-foreground-muted mb-6">
              <Search className="h-16 w-16 mx-auto opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-foreground-primary mb-2">No Products Found</h3>
            <p className="text-foreground-muted mb-8 max-w-md mx-auto">
              We couldn&apos;t find any products matching your search. Try adjusting your filters or search terms.
            </p>
            <Button onClick={clearFilters} variant="outline" className="px-8">
              Clear All Filters
            </Button>
          </div>
        )}

        {hasMoreProducts && (
          <div className="text-center mt-16">
            <Button
              variant="outline"
              size="lg"
              className="px-12"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load More Products ({remainingCount} remaining)</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
