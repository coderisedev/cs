"use client"

interface Stat {
  label: string
  value: string
}

interface PerformanceSectionProps {
  title: string
  description: string
  stats: Stat[]
}

export function PerformanceSection({
  title,
  description,
  stats,
}: PerformanceSectionProps) {
  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 whitespace-pre-line">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            {description}
          </p>
        </div>

        {/* Visual Representation */}
        <div className="relative w-full max-w-5xl mx-auto mb-16 aspect-[16/9]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="text-9xl opacity-10">⚡</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-800/30 rounded-2xl backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all"
            >
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
