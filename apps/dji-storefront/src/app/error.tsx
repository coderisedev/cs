"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { logger } from "@/lib/logger"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console and local logger
    logger.error("Unhandled application error", error, { digest: error.digest })

    // Capture error in Sentry with additional context
    Sentry.captureException(error, {
      tags: {
        source: "error-boundary",
        digest: error.digest,
      },
      extra: {
        componentStack: error.stack,
      },
    })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-foreground-primary mb-3">
          Something went wrong
        </h1>

        <p className="text-foreground-secondary mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
          Please try again or contact support if the problem persists.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Try again
          </button>

          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-border-primary text-foreground-primary font-medium rounded-lg hover:bg-background-secondary transition-colors"
          >
            Go to homepage
          </a>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-foreground-muted hover:text-foreground-secondary">
              Error details (development only)
            </summary>
            <pre className="mt-2 p-4 bg-background-secondary rounded-lg text-xs overflow-auto max-h-48">
              {error.message}
              {error.stack && (
                <>
                  {"\n\n"}
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
