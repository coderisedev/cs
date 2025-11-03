"use client"

import { ArrowRight, Star } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-secondary-50 to-primary-100 py-12 sm:py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="mobile-container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 animate-fade-in">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-xs sm:text-sm font-medium">
              Professional Flight Simulation Hardware
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent animate-fade-in">
            Build Your Dream Cockpit
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 animate-fade-in px-4">
            Authentic aircraft controls and panels for serious flight simulation
            enthusiasts. Compatible with MSFS 2024, X-Plane 12, and Prepar3D.
          </p>
          <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center animate-fade-in px-4">
            <LocalizedClientLink href="/store">
              <button className="w-full xs:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold transition-opacity touch-target flex items-center justify-center gap-2 text-sm sm:text-base">
                Shop All Products
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/collections">
              <button className="w-full xs:w-auto bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-semibold border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all touch-target text-sm sm:text-base">
                View Featured
              </button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}

export default Hero
