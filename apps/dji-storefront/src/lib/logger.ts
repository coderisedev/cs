/**
 * Logger utility for consistent logging across the application
 * Integrates with Sentry for production error tracking
 */

import * as Sentry from "@sentry/nextjs"

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: unknown
}

const isDev = process.env.NODE_ENV === "development"

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const contextStr = context ? ` ${JSON.stringify(context)}` : ""
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
}

export const logger = {
  /**
   * Debug messages - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    if (isDev) {
      console.log(formatMessage("debug", message, context))
    }
  },

  /**
   * Info messages - only shown in development
   */
  info(message: string, context?: LogContext): void {
    if (isDev) {
      console.info(formatMessage("info", message, context))
    }
  },

  /**
   * Warning messages - shown in all environments
   * Sent to Sentry as breadcrumbs
   */
  warn(message: string, context?: LogContext): void {
    if (isDev) {
      console.warn(formatMessage("warn", message, context))
    }

    // Add breadcrumb to Sentry for context in case of errors
    Sentry.addBreadcrumb({
      category: "warning",
      message,
      level: "warning",
      data: context,
    })
  },

  /**
   * Error messages - shown in all environments
   * Sent to Sentry for tracking
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    }

    if (isDev) {
      console.error(formatMessage("error", message, errorContext))
    } else {
      // In production, log minimal info to console
      console.error(`[ERROR] ${message}`)
    }

    // Send to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: context,
        tags: {
          source: "logger",
        },
      })
    } else if (error) {
      Sentry.captureMessage(message, {
        level: "error",
        extra: { error, ...context },
        tags: {
          source: "logger",
        },
      })
    } else {
      Sentry.captureMessage(message, {
        level: "error",
        extra: context,
        tags: {
          source: "logger",
        },
      })
    }
  },
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "An unexpected error occurred"
}

/**
 * Set user context for Sentry
 * Call this after user authentication
 */
export function setUserContext(user: { id: string; email?: string }): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  })
}

/**
 * Clear user context from Sentry
 * Call this after user logout
 */
export function clearUserContext(): void {
  Sentry.setUser(null)
}
