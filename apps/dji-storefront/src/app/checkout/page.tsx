import { getCart } from "@/lib/data/cart"
import { getAddresses } from "@/lib/data/account"
import { Button } from "@/components/ui/button"
import { currencyFormatter } from "@/lib/number"

export const metadata = {
  title: "Checkout · DJI Storefront",
}

export default async function CheckoutPage() {
  const [cart, addresses] = await Promise.all([getCart(), getAddresses()])
  const defaultAddress = addresses[0]

  return (
    <div className="container py-16 grid gap-8 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-border-primary p-6 space-y-4">
          <h2 className="text-xl font-semibold">Customer</h2>
          <input type="email" placeholder="Email" className="w-full rounded-base border border-border-secondary px-3 py-2" defaultValue="pilot@example.com" />
        </div>
        <div className="rounded-3xl border border-border-primary p-6 space-y-4">
          <h2 className="text-xl font-semibold">Shipping address</h2>
          {defaultAddress ? (
            <div className="text-sm text-foreground-secondary">
              <p>
                {defaultAddress.first_name} {defaultAddress.last_name}
              </p>
              <p>{defaultAddress.address_1}</p>
              <p>
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
              </p>
              <p>{defaultAddress.country}</p>
            </div>
          ) : (
            <p>No address on file.</p>
          )}
        </div>
        <div className="rounded-3xl border border-border-primary p-6 space-y-4">
          <h2 className="text-xl font-semibold">Payment</h2>
          <p className="text-sm text-foreground-secondary">Mock checkout — payment collection disabled in this environment.</p>
        </div>
        <Button size="lg">Place order (mock)</Button>
      </section>

      <aside className="rounded-3xl border border-border-primary p-6 space-y-4 bg-background-secondary">
        <p className="text-lg font-semibold">Order summary</p>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-foreground-secondary">
            <span>
              {item.title} × {item.quantity}
            </span>
            <span>{currencyFormatter(item.total)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span>{currencyFormatter(cart.total)}</span>
        </div>
      </aside>
    </div>
  )
}
