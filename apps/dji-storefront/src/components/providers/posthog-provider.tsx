"use client"

/**
 * PostHog Provider Component
 *
 * Wraps the application with PostHog context for analytics tracking.
 * Must be used as a client component since PostHog runs in the browser.
 */

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { initPostHog, posthog, POSTHOG_KEY } from "@/lib/posthog"

/**
 * Track page views on route changes
 */
function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!POSTHOG_KEY || typeof window === "undefined") return

    // Construct full URL for tracking
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    posthog.capture("$pageview", {
      $current_url: window.location.origin + url,
    })
  }, [pathname, searchParams])

  return null
}

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    initPostHog()
  }, [])

  // If PostHog is not configured, render children without provider
  if (!POSTHOG_KEY) {
    return <>{children}</>
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  )
}
