"use client"

import { Check } from "lucide-react"

interface DesignSectionProps {
  title: string
  subtitle: string
  features: string[]
}

export function DesignSection({ title, subtitle, features }: DesignSectionProps) {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 whitespace-pre-line">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Visual Content */}
        <div className="relative w-full max-w-5xl mx-auto mb-16 aspect-[16/9]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-9xl opacity-10">✨</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-gray-800/50 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <p className="text-lg text-gray-200 pt-1">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
