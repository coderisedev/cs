// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {
    // Initialize Sentry if DSN provided
    const dsn = process.env.SENTRY_DSN
    if (dsn) {
      // Dynamic import to avoid type issues if not installed in certain envs
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/node') as typeof import('@sentry/node')
      Sentry.init({ dsn, tracesSampleRate: 0.1, environment: process.env.NODE_ENV })
    }
  },
};
