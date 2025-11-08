"use client"

import { useEffect, useMemo, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { Check, Download, FileText, Info } from "lucide-react"
import type { ProductDetail } from "@lib/data/product-details"

interface ProductDetailTabsProps {
  product: HttpTypes.StoreProduct
  productDetail: ProductDetail | null
}

type TabId = "overview" | "specs" | "features" | "faq" | "downloads"

const fallbackFeatures = [
  {
    heading: "Authentic aircraft controls",
    body: "<p>Precise hardware-inspired detailing keeps the experience immersive even on long simulator sessions.</p>",
  },
  {
    heading: "Plug and play USB connection",
    body: "<p>Every product is ready out of the box with standard USB-C cables and cross-platform firmware support.</p>",
  },
  {
    heading: "Compatible with major flight simulators",
    body: "<p>Tested with Microsoft Flight Simulator, X-Plane, and DCS for low-latency response.</p>",
  },
  {
    heading: "Professional-grade build quality",
    body: "<p>Reinforced stitching, taped seams, and premium trims stand up to heavy daily wear.</p>",
  },
  {
    heading: "Customizable button mapping",
    body: "<p>Metadata sections include suggested mappings plus room for your personal presets.</p>",
  },
  {
    heading: "LED backlighting",
    body: "<p>Reflective accents and subtle LEDs keep you visible without adding glare to cockpit setups.</p>",
  },
]

const fallbackFaq = [
  {
    question: "What is the warranty?",
    answer: "<p>All Medusa merch ships with a 2-year workmanship warranty and 30-day returns.</p>",
  },
]

export default function ProductDetailTabs({ product, productDetail }: ProductDetailTabsProps) {
  const specs = useMemo(() => {
    if (productDetail?.specs?.length) {
      return productDetail.specs
    }

    return [
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
  }, [product, productDetail?.specs])

  const features = useMemo(() => {
    if (productDetail?.features?.length) {
      return productDetail.features
    }

    return fallbackFeatures
  }, [productDetail?.features])

  const faq = useMemo(() => {
    if (productDetail?.faq?.length) {
      return productDetail.faq
    }

    return fallbackFaq
  }, [productDetail?.faq])

  const downloads = productDetail?.downloads ?? []

  const overviewHtml = productDetail?.overview ?? null
  const fallbackOverviewText = !overviewHtml ? product.description : null
  const hasOverview = Boolean(productDetail?.heroExcerpt || overviewHtml || fallbackOverviewText)

  const tabs = useMemo(() => {
    const config: { id: TabId; label: string }[] = []
    if (hasOverview) {
      config.push({ id: "overview", label: "Overview" })
    }
    if (specs.length) {
      config.push({ id: "specs", label: "Specifications" })
    }
    if (features.length) {
      config.push({ id: "features", label: "Features" })
    }
    if (faq.length) {
      config.push({ id: "faq", label: "FAQ" })
    }
    if (downloads.length) {
      config.push({ id: "downloads", label: "Downloads" })
    }
    return config
  }, [downloads.length, faq.length, features.length, hasOverview, specs.length])

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id ?? "specs")
  const firstTabId = tabs[0]?.id ?? "specs"

  useEffect(() => {
    if (!tabs.find((tab) => tab.id === activeTab)) {
      setActiveTab(firstTabId)
    }
  }, [activeTab, firstTabId, tabs])

  return (
    <div className="mb-12 sm:mb-16">
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <div className="flex min-w-max sm:min-w-full">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex-1 text-center ${
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

      <div className="mt-6">
        {activeTab === "overview" && hasOverview && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Overview
            </h3>
            {productDetail?.heroExcerpt && (
              <p className="text-base text-gray-900 font-medium mb-3">
                {productDetail.heroExcerpt}
              </p>
            )}
            {overviewHtml ? (
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: overviewHtml }}
              />
            ) : (
              fallbackOverviewText && (
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  {fallbackOverviewText}
                </p>
              )
            )}
          </div>
        )}

        {activeTab === "specs" && specs.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {specs.map((spec) => (
                <div
                  key={`${spec.label}-${spec.value}`}
                  className="flex justify-between gap-3 py-2 border-b border-gray-200 last:border-0"
                >
                  <span className="font-medium text-gray-700 text-sm sm:text-base">
                    {spec.label}:
                  </span>
                  <span className="text-gray-900 text-sm sm:text-base text-right">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "features" && features.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={`${feature.heading}-${index}`} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm sm:text-base">
                      {feature.heading}
                    </p>
                  </div>
                  {feature.body ? (
                    <div
                      className="text-sm text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: feature.body }}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{feature.heading}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "faq" && faq.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {faq.map((entry, index) => (
                <div key={`${entry.question}-${index}`} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                  <p className="font-semibold text-gray-900 mb-2">{entry.question}</p>
                  {entry.answer && (
                    <div
                      className="text-sm text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: entry.answer }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "downloads" && downloads.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="font-bold text-lg sm:text-xl mb-4">Downloads &amp; Resources</h3>
            <div className="space-y-3">
              {downloads.map((download, index) => {
                const linkProps = download.href
                  ? { href: download.href, target: "_blank", rel: "noopener noreferrer" as const }
                  : {}

                return (
                  <a
                    key={`${download.label}-${index}`}
                    {...linkProps}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm sm:text-base transition-colors ${
                      download.href
                        ? 'hover:border-primary hover:text-primary'
                        : 'border-dashed text-gray-500 cursor-not-allowed'
                    }`}
                    aria-disabled={!download.href}
                  >
                    <div className="flex items-center gap-3">
                      {download.href ? <Download className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      <span>{download.label}</span>
                    </div>
                    {download.href && <span className="text-xs text-gray-500">Opens in new tab</span>}
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
