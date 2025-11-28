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
  ChevronRight,
  ArrowRight
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

const featureIconMap: Record<string, ReactNode> = {
  Zap: <Zap className="h-6 w-6" />,
  Globe: <Globe className="h-6 w-6" />,
  Settings: <Settings className="h-6 w-6" />,
  Wifi: <Wifi className="h-6 w-6" />,
  Monitor: <Monitor className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
}

const tabs = [
  { id: "features", label: "Features" },
  { id: "platforms", label: "Platforms" },
  { id: "compatibility", label: "Compatibility" },
  { id: "versions", label: "History" },
  { id: "download", label: "Download" },
]

export default function SoftwarePage() {
  const [activeTab, setActiveTab] = useState<string>("features")

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Apple-style Hero Section */}
      <section className="relative pt-16 pb-8 lg:pt-24 lg:pb-14 text-center px-6 overflow-hidden bg-brand-blue-600 selection:bg-white/30">
        {/* Dynamic Background System */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Base Gradient - Rich Blue */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-500 via-brand-blue-600 to-brand-blue-700" />

          {/* Animated Glow Orbs - Lighter Blue/White for contrast */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-blue-400/30 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-float" />

          {/* Conic Gradient for Subtle Light Play */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-[conic-gradient(from_90deg_at_50%_50%,#ffffff00_50%,#ffffff20_100%)] blur-[100px] opacity-40 mix-blend-overlay" />

          {/* Noise Texture Overlay for Premium Feel */}
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        </div>

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm animate-fade-in-up">
            <Cpu className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold tracking-wide uppercase text-white">Professional Flight Simulation</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] drop-shadow-2xl">
            CockpitSimulator <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-200 via-brand-blue-400 to-brand-blue-600">
              Bridge
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-400 max-w-3xl mx-auto leading-relaxed tracking-wide">
            The ultimate plug-and-play solution. <br className="hidden md:block" />
            Seamlessly integrate hardware with <span className="text-white">25+ aircraft</span>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10 items-center">
            <button className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative flex items-center gap-2">
                Download v2025.2.3 <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            <button className="px-8 py-4 rounded-full text-white font-medium text-lg transition-all hover:text-brand-blue-300 flex items-center gap-2 group">
              View Documentation
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimalist */}
      <section className="py-12 border-b border-border-secondary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {softwareStats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <div className="text-3xl lg:text-4xl font-semibold text-foreground-primary">{stat.value}</div>
                <div className="text-sm font-medium text-foreground-secondary uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Navigation */}
      <section className="sticky top-[44px] z-40 bg-background-primary/80 backdrop-blur-md border-b border-border-secondary">
        <div className="container mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex justify-center min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                  ? "border-foreground-primary text-foreground-primary"
                  : "border-transparent text-foreground-secondary hover:text-foreground-primary"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-background-secondary py-20 lg:py-32">
        <div className="container mx-auto px-6 max-w-6xl">

          {/* Features Tab */}
          {activeTab === "features" && (
            <div className="space-y-16 animate-fade-in">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="section-headline">Powerful Features.</h2>
                <p className="text-xl text-foreground-secondary">
                  Everything you need for seamless hardware integration.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwareFeatures.map((feature) => (
                  <div key={feature.title} className="card-apple p-8 bg-background-primary">
                    <div className="text-brand-blue-500 mb-6">
                      {featureIconMap[feature.icon]}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground-primary">{feature.title}</h3>
                    <p className="text-foreground-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platforms Tab */}
          {activeTab === "platforms" && (
            <div className="space-y-16 animate-fade-in">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="section-headline">Works Everywhere.</h2>
                <p className="text-xl text-foreground-secondary">
                  Compatible with every major simulator platform.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwarePlatforms.map((platform) => (
                  <div key={platform.name} className="card-apple p-8 bg-background-primary flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-foreground-primary">{platform.name}</h3>
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-foreground-secondary mb-6">{platform.description}</p>
                    </div>
                    <div className="pt-6 border-t border-border-secondary">
                      <span className="text-sm font-medium text-brand-blue-500 bg-brand-blue-500/10 px-3 py-1 rounded-full">
                        {platform.version}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility Tab */}
          {activeTab === "compatibility" && (
            <div className="space-y-16 animate-fade-in">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="section-headline">Plug & Play.</h2>
                <p className="text-xl text-foreground-secondary">
                  Pre-configured profiles for popular aircraft.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aircraftPlugins.map((group) => (
                  <div key={group.category} className="card-apple p-8 bg-background-primary">
                    <h3 className="text-lg font-semibold mb-6 text-foreground-primary border-b border-border-secondary pb-4">
                      {group.category}
                    </h3>
                    <div className="space-y-3">
                      {group.plugins.map((plugin) => (
                        <div key={plugin.name} className="flex items-center justify-between text-sm">
                          <span className="text-foreground-primary font-medium">{plugin.name}</span>
                          <span className="text-foreground-muted">{plugin.version}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="card-apple p-8 bg-background-primary">
                  <h3 className="text-xl font-semibold mb-6">System Requirements</h3>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-4">Minimum</h4>
                      <div className="space-y-2 text-sm text-foreground-secondary">
                        {Object.entries(systemRequirements.minimum).map(([key, value]) => (
                          <p key={key} className="flex gap-2"><span className="text-foreground-muted">•</span> {value}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide mb-4">Recommended</h4>
                      <div className="space-y-2 text-sm text-foreground-secondary">
                        {Object.entries(systemRequirements.recommended).map(([key, value]) => (
                          <p key={key} className="flex gap-2"><span className="text-foreground-muted">•</span> {value}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-apple p-8 bg-background-primary">
                  <h3 className="text-xl font-semibold mb-6">Installation Guide</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground-primary mb-2">Setup</h4>
                      <ul className="space-y-2 text-sm text-foreground-secondary">
                        <li className="flex gap-2"><Check className="w-4 h-4 text-brand-blue-500" /> Run installer as Administrator</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-brand-blue-500" /> Close simulators before install</li>
                        <li className="flex gap-2"><Check className="w-4 h-4 text-brand-blue-500" /> Restart after completion</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground-primary mb-2">Support</h4>
                      <p className="text-sm text-foreground-secondary">
                        Includes automatic updates and 1 year of free technical support via email and community forums.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Versions Tab */}
          {activeTab === "versions" && (
            <div className="space-y-16 animate-fade-in">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <h2 className="section-headline">Evolving Platform.</h2>
                <p className="text-xl text-foreground-secondary">
                  Continuous improvements and new features.
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                {versionHistory.map((version, index) => (
                  <div key={version.version} className="card-apple p-8 bg-background-primary relative overflow-hidden">
                    {index === 0 && (
                      <div className="absolute top-0 right-0 bg-brand-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                        LATEST
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                      <h3 className="text-2xl font-bold text-foreground-primary">{version.version}</h3>
                      <span className="text-sm text-foreground-muted font-medium bg-background-secondary px-3 py-1 rounded-full">
                        {version.date}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {version.changes.map((change) => (
                        <li key={change} className="flex items-start gap-3 text-foreground-secondary">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-blue-500 shrink-0" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Tab */}
          {activeTab === "download" && (
            <div className="text-center max-w-2xl mx-auto py-12 animate-fade-in">
              <div className="mb-8 inline-flex p-4 rounded-full bg-brand-blue-50 text-brand-blue-600">
                <Download className="w-8 h-8" />
              </div>
              <h2 className="section-headline mb-6">Start Your Journey.</h2>
              <p className="text-xl text-foreground-secondary mb-10">
                Download CS Bridge today and experience the next level of flight simulation immersion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-apple btn-apple-large w-full sm:w-auto">
                  Download for Windows
                </button>
                <button className="px-8 py-3 rounded-full border border-border-primary text-foreground-primary font-medium hover:bg-background-secondary transition-colors w-full sm:w-auto">
                  Contact Support
                </button>
              </div>
              <p className="mt-8 text-sm text-foreground-muted">
                Requires Windows 10/11 (64-bit) • v2025.2.3 • 145 MB
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
