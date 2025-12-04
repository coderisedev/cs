import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Retrieve complete order data using Query
  const {
    data: [order],
  } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "created_at",
      "currency_code",
      "subtotal",
      "shipping_total",
      "tax_total",
      "total",
      "items.*",
      "items.variant.*",
      "items.variant.product.*",
      "shipping_address.*",
      "billing_address.*",
      "shipping_methods.*",
    ],
    filters: {
      id: data.id,
    },
  })

  if (!order || !order.email) {
    console.warn(`Order ${data.id} not found or has no email`)
    return
  }

  // Format order items for email template
  const formattedItems = order.items?.map((item: {
    id: string
    title?: string
    quantity: number
    unit_price: number
    thumbnail?: string
    variant?: {
      title?: string
      product?: {
        thumbnail?: string
      }
    }
  }) => ({
    id: item.id,
    title: item.title || "Product",
    quantity: item.quantity,
    unit_price: item.unit_price,
    thumbnail: item.thumbnail || item.variant?.product?.thumbnail,
    variant: item.variant
      ? {
          title: item.variant.title,
        }
      : undefined,
  }))

  // Send order confirmation email
  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-placed",
    data: {
      order: {
        id: order.id,
        display_id: order.display_id,
        email: order.email,
        created_at: order.created_at,
        currency_code: order.currency_code,
        items: formattedItems,
        shipping_address: order.shipping_address,
        subtotal: order.subtotal,
        shipping_total: order.shipping_total,
        tax_total: order.tax_total,
        total: order.total,
      },
    },
  })

  console.log(`Order confirmation email sent to ${order.email} for order ${order.id}`)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
