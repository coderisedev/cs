"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { cn } from "@/components/ui"

type FeedbackWidgetProps = {
  href: string
}

const FeedbackWidget = ({ href }: FeedbackWidgetProps) => {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={cn(
        "fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full border border-border-base bg-surface-primary px-4 py-2 text-sm font-semibold text-foreground-base shadow-md transition hover:translate-y-0.5 hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--dji-color-focus-ring))]",
        "small:bottom-8 small:right-8"
      )}
      aria-label="Share feedback"
    >
      <MessageCircle className="h-4 w-4" aria-hidden />
      <span>Share feedback</span>
    </Link>
  )
}

export default FeedbackWidget
