import { notFound } from "next/navigation"
import { HeroSection } from "./components/hero-section"
import { HighlightsGallery } from "./components/highlights-gallery"
import { DesignSection } from "./components/design-section"
import { ProductViewer } from "./components/product-viewer"
import { FeaturesSection } from "./components/features-section"
import { PerformanceSection } from "./components/performance-section"
import { SpecificationsSection } from "./components/specifications-section"
import { AccessoriesSection } from "./components/accessories-section"

// Mock data - in real scenario, this would come from your CMS/API
const showcaseData = {
  "dji-air-3s": {
    name: "DJI Air 3S",
    tagline: "Omnidirectional Obstacle Sensing.\nNext-Level Night Imaging.",
    description: "The DJI Air 3S is a powerful, intelligent drone featuring dual-camera setup with 1-inch CMOS sensor and a 70mm medium tele camera. Capture stunning 14-bit RAW photos and shoot in 4K/60fps HDR or 4K/120fps slow motion.",
    price: "$1,099",
    priceMonthly: "$45.79/mo. for 24 mo.",
    heroImage: "/images/showcase/air-3s/hero.jpg",
    highlights: [
      {
        id: "design",
        title: "Design",
        description: "Compact, foldable design with omnidirectional obstacle sensing for safer flights.",
        media: "/images/showcase/air-3s/design.mp4"
      },
      {
        id: "camera",
        title: "Dual Camera System",
        description: "1-inch CMOS primary camera paired with a 70mm medium tele camera for versatile shooting.",
        media: "/images/showcase/air-3s/camera.mp4"
      },
      {
        id: "night",
        title: "Free Panorama Night Mode",
        description: "Capture breathtaking nightscapes with advanced imaging technology.",
        media: "/images/showcase/air-3s/night.mp4"
      },
      {
        id: "video",
        title: "4K/120fps Video",
        description: "Cinematic slow motion and smooth HDR footage in stunning 4K resolution.",
        media: "/images/showcase/air-3s/video.mp4"
      }
    ],
    design: {
      title: "Intelligent Flight.\nSafer Navigation.",
      subtitle: "The Air 3S features omnidirectional obstacle sensing with six fisheye vision sensors and downward dual-vision sensors, ensuring safe flight in all directions.",
      features: [
        "Omnidirectional Obstacle Sensing",
        "Advanced Return to Home",
        "Foldable Compact Design",
        "Up to 45 Minutes Flight Time"
      ]
    },
    features: [
      {
        title: "Primary Camera",
        specs: ["1-inch CMOS Sensor", "50MP Photos", "f/1.8 Aperture", "24mm Equivalent"],
        icon: "camera"
      },
      {
        title: "Tele Camera",
        specs: ["1/1.3-inch CMOS", "48MP Photos", "f/2.8 Aperture", "70mm Equivalent"],
        icon: "lens"
      },
      {
        title: "Video Performance",
        specs: ["4K/60fps HDR", "4K/120fps", "10-bit D-Log M", "Up to 150 Mbps"],
        icon: "video"
      },
      {
        title: "Intelligent Features",
        specs: ["ActiveTrack 360°", "Spotlight 2.0", "Point of Interest 3.0", "MasterShots"],
        icon: "ai"
      }
    ],
    performance: {
      title: "Performance.\nPowered by Innovation.",
      description: "Experience unmatched flight performance with intelligent battery management and powerful motors that deliver stable flight even in challenging conditions.",
      stats: [
        { label: "Max Flight Time", value: "45 min" },
        { label: "Max Speed", value: "42 mph" },
        { label: "Max Wind Resistance", value: "23.6 mph" },
        { label: "Max Altitude", value: "19,685 ft" }
      ]
    },
    specifications: [
      {
        category: "Aircraft",
        specs: [
          { label: "Takeoff Weight", value: "724 g" },
          { label: "Dimensions (Folded)", value: "207×100×91.1 mm" },
          { label: "Max Ascent Speed", value: "6 m/s (S Mode)" },
          { label: "Max Descent Speed", value: "6 m/s (S Mode)" }
        ]
      },
      {
        category: "Camera",
        specs: [
          { label: "Primary Sensor", value: "1-inch CMOS, 50MP" },
          { label: "Tele Sensor", value: "1/1.3-inch CMOS, 48MP" },
          { label: "Video Resolution", value: "4K: 3840×2160@24/25/30/48/50/60/100/120fps" },
          { label: "Photo Format", value: "JPEG/DNG (RAW)" }
        ]
      },
      {
        category: "Battery",
        specs: [
          { label: "Capacity", value: "4241 mAh" },
          { label: "Voltage", value: "17.26 V" },
          { label: "Battery Type", value: "Li-ion" },
          { label: "Charging Time", value: "Approx. 60 min" }
        ]
      }
    ],
    accessories: [
      {
        name: "DJI RC 2",
        description: "Compact remote controller with built-in screen for enhanced control.",
        image: "/images/accessories/rc2.jpg",
        price: "$299"
      },
      {
        name: "Intelligent Flight Battery",
        description: "Extended 45-minute flight time with intelligent battery management.",
        image: "/images/accessories/battery.jpg",
        price: "$199"
      },
      {
        name: "ND Filters Set",
        description: "Professional ND4/8/16/32 filters for creative exposure control.",
        image: "/images/accessories/nd-filters.jpg",
        price: "$89"
      }
    ]
  }
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const { slug } = await params
  const product = showcaseData[slug as keyof typeof showcaseData]

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <HeroSection
        name={product.name}
        tagline={product.tagline}
        price={product.price}
        priceMonthly={product.priceMonthly}
        heroImage={product.heroImage}
      />

      {/* Highlights Gallery */}
      <HighlightsGallery highlights={product.highlights} />

      {/* Design Section */}
      <DesignSection
        title={product.design.title}
        subtitle={product.design.subtitle}
        features={product.design.features}
      />

      {/* Product Viewer */}
      <ProductViewer />

      {/* Features Section */}
      <FeaturesSection features={product.features} />

      {/* Performance Section */}
      <PerformanceSection
        title={product.performance.title}
        description={product.performance.description}
        stats={product.performance.stats}
      />

      {/* Specifications */}
      <SpecificationsSection specifications={product.specifications} />

      {/* Accessories */}
      <AccessoriesSection accessories={product.accessories} />
    </div>
  )
}
