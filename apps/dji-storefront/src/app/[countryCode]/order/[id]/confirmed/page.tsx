import { retrieveOrder } from "@/lib/data/orders"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { CheckCircle2, Package, CreditCard, Truck } from "lucide-react"
import Link from "next/link"

type Props = {
  params: Promise<{ id: string; countryCode: string }>
}

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your purchase was successful",
}

function formatPrice(amount: number, currencyCode: string = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100)
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background-primary py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-background-secondary rounded-lg p-8 mb-6 text-center border border-border-primary">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground-primary mb-2">
            Thank you for your order!
          </h1>
          <p className="text-foreground-secondary mb-4">
            Your order has been placed successfully.
          </p>
          <div className="text-sm text-foreground-muted">
            Order Number: <span className="font-mono font-semibold text-foreground-primary">#{order.display_id}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-background-secondary rounded-lg p-6 mb-6 border border-border-primary">
          <h2 className="text-xl font-semibold text-foreground-primary mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Details
          </h2>
          
          {/* Items */}
          <div className="space-y-4 mb-6">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-border-primary last:border-0">
                {item.variant?.product?.thumbnail && (
                  <img
                    src={item.variant.product.thumbnail}
                    alt={item.variant.product.title || "Product"}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-foreground-primary">
                    {item.variant?.product?.title || item.title}
                  </h3>
                  {item.variant?.title && item.variant.title !== "Default Variant" && (
                    <p className="text-sm text-foreground-secondary">{item.variant.title}</p>
                  )}
                  <p className="text-sm text-foreground-muted">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground-primary">
                    {formatPrice(item.total || 0, order.currency_code)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t border-border-primary">
            <div className="flex justify-between text-foreground-secondary">
              <span>Subtotal</span>
              <span>{formatPrice(order.item_subtotal || 0, order.currency_code)}</span>
            </div>
            {(order.shipping_total || 0) > 0 && (
              <div className="flex justify-between text-foreground-secondary">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_total, order.currency_code)}</span>
              </div>
            )}
            {(order.tax_total || 0) > 0 && (
              <div className="flex justify-between text-foreground-secondary">
                <span>Tax</span>
                <span>{formatPrice(order.tax_total, order.currency_code)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-foreground-primary pt-2 border-t border-border-primary">
              <span>Total</span>
              <span>{formatPrice(order.total || 0, order.currency_code)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Information */}
        {order.shipping_address && (
          <div className="bg-background-secondary rounded-lg p-6 mb-6 border border-border-primary">
            <h2 className="text-xl font-semibold text-foreground-primary mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" />
              Shipping Information
            </h2>
            <div className="text-foreground-secondary">
              <p className="font-medium text-foreground-primary">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p>{order.shipping_address.address_1}</p>
              {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
              <p>
                {order.shipping_address.city}, {order.shipping_address.province} {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country_code?.toUpperCase()}</p>
              {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
            </div>
            {order.shipping_methods && order.shipping_methods.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-primary">
                <p className="text-sm text-foreground-muted">Shipping Method</p>
                <p className="font-medium text-foreground-primary">{order.shipping_methods[0].name}</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Information */}
        <div className="bg-background-secondary rounded-lg p-6 mb-6 border border-border-primary">
          <h2 className="text-xl font-semibold text-foreground-primary mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Information
          </h2>
          <div className="text-foreground-secondary">
            <p className="font-medium text-foreground-primary">
              {order.payment_collections?.[0]?.payments?.[0]?.provider_id === "pp_system_default" 
                ? "Manual Payment (Test Mode)" 
                : "Payment Processed"}
            </p>
            <p className="text-sm text-foreground-muted mt-1">
              Status: <span className="capitalize">{order.payment_status}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/${params.countryCode}`}
            className="flex-1 text-center px-6 py-3 bg-primary-500 text-white rounded-pill-xxl hover:bg-primary-600 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
          <Link
            href={`/${params.countryCode}/account`}
            className="flex-1 text-center px-6 py-3 bg-background-elevated text-foreground-primary rounded-pill-xxl hover:bg-background-secondary transition-colors font-medium border border-border-primary"
          >
            View Orders
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <div className="mt-8 text-center text-sm text-foreground-muted">
          <p>A confirmation email has been sent to <span className="font-medium text-foreground-primary">{order.email}</span></p>
        </div>
      </div>
    </div>
  )
}
