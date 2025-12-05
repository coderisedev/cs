/**
 * Sentry Error Handler Middleware for Strapi
 * Captures unhandled errors and sends them to Sentry
 */

import * as Sentry from '@sentry/node'
import type { Core } from '@strapi/strapi'

interface StrapiContext {
  request: {
    url: string
    method: string
    headers: Record<string, string>
    body?: unknown
  }
  state: {
    user?: {
      id: number
      email?: string
    }
  }
}

export default (
  _config: Record<string, unknown>,
  { strapi }: { strapi: Core.Strapi }
) => {
  return async (ctx: StrapiContext, next: () => Promise<void>) => {
    try {
      await next()
    } catch (error) {
      // Set user context if available
      if (ctx.state?.user) {
        Sentry.setUser({
          id: String(ctx.state.user.id),
          email: ctx.state.user.email,
        })
      }

      // Capture the exception with request context
      Sentry.captureException(error, {
        tags: {
          source: 'middleware',
          path: ctx.request.url,
          method: ctx.request.method,
        },
        extra: {
          url: ctx.request.url,
          method: ctx.request.method,
        },
      })

      // Clear user context after capture
      Sentry.setUser(null)

      // Re-throw to let Strapi handle the error response
      throw error
    }
  }
}
