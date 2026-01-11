// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay settings
  // This sets the sample rate to be 10% for general sessions
  replaysSessionSampleRate: 0.1,

  // If you're not already sampling the entire session, change the sample rate to 100%
  // when sampling sessions where errors occur.
  replaysOnErrorSampleRate: 1.0,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,
      // Block all media (images, videos) for privacy
      blockAllMedia: true,
    }),
  ],

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors that are expected
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // User cancellations
    "AbortError",
  ],

  // Don't send events in development unless explicitly enabled
  enabled: process.env.NODE_ENV === "production" || process.env.SENTRY_ENABLED === "true",
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
