"use client"

import Image from "next/image"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { cn } from "@/lib/utils"
import type { ContentSection as ContentSectionType } from "@/lib/strapi/product-detail"

const markdownComponents: Components = {
  h2: ({ className, children, ...props }) => (
    <h2 {...props} className={cn("text-xl font-semibold text-foreground-primary mt-6 mb-3", className)}>
      {children}
    </h2>
  ),
  h3: ({ className, children, ...props }) => (
    <h3 {...props} className={cn("text-lg font-semibold text-foreground-primary mt-4 mb-2", className)}>
      {children}
    </h3>
  ),
  p: ({ className, children, ...props }) => (
    <p {...props} className={cn("text-foreground-secondary leading-relaxed mb-4 last:mb-0", className)}>
      {children}
    </p>
  ),
  ul: ({ className, children, ...props }) => (
    <ul {...props} className={cn("list-disc pl-6 space-y-1 text-foreground-secondary mb-4", className)}>
      {children}
    </ul>
  ),
  ol: ({ className, children, ...props }) => (
    <ol {...props} className={cn("list-decimal pl-6 space-y-1 text-foreground-secondary mb-4", className)}>
      {children}
    </ol>
  ),
  li: ({ className, children, ...props }) => (
    <li {...props} className={cn("text-foreground-secondary leading-relaxed", className)}>
      {children}
    </li>
  ),
  a: ({ className, children, href, ...props }) => (
    <a
      {...props}
      href={href ?? "#"}
      className={cn("text-primary-500 underline hover:text-primary-600", className)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ className, children, ...props }) => (
    <strong {...props} className={cn("font-semibold text-foreground-primary", className)}>
      {children}
    </strong>
  ),
  blockquote: ({ className, children, ...props }) => (
    <blockquote {...props} className={cn("border-l-4 border-primary-500 pl-4 italic text-foreground-secondary my-4", className)}>
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => (
    <code {...props} className={cn("bg-neutral-100 px-1.5 py-0.5 rounded text-sm font-mono", className)}>
      {children}
    </code>
  ),
}

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
      <div className="container max-w-[882px] mx-auto px-4 sm:px-6">
        {/* Eyebrow */}
        {eyebrow && (
          <p className="mb-[var(--fluid-gap-xs)] text-[length:var(--fluid-body-sm)] font-medium uppercase tracking-widest text-foreground-muted">
            {eyebrow}
          </p>
        )}

        {/* Media Top */}
        {isMediaTop && hasMedia && (
          <div className="mb-[var(--fluid-gap-lg)] relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg">
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? heading}
              width={882}
              height={600}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, 882px"
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
            <div className="relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
              <Image
                src={mediaUrl}
                alt={mediaAlt ?? heading}
                width={441}
                height={400}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 441px"
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
              <div className="max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={markdownComponents}
                >
                  {description}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Media Right (default) */}
          {!isMediaLeft && !isMediaTop && !isMediaBottom && !isMediaContentBottom && hasMedia && (
            <div className="relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg transition-shadow hover:shadow-xl">
              <Image
                src={mediaUrl}
                alt={mediaAlt ?? heading}
                width={441}
                height={400}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 441px"
              />
            </div>
          )}
        </div>

        {/* Media Bottom */}
        {isMediaBottom && hasMedia && (
          <div className="mt-[var(--fluid-gap-lg)] relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg">
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? heading}
              width={882}
              height={600}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, 882px"
            />
          </div>
        )}

        {/* Media Content Bottom - media placed directly after content text */}
        {isMediaContentBottom && hasMedia && (
          <div className="mt-[var(--fluid-gap-lg)] relative rounded-[var(--fluid-radius)] overflow-hidden shadow-lg">
            <Image
              src={mediaUrl}
              alt={mediaAlt ?? heading}
              width={882}
              height={600}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 100vw, 882px"
            />
          </div>
        )}
      </div>
    </section>
  )
}
