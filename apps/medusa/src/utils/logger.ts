/**
 * Logger utility for Medusa backend
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

/**
 * Sanitize sensitive data from log context
 * Never log PII (emails, passwords, tokens) in production
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined

  const sensitiveKeys = ["email", "password", "token", "secret", "key", "authorization"]
  const sanitized: LogContext = {}

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
      sanitized[key] = "[REDACTED]"
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
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
   * Warning messages - shown in all environments (sanitized in production)
   */
  warn(message: string, context?: LogContext): void {
    const safeContext = isDev ? context : sanitizeContext(context)
    console.warn(formatMessage("warn", message, safeContext))
  },

  /**
   * Error messages - shown in all environments (sanitized in production)
   * In production, these should be sent to an error tracking service
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? { message: error.message, name: error.name } : error,
    }
    const safeContext = isDev ? errorContext : sanitizeContext(errorContext)

    console.error(formatMessage("error", message, safeContext))

    // In production: send to error tracking service
    // TODO: Integrate with Sentry or similar
    // if (!isDev) {
    //   Sentry.captureException(error, { extra: context })
    // }
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
 * Get a generic error message for client responses
 * Never expose internal error details to clients
 */
export function getClientErrorMessage(error: unknown, fallback: string): string {
  // In development, return actual error for debugging
  if (isDev && error instanceof Error) {
    return error.message
  }
  return fallback
}
