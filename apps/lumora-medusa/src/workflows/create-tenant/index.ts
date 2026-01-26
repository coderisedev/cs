import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../../modules/tenant"

type CreateTenantInput = {
  name: string
  slug: string
  supabase_tenant_id: string
  plan?: string
}

const createTenantRecordStep = createStep(
  "create-tenant-record",
  async (input: CreateTenantInput, { container }) => {
    const tenantService = container.resolve(TENANT_MODULE)
    const tenant = await tenantService.createTenants({
      name: input.name,
      slug: input.slug,
      supabase_tenant_id: input.supabase_tenant_id,
      plan: input.plan ?? "free",
    })

    return new StepResponse(tenant, tenant.id)
  },
  async (tenantId: string, { container }) => {
    const tenantService = container.resolve(TENANT_MODULE)
    await tenantService.deleteTenants(tenantId)
  }
)

const createSalesChannelStep = createStep(
  "create-sales-channel",
  async (input: { name: string; description?: string }, { container }) => {
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
    const salesChannel = await salesChannelService.createSalesChannels({
      name: input.name,
      description: input.description ?? `Sales channel for ${input.name}`,
      is_disabled: false,
    })

    return new StepResponse(salesChannel, salesChannel.id)
  },
  async (salesChannelId: string, { container }) => {
    const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
    await salesChannelService.deleteSalesChannels(salesChannelId)
  }
)

const linkTenantSalesChannelStep = createStep(
  "link-tenant-sales-channel",
  async (
    input: { tenant_id: string; sales_channel_id: string },
    { container }
  ) => {
    const linkService = container.resolve("remoteLink")
    await linkService.create({
      [TENANT_MODULE]: { tenant_id: input.tenant_id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: input.sales_channel_id },
    })

    return new StepResponse(input)
  },
  async (
    input: { tenant_id: string; sales_channel_id: string },
    { container }
  ) => {
    const linkService = container.resolve("remoteLink")
    await linkService.dismiss({
      [TENANT_MODULE]: { tenant_id: input.tenant_id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: input.sales_channel_id },
    })
  }
)

export const createTenantWorkflow = createWorkflow(
  "create-tenant",
  (input: CreateTenantInput) => {
    const tenant = createTenantRecordStep(input)

    const salesChannel = createSalesChannelStep({
      name: input.name,
    })

    linkTenantSalesChannelStep({
      tenant_id: tenant.id,
      sales_channel_id: salesChannel.id,
    })

    return new WorkflowResponse({
      tenant,
      salesChannel,
    })
  }
)
