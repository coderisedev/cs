/**
 * PostHog Analytics Configuration
 *
 * Provides product analytics, session replay, feature flags, and A/B testing.
 * https://posthog.com/docs/libraries/next-js
 */

import posthog from "posthog-js"

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

/**
 * Initialize PostHog client-side
 * Should only be called once in the app lifecycle
 */
export function initPostHog(): void {
  if (typeof window === "undefined") return
  if (!POSTHOG_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] NEXT_PUBLIC_POSTHOG_KEY not configured")
    }
    return
  }

  // Prevent double initialization
  if (posthog.__loaded) return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,

    // Capture pageviews automatically
    capture_pageview: true,

    // Capture pageleave events for session duration
    capture_pageleave: true,

    // Session Replay configuration
    session_recording: {
      // Mask all text content for privacy
      maskAllInputs: true,
      maskTextSelector: "[data-ph-mask]",
    },

    // Autocapture clicks, form submissions, etc.
    autocapture: true,

    // Respect Do Not Track browser setting
    respect_dnt: true,

    // Disable in development unless explicitly enabled
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        // Uncomment to enable debug mode in development
        // posthog.debug()
      }
    },

    // Bootstrap for faster initial load (optional)
    bootstrap: {
      distinctID: undefined, // Will be auto-generated
    },

    // Persistence: localStorage is recommended
    persistence: "localStorage+cookie",

    // Cross-subdomain tracking
    cross_subdomain_cookie: true,
  })
}

/**
 * Identify a user (call after login)
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, unknown>
): void {
  if (!POSTHOG_KEY || typeof window === "undefined") return

  posthog.identify(userId, properties)
}

/**
 * Reset user identity (call after logout)
 */
export function resetUser(): void {
  if (!POSTHOG_KEY || typeof window === "undefined") return

  posthog.reset()
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
): void {
  if (!POSTHOG_KEY || typeof window === "undefined") return

  posthog.capture(eventName, properties)
}

/**
 * Set user properties without identifying
 */
export function setUserProperties(properties: Record<string, unknown>): void {
  if (!POSTHOG_KEY || typeof window === "undefined") return

  posthog.setPersonProperties(properties)
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagKey: string): boolean {
  if (!POSTHOG_KEY || typeof window === "undefined") return false

  return posthog.isFeatureEnabled(flagKey) ?? false
}

/**
 * Get feature flag value (for multivariate flags)
 */
export function getFeatureFlag(flagKey: string): string | boolean | undefined {
  if (!POSTHOG_KEY || typeof window === "undefined") return undefined

  return posthog.getFeatureFlag(flagKey)
}

// Re-export posthog instance for direct access
export { posthog }
