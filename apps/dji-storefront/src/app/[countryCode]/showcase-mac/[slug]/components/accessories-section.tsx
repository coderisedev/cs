"use client"

interface Accessory {
  name: string
  description: string
  image: string
  price: string
}

interface AccessoriesSectionProps {
  accessories: Accessory[]
  productName: string
}

export function AccessoriesSection({
  accessories,
  productName
}: AccessoriesSectionProps) {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            ACCESSORIES
          </p>
          <h2 className="mb-4 text-4xl font-semibold text-gray-900 sm:text-5xl">
            Explore {productName} accessories.
          </h2>
          <a href="#" className="text-blue-600 hover:underline">
            Shop all accessories →
          </a>
        </div>

        {/* Accessories Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {accessories.map((accessory, index) => (
            <div key={index} className="group">
              <div className="mb-4 aspect-square overflow-hidden rounded-2xl bg-white shadow-md transition-shadow group-hover:shadow-lg">
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-2 text-6xl">📦</div>
                    <p className="text-xs text-gray-500">{accessory.name}</p>
                  </div>
                </div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{accessory.name}</h3>
              <p className="mb-3 text-sm leading-relaxed text-gray-600">
                {accessory.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">{accessory.price}</span>
                <button className="rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
