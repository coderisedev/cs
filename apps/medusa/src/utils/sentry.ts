/**
 * Sentry initialization and utilities for Medusa backend
 */

import * as Sentry from "@sentry/node"

let initialized = false

/**
 * Initialize Sentry for error tracking and performance monitoring
 * Call this early in the application lifecycle (before other imports if possible)
 */
export function initSentry(): void {
  if (initialized) {
    return
  }

  // Support both MEDUSA_SENTRY_DSN (GCE deploy) and SENTRY_DSN (generic)
  const dsn = process.env.MEDUSA_SENTRY_DSN || process.env.SENTRY_DSN
  if (!dsn) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[Sentry] SENTRY_DSN not configured - error tracking disabled in production")
    }
    return
  }

  const environment = process.env.NODE_ENV || "development"
  const release = process.env.SENTRY_RELEASE || process.env.npm_package_version

  Sentry.init({
    dsn,
    environment,
    release,

    // Performance monitoring - reduce sample rate in production
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Enable profiling for a sample of traces
    profilesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Integrations for Node.js
    integrations: [
      // Auto-instrument PostgreSQL queries
      Sentry.postgresIntegration(),
      // Auto-instrument Redis operations
      Sentry.redisIntegration(),
      // Auto-instrument HTTP requests
      Sentry.httpIntegration(),
    ],

    // Filter sensitive data before sending to Sentry
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"]
        delete event.request.headers["cookie"]
        delete event.request.headers["x-api-key"]
        delete event.request.headers["x-medusa-access-token"]
      }

      // Scrub sensitive data from request body
      if (event.request?.data && typeof event.request.data === "object") {
        const sensitiveFields = [
          "password",
          "token",
          "secret",
          "credit_card",
          "cvv",
          "card_number",
          "api_key",
          "refresh_token",
          "access_token",
        ]
        for (const field of sensitiveFields) {
          if (field in event.request.data) {
            event.request.data[field] = "[Filtered]"
          }
        }
      }

      return event
    },

    // Filter breadcrumbs to avoid noise
    beforeBreadcrumb(breadcrumb) {
      // Filter out noisy health check requests
      if (
        breadcrumb.category === "http" &&
        breadcrumb.data?.url?.includes("/health")
      ) {
        return null
      }
      return breadcrumb
    },

    // Only enable in production or when explicitly enabled
    enabled: environment === "production" || process.env.SENTRY_ENABLED === "true",
  })

  initialized = true

  if (environment !== "production") {
    console.log("[Sentry] Initialized for environment:", environment)
  }
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>
): string | undefined {
  return Sentry.captureException(error, {
    extra: context,
  })
}

/**
 * Capture a message and send to Sentry
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, unknown>
): string | undefined {
  return Sentry.captureMessage(message, {
    level,
    extra: context,
  })
}

/**
 * Set user context for Sentry
 * Call this after customer authentication
 */
export function setUserContext(user: {
  id: string
  email?: string
  customerId?: string
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    customerId: user.customerId,
  } as Sentry.User)
}

/**
 * Clear user context from Sentry
 * Call this after customer logout
 */
export function clearUserContext(): void {
  Sentry.setUser(null)
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return initialized
}

/**
 * Add a breadcrumb for context
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb)
}

// Re-export Sentry for direct access when needed
export { Sentry }
