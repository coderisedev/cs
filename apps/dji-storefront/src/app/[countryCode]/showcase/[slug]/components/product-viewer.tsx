"use client"

import { useState } from "react"

interface ProductViewerProps {
  productName: string
}

export function ProductViewer({ productName }: ProductViewerProps) {
  const [rotation, setRotation] = useState(0)

  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Take a closer look.
          </h3>
        </div>

        {/* 360 Viewer */}
        <div className="relative w-full max-w-4xl mx-auto">
          {/* Product Display */}
          <div 
            className="relative aspect-square bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ transform: `rotateY(${rotation}deg)` }}
          >
            <div className="text-9xl opacity-20">🚁</div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-gray-400 text-sm">Drag to rotate</p>
            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full max-w-md accent-blue-600"
            />
          </div>

          {/* Color Options */}
          <div className="mt-12 flex justify-center gap-4">
            {["bg-gray-800", "bg-blue-900", "bg-white"].map((color, index) => (
              <button
                key={index}
                className={`w-12 h-12 rounded-full border-2 border-gray-600 hover:border-white transition-colors ${color}`}
                aria-label={`Color option ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
