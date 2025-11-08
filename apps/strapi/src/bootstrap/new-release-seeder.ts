import type { Core } from '@strapi/strapi'

const daysAgo = (value: number) => {
  const date = new Date()
  date.setDate(date.getDate() - value)
  return date.toISOString()
}

const NEW_RELEASE_SEEDS = [
  {
    title: 'Medusa T-Shirt Refresh',
    slug: 't-shirt-refresh-launch',
    tagline: 'New Arrival',
    description:
      '<p>Our fan-favorite tee returns with updated microvent fabric, a reinforced neckline, and two new flight-ready colorways.</p>',
    launch_date: daysAgo(0),
    hero_media: {
      type: 'embed' as const,
      embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    cta_label: 'Shop the Tee',
    cta_url: '/products/t-shirt',
    secondary_cta_label: 'Learn More',
    secondary_cta_url: '/stories/medusa-tee-refresh',
    sku_reference: 't-shirt',
    is_featured: true,
    is_preorder: false,
    inventory_badge: 'Back in stock — limited run',
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
  },
  {
    title: 'Sweatpants Flight Kit',
    slug: 'sweatpants-flight-kit',
    tagline: 'Limited Drop',
    description:
      '<p>Flight-ready joggers with articulated knees, stash pockets, and a matching travel pouch. Designed for simulator marathons on the road.</p>',
    launch_date: daysAgo(10),
    hero_media: {
      type: 'embed' as const,
      embed_url: 'https://www.youtube.com/embed/kXYiU_JCYtU'
    },
    cta_label: 'Reserve Your Kit',
    cta_url: '/products/sweatpants',
    secondary_cta_label: 'View Details',
    secondary_cta_url: '/stories/sweatpants-flight-kit',
    sku_reference: 'sweatpants',
    is_featured: false,
    is_preorder: true,
    inventory_badge: 'First 500 kits include travel pouch',
    features: [
      {
        heading: 'Travel-ready accessories',
        body: '<p>Each kit ships with a compression pouch and cable organizer so you can pack light.</p>',
      },
      {
        heading: 'Cargo-smart storage',
        body: '<p>Hidden zip pocket fits VR controllers, passports, or power banks without bulk.</p>',
      },
    ],
    stats: [
      {
        label: 'Inseam',
        value: '30" standard',
      },
      {
        label: 'Pre-order bonus',
        value: '500 kits',
        description: 'Includes the limited travel pouch while supplies last.'
      },
    ],
    regions: ['us', 'eu', 'dk'],
  },
]

export const seedNewReleases = async (strapi: Core.Strapi) => {
  await migrateLegacyHeroMedia(strapi)

  for (const seed of NEW_RELEASE_SEEDS) {
    const existing = await strapi.entityService.findMany('api::new-release.new-release', {
      filters: {
        slug: seed.slug,
      },
      fields: ['id'],
      publicationState: 'preview',
    })

    if (Array.isArray(existing) && existing.length) {
      continue
    }

    await strapi.entityService.create('api::new-release.new-release', {
      data: {
        ...seed,
        publishedAt: new Date().toISOString(),
      },
    })

    strapi.log.info(`Seeded new release entry "${seed.slug}"`)
  }
}

const migrateLegacyHeroMedia = async (strapi: Core.Strapi) => {
  const entries = await strapi.entityService.findMany('api::new-release.new-release', {
    populate: ['hero_media'],
    fields: ['id'],
    limit: 1000,
  })

  if (!Array.isArray(entries) || !entries.length) {
    return
  }

  for (const entry of entries) {
    if (entry.hero_media) {
      continue
    }

    const legacyLink = await strapi.db
      .connection('upload_file_morphs')
      .where({
        related_id: entry.id,
        related_type: 'api::new-release.new-release',
        field: 'hero_media',
      })
      .orderBy('order', 'asc')
      .first()

    if (!legacyLink?.upload_file_id) {
      continue
    }

    await strapi.entityService.update('api::new-release.new-release', entry.id, {
      data: {
        hero_media: {
          type: 'image',
          asset: legacyLink.upload_file_id,
        },
      },
    })

    strapi.log.info(`Migrated hero media for new release entry ${entry.id}`)
  }
}
