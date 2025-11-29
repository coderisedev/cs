"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface Spec {
  label: string
  value: string
}

interface SpecCategory {
  category: string
  specs: Spec[]
}

interface SpecificationsSectionProps {
  specifications: SpecCategory[]
}

export function SpecificationsSection({
  specifications,
}: SpecificationsSectionProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0)

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Technical Specifications
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about the specs.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {specifications.map((category, index) => (
            <div
              key={index}
              className="bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50 overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() =>
                  setExpandedCategory(expandedCategory === index ? null : index)
                }
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
              >
                <h3 className="text-2xl font-bold">{category.category}</h3>
                <ChevronDown
                  className={`w-6 h-6 transition-transform ${
                    expandedCategory === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Category Content */}
              <div
                className={`transition-all duration-300 ${
                  expandedCategory === index
                    ? "max-h-[1000px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-8 pb-6 space-y-4">
                  {category.specs.map((spec, specIndex) => (
                    <div
                      key={specIndex}
                      className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-700/30 last:border-0"
                    >
                      <span className="text-gray-400 mb-1 sm:mb-0">
                        {spec.label}
                      </span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
