import type { ExecArgs } from "@medusajs/framework/types"
import { TENANT_MODULE } from "../modules/tenant"
import { Modules } from "@medusajs/framework/utils"

export default async function seed({ container }: ExecArgs) {
  const tenantService = container.resolve(TENANT_MODULE)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const linkService = container.resolve("remoteLink")

  console.log("Seeding lumora-medusa...")

  // Create demo tenants
  const tenants = [
    {
      name: "Demo Store Alpha",
      slug: "demo-alpha",
      supabase_tenant_id: "00000000-0000-0000-0000-000000000001",
      plan: "pro" as const,
    },
    {
      name: "Demo Store Beta",
      slug: "demo-beta",
      supabase_tenant_id: "00000000-0000-0000-0000-000000000002",
      plan: "free" as const,
    },
  ]

  for (const tenantData of tenants) {
    const existing = await tenantService.findBySlug(tenantData.slug)
    if (existing) {
      console.log(`  Tenant "${tenantData.slug}" already exists, skipping.`)
      continue
    }

    const tenant = await tenantService.createTenants(tenantData)
    console.log(`  Created tenant: ${tenant.name} (${tenant.slug})`)

    // Create a sales channel for each tenant
    const salesChannel = await salesChannelService.createSalesChannels({
      name: `${tenant.name} Channel`,
      description: `Sales channel for ${tenant.name}`,
      is_disabled: false,
    })
    console.log(`  Created sales channel: ${salesChannel.name}`)

    // Link tenant to sales channel
    await linkService.create({
      [TENANT_MODULE]: { tenant_id: tenant.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    })
    console.log(`  Linked tenant → sales channel`)
  }

  console.log("Seed complete!")
}
