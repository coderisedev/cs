import { useState } from 'react'
import { Download, Check, Monitor, Cpu, HardDrive, Wifi, Zap, Settings, Shield, Globe, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function SoftwarePage() {
  const [activeTab, setActiveTab] = useState('features')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Plug & Play Operation",
      description: "Simply open the software, connect your devices, and start automatically. No complex configuration required."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Automatic Connection",
      description: "Automatically connects flight simulation games and aircraft plugins without manual intervention."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Hardware Testing",
      description: "Built-in hardware testing functionality to verify your setup and troubleshoot issues."
    },
    {
      icon: <Wifi className="h-6 w-6" />,
      title: "Wireless Firmware Updates",
      description: "Update device firmware wirelessly without cables or complex procedures."
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: "Multi-Platform Support",
      description: "Compatible with all major flight simulation platforms and versions."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "CDU/MCDU Brightness",
      description: "Maintains optimal screen brightness for CDU/MCDU displays during operation."
    }
  ]

  const platforms = [
    {
      name: "Microsoft Flight Simulator 2024",
      status: "supported",
      version: "Latest",
      description: "Full compatibility with the newest Microsoft Flight Simulator"
    },
    {
      name: "Microsoft Flight Simulator (2020)",
      status: "supported",
      version: "All versions",
      description: "Complete support for MSFS 2020 and all updates"
    },
    {
      name: "X-Plane 11/12",
      status: "supported",
      version: "11.50+ / 12.x",
      description: "Native support for both X-Plane 11 and 12"
    },
    {
      name: "Prepar3D v4/v5",
      status: "supported",
      version: "v4.5+ / v5.x",
      description: "Professional flight training simulation platform"
    },
    {
      name: "Flight Simulator X",
      status: "supported",
      version: "All versions",
      description: "Legacy support for the classic FSX platform"
    },
    {
      name: "Aerowinx Precision Simulator 10 (PSX)",
      status: "supported",
      version: "v10.180+",
      description: "Professional-grade precision simulator support"
    }
  ]

  const aircraftPlugins = [
    {
      category: "A320 Series",
      plugins: [
        { name: "ProSimA320", version: "v1.40+", status: "supported" },
        { name: "Fenix A320", version: "V2.3.0.541+", status: "supported" },
        { name: "FlyByWire A32NX", version: "stable v0.12.x", status: "supported" },
        { name: "Aerosoft A320", version: "All versions", status: "supported" }
      ]
    },
    {
      category: "737 Series", 
      plugins: [
        { name: "ProSim737", version: "v3.0+", status: "supported" },
        { name: "PMDG 737-800/900", version: "All versions", status: "supported" },
        { name: "iFly 737 MAX8", version: "Latest", status: "supported" },
        { name: "Majestic Software 737", version: "All versions", status: "supported" }
      ]
    },
    {
      category: "Other Aircraft",
      plugins: [
        { name: "PMDG 777-200ER", version: "Latest", status: "supported" },
        { name: "Toliss A330", version: "Latest", status: "supported" },
        { name: "Fenix A330", version: "Latest", status: "supported" },
        { name: "Heavy Division 747", version: "Latest", status: "supported" }
      ]
    }
  ]

  const versionHistory = [
    {
      version: "v2025.2.3",
      date: "June 12, 2025",
      changes: [
        "Added iFly 737 MAX8 support for MSFS 2024",
        "Improved connection stability for X-Plane 12",
        "Enhanced hardware detection algorithms",
        "Fixed CDU brightness persistence issues"
      ]
    },
    {
      version: "v2025.2.2",
      date: "May 28, 2025", 
      changes: [
        "Added PMDG 777-200ER support for MSFS",
        "Optimized memory usage for large plugin sets",
        "Improved wireless firmware update reliability",
        "Enhanced error reporting and diagnostics"
      ]
    },
    {
      version: "v2025.2.0",
      date: "April 15, 2025",
      changes: [
        "Added Aerowinx Precision Simulator 10 support",
        "Redesigned user interface with dark mode",
        "Implemented automatic plugin detection",
        "Enhanced multi-platform compatibility"
      ]
    }
  ]

  const systemRequirements = {
    minimum: {
      os: "Windows 10 (64-bit) or newer",
      processor: "Intel i5-8400 / AMD Ryzen 5 2600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GTX 1060 / AMD RX 580",
      storage: "500 MB available space",
      network: "Broadband internet connection"
    },
    recommended: {
      os: "Windows 11 (64-bit)",
      processor: "Intel i7-10700K / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA RTX 3070 / AMD RX 6700 XT",
      storage: "1 GB available space (SSD recommended)",
      network: "Broadband internet connection"
    }
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-background-primary to-background-elevated"></div>
        <div className="container mx-auto px-4 lg:px-12 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 text-primary-500 text-sm font-medium mb-6">
              <Cpu className="h-4 w-4" />
              Professional Flight Simulation Software
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground-primary mb-6 leading-tight">
              CockpitSimulator Bridge
              <span className="block text-primary-500 text-3xl lg:text-4xl mt-2">CS Bridge v2025.2.3</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-foreground-secondary mb-8 leading-relaxed">
              The ultimate plug-and-play solution for connecting your cockpit hardware to flight simulation software. 
              Seamlessly integrate with 25+ aircraft plugins across 6 major platforms.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105">
                <Download className="h-5 w-5 mr-2" />
                Download Latest Version
              </Button>
              <Button variant="outline" size="lg" className="border-border-primary text-foreground-primary hover:bg-background-elevated px-8 py-4 text-lg font-semibold transition-all duration-300">
                View Documentation
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">25+</div>
                <div className="text-sm text-foreground-secondary">Aircraft Plugins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">6</div>
                <div className="text-sm text-foreground-secondary">Platforms Supported</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">40+</div>
                <div className="text-sm text-foreground-secondary">Version Releases</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500 mb-1">5+</div>
                <div className="text-sm text-foreground-secondary">Years Development</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 border-b border-border-primary bg-background-elevated">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'features', label: 'Features', icon: <Settings className="h-4 w-4" /> },
              { id: 'platforms', label: 'Platforms', icon: <Monitor className="h-4 w-4" /> },
              { id: 'compatibility', label: 'Compatibility', icon: <Check className="h-4 w-4" /> },
              { id: 'versions', label: 'Version History', icon: <Globe className="h-4 w-4" /> },
              { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" /> }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-primary-500 text-white hover:bg-primary-600' 
                    : 'text-foreground-primary hover:bg-background-primary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-12">
          
          {/* Features Section */}
          {activeTab === 'features' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-4">
                  Powerful Features for Professional Simulation
                </h2>
                <p className="text-xl text-foreground-secondary max-w-3xl mx-auto">
                  CS Bridge provides everything you need for seamless hardware integration with your favorite flight simulation platforms.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-background-elevated border-border-primary hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                          {feature.icon}
                        </div>
                        <CardTitle className="text-lg text-foreground-primary">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-foreground-secondary leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Platforms Section */}
          {activeTab === 'platforms' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-4">
                  Multi-Platform Compatibility
                </h2>
                <p className="text-xl text-foreground-secondary max-w-3xl mx-auto">
                  CS Bridge works seamlessly with all major flight simulation platforms, ensuring you can use your hardware regardless of your preferred simulator.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {platforms.map((platform, index) => (
                  <Card key={index} className="bg-background-elevated border-border-primary hover:border-primary-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-3">
                        <CardTitle className="text-lg text-foreground-primary">{platform.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-green-500 font-medium">Supported</span>
                        </div>
                      </div>
                      <div className="text-sm text-primary-500 font-medium mb-2">{platform.version}</div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-foreground-secondary">
                        {platform.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility Section */}
          {activeTab === 'compatibility' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-4">
                  Aircraft Plugin Compatibility
                </h2>
                <p className="text-xl text-foreground-secondary max-w-3xl mx-auto">
                  CS Bridge supports over 25 popular aircraft plugins, ensuring your hardware works with the aircraft you love to fly.
                </p>
              </div>

              <div className="space-y-8">
                {aircraftPlugins.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-background-elevated rounded-xl border border-border-primary overflow-hidden">
                    <div 
                      className="p-6 cursor-pointer hover:bg-background-primary transition-colors duration-300"
                      onClick={() => toggleSection(`category-${categoryIndex}`)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-foreground-primary">{category.category}</h3>
                        {expandedSection === `category-${categoryIndex}` ? 
                          <ChevronUp className="h-5 w-5 text-foreground-secondary" /> : 
                          <ChevronDown className="h-5 w-5 text-foreground-secondary" />
                        }
                      </div>
                    </div>
                    
                    {expandedSection === `category-${categoryIndex}` && (
                      <div className="px-6 pb-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {category.plugins.map((plugin, pluginIndex) => (
                            <div key={pluginIndex} className="flex items-center justify-between p-4 rounded-lg bg-background-primary border border-border-primary">
                              <div>
                                <div className="font-medium text-foreground-primary">{plugin.name}</div>
                                <div className="text-sm text-foreground-secondary">{plugin.version}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-500 font-medium">Compatible</span>
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
          {activeTab === 'versions' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-4">
                  Version History
                </h2>
                <p className="text-xl text-foreground-secondary max-w-3xl mx-auto">
                  Track the evolution of CS Bridge with detailed release notes and feature additions.
                </p>
              </div>

              <div className="space-y-8">
                {versionHistory.map((version, index) => (
                  <Card key={index} className="bg-background-elevated border-border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl text-foreground-primary">{version.version}</CardTitle>
                          <CardDescription className="text-foreground-secondary">{version.date}</CardDescription>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-sm font-medium">
                          Latest
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {version.changes.map((change, changeIndex) => (
                          <li key={changeIndex} className="flex items-start gap-3">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground-secondary">{change}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Download Section */}
          {activeTab === 'download' && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-4">
                  Download CS Bridge
                </h2>
                <p className="text-xl text-foreground-secondary max-w-3xl mx-auto">
                  Get the latest version of CockpitSimulator Bridge and start connecting your hardware today.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                {/* Download Options */}
                <Card className="bg-background-elevated border-border-primary">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground-primary">Latest Release</CardTitle>
                    <CardDescription className="text-foreground-secondary">
                      CS Bridge v2025.2.3 - June 12, 2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 text-lg font-semibold transition-all duration-300">
                      <Download className="h-5 w-5 mr-2" />
                      Download v2025.2.3 (EXE)
                    </Button>
                    <Button variant="outline" className="w-full border-border-primary text-foreground-primary hover:bg-background-primary py-3 transition-all duration-300">
                      <Download className="h-5 w-5 mr-2" />
                      Download v2025.2.3 (ZIP)
                    </Button>
                    <div className="text-sm text-foreground-muted">
                      File size: ~45 MB | Requires Windows 10 or newer
                    </div>
                  </CardContent>
                </Card>

                {/* System Requirements */}
                <Card className="bg-background-elevated border-border-primary">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground-primary">System Requirements</CardTitle>
                    <CardDescription className="text-foreground-secondary">
                      Minimum and recommended specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground-primary mb-3">Minimum Requirements</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">OS:</span>
                            <span className="text-foreground-primary">{systemRequirements.minimum.os}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Processor:</span>
                            <span className="text-foreground-primary">{systemRequirements.minimum.processor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Memory:</span>
                            <span className="text-foreground-primary">{systemRequirements.minimum.memory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Graphics:</span>
                            <span className="text-foreground-primary">{systemRequirements.minimum.graphics}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Storage:</span>
                            <span className="text-foreground-primary">{systemRequirements.minimum.storage}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground-primary mb-3">Recommended</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">OS:</span>
                            <span className="text-foreground-primary">{systemRequirements.recommended.os}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Processor:</span>
                            <span className="text-foreground-primary">{systemRequirements.recommended.processor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Memory:</span>
                            <span className="text-foreground-primary">{systemRequirements.recommended.memory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground-secondary">Graphics:</span>
                            <span className="text-foreground-primary">{systemRequirements.recommended.graphics}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Information */}
              <Card className="bg-background-elevated border-border-primary">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground-primary">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground-primary mb-2">Installation Notes</h4>
                      <ul className="text-sm text-foreground-secondary space-y-1">
                        <li>• Run installer as Administrator</li>
                        <li>• Close all flight simulation software</li>
                        <li>• Allow firewall exceptions when prompted</li>
                        <li>• Restart computer after installation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground-primary mb-2">Support & Updates</h4>
                      <ul className="text-sm text-foreground-secondary space-y-1">
                        <li>• Automatic update notifications</li>
                        <li>• Free updates for 1 year</li>
                        <li>• Email support included</li>
                        <li>• Community forum access</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500/10 to-background-elevated">
        <div className="container mx-auto px-4 lg:px-12 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground-primary mb-6">
            Ready to Connect Your Hardware?
          </h2>
          <p className="text-xl text-foreground-secondary mb-8 max-w-3xl mx-auto">
            Download CS Bridge today and experience seamless integration between your cockpit hardware and flight simulation software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105">
              <Download className="h-5 w-5 mr-2" />
              Download Now
            </Button>
            <Button variant="outline" size="lg" className="border-border-primary text-foreground-primary hover:bg-background-primary px-8 py-4 text-lg font-semibold transition-all duration-300">
              Contact Support
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}