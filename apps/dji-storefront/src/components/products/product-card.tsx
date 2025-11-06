import Image from "next/image"
import Link from "next/link"
import type { MockProduct } from "@cs/medusa-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currencyFormatter } from "@/lib/number"

export function ProductCard({ product }: { product: MockProduct }) {
  const image = product.images[0]

  return (
    <Card className="border-border-secondary hover:shadow-md transition-shadow flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-background-secondary">
        {image ? (
          <Image src={image} alt={product.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground-muted text-sm">
            No image
          </div>
        )}
        {product.isNew && <Badge label="New" />}
        {product.isSale && <Badge label="Sale" position="right" />}
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-foreground-muted">{product.category}</p>
          <h3 className="text-lg font-semibold text-foreground-primary mt-1">{product.title}</h3>
          <p className="text-sm text-foreground-secondary line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-lg font-semibold text-foreground-primary">{currencyFormatter(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-sm text-foreground-muted line-through">
                {currencyFormatter(product.compareAtPrice)}
              </p>
            )}
          </div>
          <Link href={`/products/${product.handle}`}>
            <Button size="sm">View</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function Badge({ label, position = "left" }: { label: string; position?: "left" | "right" }) {
  return (
    <span
      className={`absolute top-4 ${position === "left" ? "left-4" : "right-4"} rounded-full bg-primary-500 px-3 py-1 text-xs font-semibold text-white`}
    >
      {label}
    </span>
  )
}
