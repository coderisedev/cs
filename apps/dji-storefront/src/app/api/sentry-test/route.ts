/**
 * Sentry Test Endpoint
 *
 * Use this endpoint to verify Sentry error tracking is working correctly.
 * DELETE THIS FILE before deploying to production!
 *
 * Usage:
 * - GET /api/sentry-test?type=error  - Throws an error
 * - GET /api/sentry-test?type=message - Sends a test message
 * - GET /api/sentry-test - Returns status info
 */

import * as Sentry from "@sentry/nextjs"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  // Only allow in development or when explicitly enabled
  if (
    process.env.NODE_ENV === "production" &&
    process.env.SENTRY_TEST_ENABLED !== "true"
  ) {
    return NextResponse.json(
      { error: "Test endpoint disabled in production" },
      { status: 403 }
    )
  }

  if (type === "error") {
    // This will be captured by Sentry
    throw new Error("Sentry test error from Storefront API route")
  }

  if (type === "message") {
    Sentry.captureMessage("Test message from Storefront", {
      level: "info",
      tags: {
        source: "sentry-test-endpoint",
        environment: process.env.NODE_ENV || "unknown",
      },
    })

    return NextResponse.json({
      success: true,
      message: "Test message sent to Sentry",
      timestamp: new Date().toISOString(),
    })
  }

  // Default: return status
  return NextResponse.json({
    sentry: {
      enabled:
        process.env.NODE_ENV === "production" ||
        process.env.SENTRY_ENABLED === "true",
      dsnConfigured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
    },
    usage: {
      testError: "/api/sentry-test?type=error",
      testMessage: "/api/sentry-test?type=message",
    },
  })
}
