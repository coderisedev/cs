import Link from 'next/link'
import Image from 'next/image'
import { listProducts } from '@/lib/medusa'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const { products } = await listProducts(24)

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <Link href="/shop/categories" className="text-blue-600 underline">Browse Categories</Link>
      </div>
      {!products?.length ? (
        <p className="text-gray-600">
          No products to display. Ensure MEDUSA URL is configured and catalog is seeded.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((p: { id: string; handle: string; title: string; images?: { url?: string }[]; variants?: { prices?: { amount?: number; currency_code?: string }[] }[] }) => {
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
