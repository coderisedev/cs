"use client"

import { useState } from "react"
import { SoftwareData } from "@/lib/software/types"
import {
  Download,
  Check,
  Monitor,
  Cpu,
  Zap,
  Settings,
  Shield,
  Globe,
  Wifi,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface SoftwareTemplateProps {
  data: SoftwareData
}

export default function SoftwareTemplate({ data }: SoftwareTemplateProps) {
  const [activeTab, setActiveTab] = useState("features")
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      zap: <Zap className="h-6 w-6" />,
      globe: <Globe className="h-6 w-6" />,
      settings: <Settings className="h-6 w-6" />,
      wifi: <Wifi className="h-6 w-6" />,
      monitor: <Monitor className="h-6 w-6" />,
      shield: <Shield className="h-6 w-6" />,
    }
    return icons[iconName] || <Settings className="h-6 w-6" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="container mx-auto px-4 lg:px-12 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Cpu className="h-4 w-4" />
              Professional E-Commerce Integration Software
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {data.title}
              <span className="block text-blue-600 text-3xl lg:text-4xl mt-2">
                {data.version}
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
              {data.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Latest Version
              </button>
              <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
                View Documentation
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {data.features.length}+
                </div>
                <div className="text-sm text-gray-600">Key Features</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {data.platforms.length}
                </div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {data.compatibility.reduce((sum, cat) => sum + cat.items.length, 0)}+
                </div>
                <div className="text-sm text-gray-600">Integrations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {data.versions.length}+
                </div>
                <div className="text-sm text-gray-600">Releases</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: "features", label: "Features", icon: <Settings className="h-4 w-4" /> },
              { id: "platforms", label: "Platforms", icon: <Monitor className="h-4 w-4" /> },
              { id: "compatibility", label: "Compatibility", icon: <Check className="h-4 w-4" /> },
              { id: "versions", label: "Version History", icon: <Globe className="h-4 w-4" /> },
              { id: "download", label: "Download", icon: <Download className="h-4 w-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">
          {/* Features Section */}
          {activeTab === "features" && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Powerful Features for Modern E-Commerce
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Everything you need for seamless integration between your storefront and backend services.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-500 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        {getIcon(feature.icon)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platforms Section */}
          {activeTab === "platforms" && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Multi-Platform Compatibility
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Works seamlessly with all major platforms and technologies in your e-commerce stack.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.platforms.map((platform, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {platform.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          Supported
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-blue-600 font-medium mb-2">
                      {platform.version}
                    </div>
                    <p className="text-gray-600">{platform.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility Section */}
          {activeTab === "compatibility" && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Third-Party Integrations
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Pre-built integrations with popular payment providers, shipping services, and marketing tools.
                </p>
              </div>

              <div className="space-y-8">
                {data.compatibility.map((category, categoryIndex) => (
                  <div
                    key={categoryIndex}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-300"
                      onClick={() => toggleSection(`category-${categoryIndex}`)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {category.category}
                        </h3>
                        {expandedSection === `category-${categoryIndex}` ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                    </div>

                    {expandedSection === `category-${categoryIndex}` && (
                      <div className="px-6 pb-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {category.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {item.version}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">
                                  Compatible
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Version History Section */}
          {activeTab === "versions" && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Version History
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Track the evolution with detailed release notes and feature additions.
                </p>
              </div>

              <div className="space-y-8">
                {data.versions.map((version, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {version.version}
                        </h3>
                        <p className="text-gray-600">{version.date}</p>
                      </div>
                      {index === 0 && (
                        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                          Latest
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {version.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Section */}
          {activeTab === "download" && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Download {data.title}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Get the latest version and start integrating your storefront today.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Download Options */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Latest Release
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {data.title} {data.version} - {data.releaseDate}
                  </p>
                  <div className="space-y-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                      <Download className="h-5 w-5" />
                      Download {data.version}
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <Download className="h-5 w-5" />
                      View on GitHub
                    </button>
                    <div className="text-sm text-gray-600">
                      Requires {data.systemRequirements.minimum.node}
                    </div>
                  </div>
                </div>

                {/* System Requirements */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    System Requirements
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Minimum Requirements
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">OS:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.minimum.os}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Node.js:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.minimum.node}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Memory:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.minimum.memory}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Database:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.minimum.database}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Recommended
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">OS:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.recommended.os}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Node.js:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.recommended.node}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Memory:</span>
                          <span className="text-gray-900">
                            {data.systemRequirements.recommended.memory}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Installation Notes
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Install dependencies with pnpm install</li>
                      <li>• Configure environment variables</li>
                      <li>• Start Docker services for database</li>
                      <li>• Run development server with pnpm dev</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Support & Updates
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Comprehensive documentation</li>
                      <li>• Community Discord support</li>
                      <li>• Regular security updates</li>
                      <li>• GitHub issue tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-gray-50">
        <div className="container mx-auto px-4 lg:px-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Download {data.title} today and experience seamless e-commerce integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
              <Download className="h-5 w-5" />
              Download Now
            </button>
            <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
