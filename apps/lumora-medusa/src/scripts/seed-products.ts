import type { ExecArgs } from "@medusajs/framework/types"
import { TENANT_MODULE } from "../modules/tenant"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function seedProducts({ container }: ExecArgs) {
  const tenantService = container.resolve(TENANT_MODULE)
  const productService = container.resolve(Modules.PRODUCT)
  const linkService = container.resolve("remoteLink")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const tenant = await tenantService.findBySlug("demo-alpha")
  if (!tenant) {
    console.error("Tenant demo-alpha not found. Run seed.ts first.")
    return
  }

  console.log(`Adding products to tenant: ${tenant.name} (${tenant.id})`)

  // Get tenant's sales channel
  const { data: scLinks } = await query.graph({
    entity: "tenant_sales_channel",
    fields: ["sales_channel_id"],
    filters: { tenant_id: tenant.id },
  })
  const salesChannelId = scLinks[0]?.sales_channel_id

  const products = [
    {
      title: "Classic White T-Shirt",
      handle: "classic-white-tshirt",
      description: "A comfortable everyday essential made from 100% organic cotton.",
      status: "published" as const,
      variants: [
        { title: "S", sku: "ALPHA-TS-WHT-S", manage_inventory: false, prices: [{ amount: 2900, currency_code: "usd" }] },
        { title: "M", sku: "ALPHA-TS-WHT-M", manage_inventory: false, prices: [{ amount: 2900, currency_code: "usd" }] },
        { title: "L", sku: "ALPHA-TS-WHT-L", manage_inventory: false, prices: [{ amount: 2900, currency_code: "usd" }] },
      ],
    },
    {
      title: "Midnight Hoodie",
      handle: "midnight-hoodie",
      description: "Premium heavyweight hoodie in deep navy. Brushed fleece interior.",
      status: "published" as const,
      variants: [
        { title: "M", sku: "ALPHA-HD-NAV-M", manage_inventory: false, prices: [{ amount: 7900, currency_code: "usd" }] },
        { title: "L", sku: "ALPHA-HD-NAV-L", manage_inventory: false, prices: [{ amount: 7900, currency_code: "usd" }] },
        { title: "XL", sku: "ALPHA-HD-NAV-XL", manage_inventory: false, prices: [{ amount: 7900, currency_code: "usd" }] },
      ],
    },
    {
      title: "Canvas Tote Bag",
      handle: "canvas-tote-bag",
      description: "Durable canvas tote with reinforced handles. Perfect for daily use.",
      status: "published" as const,
      variants: [
        { title: "One Size", sku: "ALPHA-TOTE-NAT", manage_inventory: false, prices: [{ amount: 3500, currency_code: "usd" }] },
      ],
    },
    {
      title: "Ceramic Coffee Mug",
      handle: "ceramic-coffee-mug",
      description: "Handcrafted 12oz ceramic mug with matte finish.",
      status: "published" as const,
      variants: [
        { title: "White", sku: "ALPHA-MUG-WHT", manage_inventory: false, prices: [{ amount: 1800, currency_code: "usd" }] },
        { title: "Black", sku: "ALPHA-MUG-BLK", manage_inventory: false, prices: [{ amount: 1800, currency_code: "usd" }] },
      ],
    },
    {
      title: "Minimalist Leather Wallet",
      handle: "minimalist-leather-wallet",
      description: "Slim genuine leather wallet with RFID blocking. Holds up to 8 cards.",
      status: "published" as const,
      variants: [
        { title: "Brown", sku: "ALPHA-WLLT-BRN", manage_inventory: false, prices: [{ amount: 4500, currency_code: "usd" }] },
        { title: "Black", sku: "ALPHA-WLLT-BLK", manage_inventory: false, prices: [{ amount: 4500, currency_code: "usd" }] },
      ],
    },
  ]

  for (const productData of products) {
    const product = await productService.createProducts(productData)
    console.log(`  Created: ${product.title} (${product.id})`)

    // Link product to tenant
    await linkService.create({
      [TENANT_MODULE]: { tenant_id: tenant.id },
      [Modules.PRODUCT]: { product_id: product.id },
    })

    // Link product to sales channel
    if (salesChannelId) {
      await linkService.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
    }
  }

  console.log(`\nDone! Added ${products.length} products to demo-alpha.`)
}
