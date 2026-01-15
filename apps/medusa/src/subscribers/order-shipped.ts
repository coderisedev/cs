import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Retrieve order data associated with the fulfillment
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
    ],
    filters: {
      fulfillments: {
        id: data.id,
      },
    },
  })

  if (!order || !order.email) {
    console.warn(`Order not found for fulfillment ${data.id} or has no email`)
    return
  }

  // Format order items for email template
  const formattedItems = order.items?.map((item: any) => ({
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

  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-shipped",
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

  console.log(`Order shipped email sent to ${order.email} for order ${order.id}`)
}

export const config: SubscriberConfig = {
  event: "fulfillment.created",
}
