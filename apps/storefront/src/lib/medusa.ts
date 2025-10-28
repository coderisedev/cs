const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_BASE_URL || ''
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

type Price = { amount?: number; currency_code?: string }
type Variant = { prices?: Price[] }
type Image = { url?: string }
export type Product = {
  id: string
  handle: string
  title: string
  description?: string
  images?: Image[]
  variants?: Variant[]
}
type ProductsResponse = { products: Product[] }

function apiUrl(path: string) {
  if (!MEDUSA_URL) return ''
  return `${MEDUSA_URL.replace(/\/$/, '')}${path}`
}

export async function listProducts(limit = 24): Promise<ProductsResponse> {
  if (!MEDUSA_URL) return { products: [] as Product[] }
  const headers: Record<string, string> = {}
  if (PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = PUBLISHABLE_KEY
    headers['x-medusa-publishable-key'] = PUBLISHABLE_KEY
  }
  const res = await fetch(apiUrl(`/store/products?limit=${limit}`), {
    // Avoid caching to show fresh catalog on first launch
    cache: 'no-store',
    headers,
    // Medusa Store API is public; include credentials only if needed later
  })
  if (!res.ok) return { products: [] as Product[] }
  return (await res.json()) as ProductsResponse
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  if (!MEDUSA_URL) return null
  const headers: Record<string, string> = {}
  if (PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = PUBLISHABLE_KEY
    headers['x-medusa-publishable-key'] = PUBLISHABLE_KEY
  }
  const res = await fetch(apiUrl(`/store/products?handle=${encodeURIComponent(handle)}&limit=1`), {
    cache: 'no-store',
    headers,
  })
  if (!res.ok) return null
  const data = (await res.json()) as ProductsResponse
  const p = Array.isArray(data?.products) ? data.products[0] : null
  return p || null
}
