import type { Core } from '@strapi/strapi'
import { seedProductDetails } from './bootstrap/product-detail-seeder'
import { seedNewReleases } from './bootstrap/new-release-seeder'

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
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await seedProductDetails(strapi)
      await seedNewReleases(strapi)
    } catch (error) {
      strapi.log.error('Failed to seed product detail content', error)
    }
  },
}
