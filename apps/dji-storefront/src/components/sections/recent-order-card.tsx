import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { MockOrder } from "@cs/medusa-client"
import { currencyFormatter } from "@/lib/number"

export function RecentOrderCard({ order }: { order?: MockOrder }) {
  if (!order) {
    return null
  }

  return (
    <Card className="border-border-primary">
      <CardHeader>
        <p className="text-xs uppercase tracking-widest text-foreground-muted">Latest order</p>
        <CardTitle className="text-xl font-semibold">{order.display_id}</CardTitle>
        <CardDescription>
          {order.items.length} items · {currencyFormatter(order.total)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm text-foreground-secondary">
          {order.items.map((item) => (
            <li key={item.id}>
              {item.title} · {item.variant_title}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
