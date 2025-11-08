import 'server-only'

import { getStrapiClient } from '@lib/strapi/client'

const strapi = getStrapiClient()
const PRODUCT_DETAIL_CACHE_TAG = 'product-detail'

type MaybeWithAttributes<T> =
  | (T & { id?: number; documentId?: string })
  | ({ id?: number; documentId?: string; attributes?: T | null } & Record<string, unknown>)

type StrapiCollectionResponse<T> = {
  data: MaybeWithAttributes<T>[]
  meta?: {
    pagination?: {
      total?: number
    }
  }
}

type StrapiMediaAttributes = {
  url: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
}

type StrapiMediaEntity = {
  id?: number
  documentId?: string
} & StrapiMediaAttributes

type StrapiMediaRelation =
  | {
      data?: StrapiMediaEntity | null
    }
  | {
      data?: StrapiMediaEntity[] | null
    }
  | StrapiMediaEntity
  | StrapiMediaEntity[]
  | null

type StrapiComponent<T> = (T & { id?: number }) | null

type StrapiProductDetailAttributes = {
  title: string
  handle: string
  hero_excerpt?: string | null
  hero_media?: StrapiMediaRelation
  gallery?: StrapiMediaRelation
  overview?: string | null
  specs?: StrapiComponent<{ label?: string | null; value?: string | null }>[]
  features?: StrapiComponent<{
    heading?: string | null
    body?: string | null
    media?: StrapiMediaRelation
  }>[]
  faq?: StrapiComponent<{ question?: string | null; answer?: string | null }>[]
  downloads?: StrapiComponent<{ label?: string | null; external_url?: string | null; file?: StrapiMediaRelation }>[]
  shipping_note?: string | null
  seo?: {
    meta_title?: string | null
    meta_description?: string | null
    canonical_url?: string | null
    og_image?: StrapiMediaRelation
  } | null
}

export type ProductDetailMedia = {
  id?: number
  url: string
  alt?: string | null
  width?: number | null
  height?: number | null
}

export type ProductDetailSpec = {
  label: string
  value: string
}

export type ProductDetailFeature = {
  heading: string
  body?: string | null
  media?: ProductDetailMedia | null
}

export type ProductDetailFaq = {
  question: string
  answer?: string | null
}

export type ProductDetailDownload = {
  label: string
  href: string | null
}

export type ProductDetailSeo = {
  metaTitle?: string | null
  metaDescription?: string | null
  canonicalUrl?: string | null
  ogImageUrl?: string | null
}

export type ProductDetail = {
  id?: number
  documentId?: string
  title: string
  handle: string
  heroExcerpt?: string | null
  heroMedia?: ProductDetailMedia | null
  gallery: ProductDetailMedia[]
  overview?: string | null
  specs: ProductDetailSpec[]
  features: ProductDetailFeature[]
  faq: ProductDetailFaq[]
  downloads: ProductDetailDownload[]
  shippingNote?: string | null
  seo?: ProductDetailSeo | null
}

export const getProductDetail = async (handle: string): Promise<ProductDetail | null> => {
  if (!handle) {
    return null
  }

  try {
    const response = await strapi.fetch<StrapiCollectionResponse<StrapiProductDetailAttributes>>('/api/product-details', {
      query: {
        'filters[handle][$eq]': handle,
        'pagination[page]': 1,
        'pagination[pageSize]': 1,
        publicationState: 'live',
        'populate[hero_media]': '*',
        'populate[gallery]': '*',
        'populate[specs]': '*',
        'populate[features][populate]': 'media',
        'populate[faq]': '*',
        'populate[downloads][populate]': 'file',
        'populate[seo][populate]': 'og_image',
      },
      tags: [PRODUCT_DETAIL_CACHE_TAG, `product-detail-${handle}`],
      revalidate: 300,
    })

    const entity = response.data?.[0]
    if (!entity) {
      return null
    }

    const normalized = normalizeEntity<StrapiProductDetailAttributes>(entity)
    return mapProductDetail(normalized)
  } catch (error) {
    console.error(`[product-detail] Failed to fetch entry for handle "${handle}"`, error)
    return null
  }
}

