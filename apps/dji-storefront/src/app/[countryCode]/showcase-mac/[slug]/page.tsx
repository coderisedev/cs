import { notFound } from "next/navigation"
import { HeroSection } from "./components/hero-section"
import { DesignArticle } from "./components/design-article"
import { PerformanceArticle } from "./components/performance-article"
import { IntelligentFeaturesArticle } from "./components/intelligent-features-article"
import { CameraArticle } from "./components/camera-article"
import { DisplayArticle } from "./components/display-article"
import { ConnectivityArticle } from "./components/connectivity-article"
import { CompareSection } from "./components/compare-section"
import { AccessoriesSection } from "./components/accessories-section"

// Mock data - MacBook Air-style product showcase
const productsData = {
  "mavic-3-pro": {
    name: "DJI Mavic 3 Pro",
    tagline: "Professional aerial capture.",
    subtitle: "Built for creators.",
    description: "The DJI Mavic 3 Pro is the ultimate professional drone for creators. With a tri-camera system featuring Hasselblad quality, 43-minute flight time, and omnidirectional obstacle sensing, capture breathtaking aerial footage like never before.",
    price: "$2,199",
    priceMonthly: "$183.25/mo. for 12 mo.",
    heroAnimation: "/videos/products/mavic-3-pro-hero.mp4",
    colors: [
      { name: "Cine Grey", value: "grey" },
      { name: "Arctic White", value: "white" }
    ],
    design: {
      sectionTitle: "DESIGN",
      title: "Built to fly anywhere.",
      description: "Remarkably compact and weighing less than 1kg, the Mavic 3 Pro fits easily into your camera bag. The foldable design and durable carbon fiber construction make it the perfect travel companion for professional creators.",
      features: [
        {
          title: "Two perfectly portable sizes.",
          description: "The standard Mavic 3 Pro is ultra-portable, and the Cine Premium version adds 1TB of internal SSD storage for RAW workflows.",
          image: "/images/products/mavic-3-pro-sizes.jpg"
        },
        {
          title: "Premium materials.",
          description: "Every Mavic 3 Pro features aerospace-grade aluminum alloy body construction with carbon fiber arms for maximum strength and minimal weight.",
          image: "/images/products/mavic-3-pro-materials.jpg"
        }
      ],
      colorGallery: {
        title: "Professional finishes.",
        description: "Choose from two elegant colors designed for professional work. Each drone comes with matching propellers and carrying case."
      },
      lifestyle: {
        images: [
          "/images/products/mavic-3-pro-lifestyle-1.jpg",
          "/images/products/mavic-3-pro-lifestyle-2.jpg",
          "/images/products/mavic-3-pro-lifestyle-3.jpg"
        ],
        caption: "Compact design that fits in your backpack."
      }
    },
    performance: {
      sectionTitle: "PERFORMANCE AND FLIGHT TIME",
      title: "Professional power. All-day battery.",
      chipName: "Qualcomm Snapdragon 8Gen2",
      chipImage: "/images/products/snapdragon-chip.jpg",
      stats: [
        { label: "Up to 43min", sublabel: "flight time", icon: "clock" },
        { label: "15km", sublabel: "max transmission range", icon: "signal" },
        { label: "12m/s", sublabel: "wind resistance", icon: "wind" }
      ],
      description: [
        {
          title: "Pro-grade flight performance.",
          body: "The Mavic 3 Pro delivers exceptional stability and control with advanced flight algorithms and powerful motors. Fly with confidence in challenging conditions."
        },
        {
          title: "Intelligent battery system.",
          body: "Advanced battery management provides up to 43 minutes of flight time. Fast charging gets you back in the air in just 60 minutes."
        },
        {
          title: "Extended range.",
          body: "O3+ transmission technology delivers crystal-clear 1080p/60fps live feed up to 15km away with minimal latency."
        }
      ]
    },
    intelligentFeatures: {
      sectionTitle: "INTELLIGENT FLIGHT",
      title: "AI-powered creativity.",
      subtitle: "Professional tools at your fingertips.",
      description: "Advanced AI features help you capture professional shots effortlessly. From subject tracking to autonomous waypoint missions, Mavic 3 Pro makes complex shots simple.",
      features: [
        {
          id: "activetrack",
          name: "ActiveTrack 5.0",
          description: "Advanced subject tracking follows your subject through complex environments with precise trajectory prediction.",
          demo: "/videos/features/activetrack.mp4"
        },
        {
          id: "quickshots",
          name: "QuickShots",
          description: "Automated cinematic movements including Dronie, Helix, Rocket, Circle, and Boomerang with one tap.",
          demo: "/videos/features/quickshots.mp4"
        },
        {
          id: "waypoint",
          name: "Waypoint 3.0",
          description: "Plan complex flight paths with precise altitude and gimbal control for repeatable professional shots.",
          demo: "/videos/features/waypoint.mp4"
        }
      ],
      privacy: {
        title: "Your flights. Your data.",
        body: "All flight data is stored locally on your device with end-to-end encryption. Control what data is shared and when."
      }
    },
    camera: {
      sectionTitle: "CAMERA SYSTEM",
      title: "Tri-camera innovation.",
      systems: [
        {
          id: "hasselblad",
          name: "Hasselblad Main Camera",
          description: "4/3 CMOS sensor captures stunning 20MP stills and 5.1K video with natural Hasselblad colors.",
          specs: [
            "4/3 CMOS Sensor",
            "20MP Photos",
            "f/2.8-f/11 Aperture",
            "24mm Equivalent",
            "5.1K/50fps Video"
          ],
          demo: "/videos/camera/hasselblad.mp4"
        },
        {
          id: "medium-tele",
          name: "Medium Tele Camera",
          description: "Perfect for portraits and compressed perspectives with 70mm equivalent focal length.",
          specs: [
            "1/1.3-inch CMOS",
            "48MP Photos",
            "f/2.8 Aperture",
            "70mm Equivalent (3x Zoom)",
            "4K/60fps Video"
          ],
          demo: "/videos/camera/medium-tele.mp4"
        },
        {
          id: "tele",
          name: "Telephoto Camera",
          description: "Reach distant subjects with 166mm equivalent focal length and hybrid zoom up to 28x.",
          specs: [
            "1/2-inch CMOS",
            "12MP Photos",
            "f/3.4 Aperture",
            "166mm Equivalent (7x Zoom)",
            "4K/60fps Video"
          ],
          demo: "/videos/camera/tele.mp4"
        }
      ],
      gallery: [
        {
          title: "Hasselblad Natural Color.",
          description: "Industry-leading color science captures authentic colors straight out of camera.",
          image: "/images/camera/hasselblad-color.jpg"
        },
        {
          title: "All-camera RAW support.",
          description: "Shoot in DNG RAW on all three cameras for maximum post-production flexibility.",
          image: "/images/camera/raw-support.jpg"
        },
        {
          title: "10-bit D-Log M.",
          description: "Preserve maximum dynamic range for professional color grading workflows.",
          image: "/images/camera/dlog.jpg"
        }
      ]
    },
    display: {
      sectionTitle: "REMOTE CONTROLLER",
      title: "Professional control at your fingertips.",
      controller: {
        name: "DJI RC Pro",
        screen: "5.5-inch 1000-nit touchscreen",
        brightness: "Clearly visible even in bright sunlight",
        description: "The built-in high-brightness screen eliminates the need for a smartphone. Intuitive controls and customizable buttons give you precise control.",
        image: "/images/products/rc-pro.jpg"
      },
      features: [
        "1000 nits peak brightness",
        "O3+ transmission with 15km range",
        "4-hour battery life",
        "Dual control sticks with customizable sensitivity"
      ]
    },
    connectivity: {
      sectionTitle: "CONNECTIVITY",
      title: "Connected flight.",
      ports: [
        {
          name: "USB-C Port",
          description: "Fast data transfer and charging",
          position: "bottom"
        },
        {
          name: "microSD Card Slot",
          description: "Support for cards up to 2TB",
          position: "side"
        },
        {
          name: "Internal Storage",
          description: "1TB SSD (Cine Premium)",
          position: "internal"
        }
      ],
      wireless: {
        title: "O3+ Video Transmission",
        features: [
          "15km max range",
          "1080p/60fps live feed",
          "Ultra-low latency < 120ms",
          "Auto-switching dual frequency"
        ]
      },
      ecosystem: {
        title: "Seamless DJI ecosystem.",
        description: "Works perfectly with DJI Fly app, DJI Assistant, and third-party apps like Litchi and DroneDeploy.",
        image: "/images/products/ecosystem.jpg"
      }
    },
    compare: {
      title: "Ready to upgrade?",
      models: [
        {
          name: "DJI Mini 3 Pro",
          improvements: [
            "3x longer flight time",
            "Tri-camera system vs single",
            "15km range vs 12km",
            "Omnidirectional sensing"
          ]
        },
        {
          name: "DJI Air 3",
          improvements: [
            "Hasselblad color science",
            "Third telephoto camera",
            "5.1K video vs 4K",
            "Professional RAW workflow"
          ]
        }
      ],
      tradeIn: {
        title: "Trade in your old drone.",
        description: "Get credit toward Mavic 3 Pro when you trade in an eligible drone.",
        minValue: "$200",
        maxValue: "$800"
      }
    },
    accessories: [
      {
        name: "DJI RC Pro",
        description: "Professional remote controller with built-in high-brightness screen.",
        image: "/images/accessories/rc-pro.jpg",
        price: "$1,199"
      },
      {
        name: "Intelligent Flight Battery",
        description: "43-minute flight time with intelligent power management.",
        image: "/images/accessories/mavic-battery.jpg",
        price: "$209"
      },
      {
        name: "ND Filters Set",
        description: "Cinema Series ND4/8/16/32/64 filters for all three cameras.",
        image: "/images/accessories/nd-cinema.jpg",
        price: "$179"
      },
      {
        name: "Care Refresh 2-Year",
        description: "Comprehensive coverage with up to 2 replacements per year.",
        image: "/images/accessories/care-refresh.jpg",
        price: "$299"
      }
    ]
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const { slug } = await params
  const product = productsData[slug as keyof typeof productsData]

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <HeroSection
        name={product.name}
        tagline={product.tagline}
        subtitle={product.subtitle}
        description={product.description}
        price={product.price}
        priceMonthly={product.priceMonthly}
        heroAnimation={product.heroAnimation}
      />

      {/* Design Article */}
      <DesignArticle
        sectionTitle={product.design.sectionTitle}
        title={product.design.title}
        description={product.design.description}
        features={product.design.features}
        colorGallery={product.design.colorGallery}
        colors={product.colors}
        lifestyle={product.design.lifestyle}
      />

      {/* Performance Article */}
      <PerformanceArticle
        sectionTitle={product.performance.sectionTitle}
        title={product.performance.title}
        chipName={product.performance.chipName}
        chipImage={product.performance.chipImage}
        stats={product.performance.stats}
        description={product.performance.description}
      />

      {/* Intelligent Features Article */}
      <IntelligentFeaturesArticle
        sectionTitle={product.intelligentFeatures.sectionTitle}
        title={product.intelligentFeatures.title}
        subtitle={product.intelligentFeatures.subtitle}
        description={product.intelligentFeatures.description}
        features={product.intelligentFeatures.features}
        privacy={product.intelligentFeatures.privacy}
      />

      {/* Camera Article */}
      <CameraArticle
        sectionTitle={product.camera.sectionTitle}
        title={product.camera.title}
        systems={product.camera.systems}
        gallery={product.camera.gallery}
      />

      {/* Display Article */}
      <DisplayArticle
        sectionTitle={product.display.sectionTitle}
        title={product.display.title}
        controller={product.display.controller}
        features={product.display.features}
      />

      {/* Connectivity Article */}
      <ConnectivityArticle
        sectionTitle={product.connectivity.sectionTitle}
        title={product.connectivity.title}
        ports={product.connectivity.ports}
        wireless={product.connectivity.wireless}
        ecosystem={product.connectivity.ecosystem}
      />

      {/* Compare Section */}
      <CompareSection
        title={product.compare.title}
        models={product.compare.models}
        tradeIn={product.compare.tradeIn}
        currentProduct={product.name}
      />

      {/* Accessories */}
      <AccessoriesSection
        accessories={product.accessories}
        productName={product.name}
      />
    </div>
  )
}
