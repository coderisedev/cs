"use client"

import { useState } from "react"

interface CameraSystem {
  id: string
  name: string
  description: string
  specs: string[]
  demo: string
}

interface GalleryItem {
  title: string
  description: string
  image: string
}

interface CameraArticleProps {
  sectionTitle: string
  title: string
  systems: CameraSystem[]
  gallery: GalleryItem[]
}

export function CameraArticle({
  sectionTitle,
  title,
  systems,
  gallery
}: CameraArticleProps) {
  const [activeSystem, setActiveSystem] = useState(0)
  const [activeGalleryItem, setActiveGalleryItem] = useState(0)

  return (
    <article className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {sectionTitle}
          </p>
          <h2 className="text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
            {title}
          </h2>
        </div>

        {/* Camera Systems Tabs */}
        <div className="mb-20">
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {systems.map((system, index) => (
              <button
                key={system.id}
                onClick={() => setActiveSystem(index)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  activeSystem === index
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {system.name}
              </button>
            ))}
          </div>

          {/* System Details */}
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex items-center justify-center">
              <div className="aspect-video w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-lg">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 text-7xl">📷</div>
                    <p className="text-sm text-gray-500">Camera Demo</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <h3 className="text-3xl font-semibold text-gray-900">
                {systems[activeSystem].name}
              </h3>
              <p className="text-base leading-relaxed text-gray-700">
                {systems[activeSystem].description}
              </p>
              <ul className="space-y-3">
                {systems[activeSystem].specs.map((spec, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-blue-600">✓</span>
                    {spec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <div className="relative mx-auto max-w-5xl">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-8xl">🖼️</div>
                  <h4 className="mb-2 text-xl font-semibold text-gray-900">
                    {gallery[activeGalleryItem].title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {gallery[activeGalleryItem].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery Navigation */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setActiveGalleryItem((prev) => (prev > 0 ? prev - 1 : gallery.length - 1))
                }
                className="rounded-full bg-white p-3 shadow-md hover:bg-gray-50 transition-colors"
                disabled={gallery.length <= 1}
              >
                ←
              </button>
              <div className="flex gap-2">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveGalleryItem(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      activeGalleryItem === index ? "bg-blue-600 w-6" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setActiveGalleryItem((prev) => (prev < gallery.length - 1 ? prev + 1 : 0))
                }
                className="rounded-full bg-white p-3 shadow-md hover:bg-gray-50 transition-colors"
                disabled={gallery.length <= 1}
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
