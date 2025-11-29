"use client"

import { ShoppingCart } from "lucide-react"

interface Accessory {
  name: string
  description: string
  image: string
  price: string
}

interface AccessoriesSectionProps {
  accessories: Accessory[]
}

export function AccessoriesSection({ accessories }: AccessoriesSectionProps) {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Accessories</h2>
          <p className="text-xl text-gray-400">Pro pairings.</p>
        </div>

        {/* Accessories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accessories.map((accessory, index) => (
            <div
              key={index}
              className="group bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all"
            >
              {/* Image Placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-8xl opacity-20 group-hover:opacity-30 transition-opacity">
                  📦
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{accessory.name}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {accessory.description}
                </p>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-400">
                    {accessory.price}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-semibold">Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold"
          >
            Shop all accessories
            <span className="text-xl">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
