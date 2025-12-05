"use client"

interface HeroSectionProps {
  name: string
  tagline: string
  subtitle: string
  description: string
  price: string
  priceMonthly: string
  heroAnimation: string
}

export function HeroSection({
  name,
  tagline,
  subtitle,
  description,
  price,
  priceMonthly,
  heroAnimation
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Top Announcement Bar */}
      <div className="bg-gray-100 py-3">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-gray-700">
            Now through 12/1, get a DJI Gift Card up to $200 when you buy Mavic 3 Pro.{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Shop
            </a>
          </p>
        </div>
      </div>

      {/* Hero Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            {name}
          </h1>
          <p className="text-2xl font-medium text-gray-900 sm:text-3xl md:text-4xl">
            {tagline}
          </p>
        </div>

        {/* Hero Animation */}
        <div className="relative mx-auto mb-8 max-w-5xl">
          <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
            {/* Placeholder for hero animation */}
            <div className="text-center">
              <div className="mb-4 text-6xl">🚁</div>
              <p className="text-sm text-gray-500">Hero Animation Placeholder</p>
            </div>
          </div>
        </div>

        {/* CTA and Pricing */}
        <div className="mb-6 text-center">
          <p className="mb-4 text-lg text-gray-600">{subtitle}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors">
              Buy
            </button>
            <div className="text-gray-600">
              <p className="text-sm">
                {price} <span className="text-gray-500">or</span> {priceMonthly}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  )
}
