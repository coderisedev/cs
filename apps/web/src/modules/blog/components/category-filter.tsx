"use client"

interface CategoryFilterProps {
  categories: string[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const allCategories = ["All", ...categories]

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max px-1 py-2">
        {allCategories.map((category) => {
          const isActive = activeCategory === category
          
          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "bg-background-secondary text-foreground-secondary hover:bg-background-tertiary hover:text-foreground-primary"
              }`}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}
