/**
 * Sentry Test Endpoint for Medusa
 *
 * Use this endpoint to verify Sentry error tracking is working correctly.
 * DELETE THIS FILE before deploying to production!
 *
 * Usage:
 * - GET /store/sentry-test?type=error  - Throws an error
 * - GET /store/sentry-test?type=message - Sends a test message
 * - GET /store/sentry-test - Returns status info
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Sentry, captureMessage, isSentryInitialized } from "../../../utils/sentry"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const type = req.query.type as string | undefined

  // Only allow in development or when explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SENTRY_TEST_ENABLED !== "true"
  ) {
    res.status(403).json({
      error: "Test endpoint disabled in production",
    })
    return
  }

  if (type === "error") {
    // This will be captured by Sentry
    throw new Error("Sentry test error from Medusa API route")
  }

  if (type === "message") {
    captureMessage("Test message from Medusa", "info", {
      source: "sentry-test-endpoint",
      environment: process.env.NODE_ENV || "unknown",
    })

    res.json({
      success: true,
      message: "Test message sent to Sentry",
      timestamp: new Date().toISOString(),
    })
    return
  }

  // Default: return status
  res.json({
    sentry: {
      initialized: isSentryInitialized(),
      dsnConfigured: !!process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
    },
    usage: {
      testError: "/store/sentry-test?type=error",
      testMessage: "/store/sentry-test?type=message",
    },
  })
}
