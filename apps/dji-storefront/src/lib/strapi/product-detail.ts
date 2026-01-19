import "server-only"
import { getStrapiClient } from "./client"

// ============================================================
// Strapi Response Types (raw API response shapes)
// ============================================================

interface StrapiMedia {
  url: string
  alternativeText?: string | null
}

interface StrapiFeatureBullet {
  id: number
  text: string
  icon?: string | null
}

interface StrapiContentSection {
  id: number
  eyebrow?: string | null
  heading: string
  description?: string | null
  media?: StrapiMedia | null
  media_position: "left" | "right" | "top" | "bottom" | "content-bottom"
  theme: "light" | "gray"
}

interface StrapiSpecItem {
  id: number
  label: string
  value: string
}

interface StrapiSpecGroup {
  id: number
  group_name: string
  items?: StrapiSpecItem[] | null
}

interface StrapiPackageItem {
  id: number
  name: string
  quantity: number
}

interface StrapiSEO {
  meta_title?: string | null
  meta_description?: string | null
  canonical_url?: string | null
  og_image?: StrapiMedia | null
}

interface StrapiProductDetail {
  id: number
  documentId: string
  title: string
  handle: string
  tagline?: string | null
  overview?: string | null
  feature_bullets?: StrapiFeatureBullet[] | null
  content_sections?: StrapiContentSection[] | null
  spec_groups?: StrapiSpecGroup[] | null
  package_contents?: StrapiPackageItem[] | null
  warranty_info?: string | null
  os_requirements?: string | null
  seo?: StrapiSEO | null
  youtube_review_url?: string | null
}

// ============================================================
// Frontend Types (mapped and resolved for React components)
// ============================================================

export interface FeatureBullet {
  text: string
  icon: string
}

export interface ContentSection {
  eyebrow?: string
  heading: string
  description?: string
  mediaUrl?: string
  mediaAlt?: string
  mediaPosition: "left" | "right" | "top" | "bottom" | "content-bottom"
  theme: "light" | "gray"
}

export interface SpecItem {
  label: string
  value: string
}

export interface SpecGroup {
  groupName: string
  items: SpecItem[]
}

export interface PackageItem {
  name: string
  quantity: number
}

export interface ProductDetailSEO {
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  ogImageUrl?: string
}

export interface ProductDetailContent {
  title: string
  handle: string
  tagline?: string
  overview?: string
  featureBullets: FeatureBullet[]
  contentSections: ContentSection[]
  specGroups: SpecGroup[]
  packageContents: PackageItem[]
  warrantyInfo?: string
  osRequirements?: string
  seo?: ProductDetailSEO
  youtubeReviewUrl?: string
}

// ============================================================
// Data Fetching
// ============================================================

const PRODUCT_DETAIL_CACHE_TAG = "product-detail"
const REVALIDATE_SECONDS = 60

/**
 * Fetch product detail content from Strapi by handle
 */
export async function getProductDetailContent(
  handle: string,
  lang: string = "en"
): Promise<ProductDetailContent | null> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/product-details?filters[handle][$eq]=${handle}&locale=${lang}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        next: {
          tags: [PRODUCT_DETAIL_CACHE_TAG, `product-detail-${handle}`],
          revalidate: REVALIDATE_SECONDS,
        },
      }
    )

    if (!response.data || response.data.length === 0) {
      return null
    }

    return mapStrapiProductDetail(response.data[0], strapi.resolveMedia)
  } catch (error) {
    console.error(`[product-detail] Failed to fetch ${handle}:`, error)
    return null
  }
}

// ============================================================
// Mapping Functions
// ============================================================

function mapStrapiProductDetail(
  data: StrapiProductDetail,
  resolveMedia: (url?: string | null) => string | null
): ProductDetailContent {
  return {
    title: data.title,
    handle: data.handle,
    tagline: data.tagline ?? undefined,
    overview: data.overview ?? undefined,
    featureBullets: (data.feature_bullets ?? []).map((b) => ({
      text: b.text,
      icon: b.icon ?? "check",
    })),
    contentSections: (data.content_sections ?? []).map((s) => ({
      eyebrow: s.eyebrow ?? undefined,
      heading: s.heading,
      description: s.description ?? undefined,
      mediaUrl: resolveMedia(s.media?.url) ?? undefined,
      mediaAlt: s.media?.alternativeText ?? undefined,
      mediaPosition: s.media_position,
      theme: s.theme,
    })),
    specGroups: (data.spec_groups ?? []).map((g) => ({
      groupName: g.group_name,
      items: (g.items ?? []).map((i) => ({
        label: i.label,
        value: i.value,
      })),
    })),
    packageContents: (data.package_contents ?? []).map((p) => ({
      name: p.name,
      quantity: p.quantity,
    })),
    warrantyInfo: data.warranty_info ?? undefined,
    osRequirements: data.os_requirements ?? undefined,
    seo: data.seo
      ? {
          metaTitle: data.seo.meta_title ?? undefined,
          metaDescription: data.seo.meta_description ?? undefined,
          canonicalUrl: data.seo.canonical_url ?? undefined,
          ogImageUrl: resolveMedia(data.seo.og_image?.url) ?? undefined,
        }
      : undefined,
    youtubeReviewUrl: data.youtube_review_url ?? undefined,
  }
}
