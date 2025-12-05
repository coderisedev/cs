"use client"

import { useState } from "react"

interface Feature {
  id: string
  name: string
  description: string
  demo: string
}

interface Privacy {
  title: string
  body: string
}

interface IntelligentFeaturesArticleProps {
  sectionTitle: string
  title: string
  subtitle: string
  description: string
  features: Feature[]
  privacy: Privacy
}

export function IntelligentFeaturesArticle({
  sectionTitle,
  title,
  subtitle,
  description,
  features,
  privacy
}: IntelligentFeaturesArticleProps) {
  const [activeFeature, setActiveFeature] = useState(0)

  return (
    <article className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {sectionTitle}
          </p>
          <h2 className="mb-4 text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
            {title}
          </h2>
          <p className="mb-6 text-xl text-gray-700">{subtitle}</p>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600">
            {description}
          </p>
        </div>

        {/* Features Tabs */}
        <div className="mb-16">
          <div className="mb-8 flex justify-center gap-4 border-b border-gray-200">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeFeature === index
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {feature.name}
              </button>
            ))}
          </div>

          {/* Feature Content */}
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex items-center justify-center">
              <div className="aspect-video w-full max-w-lg overflow-hidden rounded-2xl bg-gray-100">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mb-4 text-6xl">🤖</div>
                    <p className="text-sm text-gray-500">Feature Demo</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-lg leading-relaxed text-gray-700">
                {features[activeFeature].description}
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="rounded-3xl bg-gray-900 p-12 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="mb-6 text-3xl font-semibold">{privacy.title}</h3>
            <p className="text-base leading-relaxed text-gray-300">{privacy.body}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
