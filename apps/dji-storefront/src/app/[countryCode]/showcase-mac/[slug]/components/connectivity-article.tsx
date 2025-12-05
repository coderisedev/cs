"use client"

interface Port {
  name: string
  description: string
  position: string
}

interface Wireless {
  title: string
  features: string[]
}

interface Ecosystem {
  title: string
  description: string
  image: string
}

interface ConnectivityArticleProps {
  sectionTitle: string
  title: string
  ports: Port[]
  wireless: Wireless
  ecosystem: Ecosystem
}

export function ConnectivityArticle({
  sectionTitle,
  title,
  ports,
  wireless,
  ecosystem
}: ConnectivityArticleProps) {
  return (
    <article className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
            {sectionTitle}
          </p>
          <h2 className="text-4xl font-semibold text-gray-900 sm:text-5xl md:text-6xl">
            {title}
          </h2>
        </div>

        {/* Ports Diagram */}
        <div className="mb-16">
          <div className="relative mx-auto max-w-4xl">
            <div className="aspect-video overflow-hidden rounded-2xl bg-white p-8 shadow-lg">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-7xl">🔌</div>
                  <p className="text-sm text-gray-500">Ports Diagram</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {ports.map((port, index) => (
              <div key={index} className="rounded-xl bg-white p-6 shadow-md">
                <h4 className="mb-2 font-semibold text-gray-900">{port.name}</h4>
                <p className="text-sm text-gray-600">{port.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wireless Section */}
        <div className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h3 className="mb-6 text-3xl font-semibold text-gray-900">{wireless.title}</h3>
            <ul className="grid gap-4 sm:grid-cols-2">
              {wireless.features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <span className="text-blue-600">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ecosystem */}
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className="aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-7xl">🌐</div>
                  <p className="text-sm text-gray-500">Ecosystem</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="mb-4 text-3xl font-semibold text-gray-900">{ecosystem.title}</h3>
            <p className="text-base leading-relaxed text-gray-700">{ecosystem.description}</p>
          </div>
        </div>
      </div>
    </article>
  )
}
