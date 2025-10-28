import * as Sentry from '@sentry/node'

const DSN = process.env.SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  })
}

export { Sentry }

