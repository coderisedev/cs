"use client"

import { useState, type ReactNode } from "react"
import {
  Cpu,
  Settings,
  Monitor,
  Check,
  Globe,
  Download,
  Zap,
  Wifi,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  softwareStats,
  softwareFeatures,
  softwarePlatforms,
  aircraftPlugins,
  versionHistory,
  systemRequirements,
} from "@/lib/data/software"

const heroImage = "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"

const featureIconMap: Record<string, ReactNode> = {
  Zap: <Zap className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  Settings: <Settings className="h-5 w-5" />,
  Wifi: <Wifi className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
}

const tabs = [
  { id: "features", label: "Features", icon: <Settings className="h-4 w-4" /> },
  { id: "platforms", label: "Platforms", icon: <Monitor className="h-4 w-4" /> },
  { id: "compatibility", label: "Compatibility", icon: <Check className="h-4 w-4" /> },
  { id: "versions", label: "Version History", icon: <Globe className="h-4 w-4" /> },
  { id: "download", label: "Download", icon: <Download className="h-4 w-4" /> },
]

export default function SoftwarePage() {
  const [activeTab, setActiveTab] = useState<string>("features")

  return (
    <div className="min-h-screen bg-background-primary">
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0" style={{ background: "var(--gradient-hero-accent)" }} />
        </div>
        <div className="relative container space-y-10 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-sm font-medium">
            <Cpu className="h-4 w-4" /> Professional Flight Simulation Software
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              CockpitSimulator Bridge <span className="block text-3xl lg:text-4xl text-primary-200 mt-2">CS Bridge v2025.2.3</span>
            </h1>
            <p className="text-xl lg:text-2xl text-white/85 max-w-4xl mx-auto">
              The ultimate plug-and-play solution for connecting your cockpit hardware to flight simulation software. Seamlessly integrate with 25+ aircraft plugins across 6 major platforms.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg font-semibold">
              <Download className="h-5 w-5 mr-2" /> Download Latest Version
            </Button>
            <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
              View Documentation
            </Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto text-white">
            {softwareStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 border-b border-border-primary bg-background-elevated">
        <div className="container flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 ${
                activeTab === tab.id ? "bg-primary-500 text-white" : "text-foreground-primary hover:bg-background-primary"
              }`}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20">
        <div className="container space-y-16">
          {activeTab === "features" && (
            <div className="space-y-8">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold">Powerful Features for Professional Simulation</h2>
                <p className="text-xl text-foreground-secondary">
                  CS Bridge provides everything you need for seamless hardware integration with your favorite flight simulation platforms.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {softwareFeatures.map((feature) => (
                  <Card
                    key={feature.title}
                    className="bg-background-elevated border-border-primary hover:border-primary-500/50 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-primary-500/10 text-primary-500">
                          {featureIconMap[feature.icon]}
                        </span>
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

          {activeTab === "platforms" && (
            <div className="space-y-8">
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h2 className="text-3xl lg:text-4xl font-bold">Multi-Platform Compatibility</h2>
                <p className="text-xl text-foreground-secondary">
                  Works seamlessly with every major simulator so you never worry about switching software mid-project.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwarePlatforms.map((platform) => (
                  <Card key={platform.name} className="bg-background-elevated border-border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <div className="flex items-center gap-1 text-semantic-success text-sm">
                          <Check className="h-4 w-4" /> Supported
                        </div>
                      </div>
                      <p className="text-sm text-primary-500 font-medium">{platform.version}</p>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-foreground-secondary">{platform.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "compatibility" && (
            <div className="space-y-12">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Aircraft Plugin Support</h2>
                <p className="text-foreground-secondary">Pre-configured profiles for the most popular aircraft families.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aircraftPlugins.map((group) => (
                  <Card key={group.category} className="border-border-primary">
                    <CardHeader>
                      <CardTitle>{group.category}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {group.plugins.map((plugin) => (
                        <div key={plugin.name} className="flex items-center justify-between text-sm text-foreground-secondary">
                          <span>{plugin.name}</span>
                          <span className="text-foreground-muted">{plugin.version}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border-primary">
                  <CardHeader>
                    <CardTitle>System requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6 text-sm text-foreground-secondary">
                    <div>
                      <p className="font-semibold text-foreground-primary mb-2">Minimum</p>
                      {Object.entries(systemRequirements.minimum).map(([key, value]) => (
                        <p key={key}>• {value}</p>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground-primary mb-2">Recommended</p>
                      {Object.entries(systemRequirements.recommended).map(([key, value]) => (
                        <p key={key}>• {value}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border-primary">
                  <CardHeader>
                    <CardTitle>Additional information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-foreground-secondary space-y-4">
                    <div>
                      <p className="font-semibold text-foreground-primary mb-2">Installation</p>
                      <p>• Run installer as Administrator</p>
                      <p>• Close all flight simulation software</p>
                      <p>• Allow firewall exceptions when prompted</p>
                      <p>• Restart computer after installation</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground-primary mb-2">Support & updates</p>
                      <p>• Automatic update notifications</p>
                      <p>• Free updates for 1 year</p>
                      <p>• Email support included</p>
                      <p>• Community forum access</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Version history</h2>
                <p className="text-foreground-secondary">Key releases for CS Bridge.</p>
              </div>
              <div className="space-y-4">
                {versionHistory.map((version) => (
                  <Card key={version.version} className="border-border-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{version.version}</CardTitle>
                        <p className="text-sm text-foreground-muted">{version.date}</p>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-6 text-sm text-foreground-secondary space-y-1">
                        {version.changes.map((change) => (
                          <li key={change}>{change}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "download" && (
            <div className="space-y-6 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold">Ready to connect your hardware?</h2>
              <p className="text-lg text-foreground-secondary">
                Download CS Bridge today and experience seamless integration between your cockpit hardware and flight simulation software.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg font-semibold">
                  <Download className="h-5 w-5 mr-2" /> Download Now
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
                  Contact Support
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
