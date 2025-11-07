import Link from "next/link"
import { getCart } from "@/lib/data/cart"
import { Button } from "@/components/ui/button"
import { currencyFormatter } from "@/lib/number"

export const metadata = {
  title: "Cart · DJI Storefront",
}

export default async function CartPage() {
  const cart = await getCart()

  return (
    <div className="container py-16 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Shopping Cart</h1>
        <Link href="/products" className="text-sm text-primary-500">
          Continue shopping →
        </Link>
      </div>

      {cart.items.length === 0 ? (
        <p className="text-foreground-secondary">Your cart is empty.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border-secondary p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground-primary">{item.title}</p>
                  <p className="text-sm text-foreground-secondary">Variant: {item.variant_id ?? "default"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground-muted">Qty: {item.quantity}</p>
                  <p className="text-lg font-semibold">{currencyFormatter(item.total)}</p>
                </div>
              </div>
            ))}
          </div>
          <aside className="rounded-2xl border border-border-primary p-6 space-y-4 bg-background-secondary">
            <p className="text-xl font-semibold">Summary</p>
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{currencyFormatter(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Estimated total</span>
              <span className="font-semibold">{currencyFormatter(cart.total)}</span>
            </div>
            <Link href="/checkout">
              <Button className="w-full">Proceed to checkout</Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}
