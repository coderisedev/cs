"use client"

import { ChevronRight } from "lucide-react"

interface HeroSectionProps {
  name: string
  tagline: string
  price: string
  priceMonthly: string
  heroImage: string
}

export function HeroSection({
  name,
  tagline,
  price,
  priceMonthly,
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Product name */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
          {name}
        </h1>
        
        {/* Tagline */}
        <p className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-12 text-gray-300 whitespace-pre-line">
          {tagline}
        </p>
        
        {/* Hero Image Placeholder */}
        <div className="relative w-full max-w-5xl mx-auto mb-12 aspect-[16/9]">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center">
            <div className="text-6xl opacity-20">🚁</div>
          </div>
          {/* In production, replace with actual image */}
          {/* <Image src={heroImage} alt={name} fill className="object-contain" /> */}
        </div>
        
        {/* CTA and Price */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors text-lg">
            Buy Now
          </button>
          <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold rounded-full transition-colors text-lg flex items-center gap-2">
            Learn More
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Price */}
        <p className="text-gray-400 text-lg">
          <span className="font-semibold">{price}</span>
          <span className="mx-2">or</span>
          <span>{priceMonthly}</span>
        </p>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
        </div>
      </div>
    </section>
  )
}
