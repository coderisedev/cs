"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"

import {
  downloadLinks,
  versionHistory,
  aircraftAddonSupport,
  spadNextPromo,
  screenshots,
} from "@/lib/data/software"

// Number of recent versions to show before the "Older versions" toggle
const RECENT_VERSIONS_COUNT = 10

export default function SoftwarePage() {
  const [activeDevice, setActiveDevice] = useState<string>("mcdu")
  const [showOlderVersions, setShowOlderVersions] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const recentVersions = versionHistory.slice(0, RECENT_VERSIONS_COUNT)
  const olderVersions = versionHistory.slice(RECENT_VERSIONS_COUNT)

  const activeDeviceData = aircraftAddonSupport.find((d) => d.id === activeDevice)

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section - Two Column Layout */}
      <section className="py-16 lg:py-24 border-b border-border-secondary">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: Text + Downloads */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground-primary tracking-tight">
                  PLUG AND PLAY
                </h1>
                <p className="text-lg text-foreground-secondary leading-relaxed">
                  CockpitSimulator Bridge (CS Bridge) is an easy-to-use software, all you need to do is open the software, plug in your devices, and it will automatically connect to your flight simulation game and aircraft addon. CS Bridge also features hardware testing and over-the-air device firmware updates.
                </p>
              </div>

              {/* Download Section */}
              <div className="space-y-4">
                <a
                  href={downloadLinks.latest.url}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download
                </a>

                <p className="text-sm text-foreground-secondary">
                  Version: {downloadLinks.latest.version}
                </p>

                <p className="text-sm text-foreground-secondary">
                  <a
                    href={downloadLinks.alternative.url}
                    className="text-brand-blue-500 hover:text-brand-blue-600 underline"
                  >
                    Download alternative zip package ({downloadLinks.alternative.version})
                  </a>
                </p>

                <div className="pt-4 border-t border-border-secondary">
                  <p className="text-sm text-foreground-muted">
                    If you are experiencing problems with the latest software, you may want to try the older version:
                  </p>
                  <p className="text-sm mt-2">
                    <a
                      href={downloadLinks.older.url}
                      className="text-brand-blue-500 hover:text-brand-blue-600 underline"
                    >
                      Download {downloadLinks.older.version}
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Image Carousel */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground-primary">
                COCKPITSIMULATOR BRIDGE
              </h2>

              {/* Main Image */}
              <div className="relative aspect-video bg-background-secondary rounded-xl overflow-hidden border border-border-secondary">
                <Image
                  src={screenshots[currentImageIndex]?.src || "/images/software/screenshot-placeholder.png"}
                  alt={screenshots[currentImageIndex]?.alt || "CockpitSimulator Bridge"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Thumbnail Navigation */}
              {screenshots.length > 1 && (
                <div className="flex gap-2">
                  {screenshots.map((screenshot, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index
                          ? "border-brand-blue-500"
                          : "border-border-secondary hover:border-border-primary"
                      }`}
                    >
                      <Image
                        src={screenshot.src}
                        alt={screenshot.alt}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Changelog Section */}
      <section className="py-16 lg:py-24 bg-background-secondary">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground-primary mb-12 text-center">
            CHANGELOG
          </h2>

          <div className="space-y-8">
            {/* Recent Versions */}
            {recentVersions.map((version) => (
              <div key={version.version}>
                <h3 className="text-lg font-bold text-foreground-primary mb-2">
                  CockpitSimulator Bridge {version.version} ({version.date})
                </h3>
                {version.changes.length > 0 && (
                  <div className="space-y-1 pl-1">
                    {version.changes.map((change, changeIndex) => (
                      <p key={changeIndex} className="text-foreground-secondary">
                        {change}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Older Versions Toggle */}
            {olderVersions.length > 0 && (
              <div>
                <button
                  onClick={() => setShowOlderVersions(!showOlderVersions)}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-background-primary hover:bg-background-tertiary rounded-xl border border-border-secondary transition-colors text-foreground-primary font-medium"
                >
                  {showOlderVersions ? (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      Hide older versions
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-5 h-5" />
                      Older versions ({olderVersions.length})
                    </>
                  )}
                </button>

                {/* Older Versions List */}
                {showOlderVersions && (
                  <div className="mt-8 space-y-8">
                    {olderVersions.map((version) => (
                      <div key={version.version}>
                        <h3 className="text-lg font-bold text-foreground-primary mb-2">
                          CockpitSimulator Bridge {version.version} ({version.date})
                        </h3>
                        {version.changes.length > 0 && (
                          <div className="space-y-1 pl-1">
                            {version.changes.map((change, changeIndex) => (
                              <p key={changeIndex} className="text-foreground-secondary">
                                {change}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Aircraft Addon Support List Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground-primary mb-12 text-center">
            AIRCRAFT ADDON SUPPORT LIST
          </h2>

          {/* Left-Right Layout: Vertical Tabs on Left, Content on Right */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left: Vertical Tabs */}
            <div className="md:w-72 shrink-0 space-y-2">
              {aircraftAddonSupport.map((device) => (
                <button
                  key={device.id}
                  onClick={() => setActiveDevice(device.id)}
                  className={`w-full text-left px-4 py-4 rounded-xl transition-all whitespace-pre-line text-sm font-medium ${
                    activeDevice === device.id
                      ? "bg-gray-800 text-white shadow-lg"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {device.title}
                </button>
              ))}
            </div>

            {/* Right: Content Area */}
            {activeDeviceData && (
              <div className="flex-1 bg-background-secondary rounded-xl border border-border-secondary p-6 md:p-8">
                <div className="space-y-8">
                  {activeDeviceData.platforms.map((platform) => (
                    <div key={platform.name}>
                      <h3 className="text-xl font-bold text-foreground-primary border-b border-border-secondary pb-3 mb-4">
                        {platform.name}
                      </h3>
                      <div className="space-y-4">
                        {platform.aircraft.map((aircraft, index) => (
                          <div key={index} className="pl-4">
                            <p className="font-medium text-foreground-primary">
                              {aircraft.name}
                            </p>
                            <p className="text-sm text-foreground-secondary">
                              (with bridge software {aircraft.version})
                            </p>
                            {aircraft.notes && aircraft.notes.length > 0 && (
                              <div className="mt-1 space-y-1">
                                {aircraft.notes.map((note, noteIndex) => (
                                  <p
                                    key={noteIndex}
                                    className="text-sm text-foreground-muted italic"
                                  >
                                    ({note})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SPAD.neXt Special Offer Section */}
      <section className="py-16 lg:py-24 bg-background-secondary">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          {/* SPAD.neXt Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src={spadNextPromo.logoUrl}
              alt="SPAD.neXt"
              width={200}
              height={80}
              className="object-contain"
            />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground-primary mb-6">
            {spadNextPromo.title}
          </h2>

          <p className="text-lg text-foreground-secondary mb-4 leading-relaxed">
            {spadNextPromo.description}
          </p>

          <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
            {spadNextPromo.offer}{" "}
            <a
              href={`mailto:${spadNextPromo.contactEmail}`}
              className="text-brand-blue-500 hover:text-brand-blue-600 underline"
            >
              {spadNextPromo.contactEmail}
            </a>
            .
          </p>

          <p className="mt-8">
            <a
              href="https://www.spadnext.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-blue-500 hover:text-brand-blue-600 font-medium"
            >
              Visit SPAD.neXt Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
