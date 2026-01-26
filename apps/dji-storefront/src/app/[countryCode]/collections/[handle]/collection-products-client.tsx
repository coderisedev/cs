"use client"

import { useMemo, useState } from "react"
import { Search, Grid, List, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StorefrontProduct } from "@/lib/data/products"
import { ProductCard } from "@/components/products/product-card"

const sortOptions = [
  { value: "name", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
] as const

const PRODUCTS_PER_PAGE = 12

type SortOption = (typeof sortOptions)[number]["value"]

type ViewMode = "grid" | "list"

interface CollectionProductsClientProps {
  products: StorefrontProduct[]
  collectionTitle: string
  countryCode: string
}

export function CollectionProductsClient({
  products,
  collectionTitle,
  countryCode,
}: CollectionProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("price-high")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const filteredProducts = useMemo(() => {
    let filtered = products

    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
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
    }

    return filtered
  }, [products, searchQuery, sortBy])

  const resetDisplayCount = () => {
    setDisplayCount(PRODUCTS_PER_PAGE)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSortBy("price-high")
    resetDisplayCount()
  }

  const handleLoadMore = () => {
    setIsLoadingMore(true)
    setTimeout(() => {
      setDisplayCount((prev) => prev + PRODUCTS_PER_PAGE)
      setIsLoadingMore(false)
    }, 300)
  }

  const displayedProducts = filteredProducts.slice(0, displayCount)
  const hasMoreProducts = displayCount < filteredProducts.length
  const remainingCount = filteredProducts.length - displayCount

  return (
    <div className="container py-12 lg:py-16">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
        {/* Search */}
        <div className="relative w-full sm:w-auto sm:min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            type="text"
            placeholder={`Search in ${collectionTitle}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              resetDisplayCount()
            }}
            className="pl-10 bg-background-elevated border-transparent focus:border-brand-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Sort Select */}
          <div className="flex-1 sm:w-[180px]">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => {
                setSortBy(value)
                resetDisplayCount()
              }}
            >
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

          {/* View Mode */}
          <div className="flex bg-background-elevated rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white shadow-sm text-black"
                  : "text-foreground-muted hover:text-foreground-primary"
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white shadow-sm text-black"
                  : "text-foreground-muted hover:text-foreground-primary"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Clear Filters */}
          {(searchQuery || sortBy !== "price-high") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-foreground-muted hover:text-semantic-error"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Product Count */}
      <div className="flex justify-between items-center mb-8">
        <p className="text-sm text-foreground-muted">
          Showing <span className="font-medium text-foreground-primary">{displayedProducts.length}</span> of{" "}
          <span className="font-medium text-foreground-primary">{filteredProducts.length}</span> products
        </p>
      </div>

      {/* Product Grid */}
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
            We couldn&apos;t find any products matching your search in this collection.
          </p>
          <Button onClick={clearFilters} variant="outline" className="px-8">
            Clear Search
          </Button>
        </div>
      )}

      {/* Load More */}
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
  )
}
