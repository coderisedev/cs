"use client"

import { Check } from "lucide-react"
import type { FeatureBullet } from "@/lib/strapi/product-detail"

interface FeatureBulletsProps {
  features: FeatureBullet[]
  className?: string
}

export function FeatureBullets({ features, className }: FeatureBulletsProps) {
  if (features.length === 0) return null

  return (
    <section className={className}>
      <h3 className="text-[length:var(--fluid-heading-sm)] font-semibold text-foreground-primary mb-[var(--fluid-gap-sm)]">Features</h3>
      <ul className="space-y-[var(--fluid-gap-sm)] max-w-2xl">
        {features.map((feature, idx) => (
          <li
            key={idx}
            className="flex items-start gap-[var(--fluid-gap-xs)]"
          >
            <Check className="h-[var(--fluid-icon-sm)] w-[var(--fluid-icon-sm)] text-semantic-success mt-0.5 flex-shrink-0" />
            <span className="text-[length:var(--fluid-body-md)] leading-relaxed text-foreground-secondary">
              {feature.text}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
