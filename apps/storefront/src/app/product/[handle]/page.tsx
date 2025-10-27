import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductByHandle } from '@/lib/medusa'
import { getPaypalCheckoutLink } from '@/lib/payments'

type Params = { handle: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = await getProductByHandle(params.handle)
  if (!product) return { title: 'Product Not Found' }
  const img = product?.images?.[0]?.url
  return {
    title: `${product.title} | Shop`,
    description: product.description || undefined,
    openGraph: {
      title: product.title,
      description: product.description || undefined,
      images: img ? [{ url: img }] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const product = await getProductByHandle(params.handle)
  if (!product) notFound()

  const img = product?.images?.[0]?.url
  const variant = product?.variants?.[0]
  const price = variant?.prices?.[0]
  const amount = price?.amount
  const currency = price?.currency_code?.toUpperCase?.()
  const paypalLink = getPaypalCheckoutLink()

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    description: product.description || '',
    image: (product.images || []).map((i) => (i as { url?: string } | undefined)?.url).filter(Boolean) || [],
    offers: amount != null && currency ? {
      '@type': 'Offer',
      price: amount,
      priceCurrency: currency,
      availability: 'https://schema.org/InStock',
    } : undefined,
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link> &nbsp;/&nbsp; <span>{product.title}</span>
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {img ? (
            <Image src={img} alt={product.title} width={800} height={600} className="w-full h-auto" />
          ) : (
            <div className="bg-gray-100 aspect-[4/3]" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{product.title}</h1>
          {amount != null && currency ? (
            <p className="mt-2 text-lg">{currency} {amount}</p>
          ) : null}
          {product.description ? (
            <p className="mt-4 text-gray-700 whitespace-pre-line">{product.description}</p>
          ) : null}
          {paypalLink ? (
            <div className="mt-6">
              <a
                href={paypalLink}
                className="inline-flex items-center rounded-md bg-yellow-400 px-4 py-2 font-medium text-black hover:bg-yellow-300"
              >
                Buy with PayPal
              </a>
              <p className="text-xs text-gray-500 mt-2">Checkout redirects to PayPal (sandbox/production as configured)</p>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  )
}
