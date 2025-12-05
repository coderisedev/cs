"use client"

import { cn } from "@/lib/utils"
import type { SpecGroup } from "@/lib/strapi/product-detail"

interface SpecGroupsProps {
  groups: SpecGroup[]
  className?: string
}

export function SpecGroups({ groups, className }: SpecGroupsProps) {
  if (groups.length === 0) return null

  return (
    <div className={cn("space-y-[var(--fluid-gap-lg)] max-w-4xl", className)}>
      {groups.map((group, idx) => (
        <div key={idx}>
          <h4 className="text-[length:var(--fluid-heading-sm)] font-semibold text-foreground-primary mb-[var(--fluid-gap-sm)] pb-[var(--fluid-gap-xs)] border-b border-border-secondary">
            {group.groupName}
          </h4>
          <div className="divide-y divide-border-secondary">
            {group.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={cn(
                  "flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 sm:gap-4 py-[var(--fluid-gap-xs)] px-[var(--fluid-gap-xs)]",
                  itemIdx % 2 === 0 ? "bg-transparent" : "bg-[#F5F5F7]/50"
                )}
              >
                <span className="text-[length:var(--fluid-body-md)] text-foreground-primary font-medium sm:font-normal">
                  {item.label}
                </span>
                <span className="text-[length:var(--fluid-body-md)] text-foreground-secondary sm:text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
