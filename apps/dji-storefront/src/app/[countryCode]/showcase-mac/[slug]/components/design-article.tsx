"use client"

import { useState } from "react"

interface DesignFeature {
  title: string
  description: string
  image: string
}

interface ColorGallery {
  title: string
  description: string
}

interface Color {
  name: string
  value: string
}

interface Lifestyle {
  images: string[]
  caption: string
}

interface DesignArticleProps {
  sectionTitle: string
  title: string
  description: string
  features: DesignFeature[]
  colorGallery: ColorGallery
  colors: Color[]
  lifestyle: Lifestyle
}

export function DesignArticle({
  sectionTitle,
  title,
  description,
  features,
  colorGallery,
  colors,
  lifestyle
}: DesignArticleProps) {
  const [selectedColor, setSelectedColor] = useState(0)
  const [currentLifestyleImage, setCurrentLifestyleImage] = useState(0)

  return (
    <article className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {sectionTitle}
          </p>
          <h2 className="mb-6 text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
            {title}
          </h2>
        </div>

        {/* Main Animation/Visual */}
        <div className="mb-16">
          <div className="relative mx-auto mb-8 max-w-4xl">
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="mb-4 text-7xl">🚁</div>
                <p className="text-sm text-gray-500">Design Animation</p>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-gray-700">{description}</p>
          </div>
        </div>

        {/* Design Features */}
        <div className="mb-20 grid gap-16 md:grid-cols-2">
          {features.map((feature, index) => (
            <div key={index} className="space-y-6">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-2 text-5xl">📐</div>
                    <p className="text-xs text-gray-500">Feature Image</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-3 text-2xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-gray-700">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Color Gallery */}
        <div className="mb-20">
          <div className="mb-8 text-center">
            <h3 className="mb-3 text-3xl font-semibold text-gray-900">
              {colorGallery.title}
            </h3>
            <p className="text-base text-gray-700">{colorGallery.description}</p>
          </div>

          {/* Color Picker */}
          <div className="mb-8 flex justify-center gap-4">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(index)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  selectedColor === index
                    ? "border-blue-600 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full ${
                    color.value === "grey" ? "bg-gray-400" : "bg-gray-100"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Color Display */}
          <div className="relative mx-auto max-w-5xl">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-2xl bg-gray-100"
                >
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-2 text-4xl">🎨</div>
                      <p className="text-xs text-gray-500">Color View {i}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lifestyle Gallery */}
        <div className="relative">
          <div className="relative mx-auto max-w-4xl">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl">📸</div>
                  <p className="text-sm font-medium text-gray-700">{lifestyle.caption}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setCurrentLifestyleImage((prev) =>
                    prev > 0 ? prev - 1 : lifestyle.images.length - 1
                  )
                }
                className="rounded-full bg-gray-200 p-3 hover:bg-gray-300 transition-colors"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setCurrentLifestyleImage((prev) =>
                    prev < lifestyle.images.length - 1 ? prev + 1 : 0
                  )
                }
                className="rounded-full bg-gray-200 p-3 hover:bg-gray-300 transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
