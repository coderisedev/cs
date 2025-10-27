import Link from 'next/link'
import Image from 'next/image'
import categories from '../../../../lib/categories'
import { listProducts } from '@/lib/medusa'

export const dynamic = 'force-dynamic'

type CategoryConfig = Record<string, { name: string; handles: string[] }>

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const cfg = (categories as unknown) as CategoryConfig
  const cat = cfg[slug]
  const title = cat?.name || slug
  const handles: string[] = cat?.handles || []
  const { products } = await listProducts(100)
  const filtered = Array.isArray(products)
    ? products.filter((p: { handle: string }) => handles.includes(p.handle))
    : []
  return (
    <main className="container mx-auto px-4 py-8">
      <nav className="text-sm text-gray-600 mb-4">
        <Link href="/">Home</Link> &nbsp;/&nbsp; <Link href="/shop">Shop</Link> &nbsp;/&nbsp; <Link href="/shop/categories">Categories</Link> &nbsp;/&nbsp; <span>{title}</span>
      </nav>
      <h1 className="text-2xl font-semibold mb-6">{title}</h1>
      {!filtered.length ? (
        <p className="text-gray-600">No products in this category.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((p: { id: string; handle: string; title: string; images?: { url?: string }[]; variants?: { prices?: { amount?: number; currency_code?: string }[] }[] }) => {
            const img = p?.images?.[0]?.url
            const price = p?.variants?.[0]?.prices?.[0]
            const amount = price?.amount
            const currency = price?.currency_code?.toUpperCase?.()
            return (
              <li key={p.id} className="border rounded-md overflow-hidden">
                <Link href={`/product/${p.handle}`} className="block">
                  {img ? (
                    <Image src={img} alt={p.title} width={600} height={400} className="w-full h-auto" />
                  ) : (
                    <div className="bg-gray-100 aspect-[3/2]" />
                  )}
                  <div className="p-4">
                    <h2 className="text-lg font-medium">{p.title}</h2>
                    {amount != null && currency ? (
                      <p className="text-gray-700 mt-1">
                        {currency} {amount}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
