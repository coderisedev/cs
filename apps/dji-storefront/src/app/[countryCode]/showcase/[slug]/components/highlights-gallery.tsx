"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface Highlight {
  id: string
  title: string
  description: string
  media: string
}

interface HighlightsGalleryProps {
  highlights: Highlight[]
}

export function HighlightsGallery({ highlights }: HighlightsGalleryProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            Get the highlights.
          </h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12 overflow-x-auto">
          <div className="flex gap-4 min-w-max px-4">
            {highlights.map((highlight, index) => (
              <button
                key={highlight.id}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                  activeTab === index
                    ? "bg-white text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {highlight.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {highlights.map((highlight, index) => (
            <div
              key={highlight.id}
              className={`transition-opacity duration-500 ${
                activeTab === index ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
              }`}
            >
              {/* Media Placeholder */}
              <div className="relative w-full max-w-4xl mx-auto mb-8 aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center group">
                <div className="text-8xl opacity-20 group-hover:opacity-30 transition-opacity">
                  🎬
                </div>
                <button className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </button>
              </div>

              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-300 text-center max-w-3xl mx-auto">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeTab === index ? "bg-white w-8" : "bg-gray-600"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
