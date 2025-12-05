import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

interface CustomerCreatedData {
  id: string
}

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<CustomerCreatedData>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)

  // Retrieve customer data
  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "created_at"],
    filters: {
      id: data.id,
    },
  })

  if (!customer || !customer.email) {
    console.warn(`Customer ${data.id} not found or has no email`)
    return
  }

  // Get store URL from environment
  const storeUrl = process.env.STORE_URL || "https://cockpitsimulator.com"

  // Send welcome email
  await notificationModuleService.createNotifications({
    to: customer.email,
    channel: "email",
    template: "customer-created",
    data: {
      email: customer.email,
      first_name: customer.first_name,
      store_url: storeUrl,
    },
  })

  console.log(`Welcome email sent to ${customer.email} for customer ${customer.id}`)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
