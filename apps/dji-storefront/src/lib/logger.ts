/**
 * Logger utility for consistent logging across the application
 * In production, errors should be sent to an error tracking service (e.g., Sentry)
 */

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
   */
  warn(message: string, context?: LogContext): void {
    if (isDev) {
      console.warn(formatMessage("warn", message, context))
    }
    // In production, you might want to send warnings to a monitoring service
  },

  /**
   * Error messages - shown in all environments
   * In production, these should be sent to an error tracking service
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    }

    if (isDev) {
      console.error(formatMessage("error", message, errorContext))
    } else {
      // In production:
      // 1. Log minimal info to console
      console.error(`[ERROR] ${message}`)

      // 2. Send to error tracking service (Sentry, DataDog, etc.)
      // TODO: Integrate with error tracking service
      // Example with Sentry:
      // Sentry.captureException(error, { extra: context })
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
