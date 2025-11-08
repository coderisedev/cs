import type { Core } from '@strapi/strapi'

const NEW_RELEASE_SLUG = 't-shirt-refresh-launch'

export const seedNewReleases = async (strapi: Core.Strapi) => {
  const existing = await strapi.entityService.findMany('api::new-release.new-release', {
    filters: {
      slug: NEW_RELEASE_SLUG,
    },
    fields: ['id'],
    publicationState: 'preview',
  })

  if (Array.isArray(existing) && existing.length) {
    return
  }

  await strapi.entityService.create('api::new-release.new-release', {
    data: {
      title: 'Medusa T-Shirt Refresh',
      slug: NEW_RELEASE_SLUG,
      tagline: 'New Arrival',
      description:
        '<p>Our fan-favorite tee returns with updated microvent fabric, a reinforced neckline, and two new flight-ready colorways.</p>',
      launch_date: new Date().toISOString(),
      cta_label: 'Shop the Tee',
      cta_url: '/products/t-shirt',
      secondary_cta_label: 'Learn More',
      secondary_cta_url: '/stories/medusa-tee-refresh',
      sku_reference: 't-shirt',
      is_featured: true,
      features: [
        {
          heading: 'Microvent comfort',
          body: '<p>Stay cool with breathable panels that wick heat during long simulator sessions.</p>',
        },
        {
          heading: 'Two limited colorways',
          body: '<p>Choose between Aurora Navy and Infrared, both dyed with low-impact pigments.</p>',
        },
      ],
      stats: [
        {
          label: 'Weight',
          value: '180 GSM'
        },
        {
          label: 'Launch Window',
          value: '72 hrs',
          description: 'Pre-order now to guarantee your size.'
        },
      ],
      regions: ['us', 'eu'],
      publishedAt: new Date().toISOString(),
    },
  })

  strapi.log.info('Seeded default new release entry')
}
