"use client"

interface Controller {
  name: string
  screen: string
  brightness: string
  description: string
  image: string
}

interface DisplayArticleProps {
  sectionTitle: string
  title: string
  controller: Controller
  features: string[]
}

export function DisplayArticle({
  sectionTitle,
  title,
  controller,
  features
}: DisplayArticleProps) {
  return (
    <article className="bg-white py-20">
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

        {/* Controller Display */}
        <div className="mb-12 grid gap-12 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            <div className="aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-gray-100 shadow-lg">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-7xl">🎮</div>
                  <p className="text-sm font-medium text-gray-700">{controller.name}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h3 className="mb-2 text-2xl font-semibold text-gray-900">{controller.screen}</h3>
              <p className="text-base text-gray-700">{controller.brightness}</p>
            </div>
            <p className="text-base leading-relaxed text-gray-700">
              {controller.description}
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mx-auto max-w-3xl">
          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1 text-blue-600">✓</span>
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}
