"use client"

import { Camera, Aperture, Film, Sparkles } from "lucide-react"

interface Feature {
  title: string
  specs: string[]
  icon: string
}

interface FeaturesSectionProps {
  features: Feature[]
}

const iconMap = {
  camera: Camera,
  lens: Aperture,
  video: Film,
  ai: Sparkles,
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Pro results down to the pixel.
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Camera
            
            return (
              <div
                key={index}
                className="group p-8 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all hover:bg-gray-800/50"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                  <IconComponent className="w-8 h-8 text-blue-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>

                {/* Specs List */}
                <ul className="space-y-2">
                  {feature.specs.map((spec, specIndex) => (
                    <li key={specIndex} className="text-gray-400 text-sm">
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
