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

type StrapiEmbedMediaComponent = {
  type?: 'image' | 'video' | 'embed'
  asset?: StrapiMedia | { data?: StrapiMedia | StrapiMedia[] | null } | null
  embed_url?: string | null
  thumbnail?: StrapiMedia | { data?: StrapiMedia | null } | null
  alt_text?: string | null
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
  hero_media?: StrapiEmbedMediaComponent | null
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

export type ReleaseAssetMedia = {
  kind: 'asset'
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type ReleaseHeroMedia =
  | ReleaseAssetMedia
  | {
      kind: 'embed'
      url: string
    }

export type NewReleaseFeature = {
  heading: string
  body?: string | null
  media?: ReleaseAssetMedia | null
}

export type NewReleaseStat = {
  label: string
  value: string
  description?: string | null
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
  heroMedia?: ReleaseHeroMedia | null
  gallery: ReleaseAssetMedia[]
  features: NewReleaseFeature[]
  stats: NewReleaseStat[]
}

export const getLatestNewRelease = async (): Promise<NewRelease | null> => {
  // Skip Strapi fetch if not configured
  const strapiUrl = process.env.STRAPI_API_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL
  const strapiToken = process.env.STRAPI_API_TOKEN
  
  if (!strapiUrl || !strapiToken) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[new-release] Strapi not configured (missing URL or token), skipping new release fetch')
    }
    return null
  }

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
    if (process.env.NODE_ENV === 'development') {
      console.warn('[new-release] Failed to fetch data from Strapi:', error instanceof Error ? error.message : error)
    }
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
  const heroMedia = extractHeroMedia(entity.hero_media)
  const gallery = extractMediaArray(entity.gallery)

  const features = (entity.features ?? [])
    .filter((feature): feature is NonNullable<typeof feature> => Boolean(feature?.heading))
    .map((feature) => ({
      heading: feature!.heading ?? '',
      body: feature!.body ?? null,
      media: extractAssetMedia(feature!.media ?? null),
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

const extractHeroMedia = (component: StrapiEmbedMediaComponent | null | undefined): ReleaseHeroMedia | null => {
  if (!component) {
    return null
  }

  if (component.type === 'embed' && component.embed_url) {
    return { kind: 'embed', url: component.embed_url }
  }

  const asset = extractAssetMedia(component.asset ?? component.thumbnail ?? null)
  if (!asset) {
    return null
  }

  return {
    ...asset,
    alt: component.alt_text ?? asset.alt,
  }
}

const extractAssetMedia = (media: any): ReleaseAssetMedia | null => {
  if (!media) {
    return null
  }

  if (Array.isArray(media)) {
    return extractAssetMedia(media[0])
  }

  if (media?.data) {
    if (Array.isArray(media.data)) {
      return extractAssetMedia(media.data[0])
    }
    return formatMedia(media.data)
  }

  return formatMedia(media)
}

const extractMediaArray = (media: any): ReleaseAssetMedia[] => {
  if (!media) {
    return []
  }

  if (Array.isArray(media)) {
    return media.map(formatMedia).filter((item): item is ReleaseAssetMedia => Boolean(item?.url))
  }

  if (media?.data) {
    if (Array.isArray(media.data)) {
      return media.data
        .map(formatMedia)
        .filter((item): item is ReleaseAssetMedia => Boolean(item?.url))
    }
    const single = formatMedia(media.data)
    return single ? [single] : []
  }

  const single = formatMedia(media)
  return single ? [single] : []
}

const formatMedia = (media?: StrapiMedia | null): ReleaseAssetMedia | null => {
  if (!media) {
    return null
  }

  const url = strapi.resolveMedia(media.url)
  if (!url) {
    return null
  }

  return {
    kind: 'asset',
    url,
    alt: media.alternativeText ?? media.caption ?? null,
    width: media.width ?? null,
    height: media.height ?? null,
  }
}