const normalizeEntity = <T>(entity: MaybeWithAttributes<T>): (T & { id?: number; documentId?: string }) => {
  if (!entity) {
    throw new Error('Missing Strapi entity')
  }

  if ('attributes' in entity && entity.attributes) {
    return {
      id: entity.id,
      documentId: entity.documentId,
      ...(entity.attributes as T),
    }
  }

  return entity as T & { id?: number; documentId?: string }
}

const mapProductDetail = (
  entity: StrapiProductDetailAttributes & { id?: number; documentId?: string }
): ProductDetail => {
  const heroMedia = extractSingleMedia(entity.hero_media)
  const gallery = extractMediaArray(entity.gallery)
  const specs = (entity.specs ?? [])
    .filter((spec): spec is NonNullable<typeof spec> => Boolean(spec?.label && spec?.value))
    .map((spec) => ({
      label: spec!.label!.trim(),
      value: spec!.value!.trim(),
    }))

  const features = (entity.features ?? [])
    .filter((feature): feature is NonNullable<typeof feature> => Boolean(feature?.heading || feature?.body))
    .map((feature) => ({
      heading: feature!.heading ?? 'Feature',
      body: feature!.body ?? null,
      media: extractSingleMedia(feature!.media),
    }))

  const faq = (entity.faq ?? [])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry?.question))
    .map((entry) => ({
      question: entry!.question ?? '',
      answer: entry!.answer ?? null,
    }))

  const downloads = (entity.downloads ?? [])
    .filter((download): download is NonNullable<typeof download> => Boolean(download?.label))
    .map((download) => ({
      label: download!.label ?? 'Download',
      href: extractSingleMedia(download!.file)?.url ?? download!.external_url ?? null,
    }))

  const seo: ProductDetailSeo | null = entity.seo
    ? {
        metaTitle: entity.seo.meta_title ?? entity.title,
        metaDescription: entity.seo.meta_description ?? entity.hero_excerpt ?? undefined,
        canonicalUrl: entity.seo.canonical_url ?? null,
        ogImageUrl: extractSingleMedia(entity.seo.og_image)?.url ?? heroMedia?.url ?? null,
      }
    : null

  return {
    id: entity.id,
    documentId: entity.documentId,
    title: entity.title,
    handle: entity.handle,
    heroExcerpt: entity.hero_excerpt ?? null,
    heroMedia,
    gallery,
    overview: entity.overview ?? null,
    specs,
    features,
    faq,
    downloads,
    shippingNote: entity.shipping_note ?? null,
    seo,
  }
}

const extractSingleMedia = (media: StrapiMediaRelation): ProductDetailMedia | null => {
  if (!media) {
    return null
  }

  if (Array.isArray(media)) {
    return extractSingleMedia(media[0] ?? null)
  }

  if ('data' in media) {
    if (Array.isArray(media.data)) {
      return extractSingleMedia(media.data[0] ?? null)
    }
    return formatMedia(media.data)
  }

  return formatMedia(media as StrapiMediaEntity)
}

const extractMediaArray = (media: StrapiMediaRelation): ProductDetailMedia[] => {
  if (!media) {
    return []
  }

  if (Array.isArray(media)) {
    return media.map(formatMedia).filter((entry): entry is ProductDetailMedia => Boolean(entry?.url))
  }

  if ('data' in media) {
    if (Array.isArray(media.data)) {
      return media.data
        .map(formatMedia)
        .filter((entry): entry is ProductDetailMedia => Boolean(entry?.url))
    }
    const single = formatMedia(media.data)
    return single ? [single] : []
  }

  const single = formatMedia(media as StrapiMediaEntity)
  return single ? [single] : []
}

const formatMedia = (media?: StrapiMediaEntity | null): ProductDetailMedia | null => {
  if (!media) {
    return null
  }

  const url = media.url ?? (media as { attributes?: StrapiMediaAttributes })?.attributes?.url
  if (!url) {
    return null
  }

  const alt = media.alternativeText ?? (media as { attributes?: StrapiMediaAttributes })?.attributes?.alternativeText ?? null
  const width = media.width ?? (media as { attributes?: StrapiMediaAttributes })?.attributes?.width ?? null
  const height = media.height ?? (media as { attributes?: StrapiMediaAttributes })?.attributes?.height ?? null

  return {
    id: media.id,
    url: strapi.resolveMedia(url),
    alt,
    width,
    height,
  }
}
