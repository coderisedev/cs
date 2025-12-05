"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import type { ContentSection as ContentSectionType } from "@/lib/strapi/product-detail"

interface ContentSectionProps extends ContentSectionType {
  className?: string
}

export function ContentSection({
  eyebrow,
  heading,
  description,
  mediaUrl,
  mediaAlt,
  mediaPosition,
  theme,
  className,
}: ContentSectionProps) {
  const isGray = theme === "gray"
  const isMediaLeft = mediaPosition === "left"
  const isMediaTop = mediaPosition === "top"
  const isMediaBottom = mediaPosition === "bottom"
  const isMediaContentBottom = mediaPosition === "content-bottom"
  const hasMedia = !!mediaUrl

  return (
    <section
      className={cn(
        "py-[var(--fluid-section-py)]",
        isGray ? "bg-[#F5F5F7]" : "bg-white",
        className
      )}
    >
      <div className="container max-w-[980px] mx-auto px-4 sm:px-6">
        {/* Eyebrow */}
        {eyebrow && (
          <p className="mb-[var(--fluid-gap-xs)] text-[length:var(--fluid-body-sm)] font-medium uppercase tracking-widest text-foreground-muted">
            {eyebrow}
          </p>
        )}

        {/* Media Top */}
        {isMediaTop && hasMedia && (
          <div className="mb-[var(--fluid-gap-lg)] aspect-video relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg">
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? heading}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 980px"
            />
          </div>
        )}

        {/* Content Grid */}
        <div
          className={cn(
            "grid gap-[var(--fluid-gap-xl)]",
            hasMedia && !isMediaTop && !isMediaBottom && !isMediaContentBottom
              ? "lg:grid-cols-2 items-center"
              : ""
          )}
        >
          {/* Media Left */}
          {isMediaLeft && hasMedia && (
            <div className="aspect-video relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
              <Image
                src={mediaUrl}
                alt={mediaAlt ?? heading}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          )}

          {/* Text Content */}
          <div
            className={cn(
              "flex flex-col justify-center",
              isMediaLeft ? "lg:order-2" : "",
              !hasMedia || isMediaTop || isMediaBottom || isMediaContentBottom ? "max-w-2xl" : ""
            )}
          >
            <h2 className="text-[length:var(--fluid-heading-lg)] font-semibold tracking-tight text-foreground-primary mb-[var(--fluid-gap-sm)] leading-tight">
              {heading}
            </h2>
            {description && (
              <div
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-foreground-secondary prose-p:leading-relaxed prose-p:text-foreground-secondary"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>

          {/* Media Right (default) */}
          {!isMediaLeft && !isMediaTop && !isMediaBottom && !isMediaContentBottom && hasMedia && (
            <div className="aspect-video relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
              <Image
                src={mediaUrl}
                alt={mediaAlt ?? heading}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 480px"
              />
            </div>
          )}
        </div>

        {/* Media Bottom */}
        {isMediaBottom && hasMedia && (
          <div className="mt-[var(--fluid-gap-lg)] aspect-video relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg">
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? heading}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 980px"
            />
          </div>
        )}

        {/* Media Content Bottom - media placed directly after content text */}
        {isMediaContentBottom && hasMedia && (
          <div className="mt-[var(--fluid-gap-lg)] aspect-video relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg">
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? heading}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 980px"
            />
          </div>
        )}
      </div>
    </section>
  )
}
