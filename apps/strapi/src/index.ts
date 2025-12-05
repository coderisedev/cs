import type { Core } from '@strapi/strapi'
import * as Sentry from '@sentry/node'
import { seedProductDetails } from './bootstrap/product-detail-seeder'
import { seedNewReleases } from './bootstrap/new-release-seeder'

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // Initialize Sentry for error tracking
    // Support both STRAPI_SENTRY_DSN (GCE deploy) and SENTRY_DSN (generic)
    const sentryDsn = process.env.STRAPI_SENTRY_DSN || process.env.SENTRY_DSN
    if (sentryDsn) {
      const environment = process.env.NODE_ENV || 'development'

      Sentry.init({
        dsn: sentryDsn,
        environment,
        release: process.env.SENTRY_RELEASE || process.env.npm_package_version,

        // Performance monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,

        // Integrations
        integrations: [
          Sentry.postgresIntegration(),
        ],

        // Filter sensitive data
        beforeSend(event) {
          if (event.request?.headers) {
            delete event.request.headers['authorization']
            delete event.request.headers['cookie']
          }
          return event
        },

        // Only enable in production or when explicitly enabled
        enabled: environment === 'production' || process.env.SENTRY_ENABLED === 'true',
      })

      strapi.log.info('Sentry initialized for error tracking')
    } else if (process.env.NODE_ENV === 'production') {
      strapi.log.warn('SENTRY_DSN not configured - error tracking disabled')
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await seedProductDetails(strapi)
      await seedNewReleases(strapi)
    } catch (error) {
      strapi.log.error('Failed to seed product detail content', error)

      // Capture seeding errors in Sentry
      if (error instanceof Error) {
        Sentry.captureException(error, {
          tags: {
            source: 'bootstrap',
            phase: 'seeding',
          },
        })
      }
    }
  },
}
