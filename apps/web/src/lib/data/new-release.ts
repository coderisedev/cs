import 'server-only'

import { getStrapiClient } from '@lib/strapi/client'

const strapi = getStrapiClient()
const CACHE_TAG = 'new-release'

type MaybeWithAttributes<T> =
  | (T & { id?: number; documentId?: string })
  | ({ id?: number; documentId?: string; attributes?: T | null } & Record<string, unknown>)

type StrapiMedia = {
  id?: number
  documentId?: string
  url?: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
}

type StrapiComponent<T> = (T & { id?: number }) | null

type StrapiNewReleaseAttributes = {
  title: string
  slug: string
  tagline?: string | null
  description?: string | null
  launch_date?: string | null
  cta_label?: string | null
  cta_url?: string | null
  secondary_cta_label?: string | null
  secondary_cta_url?: string | null
  sku_reference?: string | null
  is_featured?: boolean | null
  is_preorder?: boolean | null
  inventory_badge?: string | null
  regions?: string[] | null
  hero_media?: StrapiMedia | { data?: StrapiMedia | StrapiMedia[] | null } | null
  gallery?:
    | StrapiMedia[]
    | {
        data?: StrapiMedia[] | StrapiMedia | null
      }
    | null
  features?: StrapiComponent<{ heading?: string | null; body?: string | null; media?: StrapiMedia | { data?: StrapiMedia | null } | null }>[]
  stats?: StrapiComponent<{ label?: string | null; value?: string | null; description?: string | null }>[]
  seo?: unknown
}

type StrapiNewReleaseResponse = {
  data: MaybeWithAttributes<StrapiNewReleaseAttributes>[]
}

export type NewReleaseFeature = {
  heading: string
  body?: string | null
  media?: ReleaseMedia | null
}

export type NewReleaseStat = {
  label: string
  value: string
  description?: string | null
}

export type ReleaseMedia = {
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type NewRelease = {
  id?: number
  title: string
  slug: string
  tagline?: string | null
  descriptionHtml?: string | null
  launchDate?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  secondaryCtaLabel?: string | null
  secondaryCtaUrl?: string | null
  skuReference?: string | null
  isFeatured: boolean
  isPreorder: boolean
  inventoryBadge?: string | null
  regions: string[]
  heroMedia?: ReleaseMedia | null
  gallery: ReleaseMedia[]
  features: NewReleaseFeature[]
  stats: NewReleaseStat[]
}

export const getLatestNewRelease = async (): Promise<NewRelease | null> => {
  const now = new Date().toISOString()

  try {
    const response = await strapi.fetch<StrapiNewReleaseResponse>('/api/new-releases', {
      query: {
        sort: 'launch_date:desc',
        'filters[launch_date][$lte]': now,
        'pagination[page]': 1,
        'pagination[pageSize]': 1,
        publicationState: 'live',
        populate: '*',
      },
      tags: [CACHE_TAG],
      revalidate: 300,
    })

    const entity = response.data?.[0]
    if (!entity) {
      return null
    }

    const normalized = normalizeEntity(entity)
    return mapNewRelease(normalized)
  } catch (error) {
    console.error('[new-release] Failed to fetch data from Strapi', error)
    return null
  }
}

const normalizeEntity = (
  entity: MaybeWithAttributes<StrapiNewReleaseAttributes>
): (StrapiNewReleaseAttributes & { id?: number }) => {
  if ('attributes' in entity && entity.attributes) {
    return {
      id: entity.id,
      ...(entity.attributes as StrapiNewReleaseAttributes),
    }
  }
  return entity as StrapiNewReleaseAttributes & { id?: number }
}

const mapNewRelease = (
  entity: StrapiNewReleaseAttributes & { id?: number }
): NewRelease => {
  const heroMedia = extractSingleMedia(entity.hero_media)
  const gallery = extractMediaArray(entity.gallery)

  const features = (entity.features ?? [])
    .filter((feature): feature is NonNullable<typeof feature> => Boolean(feature?.heading))
    .map((feature) => ({
      heading: feature!.heading ?? '',
      body: feature!.body ?? null,
      media: extractSingleMedia(feature!.media ?? null),
    }))

  const stats = (entity.stats ?? [])
    .filter((stat): stat is NonNullable<typeof stat> => Boolean(stat?.label && stat?.value))
    .map((stat) => ({
      label: stat!.label!,
      value: stat!.value!,
      description: stat!.description ?? null,
    }))

  return {
    id: entity.id,
    title: entity.title,
    slug: entity.slug,
    tagline: entity.tagline ?? null,
    descriptionHtml: entity.description ?? null,
    launchDate: entity.launch_date ?? null,
    ctaLabel: entity.cta_label ?? null,
    ctaUrl: entity.cta_url ?? null,
    secondaryCtaLabel: entity.secondary_cta_label ?? null,
    secondaryCtaUrl: entity.secondary_cta_url ?? null,
    skuReference: entity.sku_reference ?? null,
    isFeatured: Boolean(entity.is_featured),
    isPreorder: Boolean(entity.is_preorder),
    inventoryBadge: entity.inventory_badge ?? null,
    regions: Array.isArray(entity.regions)
      ? entity.regions.map((region) => region.toLowerCase())
      : [],
    heroMedia,
    gallery,
    features,
    stats,
  }
}

const extractSingleMedia = (media: any): ReleaseMedia | null => {
  if (!media) {
    return null
  }

  if (Array.isArray(media)) {
    return extractSingleMedia(media[0])
  }

  if (media?.data) {
    if (Array.isArray(media.data)) {
      return extractSingleMedia(media.data[0])
    }
    return formatMedia(media.data)
  }

  return formatMedia(media)
}

const extractMediaArray = (media: any): ReleaseMedia[] => {
  if (!media) {
    return []
  }

  if (Array.isArray(media)) {
    return media.map(formatMedia).filter((item): item is ReleaseMedia => Boolean(item?.url))
  }

  if (media?.data) {
    if (Array.isArray(media.data)) {
      return media.data
        .map(formatMedia)
        .filter((item): item is ReleaseMedia => Boolean(item?.url))
    }
    const single = formatMedia(media.data)
    return single ? [single] : []
  }

  const single = formatMedia(media)
  return single ? [single] : []
}

const formatMedia = (media?: StrapiMedia | null): ReleaseMedia | null => {
  if (!media) {
    return null
  }

  const url = strapi.resolveMedia(media.url)
  if (!url) {
    return null
  }

  return {
    url,
    alt: media.alternativeText ?? media.caption ?? null,
    width: media.width ?? null,
    height: media.height ?? null,
  }
}
