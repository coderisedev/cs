'use client'

import { useState } from 'react'
import { products } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

export default function ProductsPage() {
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const categories = [
    { id: 'a320-series', label: 'Airbus A320 Series' },
    { id: '737-series', label: 'Boeing 737 Series' },
    { id: '777-series', label: 'Boeing 777 Series' },
    { id: 'accessories', label: 'Accessories' },
  ]

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
    { value: 'rating', label: 'Highest Rated' },
  ]

  let filteredProducts = products

  // Filter by category
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(p => 
      selectedCategories.includes(p.category)
    )
  }

  // Filter by price
  filteredProducts = filteredProducts.filter(p => 
    p.price >= priceRange[0] && p.price <= priceRange[1]
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            All Products
          </h1>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Browse our complete collection of professional flight simulation hardware
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, category.id])
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category.id))
                        }
                      }}
                    />
                    <Label htmlFor={category.id} className="text-sm cursor-pointer">
                      {category.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4">Price Range</h3>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={1000}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedCategories([])
                setPriceRange([0, 1000])
              }}
            >
              Clear Filters
            </Button>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {sortedProducts.length} of {products.length} products
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
