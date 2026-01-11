import * as Sentry from "@sentry/nextjs"

export const onRequestError = Sentry.captureRequestError

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Environment configuration
      environment: process.env.NODE_ENV,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Filter out noisy errors
      ignoreErrors: [
        // Network errors
        "ECONNRESET",
        "ECONNREFUSED",
        "ETIMEDOUT",
        // Expected validation errors
        "ValidationError",
      ],

      // Filter sensitive data from events
      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers["authorization"]
          delete event.request.headers["cookie"]
          delete event.request.headers["x-api-key"]
        }

        // Remove sensitive data from request body
        if (event.request?.data && typeof event.request.data === "object" && event.request.data !== null) {
          const sensitiveFields = ["password", "token", "secret", "credit_card", "cvv"]
          const data = event.request.data as Record<string, unknown>
          for (const field of sensitiveFields) {
            if (field in data) {
              data[field] = "[Filtered]"
            }
          }
        }

        return event
      },

      // Don't send events in development unless explicitly enabled
      enabled: process.env.NODE_ENV === "production" || process.env.SENTRY_ENABLED === "true",
    })
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Environment configuration
      environment: process.env.NODE_ENV,

      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Don't send events in development unless explicitly enabled
      enabled: process.env.NODE_ENV === "production" || process.env.SENTRY_ENABLED === "true",
    })
  }
}
