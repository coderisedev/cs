import 'server-only'

type QueryPrimitive = string | number | boolean
type QueryValue = QueryPrimitive | QueryPrimitive[] | null | undefined

export type StrapiFetchOptions = {
  query?: Record<string, QueryValue>
  init?: globalThis.RequestInit
  revalidate?: number
  tags?: string[]
  cache?: globalThis.RequestCache
}

export type StrapiClient = {
  fetch: <T>(path: string, options?: StrapiFetchOptions) => Promise<T>
  resolveMedia: (url?: string | null) => string | null
  baseUrl: string
  apiToken?: string
}

const DEFAULT_STRAPI_URL =
  process.env.STRAPI_API_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const DEFAULT_REVALIDATE_SECONDS = 60

export const getStrapiClient = (): StrapiClient => {
  const baseUrl = normalizeBaseUrl(DEFAULT_STRAPI_URL)
  const apiToken = process.env.STRAPI_API_TOKEN

  const fetchFromStrapi = async <T>(path: string, options: StrapiFetchOptions = {}): Promise<T> => {
    const targetUrl = buildUrl(baseUrl, path, options.query)
    const headers = buildHeaders(apiToken, options.init?.headers)
    const revalidate = options.revalidate ?? DEFAULT_REVALIDATE_SECONDS
    const hasRevalidate = typeof revalidate === 'number' && Number.isFinite(revalidate) && revalidate > 0

    const response = await fetch(targetUrl, {
      ...options.init,
      headers,
      cache: options.cache ?? options.init?.cache ?? (hasRevalidate ? 'force-cache' : 'no-store'),
      next:
        options.tags?.length || hasRevalidate
          ? {
              revalidate: hasRevalidate ? revalidate : undefined,
              tags: options.tags,
              ...options.init?.next,
            }
          : options.init?.next,
    })

    if (!response.ok) {
      const errorPayload = await safeReadBody(response)
      throw new Error(`Strapi request failed (${response.status}): ${errorPayload}`)
    }

    return (await response.json()) as T
  }

  return {
    fetch: fetchFromStrapi,
    resolveMedia: (url?: string | null) => resolveStrapiMedia(url, baseUrl),
    baseUrl,
    apiToken,
  }
}

const buildUrl = (baseUrl: string, path: string, query?: Record<string, QueryValue>) => {
  const url = path.startsWith('http') ? new URL(path) : new URL(path, baseUrl)

  if (query) {
    Object.entries(query).forEach(([key, value]) => appendQueryParam(url.searchParams, key, value))
  }

  return url.toString()
}

const buildHeaders = (apiToken?: string, existing?: globalThis.HeadersInit) => {
  const headers = new Headers(existing)
  headers.set('Content-Type', 'application/json')
  if (apiToken) {
    headers.set('Authorization', `Bearer ${apiToken}`)
  }
  return headers
}

const appendQueryParam = (params: URLSearchParams, key: string, value: QueryValue) => {
  if (value === null || value === undefined) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => appendQueryParam(params, key, entry))
    return
  }

  params.append(key, typeof value === 'boolean' ? String(value) : `${value}`)
}

const safeReadBody = async (response: Response) => {
  try {
    const text = await response.text()
    return text?.slice(0, 280) ?? '<empty>'
  } catch {
    return '<unreadable error body>'
  }
}

const normalizeBaseUrl = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value)

export const resolveStrapiMedia = (url?: string | null, baseUrl: string = DEFAULT_STRAPI_URL) => {
  if (!url) {
    return null
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const normalizedBase = normalizeBaseUrl(baseUrl)
  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return `${normalizedBase}${normalizedPath}`
}
