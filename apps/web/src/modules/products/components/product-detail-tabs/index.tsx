"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Check } from "lucide-react"

interface ProductDetailTabsProps {
  product: HttpTypes.StoreProduct
}

export default function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("specifications")

  const tabs = [
    { id: "specifications", label: "Specifications" },
    { id: "compatibility", label: "Compatibility" },
    { id: "features", label: "Features" },
  ]

  // Extract specifications from product metadata or standard fields
  const specifications = [
    { label: "Material", value: product.material || "N/A" },
    { label: "Weight", value: product.weight ? `${product.weight} g` : "N/A" },
    {
      label: "Dimensions",
      value:
        product.length && product.width && product.height
          ? `${product.length}L x ${product.width}W x ${product.height}H`
          : "N/A",
    },
    { label: "Country of Origin", value: product.origin_country || "N/A" },
    { label: "Type", value: product.type?.value || "N/A" },
  ]

  // Compatibility info (from metadata or hardcoded)
  const compatibility = [
    "Microsoft Flight Simulator 2024",
    "X-Plane 12",
    "Prepar3D v5",
    "DCS World",
  ]

  // Features (from metadata or product description)
  const features = [
    "Authentic aircraft controls",
    "Plug and play USB connection",
    "Compatible with major flight simulators",
    "Professional-grade build quality",
    "Customizable button mapping",
    "LED backlighting",
  ]

  return (
    <div className="mb-12 sm:mb-16">
      {/* Tabs List */}
      <div className="border-b border-gray-200 mb-6">
        <div className="grid grid-cols-3 gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "specifications" && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between py-2 border-b border-gray-200 last:border-0"
                >
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    {spec.label}:
                  </span>
                  <span className="text-gray-900 text-sm sm:text-base">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "compatibility" && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">
              Compatible Software
            </h3>
            <div className="space-y-3">
              {compatibility.map((software, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                  <span className="text-sm sm:text-base">{software}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "features" && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
