"use client"

import { Package } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PackageItem } from "@/lib/strapi/product-detail"

interface PackageContentsProps {
  items: PackageItem[]
  className?: string
}

export function PackageContents({ items, className }: PackageContentsProps) {
  if (items.length === 0) return null

  return (
    <section className={cn("py-[var(--fluid-section-py)] bg-white", className)}>
      <div className="container max-w-[980px] mx-auto px-4 sm:px-6">
        <h3 className="text-[length:var(--fluid-heading-md)] font-semibold text-foreground-primary mb-[var(--fluid-gap-lg)]">
          What&apos;s in the Box
        </h3>
        <div className="grid gap-[var(--fluid-gap-md)] grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-[var(--fluid-gap-sm)]"
            >
              <div className="w-[var(--fluid-icon-md)] h-[var(--fluid-icon-md)] bg-[#F5F5F7] rounded-[var(--fluid-radius)] flex items-center justify-center mb-[var(--fluid-gap-xs)]">
                <Package className="w-[var(--fluid-icon-sm)] h-[var(--fluid-icon-sm)] text-foreground-secondary" />
              </div>
              <p className="text-[length:var(--fluid-body-sm)] text-foreground-primary leading-tight">
                {item.name}
              </p>
              {item.quantity > 1 && (
                <p className="text-[length:var(--fluid-body-sm)] text-foreground-muted mt-1">
                  x{item.quantity}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
