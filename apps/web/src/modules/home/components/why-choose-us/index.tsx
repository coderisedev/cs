import { Shield, Zap, Headphones } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Premium Quality",
    description: "Professional-grade materials",
  },
  {
    icon: Zap,
    title: "Plug & Play",
    description: "Easy setup and configuration",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    description: "Dedicated customer service",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-8 sm:py-12 border-b">
      <div className="mobile-container">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-start sm:items-center gap-3 sm:gap-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
