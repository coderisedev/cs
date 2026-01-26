import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantId = req.tenant_id

  if (!tenantId) {
    res.status(400).json({ message: "Tenant not resolved" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get the sales channel linked to this tenant
  const { data: links } = await query.graph({
    entity: "tenant_sales_channel",
    fields: ["sales_channel_id"],
    filters: {
      tenant_id: tenantId,
    },
  })

  if (!links.length) {
    res.status(404).json({ message: "No sales channel configured for this store" })
    return
  }

  const salesChannelId = links[0].sales_channel_id

  // Create cart scoped to the tenant's sales channel
  const cartService = req.scope.resolve("cart")
  const cart = await cartService.createCarts({
    sales_channel_id: salesChannelId,
    ...(req.body as object),
  })

  res.status(201).json({ cart })
}
