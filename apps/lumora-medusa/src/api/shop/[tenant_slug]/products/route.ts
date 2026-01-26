import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantId = req.tenant_id

  if (!tenantId) {
    res.status(400).json({ message: "Tenant not resolved" })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: links } = await query.graph({
    entity: "tenant_product",
    fields: ["product_id"],
    filters: {
      tenant_id: tenantId,
    },
  })

  const productIds = links.map((l: any) => l.product_id)

  if (productIds.length === 0) {
    res.json({ products: [], count: 0 })
    return
  }

  const productService = req.scope.resolve(Modules.PRODUCT)
  const [products, count] = await productService.listAndCountProducts(
    { id: productIds },
    {
      take: Number(req.query.limit) || 20,
      skip: Number(req.query.offset) || 0,
    }
  )

  res.json({ products, count })
}
