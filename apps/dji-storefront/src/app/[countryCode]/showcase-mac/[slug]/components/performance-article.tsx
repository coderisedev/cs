"use client"

interface Stat {
  label: string
  sublabel: string
  icon: string
}

interface Description {
  title: string
  body: string
}

interface PerformanceArticleProps {
  sectionTitle: string
  title: string
  chipName: string
  chipImage: string
  stats: Stat[]
  description: Description[]
}

export function PerformanceArticle({
  sectionTitle,
  title,
  chipName,
  stats,
  description
}: PerformanceArticleProps) {
  return (
    <article className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {sectionTitle}
          </p>
          <h2 className="mb-6 text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
            {title}
          </h2>
        </div>

        {/* Performance Visual */}
        <div className="mb-16">
          <div className="relative mx-auto max-w-4xl">
            <div className="flex aspect-video items-center justify-center rounded-2xl bg-white shadow-lg">
              <div className="text-center">
                <div className="mb-4 text-6xl">⚡</div>
                <p className="text-sm text-gray-500">Performance Animation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chip and Stats */}
        <div className="mb-16 grid gap-12 lg:grid-cols-2">
          {/* Chip Image */}
          <div className="flex items-center justify-center">
            <div className="max-w-md">
              <div className="mb-6 flex aspect-square items-center justify-center rounded-2xl bg-white p-8 shadow-md">
                <div className="text-center">
                  <div className="mb-4 text-7xl">🔧</div>
                  <p className="text-sm font-medium text-gray-700">{chipName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-2xl bg-white p-6 shadow-md">
                <div className="mb-2 text-3xl">{stat.icon === 'clock' ? '⏱️' : stat.icon === 'signal' ? '📡' : '💨'}</div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description Sections */}
        <div className="space-y-12">
          {description.map((desc, index) => (
            <div key={index} className="mx-auto max-w-3xl">
              <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                {desc.title}
              </h3>
              <p className="text-base leading-relaxed text-gray-700">{desc.body}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            Learn more about performance
            <span>→</span>
          </button>
        </div>
      </div>
    </article>
  )
}
