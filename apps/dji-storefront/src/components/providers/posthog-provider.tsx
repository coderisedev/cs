"use client"

/**
 * PostHog Provider Component
 *
 * Wraps the application with PostHog context for analytics tracking.
 * Must be used as a client component since PostHog runs in the browser.
 *
 * GDPR/CCPA Compliance:
 * - Only initializes PostHog when user has given analytics consent
 * - Listens to consent changes and opts in/out accordingly
 */

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import {
  initPostHog,
  posthog,
  POSTHOG_KEY,
  optInToTracking,
  optOutOfTracking,
  isPostHogLoaded,
} from "@/lib/posthog"
import { useConsent } from "@/lib/context/consent-context"
import { requiresExplicitConsent } from "@/lib/consent/region-rules"

/**
 * Track page views on route changes
 */
function PostHogPageView(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { hasAnalyticsConsent } = useConsent()

  useEffect(() => {
    if (!POSTHOG_KEY || typeof window === "undefined") return

    // Only track if user has consented to analytics
    if (!hasAnalyticsConsent()) return

    // Construct full URL for tracking
    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    posthog.capture("$pageview", {
      $current_url: window.location.origin + url,
    })
  }, [pathname, searchParams, hasAnalyticsConsent])

  return null
}

interface PostHogProviderProps {
  children: React.ReactNode
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const { state, hasAnalyticsConsent } = useConsent()
  const hasConsented = state.hasConsented
  const analyticsAllowed = hasAnalyticsConsent()
  const prevAnalyticsAllowed = useRef<boolean | null>(null)

  // Initialize PostHog based on consent
  useEffect(() => {
    if (!POSTHOG_KEY) return

    // Determine if we should opt out by default based on region
    const optOutByDefault = requiresExplicitConsent(state.regionType)

    // Initialize PostHog (only happens once)
    if (!isPostHogLoaded()) {
      initPostHog(optOutByDefault)
    }

    // Handle consent changes
    if (prevAnalyticsAllowed.current !== null && prevAnalyticsAllowed.current !== analyticsAllowed) {
      if (analyticsAllowed) {
        optInToTracking()
      } else {
        optOutOfTracking()
      }
    }

    // If user has made an explicit consent choice, apply it
    if (hasConsented && isPostHogLoaded()) {
      if (analyticsAllowed) {
        optInToTracking()
      } else {
        optOutOfTracking()
      }
    }

    prevAnalyticsAllowed.current = analyticsAllowed
  }, [hasConsented, analyticsAllowed, state.regionType])

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
