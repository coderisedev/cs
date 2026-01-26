import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../../modules/tenant"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantId = req.tenant_id

  if (!tenantId) {
    res.status(400).json({ message: "Missing X-Tenant-Id header" })
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

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const tenantId = req.tenant_id

  if (!tenantId) {
    res.status(400).json({ message: "Missing X-Tenant-Id header" })
    return
  }

  const productService = req.scope.resolve(Modules.PRODUCT)
  const linkService = req.scope.resolve("remoteLink")

  // Create product
  const product = await productService.createProducts(req.body as any)

  // Link product to tenant
  await linkService.create({
    [TENANT_MODULE]: { tenant_id: tenantId },
    [Modules.PRODUCT]: { product_id: product.id },
  })

  // Also publish to tenant's sales channel
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: scLinks } = await query.graph({
    entity: "tenant_sales_channel",
    fields: ["sales_channel_id"],
    filters: { tenant_id: tenantId },
  })

  if (scLinks.length > 0) {
    const salesChannelId = scLinks[0].sales_channel_id
    await linkService.create({
      [Modules.PRODUCT]: { product_id: product.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
    })
  }

  res.status(201).json({ product })
}
