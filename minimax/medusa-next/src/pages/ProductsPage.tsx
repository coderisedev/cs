import { useState } from 'react'
import { products, categories } from '@/data/products'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, List, SlidersHorizontal } from 'lucide-react'

export function ProductsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Filter products
  let filteredProducts = [...products]
  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p) => selectedCategories.includes(p.category))
  }
  filteredProducts = filteredProducts.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  )

  // Sort products
  switch (sortBy) {
    case 'price-asc':
      filteredProducts.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      filteredProducts.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filteredProducts.sort((a, b) => b.rating - a.rating)
      break
    case 'newest':
      filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      break
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">全部商品</h1>
          <p className="text-gray-600">发现您喜爱的产品</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg p-6 sticky top-20">
              <h3 className="font-bold mb-4">筛选条件</h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">分类</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={category.id} className="ml-2 text-sm cursor-pointer">
                        {category.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">价格区间</h4>
                <Slider
                  min={0}
                  max={2000}
                  step={50}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-3"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>¥{priceRange[0]}</span>
                  <span>¥{priceRange[1]}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedCategories([])
                  setPriceRange([0, 2000])
                }}
              >
                重置筛选
              </Button>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  筛选
                </Button>
                <span className="text-sm text-gray-600">
                  共 {filteredProducts.length} 件商品
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">推荐排序</SelectItem>
                    <SelectItem value="newest">最新上架</SelectItem>
                    <SelectItem value="price-asc">价格从低到高</SelectItem>
                    <SelectItem value="price-desc">价格从高到低</SelectItem>
                    <SelectItem value="rating">评分最高</SelectItem>
                  </SelectContent>
                </Select>
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant={view === 'grid' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setView('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setView('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-gray-600">没有找到符合条件的商品</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategories([])
                    setPriceRange([0, 2000])
                  }}
                >
                  清除筛选条件
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
