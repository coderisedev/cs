import { getOrders, getAddresses } from "@/lib/data/account"
import { currencyFormatter } from "@/lib/number"

export const metadata = {
  title: "Account · DJI Storefront",
}

export default async function AccountPage() {
  const [orders, addresses] = await Promise.all([getOrders(), getAddresses()])

  return (
    <div className="container py-16 space-y-10">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-foreground-muted">Account</p>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-foreground-secondary">Mock account overview with recent orders and saved addresses.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Recent orders</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-border-primary p-5 space-y-2">
              <p className="text-sm text-foreground-muted">{order.created_at}</p>
              <p className="text-lg font-semibold">{order.display_id}</p>
              <p className="text-sm text-foreground-secondary">{order.items.length} items · {currencyFormatter(order.total)}</p>
              <ul className="text-xs text-foreground-secondary space-y-1">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.title} · {item.variant_title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Addresses</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-border-secondary p-5 text-sm text-foreground-secondary">
              <p className="font-semibold text-foreground-primary">
                {address.first_name} {address.last_name}
              </p>
              <p>{address.address_1}</p>
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p>{address.country}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
