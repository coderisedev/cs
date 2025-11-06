import Image from "next/image"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { getProducts, getProductDetail } from "@/lib/data/products"
import { Button } from "@/components/ui/button"
import { currencyFormatter } from "@/lib/number"

export async function generateStaticParams() {
  const products = await getProducts({ limit: 8 })
  return products.map((product) => ({ handle: product.handle }))
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  const product = await getProductDetail(params.handle)
  if (!product) {
    return { title: "Product · DJI Storefront" }
  }
  return {
    title: `${product.title} · DJI Storefront`,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }: { params: { handle: string } }) {
  const product = await getProductDetail(params.handle)
  if (!product) {
    notFound()
  }

  return (
    <div className="container py-16 grid gap-10 lg:grid-cols-2">
      <div className="space-y-4">
        {product.images.map((image, index) => (
          <div key={image} className="relative h-72 w-full rounded-3xl overflow-hidden">
            <Image src={image} alt={`${product.title}-${index}`} fill className="object-cover" />
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-foreground-muted">{product.category}</p>
          <h1 className="text-4xl font-semibold text-foreground-primary">{product.title}</h1>
          <p className="text-sm text-foreground-secondary mt-4">{product.description}</p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-foreground-primary">{currencyFormatter(product.price)}</p>
          {product.compareAtPrice && (
            <p className="text-sm text-foreground-muted line-through">{currencyFormatter(product.compareAtPrice)}</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Variants</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <span key={variant.id} className="rounded-full border border-border-secondary px-4 py-2 text-sm">
                {variant.title}
              </span>
            ))}
          </div>
        </div>
        <Button size="lg" className="w-full">Add to cart (mock)</Button>
      </div>
    </div>
  )
}
