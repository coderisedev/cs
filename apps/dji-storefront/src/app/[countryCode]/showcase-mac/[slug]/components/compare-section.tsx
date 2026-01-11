"use client"

import { useState } from "react"

interface Model {
  name: string
  improvements: string[]
}

interface TradeIn {
  title: string
  description: string
  minValue: string
  maxValue: string
}

interface CompareSectionProps {
  title: string
  models: Model[]
  tradeIn: TradeIn
  currentProduct: string
}

export function CompareSection({
  title,
  models,
  tradeIn,
  currentProduct
}: CompareSectionProps) {
  const [selectedModel, setSelectedModel] = useState(0)

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-6 text-4xl font-semibold text-gray-900 sm:text-5xl">
            {title}
          </h2>
        </div>

        {/* Model Selector */}
        <div className="mb-12">
          <div className="mx-auto max-w-2xl">
            <label htmlFor="compare-model" className="mb-3 block text-sm font-medium text-gray-700">
              Select your current drone:
            </label>
            <select
              id="compare-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(parseInt(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {models.map((model, index) => (
                <option key={index} value={index}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison */}
        <div className="mb-16">
          <div className="mx-auto max-w-3xl">
            <p className="mb-6 text-center text-lg text-gray-700">
              Here&apos;s what you get with the new <strong>{currentProduct}</strong>:
            </p>
            <ul className="grid gap-4 sm:grid-cols-2">
              {models[selectedModel].improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
                  <span className="mt-1 text-green-600">✓</span>
                  <span className="text-sm text-gray-900">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trade In */}
        <div className="rounded-3xl bg-gray-900 p-12 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 text-5xl">♻️</div>
            <h3 className="mb-4 text-3xl font-semibold">{tradeIn.title}</h3>
            <p className="mb-6 text-base text-gray-300">{tradeIn.description}</p>
            <p className="mb-8 text-xl font-medium">
              {tradeIn.minValue} - {tradeIn.maxValue}
            </p>
            <button className="rounded-full bg-white px-8 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors">
              See what your device is worth
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
