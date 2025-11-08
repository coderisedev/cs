import Image from "next/image"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import type { NewRelease } from "@lib/data/new-release"

interface NewReleaseHighlightProps {
  release: NewRelease | null
}

const badgeClasses =
  "inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"

const buttonBase =
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"

export default function NewReleaseHighlight({ release }: NewReleaseHighlightProps) {
  if (!release) {
    return null
  }

  return (
    <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mobile-container grid gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          {release.tagline && (
            <span className={badgeClasses}>
              <Sparkles className="h-3 w-3" />
              {release.tagline}
            </span>
          )}
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {release.title}
          </h2>
          {release.inventoryBadge && (
            <p className="mt-2 text-sm font-semibold text-amber-300">
              {release.inventoryBadge}
            </p>
          )}
          {release.descriptionHtml && (
            <div
              className="prose prose-invert mt-4 text-base text-slate-100"
              dangerouslySetInnerHTML={{ __html: release.descriptionHtml }}
            />
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {release.ctaLabel && release.ctaUrl && (
              <Link href={release.ctaUrl} className={`${buttonBase} bg-white text-slate-900`}>
                {release.ctaLabel}
              </Link>
            )}
            {release.secondaryCtaLabel && release.secondaryCtaUrl && (
              <Link
                href={release.secondaryCtaUrl}
                className={`${buttonBase} border border-white/30 text-white hover:bg-white/10`}
              >
                {release.secondaryCtaLabel}
              </Link>
            )}
          </div>
          {release.features.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {release.features.map((feature) => (
                <div key={feature.heading} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-1 text-sm font-semibold text-white">{feature.heading}</p>
                  {feature.body ? (
                    <div
                      className="text-sm text-white/80"
                      dangerouslySetInnerHTML={{ __html: feature.body }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {release.stats.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-4 text-white/90 sm:grid-cols-3">
              {release.stats.map((stat) => (
                <div key={stat.label} className="rounded-xl bg-white/5 p-4">
                  <dt className="text-xs uppercase tracking-wide text-white/70">{stat.label}</dt>
                  <dd className="text-2xl font-bold text-white">{stat.value}</dd>
                  {stat.description && (
                    <p className="text-xs text-white/70">{stat.description}</p>
                  )}
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-slate-800 shadow-2xl">
            {release.heroMedia ? (
              release.heroMedia.kind === "embed" ? (
                <div className="aspect-video">
                  <iframe
                    src={release.heroMedia.url}
                    title={release.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ) : (
                <Image
                  src={release.heroMedia.url}
                  alt={release.heroMedia.alt || release.title}
                  width={release.heroMedia.width || 800}
                  height={release.heroMedia.height || 600}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 1024px) 45vw, 90vw"
                />
              )
            ) : (
              <div className="aspect-[4/3]" />
            )}
            {release.isPreorder && (
              <div className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">
                Pre-order
              </div>
            )}
          </div>
          {release.gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {release.gallery.slice(0, 3).map((image, index) => (
                <div key={`${image.url}-${index}`} className="relative overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src={image.url}
                    alt={image.alt || `${release.title} detail ${index + 1}`}
                    width={image.width || 300}
                    height={image.height || 200}
                    className="h-full w-full object-cover"
                    sizes="200px"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
